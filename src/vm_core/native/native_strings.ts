/**
 * @author Yutian Chen <yutianch@andrew.cmu.edu>
 * @Description TypeScript implementation of string native functions in C0VM.
 * 
 * Source:
 * cc0/bare/cstr.c
 * cc0/libs/string/string.c
 */

import { c0_cvt2_js_value } from "../../utility/c0_value_utility";
import { c0_value_error, vm_error } from "../../utility/errors";
import { read_ptr } from "../../utility/pointer_utility";
import { loadString, allocate_js_string } from "../../utility/string_utility";
import { expand_C0Array } from "../../utility/c0_value_utility";
import { String2Type } from "../../utility/c0_type_utility";

/**
 * Compare two "string" objects
 * @param mem Memory allocator whose heap memory stores the strings
 * @param arg1 pointer to string 1
 * @param arg2 pointer to string 2
 * @returns -1 if arg1 < arg2, 0 if equal and 1 if arg1 > arg2
 */
export function c0_string_compare(
    mem: C0HeapAllocator,
    arg1: C0Value<Maybe<"string">>,
    arg2: C0Value<Maybe<"string">>
): number {
    const str_1 = loadString(arg1, mem);
    const str_2 = loadString(arg2, mem);

    return str_1 < str_2 ? -1 : str_1 > str_2 ? 1 : 0;
}

/**
 * Check whether two "string" objects are equal
 * @param mem Memory allocator whose heap memory stores the strings
 * @param arg1 Pointer to string 1
 * @param arg2 Pointer to string 2
 * @returns true if arg1 == arg2, false otherwise
 */
export function c0_string_equal(
    mem: C0HeapAllocator,
    arg1: C0Value<Maybe<"string">>,
    arg2: C0Value<Maybe<"string">>
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
    arg1: C0Value<Maybe<"value">>
): C0Pointer {
    // We need to explicitly assign (overwrite) type to arg1 so that c0_cvt2_js_value will
    // give us the correct conversion result type (boolean in this case)
    arg1.type = { type: "value", value: "bool" };
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
    arg1: C0Value<Maybe<"value">>
): C0Pointer {
    // We need to explicitly assign (overwrite) type to arg1 so that c0_cvt2_js_value will
    // give us the correct conversion result type (string in this case)
    arg1.type = { type: "value", value: "char" };
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
    arg1: C0Value<Maybe<"value">>
): C0Pointer {
    // We need to explicitly assign (overwrite) type to arg1 so that c0_cvt2_js_value will
    // give us the correct conversion result type (number in this case)
    arg1.type = { type: "value", value: "int" };
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
    arg1: C0Value<Maybe<"string">>,
    arg2: C0Value<Maybe<"string">>
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
    arg1: C0Value<Maybe<"string">>
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
    arg1: C0Value<Maybe<"string">>
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
    arg1: C0Value<Maybe<"ptr">>
): C0Pointer {
    const mem_block = mem.deref(arg1.value);

    if (mem_block.getUint8(0) !== 1)
        throw new vm_error("String from Chararray doesn't receive a char[]");

    const [, offset, size] = read_ptr(arg1.value);
    const length = size - offset;
    let str = "";
    for (let i = 0; i < length; i++) {
        str = str + String.fromCharCode(mem_block.getUint8(4 + i));
    }
    return allocate_js_string(mem, str);
}

export function c0_string_charat(
    mem: C0HeapAllocator,
    arg1: C0Value<Maybe<"string">>,
    arg2: C0Value<Maybe<"value">>
): string {
    const str = loadString(arg1, mem);
    // Force cast
    arg2.type = {type: "value", value: "int"};

    const idx = c0_cvt2_js_value(arg2) as number;
    if (idx < 0 || idx >= str.length) throw new c0_value_error("c0_string_charat: index out of bound");
    return str[idx];
}

export function c0_string_sub(
    mem: C0HeapAllocator,
    arg1: C0Value<Maybe<"string">>,
    arg2: C0Value<Maybe<"value">>,
    arg3: C0Value<Maybe<"value">>
): C0Pointer {
    const str = loadString(arg1, mem);
    // Force cast
    arg2.type = {type: "value", value: "int"};
    arg3.type = {type: "value", value: "int"};

    const lidx = c0_cvt2_js_value(arg2) as number;
    const ridx = c0_cvt2_js_value(arg3) as number;
    if (lidx < 0) throw new c0_value_error("c0_string_sub: start_idx < 0");
    if (ridx > str.length) throw new c0_value_error("c0_string_sub: end_idx > string length");
    if (lidx > ridx) throw new c0_value_error("c0_string_sub: start_idx > end_idx");
    if (lidx === ridx) return allocate_js_string(mem, "");
    return allocate_js_string(mem, str.slice(lidx, ridx));
}


export function c0_string_terminated(
    mem: C0HeapAllocator,
    arg1: C0Value<Maybe<"ptr">>,
    arg2: C0Value<Maybe<"value">>
): boolean {
    // Force cast
    arg1.type = String2Type("char[]") as C0Type<"ptr">;
    arg2.type = String2Type("int") as C0Type<"value">;

    const str = expand_C0Array(mem, arg1 as C0Value<"ptr">);

    const n = c0_cvt2_js_value(arg2);
    for (let i = 0; i < str.length && i < n; i ++) {
        if (c0_cvt2_js_value(str[i] as C0Value<"value">) === '\0') {
            return true;
        }
    }
    return false;
}

export function c0_char_ord(arg1: C0Value<Maybe<"value">>): number {
    return c0_cvt2_js_value(arg1).toString().charCodeAt(0);
}

export function c0_char_chr(arg1: C0Value<Maybe<"value">>): string {
    // Force cast
    arg1.type = String2Type("int") as C0Type<"value">;

    const n = c0_cvt2_js_value(arg1) as number;
    if (n < 0 || n > 127) throw new c0_value_error("c0_char_chr: only ASCII code [0, 127] is supported.");
    return String.fromCharCode(n);
}

export function c0_string_tolower(mem: C0HeapAllocator, arg1: C0Value<Maybe<"string">>): C0Pointer {
    const s = loadString(arg1, mem);
    return allocate_js_string(mem, s.toLowerCase());
}
