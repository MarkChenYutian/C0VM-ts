import MaterialEmitter from "./gui/material_emitter";
import { compile } from "./web_handle/web_handler";
import init_runtime from "./web_handle/web_runtime_init";

function init_env() {
    // Initialize global variables
    globalThis.DEBUG = true;
    globalThis.DEBUG_DUMP_MEM = true;
    globalThis.DEBUG_DUMP_STEP = false;

    globalThis.MEM_POOL_SIZE = 1024 * 50;
    globalThis.MEM_POOL_DEFAULT_SIZE = 1024 * 50;
    globalThis.MEM_POOL_MAX_SIZE = 0xFFFF_FFFE;
    globalThis.MEM_POOL_MIN_SIZE = 0x0000_0001;

    globalThis.MEM_BLOCK_MAX_SIZE = 0xFFFF;

    globalThis.UI_INPUT_ID = "c0-code-input";
    globalThis.UI_PRINTOUT_ID = "c0-output";
    globalThis.UI_MSG_ID = "message-terminal";

    globalThis.UI_ERR_DISPLAY_TIME_MS = 10000;
    globalThis.UI_WARN_DISPLAY_TIME_MS = 7000;
    globalThis.UI_OK_DISPLAY_TIME_MS = 4000;

    globalThis.COMPILER_BACKEND_URL = "http://127.0.0.1:8081/compile";

    globalThis.C0_BYTECODE_MAX_LENGTH = 20000;
    globalThis.C0_ENVIR_MODE = "web";
    globalThis.C0_MAX_RECURSION = 999;

    globalThis.C0_RUNTIME = undefined;
    globalThis.MSG_EMITTER = new MaterialEmitter();
    ///////////////////////////////
    console.log("[C0VM.ts] Environment initialized.");
    if (globalThis.DEBUG) {
        console.log(`
C0VM.ts Configuration Report:
    General Configuration:
        Supported Language Level: C0-language-level
        Supported Native Group: standard Output, string operation
        Environment Mode: ${globalThis.C0_ENVIR_MODE}
        C0 Bytecode Max Size: ${globalThis.C0_BYTECODE_MAX_LENGTH}

    Debug Configuration:
        Debug Mode: ${globalThis.DEBUG}
        Dump heap memory: ${globalThis.DEBUG_DUMP_MEM}
        Dump VM Step: ${globalThis.DEBUG_DUMP_STEP}

    Heap Memory Configuration:
        Heap memory current size: ${globalThis.MEM_POOL_SIZE}
        Heap memory default size: ${globalThis.MEM_POOL_DEFAULT_SIZE}
        Heap memory max size: ${globalThis.MEM_POOL_MAX_SIZE}
        Heap memory min size: ${globalThis.MEM_POOL_MIN_SIZE}
        Heap memory block max size: ${globalThis.MEM_BLOCK_MAX_SIZE}
`);
    }
}

function init_from_input() {
    init_runtime((document.getElementById(globalThis.UI_INPUT_ID) as HTMLInputElement).value);
}

function step_runtime() {
    if (globalThis.C0_RUNTIME === undefined) {
        globalThis.MSG_EMITTER.err(
            "C0VM has not load any bytecode yet!",
            "After input bytecode, press Load to load the bytecode before executing."
        );
        return;
    }
    try {
        if (!globalThis.C0_RUNTIME.step_forward()) {
            globalThis.MSG_EMITTER.ok(
                "Program Execution Finished!",
                "Load the program again if you want to rerun the program."
            );
            globalThis.C0_RUNTIME = undefined;
        }
    } catch (e) {
        globalThis.MSG_EMITTER.err(
            (e as Error).name,
            (e as Error).message
        );
        globalThis.C0_RUNTIME = undefined;
    }
}

function run_runtime() {
    if (globalThis.C0_RUNTIME === undefined) {
        globalThis.MSG_EMITTER.err(
            "C0VM has not load any bytecode yet!",
            "After input bytecode, press Load to load the bytecode before executing."
        );
        return;
    }
    let res = true;
    while (res) {
        try {
            res = globalThis.C0_RUNTIME.step_forward();
        } catch (e) {
            globalThis.MSG_EMITTER.err(
                (e as Error).name,
                (e as Error).message
            )
            globalThis.C0_RUNTIME = undefined;
            return;
        }

    }
    globalThis.MSG_EMITTER.ok(
        "Program Execution Finished!",
        "Load the program again if you want to rerun the program."
    );
    globalThis.C0_RUNTIME = undefined;
}

function reset_runtime() {
    if (globalThis.C0_RUNTIME === undefined) {
        return;
    }
    globalThis.C0_RUNTIME.restart();
    document.getElementById(globalThis.UI_PRINTOUT_ID).textContent = "";
    document.getElementById(globalThis.UI_MSG_ID).childNodes.forEach(
        (e) => document.getElementById(globalThis.UI_MSG_ID).removeChild(e)
    );
    globalThis.MSG_EMITTER.ok(
        "C0VM Restart Successfully",
        "Your program will be executed again from the beginning."
    );
}

function init_from_drag(e: DragEvent) {
    e.preventDefault();
    if (!e.dataTransfer.items) return;

    if (e.dataTransfer.items.length !== 1) {
        globalThis.MSG_EMITTER.err(
            "Unsupported Feature",
            "We only support uploading one .bc0 file into the C0VM.ts now."
        );
    }

    const fr = new FileReader();
    fr.readAsText(e.dataTransfer.items[0].getAsFile(), "utf-8");
    fr.onloadend = (e) => {
        if (fr.result === null) {
            globalThis.MSG_EMITTER.err("Unable to read the file.");
            return;
        }
        const res = fr.result.toString();
        if (res.length > globalThis.C0_BYTECODE_MAX_LENGTH) {
            globalThis.MSG_EMITTER.err(
                "Input file is too large for C0VM.ts!",
                "The input file size is " + res.length + ", but the maximum accepted size is " + globalThis.C0_BYTECODE_MAX_LENGTH
            );
            return;
        }
        (document.getElementById(globalThis.UI_INPUT_ID) as HTMLTextAreaElement).value = res;
        // init_runtime(res);
    }
}

function drag_hint_enter_ui() {
    (document.getElementById(globalThis.UI_INPUT_ID) as HTMLTextAreaElement).value = "Drop .bc0 file here to load bytecode.";
}

function drag_hint_leave_ui() {
    (document.getElementById(globalThis.UI_INPUT_ID) as HTMLTextAreaElement).value = "";
}

function web_compile() {
    compile(
        (document.getElementById(globalThis.UI_INPUT_ID) as HTMLTextAreaElement).value
        , []
    );
}

export default {
    init_env,
    init_from_drag,
    init_from_input,
    step_runtime,
    run_runtime,
    reset_runtime,
    drag_hint_enter_ui,
    drag_hint_leave_ui,
    web_compile
};
