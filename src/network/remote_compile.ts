import { vm_error } from "../utility/errors";
import { stdout, toBase64 } from "../utility/ui_utility";
import * as VM from "../vm_core/vm_interface"; 
import { is_all_library_supported } from "./c0_parser";

async function stringify_content(content: string | File) {
    if (typeof content === "string") return content
    const base64_encoded_file: string = await toBase64(content)
    return base64_encoded_file
}

export default async function remote_compile(
    {set_app_state}: SetAppStateHook,
    editors: C0EditorTab[],
    check_contract: boolean,
    clean_printout: () => void,
    print_update: (s: string) => void,
): Promise<void> {
    for (const tab of editors) {
        if (typeof tab.content !== "string" && tab.ref_content === undefined) {
            MSG_EMITTER.warn(
                "Parsing Failed", 
                `Failed to get typedef information from ${tab.title}. The type display in debugger may not apply certain typedef aliaes appropriately.`
            );
        }
    }

    if (!is_all_library_supported(editors)){
        globalThis.MSG_EMITTER.err(
            "Unsupported Library Used", 
            "The C0 visualizer does not support 'file', 'img', 'args', and 'cursor' libraries, please remove these dependencies."
        );
        return;
    }

    /** Update since v1.0.4 - print out the compile command when user hit compile button */
    let compile_command = "$ cc0";
    for (let tab of editors) {
        compile_command += " " + tab.title;
    }
    compile_command += check_contract ? " -d" : "";

    print_update("Compiling the code with command line \n");
    print_update(compile_command + "\n\n");

    /* Start building compile command */
    const code_file: string[] = [];
    for (const tab of editors) {
        const str_content = await stringify_content(tab.content)
        code_file.push(str_content);
    }

    fetch(globalThis.COMPILER_BACKEND_URL + `compile?dyn_check=${check_contract ? "true" : "false"}`, {
        method: "POST",
        cache: "no-cache",
        headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
        },
        body: JSON.stringify({
            codes    : code_file,
            filenames: editors.map(tab => tab.title),
            is_binaries: editors.map(tab => typeof tab.content !== "string")
        })
    })
    .then(
        (response: Response) => response.json()
    )
    .then(
        (result: any) => {
            if (result.error !== ""){
                const error_explain = result.error as string;
                stdout("error", print_update)(
`[Error]: Program compile failed!
with command line:
${compile_command}

---
with error message:
${error_explain}`
                )
                throw new vm_error("Compile Failed for c0 source code. See standard output for more information.");
            }
            
            set_app_state({BC0SourceCode: result.bytecode});
            return VM.initialize(result.bytecode, clean_printout, editors, print_update, MEM_POOL_SIZE);
        }
    )
    .then(
        (state) => {
            stdout("info", print_update)(
`Compile success with command line:
${compile_command}
`)
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
