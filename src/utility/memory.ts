/**
 * @author Yutian Chen <yutianch@andrew.cmu.edu>
 * @abstract Heap memory "allocator" for C0VM.ts that mimics the heap memory of C.
 * @todo Find a way to free/reuse the allocated space. (maybe through reference-count?)
 * @description One can also implement a more fancy allocator that follows the C0HeapAllocator interface.
 * To maximize the type inference for typescript, it is recommanded to use the exported factory function 
 * `createHeap` to create (instantiate) the heap allocator.
 */

import { c0_memory_error, vm_error } from "./errors";
import { read_ptr } from "./pointer_ops";

export class VM_Memory implements C0HeapAllocator {
    private memory_pool: ArrayBuffer;
    private heap_top_address: number;
    private memory_size: number;

    constructor(size?: number) {
        
        if (size >= 0xFFFFFFE) {
            throw new c0_memory_error(`Unable to initialize memory greater than 0xFFFFFFFE`);
        }
        // Add 1 here since the address 0x00 is reserved for NULL
        // Initialize 50kb of memory by default
        this.memory_size = (size ? size : 1024 * 50) + 1;
        this.memory_pool = new ArrayBuffer(this.memory_size);
        this.heap_top_address = 0x01;
    }

    malloc(size: number): C0Pointer {
        if (size < 0 || this.heap_top_address + size > this.memory_pool.byteLength) {
            throw new c0_memory_error(`Unable to allocate ${size} bytes of memory.`);
        }
        if (size > 0xFFFF) {
            throw new c0_memory_error(`Unable to allocate memory block bigger than 0xFFFF (65535)`);
        }
        const ptr = new DataView(new ArrayBuffer(8));
        ptr.setUint32(0, this.heap_top_address);
        ptr.setUint16(4, 0);
        ptr.setUint16(6, size);
        this.heap_top_address += size;
        return ptr;
    }

    /**
     * **In this version, free is not implemented yet!**
     * 
     * Calling `free` function on a pointer will only overwrite 0x00 to all the bytes
     * in that segment. No further behavior will occur.
     * 
     * @param ptr Pointer to be freed
     */
    free(ptr: C0Pointer): void {
        const addr = ptr.getUint32(0);
        const offset = ptr.getUint16(4);
        const size = ptr.getInt16(6);
        if (offset !== 0) {
            throw new vm_error(`Freeing a memory that is not pointing at the start of memory block`);
        }
        // Fill the segment with zero.
        new Uint8Array(this.memory_pool, addr).fill(0, 0, size);
    }

    clear(): void {
        this.memory_pool = new ArrayBuffer(this.memory_size);
    }

    debug_getMemPool(): ArrayBuffer {
        return this.memory_pool;
    }

    cmstore(ptr: C0Pointer, value: DataView): void {
        const [address, offset, size] = read_ptr(ptr);
        if (address === 0) {
            throw new c0_memory_error("Dereferencing NULL Pointer");
        }
        if (value.byteLength < 1) {
            throw new vm_error("Not enough value to store!")
        }
        if (size - offset < 1) {
            throw new c0_memory_error(
                `Tried to write 1 byte @${address + offset}, but segment is only allocated as [${address}, ${address + size})`
            );
        }
        new DataView(this.memory_pool).setUint8(
            address + offset, value.getUint8(0)
        );
    }

    cmload(ptr: C0Pointer): DataView {
        const [address, offset, size] = read_ptr(ptr);
        if (address === 0) {
            throw new c0_memory_error("Dereferencing NULL Pointer");
        }
        if (size - offset < 1) {
            throw new c0_memory_error(
                `Tried to read 1 byte @${address + offset}, but the segment is only allocated as [${address}, ${address + size})`
            );
        }
        const result = new Uint8Array([new DataView(this.memory_pool).getUint8(address + offset)]);
        return new DataView(result.buffer);
    }

    imstore(ptr: C0Pointer, value: DataView): void {
        const [address, offset, size] = read_ptr(ptr);
        if (address === 0) {
            throw new c0_memory_error("Dereferencing NULL Pointer");
        }
        if (value.byteLength < 4) {
            throw new vm_error("Not enough value to store!");
        }
        if (size - offset < 4) {
            throw new c0_memory_error(
                `Tried to write 4 bytes @${address + offset}, but segment is only allocated as [${address}, ${address + size})`
            );
        }
        new DataView(this.memory_pool).setUint32(
            address + offset, value.getUint32(0)
        );
    }

    imload(ptr: C0Pointer): DataView {
        const [address, offset, size] = read_ptr(ptr);
        if (address === 0) {
            throw new c0_memory_error("Dereferencing NULL Pointer");
        }
        if (size - offset < 4) {
            throw new c0_memory_error(
                `Tried to read 4 bytes @${address + offset}, but the segment is only allocated as [${address}, ${address + size})`
            );
        }
        const result = new DataView(new Uint8Array(4).buffer);
        result.setUint32(0, new DataView(this.memory_pool).getUint32(address + offset));
        // const result = new Uint32Array([new DataView(this.memory_pool).getUint32(address + offset)]);
        // return new DataView(result.buffer);
        return result;
    }

    amstore(ptr: C0Pointer, stored_ptr: DataView): void {
        const [address, offset, size] = read_ptr(ptr);
        if (address === 0) {
            throw new c0_memory_error("Dereferencing NULL Pointer");
        }
        if (stored_ptr.byteLength < 8) {
            throw new vm_error("Not enough value to store!");
        }
        if (size - offset < 8) {
            throw new c0_memory_error(
                `Tried to write 8 bytes @${address + offset}, but segment is only allocated as [${address}, ${address + size})`
            )
        }
        new DataView(this.memory_pool).setBigUint64(
            address + offset, stored_ptr.getBigUint64(0)
        );
    }

    amload(ptr: C0Pointer): DataView {
        const [address, offset, size] = read_ptr(ptr);
        if (address === 0) {
            throw new c0_memory_error("Dereferencing NULL Pointer");
        }
        if (size - offset < 8) {
            throw new c0_memory_error(
                `Tried to load 8 bytes @${address + offset}, but segment is only allocated as [${address}, ${address + size})`
            )
        }
        const result = new DataView(new Uint8Array(8).buffer);
        result.setBigUint64(0, new DataView(this.memory_pool).getBigUint64(address + offset));
        return result;
    }

}

/**
 * Factory function for heap allocator.
 * @param allocator Heap Allocator Class
 * @param size Size of memory pool, will be passed into the Heap allocator constructor
 * @returns A instentiated heap allocator
 */
export function createHeap(allocator: C0HeapAllocatorConstructor, size ?: number): C0HeapAllocator {
    return new allocator(size);
}
