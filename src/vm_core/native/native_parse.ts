/**
 * @author Yutian Chen <yutianch@andrew.cmu.edu>
 * @Description TypeScript implementation of string native functions in C0VM.
 * 
 * Source:
 * cc0/libs/parse.c
 */

import { castToType } from "../../utility/c0_type_utility";
import { c0_cvt2_js_value, js_cvt2_c0_value } from "../../utility/c0_value_utility";
import { c0_memory_error, c0_value_error } from "../../utility/errors";
import { build_null_ptr, isNullPtr } from "../../utility/pointer_utility";
import { allocate_js_string, loadString } from "../../utility/string_utility";

export function c0_parse_bool(
    mem: C0HeapAllocator,
    arg1: C0Value<Maybe<"string">>
): C0Pointer {
    if (isNullPtr(arg1.value)) {
        throw new c0_memory_error("native function bool *parse_bool(string s) receives a NULL pointer.");
    }
    const str = loadString(arg1, mem);
    if (str === "true") {
        const res = mem.malloc(1);
        mem.cmstore(res, js_cvt2_c0_value(true).value);
        return res;
    } else if (str === "false") {
        const res = mem.malloc(1);
        mem.cmstore(res, js_cvt2_c0_value(false).value);
        return res;
    } else {
        return build_null_ptr()    // return NULL
    }
}


export function c0_parse_int(
    mem: C0HeapAllocator,
    arg1: C0Value<Maybe<"string">>,
    arg2: C0Value<Maybe<"value">>
): C0Pointer {
    if (isNullPtr(arg1.value)) {
        throw new c0_memory_error("native function int *parse_int(string s, int base) receives a NULL pointer.");
    }
    const str = loadString(arg1, mem);
    const arg2_int = castToType<"value">(arg2, {type: "value", value: "int"});  // Cast to int
    const base = c0_cvt2_js_value(arg2_int) as number;
    if (base < 2 || base > 36) throw new c0_value_error("native function int *parse_int(string s, int base) receives base not in range [2, 36]");

    const res_value = parseInt(str, base);
    if (isNaN(res_value)) {
        return build_null_ptr();    // return NULL
    } else {
        const res_ptr = mem.malloc(4);
        mem.imstore(res_ptr, js_cvt2_c0_value(res_value).value);
        return res_ptr;
    }
}

export function c0_num_tokens(
    mem: C0HeapAllocator,
    arg1: C0Value<Maybe<"string">>
): number {
    if (isNullPtr(arg1.value)) {
        throw new c0_memory_error("native function int num_tokens(string s) receives a NULL pointer.");
    }

    const str = loadString(arg1, mem);
    return str.split(/(\s+)/).length;
}

export function c0_parse_ints(
    mem: C0HeapAllocator,
    arg1: C0Value<Maybe<"string">>,
    arg2: C0Value<Maybe<"value">>
): C0Pointer {
    const str = loadString(arg1, mem);
    arg2 = castToType<"value">(arg2, {type: "value", value: "int"});
    const base = c0_cvt2_js_value(arg2) as number;
    if (base < 2 || base > 36) throw new c0_value_error("native function int *parse_ints(string s, int base) receives base not in range [2, 36]");

    const tokens = str.split(/(\s+)/);
    const ints: number[] = [];
    for (let i = 0; i < tokens.length; i ++) {
        const parsed = parseInt(tokens[i], base);
        if (isNaN(parsed)) throw new c0_value_error(`int *parsed_ints(...): Failed to parse token '${tokens[i]}'`);
        ints.push(parsed);
    }
    
    // Create a c0 array and fill ints inside it
    const arrPtr: C0Pointer = mem.malloc(4 + 4 * ints.length);
    arrPtr.setInt32(0, 4);      // sizeof(int) = 4
    for (let i = 0; i < ints.length; i ++) {
        arrPtr.setInt32(4 * (i + 1), ints[i]);
    }

    return arrPtr;
}

export function c0_parse_tokens(
    mem: C0HeapAllocator,
    arg1: C0Value<Maybe<"string">>
): C0Pointer {
    const str = loadString(arg1, mem);
    const tokens = str.split(/(\s+)/);

    // Create a c0 array and fill strings inside it
    const arrPtr: C0Pointer = mem.malloc(4 + 8 * tokens.length);
    arrPtr.setInt32(0, 8);
    for (let i = 0; i < tokens.length; i ++) {
        const tokenPtr = allocate_js_string(mem, tokens[i]);
        // Sadly, Safari does not support BigInt (Uint64), so we have
        // to do this in two steps
        arrPtr.setUint32(4 + 8 * i, tokenPtr.getUint32(0));
        arrPtr.setUint32(4 + 8 * i + 4, tokenPtr.getUint32(4));
    }
    return arrPtr;
}

export function c0_int_tokens(
    mem: C0HeapAllocator,
    arg1: C0Value<Maybe<"string">>,
    arg2: C0Value<Maybe<"value">>
): boolean {
    const str = loadString(arg1, mem);
    arg2 = castToType<"value">(arg2, {type: "value", value: "int"});
    const base = c0_cvt2_js_value(arg2) as number;
    if (base < 2 || base > 36) throw new c0_value_error("native function int *int_tokens(string s, int base) receives base not in range [2, 36]");

    const tokens = str.split(/(\s+)/);
    for (let i = 0; i < tokens.length; i ++) {
        const parsed = parseInt(tokens[i], base);
        if (isNaN(parsed)) return false;
    }
    return true;
}
