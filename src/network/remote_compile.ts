import { vm_error } from "../utility/errors";
import * as VM from "../vm_core/vm_interface"; 
import { is_all_library_supported } from "./c0_parser";


function rearrangeByFileSeq(fileSeq: string[] | undefined, tabs: C0EditorTab[]): C0EditorTab[] | undefined {
    if (fileSeq === undefined) return undefined;

    const selector = new Map<string, C0EditorTab>();
    for (let tab of tabs) selector.set(tab.title, tab);

    const result: C0EditorTab[] = [];
    for (let fileName of fileSeq) {
        const selectedTab = selector.get(fileName)
        if (selectedTab === undefined) return undefined;
        result.push(selectedTab);
    }
    return result;
}


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

    /** 
     * Update since v1.0.4 - when there is a *.txt file with % cc0 ... command, 
     * use the provided command with higher priority if it is valid
     */
    const recommanded_tabs = rearrangeByFileSeq(globalThis.RECOMMAND_COMPILE_SEQ, app_state.C0Editors);
    const recommand_valid  = recommanded_tabs !== undefined;
    const editor_tabs: C0EditorTab[] = recommanded_tabs === undefined
        ? app_state.C0Editors 
        : recommanded_tabs;

    if (recommand_valid) {
        print_update("Detect a cc0 compile command in *.txt file and is valid. Using the provided command.\n\n");
    } else if (globalThis.RECOMMAND_COMPILE_SEQ !== undefined) {
        print_update(`<span class="stdout-error">Warning: a cc0 compile command is detected in *.txt. But some .c0/c1 files are missing.
        
        The provided command is therefore ignored and I'll arrange the compile task using editor tab order. </span>\n\n`)
    } else {
        print_update("No valid cc0 command detected in *.txt or no such file exists. Using editor tab order as compile command file ordering.\n\n");
    }

    /** Update since v1.0.4 - print out the compile command when user hit compile button */
    let compile_command = "$ cc0 ";
    for (let tab of editor_tabs) {
        if (tab.noCompile) continue;
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
            codes    : editor_tabs.filter(tab => !tab.noCompile).map(tab => tab.content),
            filenames: editor_tabs.filter(tab => !tab.noCompile).map(tab => tab.title),
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
            return VM.initialize(result.bytecode, clean_printout, editor_tabs, print_update, MEM_POOL_SIZE);
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
