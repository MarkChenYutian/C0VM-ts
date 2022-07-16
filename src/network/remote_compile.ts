import { vm_error } from "../utility/errors";
import * as VM from "../vm_core/vm_interface"; 


export default function remote_compile(
    s: string,
    update_content: (s: string) => void,
    clean_printout: () => void,
    update_printout: (s: string) => void,
    compiler_flags: Record<string, boolean>
): void {
    fetch(globalThis.COMPILER_BACKEND_URL, {
        method: "POST",
        cache: "no-cache",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            code: s,
            flag: compiler_flags
        })
    })
    .then(
        (response: Response) => response.json()
    )
    .then(
        (result: any) => {
            if (result.c0_output !== ""){
                update_printout(result.c0_output as string);
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
