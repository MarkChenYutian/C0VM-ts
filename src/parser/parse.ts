import { bc0_format_error, vm_error } from "../utility/errors";
import { nativeFuncLoader } from "../native/native_interface";

//TODO: use regex instead of hardcoding
/**
 * Parse the bc0 text into byte arrays, load Native Functions from Native Pool
 * @param raw_file A .bc0 string compiled by cc0 with -b flag
 * @returns A parsed C0ByteCode object
 * @throws `bc0_format_error` in many situations - mostly due to discrepency in 
 * declared value (e.g. the size of int pool) and the actual value (actual length
 * of Uint32Array)
 * @todo Known problem - the `parse` function will not be happy to deal with
 * CRLF input. It can only parse files with LF line change character.
 */
export default function parse(raw_file: string): C0ByteCode {
    const blocks = raw_file.trim().split("\n\n");
    if (blocks.length < 6) { throw new bc0_format_error(); }


    /* Check Header */
    const header = blocks[0].split("\n");
    if (header.length != 2 || !header[0].startsWith("C0 C0 FF EE")) {
        throw new bc0_format_error();
    }


    /* Load Intpool */
    const intpool = blocks[1].split("\n");
    const intpoolSize = parseInt((intpool[0].split("#")[0]).trim().replace(" ", ""), 16);

    if (intpool.length != intpoolSize + 2) {
        throw new bc0_format_error();
    }

    const intpoolVal = new Int32Array(
        new Uint8Array([].concat.apply([],
            (intpool.slice(2,)
                .map((row) => row.split(" ")))
        ).map(
            (elem: string) => parseInt(elem, 16)
        )).buffer
    );

    // console.log("Int Pool Size:", intpoolSize);
    // console.log("Int Pool:\n", intpoolVal, "\n");


    /* Load String Pool */
    const strpool = blocks[2].split("\n");
    const strpoolSize = parseInt((strpool[0].split("#")[0]).trim().replace(" ", ""), 16);
    const strpoolVal = new Uint8Array([].concat.apply([],
        strpool.slice(2,)
            .map((row) => row.split("#")[0].trim())
            .map((row) => row.length <= 1 ? [] : row.split(" ").map(
                (elem: string) => parseInt(elem, 16)
            ))
    ));

    // console.log("Str Pool Size:", strpoolSize);
    // console.log("Str Pool:\n", strpoolVal, "\n");


    /* Load Function Pool */
    const functionNumber = parseInt(
        blocks[3].split("#")[0].replace(" ", ""), 16
    );
    // console.log("Function Count:", functionNumber);
    // Double Check the file format
    if (blocks.length != 5 + functionNumber) { throw new bc0_format_error(); }


    /* Load Functions */
    const functionPool: C0Function[] = [];
    for (let i = 4; i < 4 + functionNumber; i++) {
        let funcLines = blocks[i].split("\n");
        if (funcLines[0] == "") funcLines = funcLines.slice(1,);

        const funcName = funcLines[0].slice(2, -1);
        const funcNumArgs = parseInt(funcLines[1].split("#")[0].trim(), 16);
        const funcNumVars = parseInt(funcLines[2].split("#")[0].trim(), 16);
        const funcSize = parseInt(funcLines[3].split("#")[0].trim().replace(" ", ""), 16);

        // Extract variable Names
        /**
         * TODO: constraint propagation
         * C0Value - type
         * if type is <unknown>, depending on the comment, update the type
         * 
         * f(x) => x + 1, g(x) => x
         * 
         * when parsing, keep dict, do type inference
         * 
         */
        const varNames = Array(funcNumVars).fill("<anonymous>");
        let funcCode: number[] = [];
        for (let lineNum = 4; lineNum < funcLines.length; lineNum++) {
            const [lineBytes, opcodeName, comment] = funcLines[lineNum].split("#")
                .map((elem) => elem.trim());

            if (lineBytes !== "") {
                funcCode = funcCode.concat(lineBytes.split(" ")
                    .map((elem: string) => parseInt(elem, 16))
                );
            }

            if (opcodeName !== undefined) {
                if (opcodeName.startsWith("vload")) {
                    varNames[parseInt(opcodeName.split(" ")[1])] = comment;
                } else if (opcodeName.startsWith("vstore")) {
                    varNames[parseInt(opcodeName.split(" ")[1])] =
                        comment.split(" ")[0].trim();
                }
            }
        }
        // Extract DataType from bipush comments
        let code_byte_counter = 0;

        const comment_mapping = new Map<number, CodeComment>();
        const int_comment_regex = /\d+/;
        const bool_comment_regex = /(true)|(false)/;
        const char_comment_regex = /'.*'/;

        for (let lineNum = 4; lineNum < funcLines.length; lineNum++) {
            const [lineBytes, opcodeName, comment] = funcLines[lineNum].split("#")
                .map((elem) => elem.trim());
            if (lineBytes === "") continue;
            if (opcodeName.startsWith("bipush")) {
                let type: "int" | "boolean" | "char";
                if (int_comment_regex.test(comment)) {
                    type = "int";
                } else if (bool_comment_regex.test(comment)) {
                    type = "boolean";
                } else if (char_comment_regex.test(comment)) {
                    type = "char";
                } else {
                    throw new vm_error("Failed to inference value type from bipush comment:\n" + comment);
                }
                comment_mapping.set(code_byte_counter, 
                    {
                        dataType: type
                    }
                );
            }
            code_byte_counter += lineBytes.split(" ").length;
        }

        functionPool.push({
            name: funcName,
            size: funcSize,
            numArgs: funcNumArgs,
            numVars: funcNumVars,
            varName: varNames,
            code: new Uint8Array(funcCode),
            comment: comment_mapping
        });
    }


    /* Load Native Pool */
    const nativePool = blocks[blocks.length - 1].split("\n");
    const nativeCount = parseInt(nativePool[0].split("#")[0].trim().replace(" ", ""), 16);
    const nativeFuncs = nativePool.slice(2,).map(
        (row) => row.split("#")[0].trim().split(" ")
    ).map(
        row => [
            parseInt(row[0] + row[1], 16),
            parseInt(row[2] + row[3], 16)
        ]
    ).map(
        row => nativeFuncLoader(row[1], row[0])
    )
    if (nativeFuncs.length != nativeCount) {
        throw new bc0_format_error();
    }

    /** Combine Everything together */
    return {
        version: parseInt(header[1].split("#")[0].trim().replace(" ", ""), 16),

        intCount: intpoolSize,
        intPool: intpoolVal,

        stringCount: strpoolSize,
        stringPool: strpoolVal,

        functionCount: functionNumber,
        functionPool: functionPool,

        nativeCount: nativeCount,
        nativePool: nativeFuncs
    }
}

