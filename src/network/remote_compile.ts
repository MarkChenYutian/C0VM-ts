import { vm_error } from "../utility/errors";
import * as VM from "../vm_core/vm_interface"; 

/**
 * Resolve the nested reference in map automatically
 * 
 * e.g. A -> B, D -> B, B -> C
 * will be flattened to:
 * A -> C, B -> C, D -> C
 * 
 * @returns A flattened type mapping
 */
function flatten_typedef(typedef: Map<string, TypeDefInfo>): Map<string, string> {
    const flattened = new Map<string, string>();
    typedef.forEach(
        (value, key) => {
            let base_case = value.source;
            while (typedef.has(base_case)) {
                base_case = (typedef.get(base_case) as TypeDefInfo).source;
            }
            flattened.set(key, base_case);
        }
    )
    return flattened;
}

function apply_typedef_information(typedef: Map<string, TypeDefInfo>, bytecode: string) {
    const type_map = flatten_typedef(typedef);
    let result = bytecode;
    type_map.forEach(
        (value, key) => {result = bytecode.replaceAll(key, value);}
    )
    return result;
}

export default function remote_compile(
    content: string[],
    names: string[],
    typedefRecord: Map<string, TypeDefInfo>,
    update_content: (s: string) => void,
    clean_printout: () => void,
    update_printout: (s: string) => void,
    compiler_flags: Record<string, boolean>
): void {
    fetch(globalThis.COMPILER_BACKEND_URL + `?dyn_check=${compiler_flags["-d"] ? "true" : "false"}`, {
        method: "POST",
        cache: "no-cache",
        headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
        },
        body: JSON.stringify({
            codes: content,
            filenames: names,
        })
    })
    .then(
        (response: Response) => response.json()
    )
    .then(
        (result: any) => {
            if (result.error !== ""){
                update_printout(result.error as string);
                throw new vm_error("Compile Failed for c0 source code. See standard output for more information.");
            }
            const clean_bytecode = apply_typedef_information(typedefRecord, result.bytecode);
            VM.initialize(clean_bytecode, clean_printout);
            update_content(clean_bytecode);
        }
    )
    .catch(
        (err: Error) => {
            if (globalThis.DEBUG) console.error(err);
            globalThis.MSG_EMITTER.err("Compile Failed", err.message);
        }
    );
}
