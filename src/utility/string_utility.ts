import { vm_error } from "./errors";

/**
 * Load the string pool to C0VM Heap memory (in order to implement ALDC command)
 * @param stringPool string pool that is being loaded in the C0 Heap
 * @param allocator heap allocator object that provides `mallc` etc.
 * @returns A pointer that points to the start of string pool in heap
 */
export function loadStringPool(stringPool: Uint8Array, allocator: C0HeapAllocator): C0Pointer {
    const ptr = allocator.malloc(stringPool.length);
    const mem_block = allocator.deref(ptr);
    for (let i = 0; i < stringPool.byteLength; i ++) {
        mem_block.setUint8(i, stringPool[i]);
    }
    return ptr;
}

/**
 * Convert C0String (a set of uint in Heap) to JS String. Stop at first NUL 
 * terminator.
 * @param ptr A pointer that points to the starting position of string
 * @param allocator HeapAllocator that manages the heap memory
 * @returns The decoded string (with utf-8 decoding by default)
 */
export function loadString(ptr: C0Value<C0ValueVMType.ptr>, allocator: C0HeapAllocator): string {
    if (ptr.type !== "<unknown>" && ptr.type !== "string") {
        throw new vm_error("Type error. Unable to extract string from type" + ptr.type);
    }
    const mem_block = allocator.deref(ptr.value);
    // stop at NUL character
    let i = 0;
    while (i < mem_block.byteLength && mem_block.getUint8(i) !== 0) {
        i ++;
    }
    const dec = new TextDecoder();
    return dec.decode(mem_block.buffer.slice(mem_block.byteOffset, mem_block.byteOffset + i + 1));
}
