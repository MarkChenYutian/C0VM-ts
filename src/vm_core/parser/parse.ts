import { String2Type, Type2String } from "../../utility/c0_type_utility";
import { bc0_format_error, vm_error, empty_code_error } from "../../utility/errors";
import { nativeFuncLoader } from "../native/native_interface";

/**
 * Parse the bytecode string to C0ByteCode Data Structure.
 * Terms: | token | # byte_instruct | # program_snippet | # comment(?) |
 * * If comment starts with ./cache/... 
 *      We know the bytecode comes from remote compile.
 *      * If typedefRecord != undefined ..
 *          In this case, apply typedef mapping and continue parsing
 *          ```c0
 *          typedef struct T* T_t;
 *          ```
 *          Then we will replace all T_t in comment with struct T*
 * 
 * @param bytecode Bytecode String from .bc0 or remote compiler
 * @param C0Editors Current c0 source code in editor
 * @param typedefRecord Typedef information extracted from c0 editors
 * @returns A parsed bytecode data structure.
 */
export default function parse(bytecode: string, typedef_lib: Map<string, string>): C0ByteCode {
    const lines = annotate_linenum(bytecode);   // Add line number info to each line
    const blocks = split_blocks(lines);

    if (bytecode==="") throw new empty_code_error();

    let parser_internal_state: "header" | "int" | "string" | "funchead" | "function" = "header";
    const parsing: C0ByteCode = {
        version: -1,
        intCount: -1,
        intPool: new Int32Array([]),
        stringCount: -1,
        stringPool: new Uint8Array([]),
        functionCount: -1,
        functionPool: [],
        nativeCount: -1,
        nativePool: []
    };

    for (let idx = 0; idx < blocks.length - 1; idx ++) {
        switch (parser_internal_state) {
            case "header":
                parsing.version = parse_magic_header(blocks[idx]);
                parser_internal_state = "int";
                break;
            case "int": 
                [parsing.intCount, parsing.intPool] = parse_int_pool(blocks[idx]);
                parser_internal_state = "string";
                break;
            case "string":
                [parsing.stringCount, parsing.stringPool] = parse_str_pool(blocks[idx]);
                parser_internal_state = "funchead";
                break;
            case "funchead":
                parsing.functionCount = parse_func_head(blocks[idx]);
                parser_internal_state = "function";
                break;
            case "function":
                parsing.functionPool.push(parse_func_block(blocks[idx], typedef_lib));
                break;
        }
    }

    // Load Native function here
    [parsing.nativeCount, parsing.nativePool] = parse_native_block(blocks[blocks.length - 1]);

    return parsing;
}

//// Regex Constants
const regex_func_name = /#<(.+)>/;
const regex_aaddf_comment = /^&?.*->\s*([a-zA-Z_0-9]+)$/;
// const regex_arr_base_comment = /^alloc_array\(\s*([a-zA-Z0-9_\s]+)([*[\]]*),.+\)/;
const regex_arr_comment = /^alloc_array\(\s*([a-zA-Z0-9_\-*[\]\s]+),.+\)/;
const regex_new_comment = /^alloc\(\s*([a-zA-Z0-9_\-*[\]\s]+)\s*\)/;
const regex_ref_comment = /^.*\.c(0|1): \d+\.\d+-\d+.\d+$/;

const regex_int_comment = /(\d+)|(dummy return value)/;
const regex_bool_comment = /(true)|(false)/;
const regex_char_comment = /'.*'/;
////////////////////

function safe_parse_hex(s: string): number {
    const res = parseInt(s, 16);
    if (isNaN(res)) throw new bc0_format_error();
    return res;
}

function safe_combine_and_parse_hex(s: string): number {
    return safe_parse_hex(s.replaceAll(" ", ""));
}

function annotate_linenum(bytecode: string): [string, number][] {
    return bytecode.split("\n").map((line, index) => [line, index + 1]);
}

function split_blocks(lines: [string, number][]): [string, number][][] {
    const result: [string, number][][] = [[]];
    for (let i = 0; i < lines.length; i ++) {
        if (lines[i][0] === "") {
            result.push([]);
            while(i < lines.length && lines[i][0] === "") i ++;
            i -= 1;
            continue;
        }
        (result[result.length - 1]).push(lines[i]);
    }
    if (result[result.length - 1].length === 0) result.pop();
    return result;
}

// Given header block, check for magic number, return version
function parse_magic_header(header: [string, number][]): number {
    if (header.length !== 2 || !header[0][0].toUpperCase().startsWith("C0 C0 FF EE")) {
        throw new bc0_format_error();
    }
    return safe_combine_and_parse_hex(header[1][0]);
}

function resolve_field_name(byte_instruct: string, comment: string): string | undefined {
    if (!byte_instruct.toUpperCase().startsWith("AADDF")) return undefined;
    const parsed_comment = regex_aaddf_comment.exec(comment);
    if (parsed_comment === null) return undefined;
    return parsed_comment[1];
}

function resolve_type_info(byte_instruct: string, comment: string, typedef_lib: Map<AliasType, SourceType>): string | undefined {
    if (byte_instruct.toUpperCase().startsWith("NEWARRAY")) {
        const parsed_comment = regex_arr_comment.exec(comment);
        if (parsed_comment === null) return undefined;
        
        return Type2String(apply_typedef(String2Type(parsed_comment[1]), typedef_lib));
    } else if (byte_instruct.toUpperCase().startsWith("NEW")) {
        const parsed_comment = regex_new_comment.exec(comment);
        if (parsed_comment === null) return undefined;
        
        return Type2String(apply_typedef(String2Type(parsed_comment[1]), typedef_lib));
    } else if (byte_instruct.toUpperCase().startsWith("BIPUSH")) {
        if (regex_int_comment.test(comment)) return "int";
        else if (regex_bool_comment.test(comment)) return "bool";
        else if (regex_char_comment.test(comment)) return "char";
        else return "bool"; // noticed that cc0 compiler may not always generate type hint on comment column
        // For instance, when running assert(!f(x)), a 1 will be pushed onto stack and run ixor with f(x)
    }
    return undefined;
}

function apply_typedef(type: C0Type<C0TypeClass>, typedef_lib: Map<AliasType, SourceType>): C0Type<C0TypeClass>{
    if (type.type === "<unknown>" || type.type === "tagptr" || type.type === "funcptr") return type;
    const type_str = Type2String(type);
    const concrete = typedef_lib?.get(type_str);
    if (concrete === undefined) {
        const next_parse = type.value;
        if (typeof next_parse === "string") return type;
        type.value = apply_typedef(next_parse, typedef_lib)
        return type
    } else {
        return String2Type(concrete);
    }
}

function resolve_var_name(bytes: string, byte_instruct: string, segment: string): [number, string] | undefined {
    if (byte_instruct.toUpperCase().startsWith("VLOAD")) {
        return [safe_parse_hex(bytes.split(" ")[1]), segment];
    } else if (byte_instruct.toUpperCase().startsWith("VSTORE")) {
        return [safe_parse_hex(bytes.split(" ")[1]), segment.split("=")[0].trim()]
    }
    return undefined;
}

function parse_int_pool(int_block: [string, number][]): [number, Int32Array] {
    if (int_block.length < 2) throw new bc0_format_error();
    if (int_block[1][0] !== "# int pool") throw new bc0_format_error();

    const intCount = safe_combine_and_parse_hex(int_block[0][0].split("#")[0]);

    const intLines = int_block.slice(2,undefined).map(([string, _]) => string.split(" ")).flat();
    const intHexs = new Uint8Array(intLines.map((num) => safe_parse_hex(num)));
    const intPool = new Int32Array(intHexs.buffer);

    if (intCount !== intPool.length) throw new bc0_format_error();

    return [intCount, intPool]
}

function parse_str_pool(str_block: [string, number][]): [number, Uint8Array] {
    if (str_block.length < 2) throw new bc0_format_error();
    if (str_block[1][0] !== "# string pool") throw new bc0_format_error();

    const strCount = safe_combine_and_parse_hex(str_block[0][0].split("#")[0]);

    const strLines = str_block.slice(2, undefined).map(([string, _]) => string.split("#")[0]);
    let strBytes = strLines.map((line) => line.split(" ")).flat();
    strBytes = strBytes.filter((v) => v !== "");
    const strHexs  = new Uint8Array(strBytes.map((tok) => safe_parse_hex(tok)));

    if (strCount !== strHexs.length) throw new bc0_format_error();

    return [strCount, strHexs];
}

// Return number of C0Functions in bytecode
function parse_func_head(func_head: [string, number][]): number {
    if (func_head.length !== 2) throw new bc0_format_error();
    if (func_head[1][0] !== "# function_pool") throw new bc0_format_error();

    return safe_combine_and_parse_hex(func_head[0][0].split("#")[0]);
}

function resolve_src_reference(comment_ref: string): [string, number, number, number, number] | undefined {
    if (!regex_ref_comment.test(comment_ref)) return undefined;
    const file = comment_ref.startsWith("./cache/")
        ? comment_ref.split("/").slice(3,).join("/")    /* Is internal file (compile from source code) */
        : comment_ref;                                  /* Is external file (lib or object file) */
    
    const [file_name, line_range] = file.split(": ");
    const [start_pos, end_pos] = line_range.split("-");
    const [start_ln, start_col] = start_pos.split(".").map((tok) => parseInt(tok));
    const [end_ln, end_col]     = end_pos.split(".").map((tok) => parseInt(tok));

    if (isNaN(start_ln) || isNaN(start_col) || isNaN(end_ln) || isNaN(end_col)) throw new bc0_format_error();

    return [file_name, start_ln, start_col, end_ln, end_col];
}

function parse_func_block(func_block: [string, number][], typedef_lib: Map<string, string>) {
    if (func_block.length < 4) throw new bc0_format_error();
    const result: C0Function = {
        name: "undefined",
        code: new Uint8Array(),
        numVars: -1,
        argName: [],
        numArgs: -1,
        size: -1,
        comment: new Map()
    };
    
    let func_name = regex_func_name.exec(func_block[0][0]);
    if (func_name === null || func_name[1] === undefined) throw new bc0_format_error();

    result.name = func_name[1];
    result.numArgs = safe_parse_hex(func_block[1][0].split("#")[0]);
    result.numVars = safe_parse_hex(func_block[2][0].split("#")[0]);
    result.argName = new Array(result.numArgs).fill("<Anonymous>");
    result.size = safe_combine_and_parse_hex(func_block[3][0].split("#")[0]);

    let bytecode_pos = 0;
    let c0_mode      = false;
    const code_num   = [];


    for (let bc_line = 4; bc_line < func_block.length; bc_line ++) {
        const curr_bc_line = func_block[bc_line][0];
        if (curr_bc_line.startsWith("#")) continue;

        let [tokens, byte_instruct, segment, comment] = curr_bc_line.split("#");

        tokens        = tokens.trim();
        byte_instruct = byte_instruct.trim();
        segment       = segment.trim();
        if (comment !== undefined) {
            c0_mode   = true
            comment   = comment.trim();
        }

        const c0_ref_pos = resolve_src_reference(comment);
        const num_tokens = tokens.split(" ").map(tok => safe_parse_hex(tok));
        for (let i = 0; i < num_tokens.length; i ++) code_num.push(num_tokens[i]);

        const var_name = resolve_var_name(tokens, byte_instruct, segment);
        if (var_name !== undefined && result.argName[var_name[0]] === "<Anonymous>" && var_name[0] < result.numArgs) {
            result.argName[var_name[0]] = var_name[1];
        }
        
        result.comment.set(bytecode_pos, {
            lineNumber: func_block[bc_line][1],
            fieldName: resolve_field_name(byte_instruct, segment),
            dataType : resolve_type_info(byte_instruct, segment, typedef_lib),
            varName  : var_name === undefined ? undefined : var_name[1],
            c0RefNumber: c0_ref_pos === undefined ? ["", 0, false] : [c0_ref_pos[0], c0_ref_pos[1], false]
        });

        // Update the PC position
        bytecode_pos += num_tokens.length;
    }

    // Figure out all the "breakable positions" (a.k.a first byte instruction on the c0 line) in code.
    if (c0_mode) {
        const LineKeys = Array.from(result.comment.keys());
        LineKeys.sort((a, b) => a - b);
        for (let i = 0; i < LineKeys.length; i ++) {
            const curr_comment = result.comment.get(LineKeys[i]);
            const prev_comment = result.comment.get(LineKeys[i - 1]);
            // In case of 1st line in each function...
            if (curr_comment !== undefined && prev_comment === undefined && curr_comment.c0RefNumber !== undefined) {
                curr_comment.c0RefNumber[2] = true;
                result.comment.set(LineKeys[i], curr_comment);
                continue;
            }
            // Make typescript undefined check happy
            if (curr_comment === undefined || prev_comment === undefined) throw new vm_error("Impossible case reached");

            // Do actual breakpoint marking
            const curr_c0_line = curr_comment.c0RefNumber;
            const prev_c0_line = prev_comment.c0RefNumber;
            
            if (curr_c0_line !== undefined && prev_c0_line !== undefined 
                && (prev_c0_line[1] !== curr_c0_line[1]     // Different c0 line
                    || prev_c0_line[0] !== curr_c0_line[0]  // Different c0 file
                )) {
                // Change breakpoint behavior to "break before executing bp"
                (curr_comment.c0RefNumber as [string, number, boolean])[2] = true;
                result.comment.set(LineKeys[i], curr_comment);
            }
        }
        const last_comment = result.comment.get(LineKeys[LineKeys.length - 1]) as CodeComment;
        if (last_comment.c0RefNumber !== undefined) {
            last_comment.c0RefNumber[2] = true;
            result.comment.set(LineKeys[LineKeys.length - 1], last_comment);
        }
    }
    result.code = new Uint8Array(code_num);
    return result;
}

function parse_native_block(native_block: [string, number][]): [number, C0Native[]] {
    if (native_block.length < 2) throw new bc0_format_error();
    if (native_block[1][0] !== "# native pool") throw new bc0_format_error();

    const native_count = safe_combine_and_parse_hex(native_block[0][0].split("#")[0]);
    const native_funcs = [];
    const native_bytes = native_block.slice(2,).map(([line, _]) => line.split("#")[0].trim());
    for (let i = 0; i < native_bytes.length; i ++) {
        const [b1, b2, b3, b4] = native_bytes[i].split(" ");
        const f_num_arg = safe_parse_hex(b1 + b2);
        const f_idx_val = safe_parse_hex(b3 + b4);
        native_funcs.push(nativeFuncLoader(f_idx_val, f_num_arg));
    }
    return [native_count, native_funcs];
}
