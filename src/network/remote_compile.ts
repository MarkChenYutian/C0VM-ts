import { vm_error } from "../utility/errors";
import * as VM from "../vm_core/vm_interface"; 
import { is_all_library_supported } from "./c0_parser";

export default function remote_compile(
    app_state: C0VMApplicationState,
    set_app_state: (update: SetAppStateInput) => void,
    clean_printout: () => void,
    print_update: (s: string) => void,
): void {
    if (!is_all_library_supported(app_state.C0Editors)){
        globalThis.MSG_EMITTER.err(
            "Unsupported Library Used", 
            "The C0 visualizer does not support 'file', 'img', 'args', and 'cursor' libraries, please remove these dependencies."
        );
        return;
    }

    /** Update since v1.0.4 - print out the compile command when user hit compile button */
    let compile_command = "$ cc0 ";
    for (let tab of app_state.C0Editors) {
        compile_command += " " + tab.title;
    }
    compile_command += app_state.CompilerFlags["d"] ? " -d" : "";

    print_update("Compiling the code with command line \n");
    print_update(compile_command + "\n\n");
    /*** */

    fetch(globalThis.COMPILER_BACKEND_URL + `?dyn_check=${app_state.CompilerFlags["d"] ? "true" : "false"}`, {
        method: "POST",
        cache: "no-cache",
        headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
        },
        body: JSON.stringify({
            codes    : app_state.C0Editors.map(tab => tab.content),
            filenames: app_state.C0Editors.map(tab => tab.title),
        })
    })
    .then(
        (response: Response) => response.json()
    )
    .then(
        (result: any) => {
            if (result.error !== ""){
                const error_explain = result.error as string;
                print_update(`<span class="stdout-error">${error_explain.replaceAll(" ", "&nbsp;")}</span>`);
                throw new vm_error("Compile Failed for c0 source code. See standard output for more information.");
            }
            
            set_app_state({BC0SourceCode: result.bytecode});
            return VM.initialize(result.bytecode, clean_printout, app_state.C0Editors, print_update, MEM_POOL_SIZE);
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
