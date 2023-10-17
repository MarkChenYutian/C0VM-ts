/**
 * @author Yutian Chen <yutianch@andrew.cmu.edu>
 * @abstract A pack of pointer related utility functions including
 * reading and writing pointer, NULL check.
 */

import { vm_error, c0_memory_error } from "./errors";

/**
 * 
 * @param ptr C0Pointer to be interpreted
 * @returns A tuple in form (address, offset, mem_blocksize)
 * 
 * address - the start address of segment that pointer is pointing to
 * offset - the offset of pointer from the address
 * mem_blocksize - the size of allocated memory block
 * 
 * [address, address + mem_blocksize) is the allocated memory segment
 * `address + offset` is the actual position that the pointer is pointing to
 */
export function read_ptr(ptr: C0Pointer): [number, number, number] {
    if (ptr.byteLength < 8) {
        throw new vm_error(`Invalid Pointer ${ptr} is dereferenced.`);
    }
    const address = ptr.getUint32(0);
    const offset = ptr.getUint16(4);
    const block_size = ptr.getUint16(6);
    if (offset > block_size){
        throw new c0_memory_error(`Pointer points to ${address + offset}, but the memory segment is only allocated at [${address}, ${address + block_size}).`)
    }
    return [address, offset, block_size];
}


/**
 * Shift the pointer forward (positive offset)
 * @param ptr Pointer to be manipulated
 * @param offset The additional offset to be appplied on the pointer (can only be positive)
 * @returns A new pointer with offset applied on it
 * @throws `c0_memory_error` when applying such offset will let a pointer point outside of the current memory block.
 * That is, pointing to somewhere not in interval [address, address + block_size)
 */
export function shift_ptr(ptr: C0Pointer, offset: number): C0Pointer {
    const [address, original_offset, size] = read_ptr(ptr);
    const new_offset = original_offset + offset;
    
        if (offset < 0 || new_offset >= size || new_offset < 0) {
            throw new c0_memory_error(
                `Tried to perform ${offset} shift on pointer @${address}+${original_offset}. However, the allocated segment is only [${address}, ${address + size})`
            );
        }

    const new_ptr: C0Pointer = new DataView(new ArrayBuffer(8));
    new_ptr.setUint32(0, address);
    new_ptr.setUint16(4, new_offset);
    new_ptr.setUint16(6, size);
    return new_ptr;
}

/**
 * Check if a pointer is NULL
 * @param ptr Pointer to be checked
 * @returns `true` if the given pointer is NULL
 */
export function isNullPtr(ptr: C0Pointer): boolean {
    // Refer to issue #3, bigUint64 is not defined in some Safari browser
    return ptr.getUint32(0) === 0 && ptr.getUint32(4) === 0;
}


/**
 * Construct a data view
 * @param addr The base address of memory block pointed to
 * @param offset The offset within the memory block the pointer is pointing at
 * @param size Memory block size
 * @returns A constructed C0Pointer (DataView)
 */
export function build_ptr(addr: number, offset: number, size: number) {
    const p_buf = new Uint8Array(8).buffer;
    const p = new DataView(p_buf);
    p.setUint32(0, addr);
    p.setUint16(4, offset);
    p.setUint16(6, size);
    return p;
}


export function build_null_ptr() {
    return build_ptr(0, 0, 0);
}

export function render_address(address : number, padding : number) {
    return address.toString(16).padStart(padding, "0").toUpperCase()
}
