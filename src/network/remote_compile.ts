import { vm_error } from "../utility/errors";
import * as VM from "../vm_core/vm_interface"; 


export default function remote_compile(
    content: string[],
    names: string[],
    update_content: (s: string) => void,
    clean_printout: () => void,
    update_printout: (s: string) => void,
    compiler_flags: Record<string, boolean>
): void {
    fetch(globalThis.COMPILER_BACKEND_URL + `?dyn_check=${compiler_flags["-d"] ? "true" : "false"}`, {
        method: "POST",
        cache: "no-cache",
        headers: {
            "Content-Type": "application/json"
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
            VM.initialize(result.bytecode, clean_printout);
            update_content(result.bytecode);
        }
    )
    .catch(
        (err: Error) => {
            if (globalThis.DEBUG) console.error(err);
            globalThis.MSG_EMITTER.err("Compile Failed", err.message);
        }
    );
}
