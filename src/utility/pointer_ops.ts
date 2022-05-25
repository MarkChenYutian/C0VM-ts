import { vm_error, c0_memory_error } from "./errors";

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

export function shift_ptr(ptr: C0Pointer, offset: number): C0Pointer {
    const [address, original_offset, size] = read_ptr(ptr);
    const new_offset = original_offset + offset;
    if (new_offset > size) {
        throw new c0_memory_error(`Tried to perform +${offset} shift on pointer @${address}+${original_offset}. However, the allocated segment is only [${address}, ${address + size})`)
    }
    const new_ptr: C0Pointer = new DataView(new ArrayBuffer(8));
    new_ptr.setUint32(0, address);
    new_ptr.setUint16(4, new_offset);
    new_ptr.setUint16(6, size);
    return new_ptr;
}

