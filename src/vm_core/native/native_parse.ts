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
import { isNullPtr } from "../../utility/pointer_utility";
import { loadString } from "../../utility/string_utility";

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
        return new DataView(new ArrayBuffer(8));    // return NULL
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
        return new DataView(new ArrayBuffer(8));    // return NULL
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

