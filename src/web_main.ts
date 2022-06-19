import html_init from "./gui/html_init";
import MaterialEmitter from "./gui/material_emitter";
import { on_clickflag } from "./gui/ui_handler";
import { compile } from "./web_handle/web_handler";
import init_runtime from "./web_handle/web_runtime_init";

function init_env() {
    // Initialize global variables
    globalThis.DEBUG = true;
    globalThis.DEBUG_DUMP_MEM = true;
    globalThis.DEBUG_DUMP_STEP = true;

    globalThis.MEM_POOL_SIZE = 1024 * 50;
    globalThis.MEM_POOL_DEFAULT_SIZE = 1024 * 50;
    globalThis.MEM_POOL_MAX_SIZE = 0xFFFF_FFFE;
    globalThis.MEM_POOL_MIN_SIZE = 0x0000_0001;

    globalThis.MEM_BLOCK_MAX_SIZE = 0xFFFF;

    globalThis.EDITOR_CONTENT = "";
    globalThis.EDITOR_BREAKPOINTS = new Set<number>();

    globalThis.UI_INPUT_ID = "c0-code-input";
    globalThis.UI_PRINTOUT_ID = "c0-output";
    globalThis.UI_MSG_ID = "message-terminal";

    globalThis.UI_ERR_DISPLAY_TIME_MS = 10000;
    globalThis.UI_WARN_DISPLAY_TIME_MS = 7000;
    globalThis.UI_OK_DISPLAY_TIME_MS = 4000;

    globalThis.COMPILER_BACKEND_URL = "http://127.0.0.1:8081/compile";
    globalThis.COMPILER_FLAGS = {
        "-d": false
    };

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
    ////////////////////////////
    // Load Event on HTML DOM
    html_init();
}

function init_from_input() {
    init_runtime(globalThis.EDITOR_CONTENT);
}

function step_runtime() {
    if (globalThis.C0_RUNTIME === undefined) {
        init_from_input();
    }
    if (globalThis.C0_RUNTIME === undefined) return;
    try {
        if (!globalThis.C0_RUNTIME.step_forward()) {
            globalThis.MSG_EMITTER.ok(
                "Program Execution Finished!",
                "Load the program again if you want to rerun the program."
            );
            globalThis.C0_RUNTIME = undefined;
        }
        update_editor();
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
        init_from_input();
    }
    if (globalThis.C0_RUNTIME === undefined) return;
    let res = true;
    while (res) {
        try {
            res = globalThis.C0_RUNTIME.step_forward();
            if (res == false) continue;
            if (globalThis.EDITOR_BREAKPOINTS.has(C0_RUNTIME.state.CurrLineNumber)) {
                update_editor();
                return;
            }
        } catch (e) {
            if (globalThis.DEBUG) {
                console.error((e as Error).stack);
            }
            globalThis.MSG_EMITTER.err(
                (e as Error).name,
                (e as Error).message
            )
            globalThis.C0_RUNTIME = undefined;
            update_editor();
            return;
        }
    }
    globalThis.MSG_EMITTER.ok(
        "Program Execution Finished!",
        "Load the program again if you want to rerun the program."
    );
    globalThis.C0_RUNTIME = undefined;
    update_editor();
}

function reset_runtime() {
    init_from_input();

    if (globalThis.C0_RUNTIME === undefined) return;
    
    // Force refresh editor to update exechighlight extension
    window.EDITOR_VIEW.update([window.EDITOR_VIEW.state.update()]);

    document.getElementById(globalThis.UI_PRINTOUT_ID).textContent = "";
    document.getElementById(globalThis.UI_MSG_ID).childNodes.forEach(
        (e) => document.getElementById(globalThis.UI_MSG_ID).removeChild(e)
    );
    globalThis.MSG_EMITTER.ok(
        "C0VM Restart Successfully",
        "Your program will be executed again from the beginning."
    );
}

function web_compile() {
    compile(
        globalThis.EDITOR_CONTENT, []
    );
}

function update_editor() {
    if (globalThis.C0_ENVIR_MODE === "web") {
        window.EDITOR_VIEW.update([window.EDITOR_VIEW.state.update()]);
    }
}

export default {
    init_env,
    step_runtime,
    run_runtime,
    reset_runtime,
    web_compile,
    on_clickflag
};
