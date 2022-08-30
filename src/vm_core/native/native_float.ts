/**
 * @author Yutian Chen <yutianch@andrew.cmu.edu>
 * @description Implementation of C0 native float functions in TypeScript
 * 
 * @note We only support NATIVE_PRINT_HEX and NATIVE_PRINT_INT in this group
 * of native functions
 * 
 * Source: cc0/libs/fpt/fpt.c
 */

import { castToType } from "../../utility/c0_type_utility";
import { c0_cvt2_js_value } from "../../utility/c0_value_utility";

export function c0_print_int_fp(
    hooks: ReactUIHook,
    arg1: C0Value<Maybe<"value">>
): number {
    arg1 = castToType<"value">(arg1, {type: "value", value: "int"});
    const str = c0_cvt2_js_value(arg1) + "";
    hooks.print_update(str);
    return 1;   // Same behavior as C implementation
}

export function c0_print_hex_fp(
    hooks: ReactUIHook,
    arg1: C0Value<Maybe<"value">>
): number {
    arg1 = castToType<"value">(arg1, {type: "value", value: "int"});
    const num = c0_cvt2_js_value(arg1) as number;
    hooks.print_update(num.toString(16));
    return 1;
}
