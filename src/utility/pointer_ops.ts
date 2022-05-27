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
    /* DEBUG_CODE */
        if (ptr.byteLength < 8) {
            throw new vm_error(`Invalid Pointer ${ptr} is dereferenced.`);
        }
    /* END_DEBUG_CODE */
    const address = ptr.getUint32(0);
    const offset = ptr.getUint16(4);
    const block_size = ptr.getUint16(6);
    /* DEBUG_CODE */
        if (offset > block_size){
            throw new c0_memory_error(`Pointer points to ${address + offset}, but the memory segment is only allocated at [${address}, ${address + block_size}).`)
        }
    /* END_DEBUG_CODE */
    return [address, offset, block_size];
}


/**
 * Shift the pointer either forward (positive offset) or backward (negative offset)
 * @param ptr Pointer to be manipulated
 * @param offset The additional offset to be appplied on the pointer (can be negative/positive)
 * @returns A new pointer with offset applied on it
 * @throws `c0_memory_error` when applying such offset will let a pointer point outside of the current memory block.
 * That is, pointing to somewhere not in interval [address, address + block_size)
 */
export function shift_ptr(ptr: C0Pointer, offset: number): C0Pointer {
    const [address, original_offset, size] = read_ptr(ptr);
    const new_offset = original_offset + offset;
    
    /* DEBUG_CODE */
        if (offset < 0 || new_offset > size || new_offset < 0) {
            throw new c0_memory_error(
                `Tried to perform ${offset} shift on pointer @${address}+${original_offset}. However, the allocated segment is only [${address}, ${address + size})`
            );
        }
    /* END_DEBUG_CODE */

    const new_ptr: C0Pointer = new DataView(new ArrayBuffer(8));
    new_ptr.setUint32(0, address);
    new_ptr.setUint16(4, new_offset);
    new_ptr.setUint16(6, size);
    return new_ptr;
}

