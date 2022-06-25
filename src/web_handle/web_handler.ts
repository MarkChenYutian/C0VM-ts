import { new_editor_state } from "../gui/code_editor_setup";
import { updateCtrBtns } from "../gui/extensions/on_view_update";
import init_runtime from "./web_runtime_init";

/**
 * Compile the given C0 Source code in backend server and load the 
 * compiled bytecode into C0_RUNTIME accordingly.
 * 
 * @param s The C0 Source code string to be compiled
 */
export function compile(s: string): void {
    fetch(globalThis.COMPILER_BACKEND_URL, {
            method: "POST",
            cache: "no-cache",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                "code": s,
                "d-flag": globalThis.COMPILER_FLAGS["-d"]
            }),
        }
    ).then(
        (res) => res.json()
    ).then(
        (res) => {
            if (res.c0_output !== "") {
                document.getElementById(globalThis.UI_PRINTOUT_ID).innerText = res.c0_output;
                throw Error("See printout window for detailed information.");
            }
            init_runtime(res.bytecode);
            globalThis.EDITOR_VIEW.setState(new_editor_state(res.bytecode));
            updateCtrBtns();
        }
    ).catch(
        (e) => {
            if (globalThis.DEBUG) console.error(e);
            globalThis.MSG_EMITTER.err(
                "Failed to compile given C0 code",
                (e as Error).message
            );
        }
    )
}
