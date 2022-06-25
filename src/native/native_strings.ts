/**
 * @author Yutian Chen <yutianch@andrew.cmu.edu>
 * @Description TypeScript implementation of string native functions in C0VM.
 */

import { c0_cvt2_js_value } from "../utility/c0_value";
import { vm_error } from "../utility/errors";
import { read_ptr } from "../utility/pointer_ops";
import { loadString, allocate_js_string } from "../utility/string_utility";

/**
 * Compare two C0TypeClass.string objects
 * @param mem Memory allocator whose heap memory stores the strings
 * @param arg1 pointer to string 1
 * @param arg2 pointer to string 2
 * @returns -1 if arg1 < arg2, 0 if equal and 1 if arg1 > arg2
 */
export function c0_string_compare(
    mem: C0HeapAllocator,
    arg1: C0Value<Maybe<C0TypeClass.string>>,
    arg2: C0Value<Maybe<C0TypeClass.string>>
): number {
    const str_1 = loadString(arg1, mem);
    const str_2 = loadString(arg2, mem);

    return str_1 < str_2 ? -1 : str_1 > str_2 ? 1 : 0;
}

/**
 * Check whether two C0TypeClass.string objects are equal
 * @param mem Memory allocator whose heap memory stores the strings
 * @param arg1 Pointer to string 1
 * @param arg2 Pointer to string 2
 * @returns true if arg1 == arg2, false otherwise
 */
export function c0_string_equal(
    mem: C0HeapAllocator,
    arg1: C0Value<Maybe<C0TypeClass.string>>,
    arg2: C0Value<Maybe<C0TypeClass.string>>
): boolean {
    return c0_string_compare(mem, arg1, arg2) === 0;
}

/**
 * Convert a boolean to string format
 * @param mem Memory Allocator that will be used to store the conversion result
 * @param arg1 A boolean C0Value that will be converted to string
 * @returns A pointer to "true" in heap memory if arg1 != 0, "false" otherwise
 */
export function c0_string_frombool(
    mem: C0HeapAllocator,
    arg1: C0Value<Maybe<C0TypeClass.value>>
): C0Pointer {
    // We need to explicitly assign (overwrite) type to arg1 so that c0_cvt2_js_value will
    // give us the correct conversion result type (boolean in this case)
    arg1.type = { type: C0TypeClass.value, value: "bool" };
    return allocate_js_string(mem, c0_cvt2_js_value(arg1) ? "true" : "false");
}

/**
 * Convert a char into string
 * @param mem Memory Allocator that will be used to store the conversion result
 * @param arg1 The char that will be converted to string
 * @returns A pointer to the converted string
 */
export function c0_string_fromchar(
    mem: C0HeapAllocator,
    arg1: C0Value<Maybe<C0TypeClass.value>>
): C0Pointer {
    // We need to explicitly assign (overwrite) type to arg1 so that c0_cvt2_js_value will
    // give us the correct conversion result type (string in this case)
    arg1.type = { type: C0TypeClass.value, value: "char" };
    return allocate_js_string(mem, c0_cvt2_js_value(arg1) as string);
}

/**
 * Convert the integer to string
 * @param mem Memory allocator that will be used to store the conversion result
 * @param arg1 The integer that will be converted to string
 * @returns A pointer to the converted string
 */
export function c0_string_fromint(
    mem: C0HeapAllocator,
    arg1: C0Value<Maybe<C0TypeClass.value>>
): C0Pointer {
    // We need to explicitly assign (overwrite) type to arg1 so that c0_cvt2_js_value will
    // give us the correct conversion result type (number in this case)
    arg1.type = { type: C0TypeClass.value, value: "int" };
    return allocate_js_string(mem, "" + c0_cvt2_js_value(arg1));
}

/**
 * Concatenate two strings
 * @param mem Memory Allocator
 * @param arg1 The first string to be concatenated
 * @param arg2 The second string to be concatenated
 * @returns A pointer points to the string "str1+str2".
 */
export function c0_string_join(
    mem: C0HeapAllocator,
    arg1: C0Value<Maybe<C0TypeClass.string>>,
    arg2: C0Value<Maybe<C0TypeClass.string>>
): C0Pointer {
    return allocate_js_string(
        mem,
        loadString(arg1, mem) + loadString(arg2, mem)
    );
}

/**
 * Get the length of a string
 * @param mem Memory Allocator
 * @param arg1 The string to check length
 * @returns The length of string pointed by arg1
 */
export function c0_string_length(
    mem: C0HeapAllocator,
    arg1: C0Value<Maybe<C0TypeClass.string>>
): number {
    return loadString(arg1, mem).length;
}

/**
 * Convert string to char[]
 * @param mem Memory Allocator
 * @param arg1 The string that will be converted into char[]
 * @returns A pointer to the char[]
 */
export function c0_string_to_chararray(
    mem: C0HeapAllocator,
    arg1: C0Value<Maybe<C0TypeClass.string>>
): C0Pointer {
    const str = loadString(arg1, mem);
    // Allocate a memory block from heap, +1 for NUL terminator, +4 for array header
    const ptr = mem.malloc(str.length + 1 + 4);
    const mem_block = mem.deref(ptr); // Obtain the Dataview of heap memory space allocated
    mem_block.setUint32(0, 1); // Header data for array - size of elem
    for (let i = 0; i < str.length; i++) {
        mem_block.setUint8(4 + i, str.charCodeAt(i)); // Fill in the data
    }
    mem_block.setUint8(str.length + 4, 0); // Add NUL Terminator
    return ptr;
}

/**
 * Convert char[] into string
 * @param mem Memory Allocator
 * @param arg1 A pointer to the char[]
 * @returns The string converted from the char[] arg1 points to
 */
export function c0_string_from_chararray(
    mem: C0HeapAllocator,
    arg1: C0Value<Maybe<C0TypeClass.ptr>>
): C0Pointer {
    const mem_block = mem.deref(arg1.value);

    if (mem_block.getUint8(0) !== 1)
        throw new vm_error("String from Chararray doesn't receive a char[]");

    const [addr, offset, size] = read_ptr(arg1.value);
    const length = size - offset;
    let str = "";
    for (let i = 0; i < length; i++) {
        str = str + String.fromCharCode(mem_block.getUint8(4 + i));
    }
    return allocate_js_string(mem, str);
}
