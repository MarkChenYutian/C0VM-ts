import C0VM_RuntimeState from "../exec/state";


export default function init_runtime(s: string) {
    try {
        globalThis.C0_RUNTIME = new C0VM_RuntimeState(
            s, globalThis.MEM_POOL_SIZE
        );
    } catch (e) {
        globalThis.C0_RUNTIME = undefined;
        globalThis.MSG_EMITTER.err(
            e.name,
            e.message
        );
        return;
    }
    if (globalThis.DEBUG_DUMP_MEM) {
        console.log("[DEBUG] Memory dump:")
        console.log(globalThis.C0_RUNTIME.debug());
    }

    document.getElementById(globalThis.UI_PRINTOUT_ID).textContent = "";
    document.getElementById(globalThis.UI_MSG_ID).childNodes.forEach(
        (e) => document.getElementById(globalThis.UI_MSG_ID).removeChild(e)
    );

    globalThis.MSG_EMITTER.ok(
        "Program is loaded into C0VM",
        "Press STEP or RUN to execute the program."
    );
}
