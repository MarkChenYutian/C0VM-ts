/**
 * @author Yutian Chen <yutianch@andrew.cmu.edu>
 * @abstract A pack of tagged_pointer related utility function including
 * creating and reading tagged pointer.
 */

import { internal_error, vm_error } from "./errors";
import { isNullPtr, read_ptr } from "./pointer_utility";

/**
 * @param ptr C0Pointer that points to the tagged_ptr
 * @param mem The heap allocator
 * 
 * The tagged ptr in C0VM is a pointer pointing to a struct with fields
 * {
 *  void* ptr;
 *  int   tag;
 * }
 * 
 * @throws `c0_memory_error` if ptr is NULL pointer
 * @throws `vm_error` if the input ptr is not a real tagged pointer
 */
export function read_tagptr(ptr: C0Pointer, mem: C0HeapAllocator): [C0Pointer, number] {
    const [, offset, block_size] = read_ptr(ptr);
    // 12 = sizeof(ptr -> ptr) + sizeof(ptr -> tag)
    if (block_size - offset < 12) throw new vm_error(`Invalid Tagged Pointer ${ptr} is passed into read_tagptr.`);

    const tagptr_struct = mem.deref(ptr);
    
    const pointer = new DataView(new Uint8Array(8).buffer);
    const tag     = tagptr_struct.getUint32(8);
    pointer.setUint32(0, tagptr_struct.getUint32(0));
    pointer.setUint32(4, tagptr_struct.getUint32(4));

    return [pointer, tag]
}

/**
 * Cast a normal pointer into a void* pointer
 * @param ptr C0Pointer that is casting to void*
 * @param tag The tag for that pointer
 * @param mem Heap memory allocator for C0VM
 */
export function build_tagptr(ptr: C0Pointer, tag: number, mem: C0HeapAllocator): C0Pointer {
    const tagptr = mem.malloc(12);
    const tagptr_struct = mem.deref(tagptr);
    /*  
        A tagged pointer structure in heap memory:
        0----------------8--------12
        |  ptr           |  tag   |
        +----------------+--------+ 
    */
    tagptr_struct.setUint32(0, ptr.getUint32(0));
    tagptr_struct.setUint32(4, ptr.getUint32(4));
    tagptr_struct.setUint32(8, tag);

    return tagptr;
}

export function remove_tag(
    tagged_ptr: C0Value<"tagptr">,
    mem: C0HeapAllocator,
    tagRecord: Map<number, C0Type<"ptr">>
): C0Value<"ptr"> {
    if (isNullPtr(tagged_ptr.value)) {
        return {value: tagged_ptr.value, type: {type: "ptr", kind: "ptr", value: {type: "<unknown>"}}}
    }
    const [ptr, tag] = read_tagptr(tagged_ptr.value, mem);
    
    if (tagged_ptr.type.value.type === "<unknown>") {
        const actual_type = tagRecord.get(tag);
        if (actual_type === undefined) { throw new internal_error("Untag a tagged_pointer with <unknown> tag"); }
        return {value: ptr, type: actual_type};
    }

    return {value: ptr, type: tagged_ptr.type.value};
}

