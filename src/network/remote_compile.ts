import { vm_error } from "../utility/errors";
import * as VM from "../vm_core/vm_interface"; 
import { extract_all_typedef } from "./c0_parser";

export default function remote_compile(
    app_state: C0VMApplicationState,
    set_app_state: (update: SetAppStateInput) => void,
    clean_printout: () => void,
    print_update: (s: string) => void,
): void {
    fetch(globalThis.COMPILER_BACKEND_URL + `?dyn_check=${app_state.CompilerFlags["-d"] ? "true" : "false"}`, {
        method: "POST",
        cache: "no-cache",
        headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
        },
        body: JSON.stringify({
            codes: app_state.C0Editors.map((tab) => tab.content),
            filenames: app_state.C0Editors.map((tab) => tab.title),
        })
    })
    .then(
        (response: Response) => response.json()
    )
    .then(
        (result: any) => {
            if (result.error !== ""){
                print_update(`<span class="error-output">${result.error as string}</span>`);
                throw new vm_error("Compile Failed for c0 source code. See standard output for more information.");
            }
            
            const typedefs = extract_all_typedef(app_state.C0Editors);
            set_app_state({BC0SourceCode: result.bytecode});
            return VM.initialize(result.bytecode, clean_printout, app_state.C0Editors, typedefs, print_update, MEM_POOL_SIZE);
        }
    )
    .then(
        (state) => {
            set_app_state({
                contentChanged: false, // Now we can run the new program
                C0Runtime     : state  // Load the initialized state
            });
        }
    )
    .catch(
        (err: Error) => {
            if (globalThis.DEBUG) console.error(err);
            globalThis.MSG_EMITTER.err("Compile Failed", err.message);
        }
    );
}
