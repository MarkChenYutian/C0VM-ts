/**
 * @author Yutian Chen <yutianch@andrew.cmu.edu>
 * @abstract Heap memory "allocator" for C0VM.ts that mimics the heap memory of C.
 * @todo Find a way to free/reuse the allocated space. (maybe through reference-count?)
 * @description One can also implement a more fancy allocator that follows the C0HeapAllocator interface.
 * To maximize the type inference for typescript, it is recommanded to use the exported factory function 
 * `createHeap` to create (instantiate) the heap allocator.
 */

import { c0_memory_error, vm_error } from "./errors";
import { isNullPtr, read_ptr } from "./pointer_ops";

/**
 * Naive Heap Memory Allocator that mimic the memory manegement in C.
 * 
 * Didn't implement Garbage Collection. The allocator will try to 
 * allocate a segment straignt from the heap top.
 */
export class VM_Memory implements C0HeapAllocator {
    private memory_pool: ArrayBuffer;
    private heap_top_address: number;
    private memory_size: number;

    /**
     * Construct a VM Heap Memory Space
     * @param size Size (in bytes) of the VM Heap Space
     * @throws `vm_error` when `size <= 0`
     * @throws `vm_error` when `size >= MEM_POOL_MAX_SIZE`
     */
    constructor(size?: number) {
        if (size >= globalThis.MEM_POOL_MAX_SIZE) {
            throw new vm_error(`Unable to initialize memory greater than ${globalThis.MEM_POOL_MAX_SIZE} bytes`);
        }
        if (size <= globalThis.MEM_POOL_MIN_SIZE) {
            throw new vm_error(`Unable to initialize memory smaller than ${globalThis.MEM_POOL_MIN_SIZE} byte`);
        }
        // Add 1 here since the address 0x00 is reserved for NULL
        // Initialize 50kb of memory by default
        this.memory_size = (size === undefined ? globalThis.MEM_POOL_DEFAULT_SIZE + 1 : size);
        this.memory_pool = new ArrayBuffer(this.memory_size);
        this.heap_top_address = 0x01;
    }

    malloc(size: number): C0Pointer {
        if (size < 0 || this.heap_top_address + size > this.memory_size) {
            throw new c0_memory_error(`Unable to allocate ${size} bytes of memory.`);
        }
        if (size > globalThis.MEM_BLOCK_MAX_SIZE) {
            throw new c0_memory_error(`Unable to allocate memory block bigger than ${globalThis.MEM_BLOCK_MAX_SIZE}`);
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
        if (isNullPtr(ptr)) {
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
            address + offset, value.getUint8(3)
        );
    }

    cmload(ptr: C0Pointer): DataView {
        const [address, offset, size] = read_ptr(ptr);
        if (isNullPtr(ptr)) {
            throw new c0_memory_error("Dereferencing NULL Pointer");
        }
        if (size - offset < 1) {
            throw new c0_memory_error(
                `Tried to read 1 byte @${address + offset}, but the segment is only allocated as [${address}, ${address + size})`
            );
        }
        const result = new Uint8Array([0, 0, 0, new DataView(this.memory_pool).getUint8(address + offset)]);
        return new DataView(result.buffer);
    }

    imstore(ptr: C0Pointer, value: DataView): void {
        const [address, offset, size] = read_ptr(ptr);
        if (isNullPtr(ptr)) {
            throw new c0_memory_error("Dereferencing NULL Pointer");
        }
        if (value.byteLength < 4) {
            throw new vm_error("Not enough value to store!");
        }
        //TODO: mark all the debug code
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
        if (isNullPtr(ptr)) {
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
        if (isNullPtr(ptr)) {
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
        if (isNullPtr(ptr)) {
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

    deref(ptr: C0Pointer, block_size?: number): DataView {
        const [address, offset, size] = read_ptr(ptr);
        if (isNullPtr(ptr)) {
            throw new c0_memory_error("Dereferencing NULL Pointer");
        }
        if (block_size === undefined) {
            block_size = size - offset; // Load the remaining of memory segment by default
        }
        if (offset + block_size > size) {
            throw new c0_memory_error("Memory access out of bound");
        }
        return new DataView(
            this.memory_pool, address + offset, block_size
        );
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
