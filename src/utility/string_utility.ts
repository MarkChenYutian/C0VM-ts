import { isNullPtr } from "./pointer_ops";

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
export function loadString(ptr: C0Value<Maybe<C0TypeClass.string>>, allocator: C0HeapAllocator): string {
    if (isNullPtr(ptr.value)) return "";
    const mem_block = allocator.deref(ptr.value);
    // stop at NUL character
    let i = 0;
    while (i < mem_block.byteLength && mem_block.getUint8(i) !== 0) {
        i ++;
    }
    const dec = new TextDecoder();
    return dec.decode(mem_block.buffer.slice(mem_block.byteOffset, mem_block.byteOffset + i));
}

/**
 * Helper Function
 * @param mem Memory Allocator
 * @param s The Javascript string you want to allocate into C0 heap memory space
 * @returns The pointer to the allocated string
 */
 export function allocate_js_string(mem: C0HeapAllocator, s: string): C0Pointer {
    const ptr = mem.malloc(s.length + 1);
    const block = mem.deref(ptr);
    for (let i = 0; i < s.length; i ++) {
        block.setUint8(i, s.charCodeAt(i));
    }
    block.setUint8(s.length, 0);    // NUL Terminator
    return ptr;
}
