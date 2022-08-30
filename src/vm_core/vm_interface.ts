import { vm_error } from "../utility/errors";
import C0VM_RuntimeState from "./exec/state";

export async function initialize(s: string, clear_printout: () => void): Promise<C0VM_RuntimeState | undefined> {
    // Clean up environment before initialize.
    clear_printout();
    try {
        const ns = new C0VM_RuntimeState(s);
        globalThis.MSG_EMITTER.ok("Load Successfully", "C0VM has load your code successfully. Press Step or Run to see result.");
        if (globalThis.DEBUG_DUMP_MEM) {
            console.log(ns.allocator.debug_getMemPool());
        }
        return ns;
    } catch (e) {
        globalThis.MSG_EMITTER.err("Load Failed (" + (e as Error).name + ")", (e as Error).message);
        if(globalThis.DEBUG) console.error(e);
        return undefined;
    }
}

export async function step(s: C0VM_RuntimeState, printout_handler: (s: string) => void): Promise<[C0VM_RuntimeState, boolean]> {
    const new_state = s.clone();
    try {
        const can_continue = await new_state.step_forward({print_update: printout_handler});
        return [new_state, can_continue];
    } catch(e) {
        globalThis.MSG_EMITTER.err("Exception during runtime (" + (e as Error).name + ")", (e as Error).message);   
        if(globalThis.DEBUG) console.error(e);
        return [s, false];
    }
}

export async function run(
    s: C0VM_RuntimeState,
    bp: Set<number>,
    signal: {abort: boolean},
    resetSig: () => void,
    printout_handler: (s: string) => void,
    update_state: (s: C0VM_RuntimeState) => void,
): Promise<[C0VM_RuntimeState, boolean]> {
    const new_state = s.clone();
    let can_continue = true;
    while (can_continue) {
        try {
            can_continue = await new_state.step_forward({print_update: printout_handler});
            if (new_state.step_cnt % C0_TIME_SLICE === 0) {
                update_state(new_state);    // Update react UI
                // Since we know that C0_ASYNC_INTERVAL will be a constant, it's safe to disable
                // eslint on next line
                // eslint-disable-next-line
                await new Promise((rs) => setTimeout(rs, C0_ASYNC_INTERVAL));
            }
            if (signal.abort) {
                resetSig();
                throw new vm_error("Execution aborted manually");
            }
        } catch(e) {
            globalThis.MSG_EMITTER.err("Exception during runtime (" + (e as Error).name + ")", (e as Error).message);
            if(globalThis.DEBUG) console.error(e);

            resetSig();
            return [s, false];
        }
        if (bp.has(new_state.state.CurrLineNumber)) break;
    }
    resetSig();
    return [new_state, can_continue];
}
