/**
 * @author Yutian Chen <yutianch@andrew.cmu.edu>
 * @abstract Load the native functions into C0ByteCode object returned by parser
 * @description The native function loader will add the native function
 * to the native function pool when the parser is parsing bc0 file.
 * The number of arguments is "injected" from the information in bc0 file
 * since it is recorded in the native pool part.
 *
 * This file only contains the native function loader & header, the actual
 * functions are defined in other files in this folder.
 */
import { build_c0_ptrValue, build_c0_stringValue, js_cvt2_c0_value } from "../../utility/c0_value_utility";
import { vm_error, vm_instruct_error } from "../../utility/errors";

import * as StringNative from "./native_strings";
import * as IONative from "./native_io";
import * as ParseNative from "./native_parse";
import * as FloatNative from "./native_float";

import * as TypeUtil from "../../utility/c0_type_utility";
/**
 * Load the C0Native Functions from bytecode to C0VM.
 * @param index Load the native function with specific index
 * @param numArgs Number of arguments the native function requires
 * @returns The C0Native, if implemented, or undefined, if not implemented
 */
export function nativeFuncLoader(
    index: number,
    numArgs: number
): C0Native {
    const native = nativeFuncMapping(index);
    native.numArgs = numArgs;
    return native;
}

/**
 * Load native functions dynamically
 * @param index The index of Native function
 * @returns A C0Native object that contains the entry-point of native function
 */
function nativeFuncMapping(index: number): C0Native {
    switch (index) {
        /* Command Line Arguments parsing */
        case 0:
            return {
                functionType: "NATIVE_ARGS_FLAG",
                numArgs: 0,
                f: () => nativeNotImplemented("NATIVE_ARGS_FLAG"),
            };
        case 1:
            return {
                functionType: "NATIVE_ARGS_INT",
                numArgs: 0,
                f: () => nativeNotImplemented("NATIVE_ARGS_INT"),
            };
        case 2:
            return {
                functionType: "NATIVE_ARGS_PARSE",
                numArgs: 0,
                f: () => nativeNotImplemented("NATIVE_ARGS_PARSE"),
            };
        case 3:
            return {
                functionType: "NATIVE_ARGS_STRING",
                numArgs: 0,
                f: () => nativeNotImplemented("NATIVE_ARGS_STRING"),
            };
        /* Native Standard I/O Functions */
        case 4:
            return {
                functionType: "NATIVE_EOF",
                numArgs: 0,
                f: (UIHook: ReactUIHook, mem: C0HeapAllocator) => {
                    return js_cvt2_c0_value(IONative.c0_eof());
                }
            }
        case 5:
            return {
                functionType: "NATIVE_FLUSH",
                numArgs: 0,
                f: (UIHook: ReactUIHook, mem: C0HeapAllocator) => {
                    return js_cvt2_c0_value(IONative.c0_flush());
                }
            };
        case 6:
            return {
                functionType: "NATIVE_PRINT",
                numArgs: 0,
                f: (UIHook: ReactUIHook, mem: C0HeapAllocator, arg1: C0Value<C0TypeClass>) => {
                    if (TypeUtil.maybeStringType(arg1)) {
                        return js_cvt2_c0_value(IONative.c0_print(UIHook, mem, arg1));
                    } else {
                        throw new vm_error(
                            "NATIVE_PRINT can only receive a string argument"
                        );
                    }
                },
            };
        case 7:
            return {
                functionType: "NATIVE_PRINTBOOL",
                numArgs: 0,
                f: (UIHook: ReactUIHook, mem: C0HeapAllocator, arg1: C0Value<C0TypeClass>) => {
                    if (TypeUtil.maybeValueType(arg1)) {
                        return js_cvt2_c0_value(
                            IONative.c0_print_bool(UIHook, mem, arg1)
                        );
                    }
                    throw new vm_error(
                        "NATIVE_PRINTBOOL can only receive a value argument"
                    );
                },
            };
        case 8:
            return {
                functionType: "NATIVE_PRINTCHAR",
                numArgs: 0,
                f: (UIHook: ReactUIHook, mem: C0HeapAllocator, arg1: C0Value<C0TypeClass>) => {
                    if (TypeUtil.maybeValueType(arg1)) {
                        return js_cvt2_c0_value(
                            IONative.c0_print_char(UIHook, mem, arg1)
                        );
                    }
                    throw new vm_error(
                        "PrintChar can only receive a value argument"
                    );
                },
            };
        case 9:
            return {
                functionType: "NATIVE_PRINTINT",
                numArgs: 0,
                f: (UIHook: ReactUIHook, mem: C0HeapAllocator, arg1: C0Value<C0TypeClass>) => {
                    if (TypeUtil.maybeValueType(arg1)) {
                        return js_cvt2_c0_value(
                            IONative.c0_print_int(UIHook, mem, arg1)
                        );
                    }
                    throw new vm_error(
                        "PrintInt can only receive a value argument"
                    );
                },
            };
        case 10:
            return {
                functionType: "NATIVE_PRINTLN",
                numArgs: 0,
                f: (UIHook: ReactUIHook, mem: C0HeapAllocator, arg1: C0Value<C0TypeClass>) => {
                    if (TypeUtil.maybeStringType(arg1)) {
                        return js_cvt2_c0_value(IONative.c0_println(UIHook, mem, arg1));
                    }
                    throw new vm_error(
                        "PrintLn can only receive a string argument"
                    );
                },
            };
        case 11:
            return {
                functionType: "NATIVE_READLINE",
                numArgs: 0,
                f: (UIHook: ReactUIHook, mem: C0HeapAllocator) => {
                    const ptr = IONative.c0_readline(mem);
                    return build_c0_stringValue(ptr);
                },
            };
        /** Double Type calculation */
        case 54: {
            return {
                functionType: "NATIVE_DADD",
                numArgs: 0,
                f: () => nativeNotImplemented("NATIVE_DADD"),
            };
        }
        case 55: {
            return {
                functionType: "NATIVE_DDIV",
                numArgs: 0,
                f: () => nativeNotImplemented("NATIVE_DDIV"),
            };
        }
        case 56: {
            return {
                functionType: "NATIVE_DLESS",
                numArgs: 0,
                f: () => nativeNotImplemented("NATIVE_DLESS"),
            };
        }
        case 57: {
            return {
                functionType: "NATIVE_DMUL",
                numArgs: 0,
                f: () => nativeNotImplemented("NATIVE_DMUL"),
            };
        }
        case 59: {
            return {
                functionType: "NATIVE_DSUB",
                numArgs: 0,
                f: () => nativeNotImplemented("NATIVE_DSUB"),
            };
        }
        case 60: {
            return {
                functionType: "NATIVE_DTOI",
                numArgs: 0,
                f: () => nativeNotImplemented("NATIVE_DTOI"),
            };
        }
        case 61: {
            return {
                functionType: "NATIVE_ITOD",
                numArgs: 0,
                f: () => nativeNotImplemented("NATIVE_ITOD"),
            };
        }
        case 62: {
            return {
                functionType: "NATIVE_PRINT_DUB",
                numArgs: 0,
                f: () => nativeNotImplemented("NATIVE_PRINT_DUB"),
            };
        }
        /* Floating Point Operations */
        case 67: {
            return {
                functionType: "NATIVE_FADD",
                numArgs: 0,
                f: () => nativeNotImplemented("NATIVE_FADD"),
            };
        }
        case 68: {
            return {
                functionType: "NATIVE_FDIV",
                numArgs: 0,
                f: () => nativeNotImplemented("NATIVE_FDIV"),
            };
        }
        case 69: {
            return {
                functionType: "NATIVE_FLESS",
                numArgs: 0,
                f: () => nativeNotImplemented("NATIVE_FLESS"),
            };
        }
        case 70: {
            return {
                functionType: "NATIVE_FMUL",
                numArgs: 0,
                f: () => nativeNotImplemented("NATIVE_FMUL"),
            };
        }
        case 71: {
            return {
                functionType: "NATIVE_FSUB",
                numArgs: 0,
                f: () => nativeNotImplemented("NATIVE_FSUB"),
            };
        }
        case 72: {
            return {
                functionType: "NATIVE_FTOI",
                numArgs: 0,
                f: () => nativeNotImplemented("NATIVE_FTOI"),
            };
        }
        case 73: {
            return {
                functionType: "NATIVE_ITOF",
                numArgs: 0,
                f: () => nativeNotImplemented("NATIVE_ITOF"),
            };
        }
        case 74: {
            return {
                functionType: "NATIVE_PRINT_FPT",
                numArgs: 0,
                f: () => nativeNotImplemented("NATIVE_PRINT_FPT"),
            };
        }
        case 75: {
            return {
                functionType: "NATIVE_PRINT_HEX",
                numArgs: 0,
                f: (
                    UIHooks: ReactUIHook,
                    mem: C0HeapAllocator,
                    arg1: C0Value<C0TypeClass>
                ) => {
                    if (TypeUtil.maybeValueType(arg1)){
                        return js_cvt2_c0_value(
                            FloatNative.c0_print_hex_fp(UIHooks, arg1)
                        );
                    }
                    throw new vm_error("NATIVE_PRINT_HEX only accepts (value) as input");
                },
            };
        }
        case 76: {
            return {
                functionType: "NATIVE_PRINT_INT",
                numArgs: 0,
                f: (
                    UIHooks: ReactUIHook,
                    mem: C0HeapAllocator,
                    arg1: C0Value<C0TypeClass>
                ) => {
                    if (TypeUtil.maybeValueType(arg1)) {
                        return js_cvt2_c0_value(
                            FloatNative.c0_print_int_fp(UIHooks, arg1)
                        );
                    }
                    throw new vm_error("NATIVE_PRINT_INT only supports (value) as input");
                },
            };
        }
        /** String Parsing Functions */
        case 85: {
            return {
                functionType: "NATIVE_INT_TOKENS",
                numArgs: 0,
                f: (
                    UIHooks: ReactUIHook,
                    mem: C0HeapAllocator,
                    arg1: C0Value<C0TypeClass>,
                    arg2: C0Value<C0TypeClass>
                ) => {
                    if (TypeUtil.maybeStringType(arg1)
                        && TypeUtil.maybeValueType(arg2)){
                        return build_c0_ptrValue(
                            ParseNative.c0_parse_ints(mem, arg1, arg2),
                            "arr",
                            {type: "value", value: "int"}
                        );
                    }
                    throw new vm_error("NATIVE_INT_TOKENS only accepts (string, value) as input");
                },
            };
        }
        case 86: {
            return {
                functionType: "NATIVE_NUM_TOKENS",
                numArgs: 0,
                f: (
                    UIHooks: ReactUIHook,
                    mem: C0HeapAllocator,
                    arg1: C0Value<C0TypeClass>
                ) => {
                    if (TypeUtil.maybeStringType(arg1)) {
                        return js_cvt2_c0_value(
                            ParseNative.c0_num_tokens(mem, arg1)
                        );
                    }
                    throw new vm_error("NATIVE_NUM_TOKENS only accepts (string) as input");
                },
            };
        }
        case 87: {
            return {
                functionType: "NATIVE_PARSE_BOOL",
                numArgs: 0,
                f: (
                    UIHooks: ReactUIHook,
                    mem: C0HeapAllocator, 
                    arg1: C0Value<C0TypeClass>
                ) => {
                    if (TypeUtil.maybeStringType(arg1)) {
                        return build_c0_ptrValue(
                            ParseNative.c0_parse_bool(mem, arg1),
                            "ptr",
                            {type: "value", value: "bool"}
                        );
                    }
                    throw new vm_error("NATIVE_PARSE_BOOL only accepts (string) as input");
                },
            };
        }
        case 88: {
            return {
                functionType: "NATIVE_PARSE_INT",
                numArgs: 0,
                f: (
                    UIHooks: ReactUIHook,
                    mem: C0HeapAllocator,
                    arg1: C0Value<C0TypeClass>,
                    arg2: C0Value<C0TypeClass>
                ) => {
                    if (TypeUtil.maybeStringType(arg1) 
                        && TypeUtil.maybeValueType(arg2)) {
                        return build_c0_ptrValue(
                            ParseNative.c0_parse_int(mem, arg1, arg2),
                            "ptr",
                            {type: "value", value: "int"}
                        );
                    }
                    throw new vm_error("NATIVE_PARSE_INT only accepts (string, value) as input");
                },
            };
        }
        case 89: {
            return {
                functionType: "NATIVE_PARSE_INTS",
                numArgs: 0,
                f: (
                    UIHooks: ReactUIHook,
                    mem: C0HeapAllocator,
                    arg1: C0Value<C0TypeClass>,
                    arg2: C0Value<C0TypeClass>
                ) => {
                    if (TypeUtil.maybeStringType(arg1)
                        && TypeUtil.maybeValueType(arg2)) {
                        return build_c0_ptrValue(
                            ParseNative.c0_parse_ints(mem, arg1, arg2),
                            "arr",
                            {type: "value", value: "int"}
                        );
                    }
                    throw new vm_error("NATIVE_PARSE_INTS only accepts (string, value) as input");
                },
            };
        }
        case 90: {
            return {
                functionType: "NATIVE_PARSE_TOKENS",
                numArgs: 0,
                f: (
                    UIHooks: ReactUIHook,
                    mem: C0HeapAllocator,
                    arg1: C0Value<C0TypeClass>
                ) => {
                    if (TypeUtil.maybeStringType(arg1)) {
                        return build_c0_ptrValue(
                            ParseNative.c0_parse_tokens(mem, arg1),
                            "ptr",
                            {type: "string", value: "string"}
                        );
                    }
                    throw new vm_error("NATIVE_PARSE_TOKENS only accepts (string) as input");
                },
            };
        }
        /** String and Char Operations */
        case 91: {
            return {
                functionType: "NATIVE_CHAR_CHR",
                numArgs: 0,
                f: (
                    UIHooks: ReactUIHook,
                    mem: C0HeapAllocator,
                    arg1: C0Value<C0TypeClass>) => {
                        if (TypeUtil.maybeValueType(arg1)) {
                            return js_cvt2_c0_value(
                                StringNative.c0_char_chr(arg1)
                            );
                        }
                        throw new vm_error("NATIVE_CHAR_CHR only accepts (value) as input");
                    },
            };
        }
        case 92: {
            return {
                functionType: "NATIVE_CHAR_ORD",
                numArgs: 0,
                f: (
                    UIHooks: ReactUIHook,
                    mem: C0HeapAllocator,
                    arg1: C0Value<C0TypeClass>) => {
                        if (TypeUtil.maybeValueType(arg1)) {
                            return js_cvt2_c0_value(
                                StringNative.c0_char_ord(arg1)
                            );
                        }
                        throw new vm_error("NATIVE_CHAR_ORD only accepts (value) as input");
                    },
            };
        }
        case 93: {
            return {
                functionType: "NATIVE_STRING_CHARAT",
                numArgs: 0,
                f: (
                    UIHooks: ReactUIHook,
                    mem: C0HeapAllocator,
                    arg1: C0Value<C0TypeClass>,
                    arg2: C0Value<C0TypeClass>
                ) => {
                    if (
                        TypeUtil.maybeStringType(arg1) &&
                        TypeUtil.maybeValueType(arg2)
                    ) {
                        return js_cvt2_c0_value(
                            StringNative.c0_string_charat(mem, arg1, arg2)
                        );
                    }
                    throw new vm_error(
                        "NATIVE_STRING_CHARAT only accepts (string, value) as input"
                    );
                },
            };
        }
        case 94: {
            return {
                functionType: "NATIVE_STRING_COMPARE",
                numArgs: 0,
                f: (
                    UIHooks: ReactUIHook,
                    mem: C0HeapAllocator,
                    arg1: C0Value<C0TypeClass>,
                    arg2: C0Value<C0TypeClass>
                ) => {
                    if (
                        TypeUtil.maybeStringType(arg1) &&
                        TypeUtil.maybeStringType(arg2)
                    ) {
                        return js_cvt2_c0_value(
                            StringNative.c0_string_compare(mem, arg1, arg2)
                        );
                    }
                    throw new vm_error(
                        "NATIVE_STRING_COMPARE only accepts (string, string) as input"
                    );
                },
            };
        }
        case 95: {
            return {
                functionType: "NATIVE_STRING_EQUAL",
                numArgs: 0,
                f: (
                    UIHooks: ReactUIHook,
                    mem: C0HeapAllocator,
                    arg1: C0Value<C0TypeClass>,
                    arg2: C0Value<C0TypeClass>
                ) => {
                    if (
                        TypeUtil.maybeStringType(arg1) &&
                        TypeUtil.maybeStringType(arg2)
                    ) {
                        return js_cvt2_c0_value(
                            StringNative.c0_string_equal(mem, arg1, arg2)
                        );
                    }
                    throw new vm_error(
                        "NATIVE_STRING_EQUAL only accepts (string, string) as input"
                    );
                },
            };
        }
        case 96: {
            return {
                functionType: "NATIVE_STRING_FROM_CHARARRAY",
                numArgs: 0,
                f: (UIHook: ReactUIHook, mem: C0HeapAllocator, arg1: C0Value<C0TypeClass>) => {
                    if (TypeUtil.maybePointerType(arg1)) {
                        return build_c0_stringValue(
                            StringNative.c0_string_from_chararray(mem, arg1)
                        );
                    }
                    throw new vm_error(
                        "NATIVE_STRING_FROM_CHARARRAY only accepts ptr as input"
                    );
                },
            };
        }
        case 97: {
            return {
                functionType: "NATIVE_STRING_FROMBOOL",
                numArgs: 0,
                f: (UIHook: ReactUIHook, mem: C0HeapAllocator, arg1: C0Value<C0TypeClass>) => {
                    if (TypeUtil.maybeValueType(arg1)) {
                        return build_c0_stringValue(StringNative.c0_string_frombool(mem, arg1));
                    }
                    throw new vm_error(
                        "NATIVE_STRING_FROMBOOL only accepts value as input"
                    );
                },
            };
        }
        case 98: {
            return {
                functionType: "NATIVE_STRING_FROMCHAR",
                numArgs: 0,
                f: (UIHook: ReactUIHook, mem: C0HeapAllocator, arg1: C0Value<C0TypeClass>) => {
                    if (TypeUtil.maybeValueType(arg1)) {
                        return build_c0_stringValue(
                            StringNative.c0_string_fromchar(mem, arg1)
                        );
                    }
                    throw new vm_error(
                        "NATIVE_STRING_FROMCHAR only accepts value as input"
                    );
                },
            };
        }
        case 99: {
            return {
                functionType: "NATIVE_STRING_FROMINT",
                numArgs: 0,
                f: (UIHook: ReactUIHook, mem: C0HeapAllocator, arg1: C0Value<C0TypeClass>) => {
                    if (TypeUtil.maybeValueType(arg1)) {
                        return build_c0_stringValue(
                            StringNative.c0_string_fromint(mem, arg1)
                        );
                    }
                    throw new vm_error(
                        "NATIVE_STRING_FROMINT only accepts value as input"
                    );
                },
            };
        }
        case 100: {
            return {
                functionType: "NATIVE_STRING_JOIN",
                numArgs: 0,
                f: (
                    UIHook: ReactUIHook,
                    mem: C0HeapAllocator,
                    arg1: C0Value<C0TypeClass>,
                    arg2: C0Value<C0TypeClass>
                ) => {
                    if (
                        TypeUtil.maybeStringType(arg1) &&
                        TypeUtil.maybeStringType(arg2)
                    ) {
                        return build_c0_stringValue(
                            StringNative.c0_string_join(mem, arg1, arg2)
                        );
                    }
                    throw new vm_error(
                        "NATIVE_STRING_JOIN only accepts (string, string) as input"
                    );
                },
            };
        }
        case 101: {
            return {
                functionType: "NATIVE_STRING_LENGTH",
                numArgs: 0,
                f: (UIHook: ReactUIHook, mem: C0HeapAllocator, arg1: C0Value<C0TypeClass>) => {
                    if (TypeUtil.maybeStringType(arg1)) {
                        return js_cvt2_c0_value(
                            StringNative.c0_string_length(mem, arg1)
                        );
                    }
                    throw new vm_error(
                        "NATIVE_STRING_LENGTH only accepts string as input"
                    );
                },
            };
        }
        case 102: {
            return {
                functionType: "NATIVE_STRING_SUB",
                numArgs: 0,
                f: (
                    UIHook: ReactUIHook,
                    mem: C0HeapAllocator,
                    arg1: C0Value<C0TypeClass>,
                    arg2: C0Value<C0TypeClass>,
                    arg3: C0Value<C0TypeClass>,
                ) => {
                    if (
                        TypeUtil.maybeStringType(arg1) &&
                        TypeUtil.maybeValueType(arg2) &&
                        TypeUtil.maybeValueType(arg3)
                    ) {
                        return build_c0_stringValue(
                            StringNative.c0_string_sub(mem, arg1, arg2, arg3)
                        );
                    }
                    throw new vm_error(
                        "NATIVE_STRING_SUB only accepts (string, value, value) as input"
                    );
                },
            };
        }
        case 103: {
            return {
                functionType: "NATIVE_STRING_TERMINATED",
                numArgs: 0,
                f: (
                    UIHook: ReactUIHook,
                    mem: C0HeapAllocator,
                    arg1: C0Value<C0TypeClass>,
                    arg2: C0Value<C0TypeClass>
                ) => {
                    if (
                        TypeUtil.maybePointerType(arg1) &&
                        TypeUtil.maybeValueType(arg2)
                    ) {
                        return js_cvt2_c0_value(
                            StringNative.c0_string_terminated(mem, arg1, arg2)
                        );
                    }
                    throw new vm_error(
                        "NATIVE_STRING_TERMINATED only accepts (ptr, value) as input"
                    );
                },
            };
        }
        case 104: {
            return {
                functionType: "NATIVE_STRING_TO_CHARARRAY",
                numArgs: 0,
                f: (UIHook: ReactUIHook, mem: C0HeapAllocator, arg1: C0Value<C0TypeClass>) => {
                    if (TypeUtil.maybeStringType(arg1)) {
                        return build_c0_ptrValue(
                            StringNative.c0_string_to_chararray(mem, arg1),
                            "arr",
                            { type: "value", value: "char" }
                        );
                    }
                    throw new vm_error(
                        "NATIVE_STRING_TO_CHARARRAY only accepts (string) as input"
                    );
                },
            };
        }
        case 105: {
            return {
                functionType: "NATIVE_STRING_TOLOWER",
                numArgs: 0,
                f: (UIHook: ReactUIHook, mem: C0HeapAllocator, arg1: C0Value<C0TypeClass>) => {
                    if (TypeUtil.maybeStringType(arg1)) {
                        return build_c0_stringValue(
                            StringNative.c0_string_tolower(mem, arg1)
                        );
                    }
                    throw new vm_error(
                        "NATIVE_STRING_TOLOWER only accepts (string) as input"
                    );
                },
            };
        }
        default:
            return {
                functionType: "NATIVE_NOT_RECOGNIZED",
                numArgs: 0,
                f: () => nativeNotImplemented("NATIVE_NOT_RECOGNIZED")
            }; // Everything not (planned to be) implemented yet goes here.
    }
}

// TODO: fancy error for user - not supporting XXX_FUNCTION

function nativeNotImplemented(name: C0NativeFuncType): never {
    throw new vm_instruct_error(`Native function ${name} is not supported yet.`);
}

/*
#define   NATIVE_ARGS_FLAG                          0
c0_value __c0ffi_args_flag(c0_value *);
#define   NATIVE_ARGS_INT                           1
c0_value __c0ffi_args_int(c0_value *);
#define   NATIVE_ARGS_PARSE                         2
c0_value __c0ffi_args_parse(c0_value *);
#define   NATIVE_ARGS_STRING                        3
c0_value __c0ffi_args_string(c0_value *);

#define   NATIVE_EOF                                4
c0_value __c0ffi_eof(c0_value *);
#define   NATIVE_FLUSH                              5
c0_value __c0ffi_flush(c0_value *);
#define   NATIVE_PRINT                              6
c0_value __c0ffi_print(c0_value *);
#define   NATIVE_PRINTBOOL                          7
c0_value __c0ffi_printbool(c0_value *);
#define   NATIVE_PRINTCHAR                          8
c0_value __c0ffi_printchar(c0_value *);
#define   NATIVE_PRINTINT                           9
c0_value __c0ffi_printint(c0_value *);
#define   NATIVE_PRINTLN                            10
c0_value __c0ffi_println(c0_value *);
#define   NATIVE_READLINE                           11
c0_value __c0ffi_readline(c0_value *);

#define   NATIVE_C_ADDCH                            12
c0_value __c0ffi_c_addch(c0_value *);
#define   NATIVE_C_CBREAK                           13
c0_value __c0ffi_c_cbreak(c0_value *);
#define   NATIVE_C_CURS_SET                         14
c0_value __c0ffi_c_curs_set(c0_value *);
#define   NATIVE_C_DELCH                            15
c0_value __c0ffi_c_delch(c0_value *);
#define   NATIVE_C_ENDWIN                           16
c0_value __c0ffi_c_endwin(c0_value *);
#define   NATIVE_C_ERASE                            17
c0_value __c0ffi_c_erase(c0_value *);
#define   NATIVE_C_GETCH                            18
c0_value __c0ffi_c_getch(c0_value *);
#define   NATIVE_C_INITSCR                          19
c0_value __c0ffi_c_initscr(c0_value *);
#define   NATIVE_C_KEYPAD                           20
c0_value __c0ffi_c_keypad(c0_value *);
#define   NATIVE_C_MOVE                             21
c0_value __c0ffi_c_move(c0_value *);
#define   NATIVE_C_NOECHO                           22
c0_value __c0ffi_c_noecho(c0_value *);
#define   NATIVE_C_REFRESH                          23
c0_value __c0ffi_c_refresh(c0_value *);
#define   NATIVE_C_SUBWIN                           24
c0_value __c0ffi_c_subwin(c0_value *);
#define   NATIVE_C_WADDCH                           25
c0_value __c0ffi_c_waddch(c0_value *);
#define   NATIVE_C_WADDSTR                          26
c0_value __c0ffi_c_waddstr(c0_value *);
#define   NATIVE_C_WCLEAR                           27
c0_value __c0ffi_c_wclear(c0_value *);
#define   NATIVE_C_WERASE                           28
c0_value __c0ffi_c_werase(c0_value *);
#define   NATIVE_C_WMOVE                            29
c0_value __c0ffi_c_wmove(c0_value *);
#define   NATIVE_C_WREFRESH                         30
c0_value __c0ffi_c_wrefresh(c0_value *);
#define   NATIVE_C_WSTANDEND                        31
c0_value __c0ffi_c_wstandend(c0_value *);
#define   NATIVE_C_WSTANDOUT                        32
c0_value __c0ffi_c_wstandout(c0_value *);
#define   NATIVE_CC_GETBEGX                         33
c0_value __c0ffi_cc_getbegx(c0_value *);
#define   NATIVE_CC_GETBEGY                         34
c0_value __c0ffi_cc_getbegy(c0_value *);
#define   NATIVE_CC_GETMAXX                         35
c0_value __c0ffi_cc_getmaxx(c0_value *);
#define   NATIVE_CC_GETMAXY                         36
c0_value __c0ffi_cc_getmaxy(c0_value *);
#define   NATIVE_CC_GETX                            37
c0_value __c0ffi_cc_getx(c0_value *);
#define   NATIVE_CC_GETY                            38
c0_value __c0ffi_cc_gety(c0_value *);
#define   NATIVE_CC_HIGHLIGHT                       39
c0_value __c0ffi_cc_highlight(c0_value *);
#define   NATIVE_CC_KEY_IS_BACKSPACE                40
c0_value __c0ffi_cc_key_is_backspace(c0_value *);
#define   NATIVE_CC_KEY_IS_DOWN                     41
c0_value __c0ffi_cc_key_is_down(c0_value *);
#define   NATIVE_CC_KEY_IS_ENTER                    42
c0_value __c0ffi_cc_key_is_enter(c0_value *);
#define   NATIVE_CC_KEY_IS_LEFT                     43
c0_value __c0ffi_cc_key_is_left(c0_value *);
#define   NATIVE_CC_KEY_IS_RIGHT                    44
c0_value __c0ffi_cc_key_is_right(c0_value *);
#define   NATIVE_CC_KEY_IS_UP                       45
c0_value __c0ffi_cc_key_is_up(c0_value *);
#define   NATIVE_CC_WBOLDOFF                        46
c0_value __c0ffi_cc_wboldoff(c0_value *);
#define   NATIVE_CC_WBOLDON                         47
c0_value __c0ffi_cc_wboldon(c0_value *);
#define   NATIVE_CC_WDIMOFF                         48
c0_value __c0ffi_cc_wdimoff(c0_value *);
#define   NATIVE_CC_WDIMON                          49
c0_value __c0ffi_cc_wdimon(c0_value *);
#define   NATIVE_CC_WREVERSEOFF                     50
c0_value __c0ffi_cc_wreverseoff(c0_value *);
#define   NATIVE_CC_WREVERSEON                      51
c0_value __c0ffi_cc_wreverseon(c0_value *);
#define   NATIVE_CC_WUNDEROFF                       52
c0_value __c0ffi_cc_wunderoff(c0_value *);
#define   NATIVE_CC_WUNDERON                        53
c0_value __c0ffi_cc_wunderon(c0_value *);

#define   NATIVE_DADD                               54
c0_value __c0ffi_dadd(c0_value *);
#define   NATIVE_DDIV                               55
c0_value __c0ffi_ddiv(c0_value *);
#define   NATIVE_DLESS                              56
c0_value __c0ffi_dless(c0_value *);
#define   NATIVE_DMUL                               57
c0_value __c0ffi_dmul(c0_value *);
#define   NATIVE_DSUB                               58
c0_value __c0ffi_dsub(c0_value *);
#define   NATIVE_DTOI                               59
c0_value __c0ffi_dtoi(c0_value *);
#define   NATIVE_ITOD                               60
c0_value __c0ffi_itod(c0_value *);
#define   NATIVE_PRINT_DUB                          61
c0_value __c0ffi_print_dub(c0_value *);

#define   NATIVE_FILE_CLOSE                         62
c0_value __c0ffi_file_close(c0_value *);
#define   NATIVE_FILE_CLOSED                        63
c0_value __c0ffi_file_closed(c0_value *);
#define   NATIVE_FILE_EOF                           64
c0_value __c0ffi_file_eof(c0_value *);
#define   NATIVE_FILE_READ                          65
c0_value __c0ffi_file_read(c0_value *);
#define   NATIVE_FILE_READLINE                      66
c0_value __c0ffi_file_readline(c0_value *);


#define   NATIVE_FADD                               67
c0_value __c0ffi_fadd(c0_value *);
#define   NATIVE_FDIV                               68
c0_value __c0ffi_fdiv(c0_value *);
#define   NATIVE_FLESS                              69
c0_value __c0ffi_fless(c0_value *);
#define   NATIVE_FMUL                               70
c0_value __c0ffi_fmul(c0_value *);
#define   NATIVE_FSUB                               71
c0_value __c0ffi_fsub(c0_value *);
#define   NATIVE_FTOI                               72
c0_value __c0ffi_ftoi(c0_value *);
#define   NATIVE_ITOF                               73
c0_value __c0ffi_itof(c0_value *);
#define   NATIVE_PRINT_FPT                          74
c0_value __c0ffi_print_fpt(c0_value *);
#define   NATIVE_PRINT_HEX                          75
c0_value __c0ffi_print_hex(c0_value *);
#define   NATIVE_PRINT_INT                          76
c0_value __c0ffi_print_int(c0_value *);

#define   NATIVE_IMAGE_CLONE                        77
c0_value __c0ffi_image_clone(c0_value *);
#define   NATIVE_IMAGE_CREATE                       78
c0_value __c0ffi_image_create(c0_value *);
#define   NATIVE_IMAGE_DATA                         79
c0_value __c0ffi_image_data(c0_value *);
#define   NATIVE_IMAGE_HEIGHT                       80
c0_value __c0ffi_image_height(c0_value *);
#define   NATIVE_IMAGE_LOAD                         81
c0_value __c0ffi_image_load(c0_value *);
#define   NATIVE_IMAGE_SAVE                         82
c0_value __c0ffi_image_save(c0_value *);
#define   NATIVE_IMAGE_SUBIMAGE                     83
c0_value __c0ffi_image_subimage(c0_value *);
#define   NATIVE_IMAGE_WIDTH                        84
c0_value __c0ffi_image_width(c0_value *);

#define   NATIVE_INT_TOKENS                         85
c0_value __c0ffi_int_tokens(c0_value *);
#define   NATIVE_NUM_TOKENS                         86
c0_value __c0ffi_num_tokens(c0_value *);
#define   NATIVE_PARSE_BOOL                         87
c0_value __c0ffi_parse_bool(c0_value *);
#define   NATIVE_PARSE_INT                          88
c0_value __c0ffi_parse_int(c0_value *);
#define   NATIVE_PARSE_INTS                         89
c0_value __c0ffi_parse_ints(c0_value *);
#define   NATIVE_PARSE_TOKENS                       90
c0_value __c0ffi_parse_tokens(c0_value *);

#define   NATIVE_CHAR_CHR                           91
c0_value __c0ffi_char_chr(c0_value *);
#define   NATIVE_CHAR_ORD                           92
c0_value __c0ffi_char_ord(c0_value *);
#define   NATIVE_STRING_CHARAT                      93
c0_value __c0ffi_string_charat(c0_value *);
#define   NATIVE_STRING_COMPARE                     94
c0_value __c0ffi_string_compare(c0_value *);
#define   NATIVE_STRING_EQUAL                       95
c0_value __c0ffi_string_equal(c0_value *);
#define   NATIVE_STRING_FROM_CHARARRAY              96
c0_value __c0ffi_string_from_chararray(c0_value *);
#define   NATIVE_STRING_FROMBOOL                    97
c0_value __c0ffi_string_frombool(c0_value *);
#define   NATIVE_STRING_FROMCHAR                    98
c0_value __c0ffi_string_fromchar(c0_value *);
#define   NATIVE_STRING_FROMINT                     99
c0_value __c0ffi_string_fromint(c0_value *);
#define   NATIVE_STRING_JOIN                        100
c0_value __c0ffi_string_join(c0_value *);
#define   NATIVE_STRING_LENGTH                      101
c0_value __c0ffi_string_length(c0_value *);
#define   NATIVE_STRING_SUB                         102
c0_value __c0ffi_string_sub(c0_value *);
#define   NATIVE_STRING_TERMINATED                  103
c0_value __c0ffi_string_terminated(c0_value *);
#define   NATIVE_STRING_TO_CHARARRAY                104
c0_value __c0ffi_string_to_chararray(c0_value *);
#define   NATIVE_STRING_TOLOWER                     105
c0_value __c0ffi_string_tolower(c0_value *);
*/
