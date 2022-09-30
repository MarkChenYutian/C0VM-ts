import { vm_error } from "../utility/errors";
import C0VM_RuntimeState from "../vm_core/exec/state";
import * as VM from "../vm_core/vm_interface"; 

export default function remote_compile(
    tabs: C0EditorTab[],
    typedefRecord: Map<string, TypeDefInfo>,
    update_content: (s: string) => void,
    clean_printout: () => void,
    update_printout: (s: string) => void,
    compiler_flags: Record<string, boolean>,
    load_c0_runtime: (s: C0VM_RuntimeState | undefined) => void 
): void {
    fetch(globalThis.COMPILER_BACKEND_URL + `?dyn_check=${compiler_flags["-d"] ? "true" : "false"}`, {
        method: "POST",
        cache: "no-cache",
        headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
        },
        body: JSON.stringify({
            codes: tabs.map((tab) => tab.content),
            filenames: tabs.map((tab) => tab.title),
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
            update_content(result.bytecode);
            return VM.initialize(result.bytecode, clean_printout, globalThis.MEM_POOL_SIZE, tabs, typedefRecord);
        }
    )
    .then(
        (state) => {
            load_c0_runtime(state);
        }
    )
    .catch(
        (err: Error) => {
            if (globalThis.DEBUG) console.error(err);
            globalThis.MSG_EMITTER.err("Compile Failed", err.message);
        }
    );
}
