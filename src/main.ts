import C0VM_RuntimeState from "./exec/state";
import MaterialEmitter from "./gui/material_emitter";


function init_env() {
    // Initialize global variables
    globalThis.DEBUG = true;
    globalThis.DEBUG_DUMP_MEM = true;

    globalThis.MEM_POOL_SIZE = 64;
    globalThis.MEM_POOL_DEFAULT_SIZE = 1024 * 50;
    globalThis.MEM_POOL_MAX_SIZE = 0xFFFF_FFFE;
    globalThis.MEM_POOL_MIN_SIZE = 0x0000_0001;

    globalThis.MEM_BLOCK_MAX_SIZE = 0xFFFF;

    globalThis.UI_INPUT_ID = "c0-code-input";
    globalThis.UI_PRINTOUT_ID = "c0-output";
    globalThis.UI_MSG_ID = "message-terminal";

    globalThis.C0_RUNTIME = undefined;
    globalThis.MSG_EMITTER = new MaterialEmitter();
    ///////////////////////////////
    console.log("[C0VM.ts] Environment initialized.");
    if (globalThis.DEBUG) {
        console.log(`
C0VM.ts Configuration Report:
    Supported Language Level: C0-language-level
    Supported Native Group: standard I/O, string operation

    Debug Configuration:
        Debug Mode: ${globalThis.DEBUG}
        Dump heap memory: ${globalThis.DEBUG_DUMP_MEM}

    Heap Memory Configuration:
        Heap memory current size: ${globalThis.MEM_POOL_SIZE}
        Heap memory default size: ${globalThis.MEM_POOL_DEFAULT_SIZE}
        Heap memory max size: ${globalThis.MEM_POOL_MAX_SIZE}
        Heap memory min size: ${globalThis.MEM_POOL_MIN_SIZE}
        Heap memory block max size: ${globalThis.MEM_BLOCK_MAX_SIZE}
`);
    }
}

function initialize_runtime() {
    console.log(document.getElementById(globalThis.UI_INPUT_ID) as HTMLInputElement);
    globalThis.C0_RUNTIME = new C0VM_RuntimeState(
        (document.getElementById(globalThis.UI_INPUT_ID) as HTMLInputElement).value, globalThis.MEM_POOL_SIZE
    );
    if (globalThis.DEBUG_DUMP_MEM) {
        console.log("[DEBUG] Memory dump:")
        console.log(globalThis.C0_RUNTIME.debug());
    }
    globalThis.MSG_EMITTER.ok(
        "Program is loaded into C0VM",
        "Press STEP or RUN to execute the program."
    );
}

function step_runtime() {
    if (globalThis.C0_RUNTIME === undefined) {
        globalThis.MSG_EMITTER.err(
            "C0VM has not load any bytecode yet!",
            "After input bytecode, press Load to load the bytecode before executing."
        );
        return;
    }
    if (!globalThis.C0_RUNTIME.step_forward()) {
        globalThis.MSG_EMITTER.ok(
            "Program Execution Finished!",
            "Load the program again if you want to rerun the program."
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
        res = globalThis.C0_RUNTIME.step_forward();
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
    globalThis.MSG_EMITTER.ok(
        "C0VM Restart Successfully",
        "Your program will be executed again from the beginning."
    );
}

export default {
    init_env,
    initialize_runtime,
    step_runtime,
    run_runtime,
    reset_runtime
};
