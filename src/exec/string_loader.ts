
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
