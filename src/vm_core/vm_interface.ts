import C0VM_RuntimeState from "./exec/state";

export function initialize(s: string, clear_printout: () => void): C0VM_RuntimeState | undefined {
    clear_printout();
    try {
        const ns = new C0VM_RuntimeState(s);
        globalThis.MSG_EMITTER.ok("Load Successfully", "C0VM has load your code successfully. Press Step or Run to see result.");
        return ns;
    } catch (e) {
        globalThis.MSG_EMITTER.err("Load Failed (" + (e as Error).name + ")", (e as Error).message);
        return undefined;
    }
}

export function step(s: C0VM_RuntimeState, printout_handler: (s: string) => void): [C0VM_RuntimeState, boolean] {
    const new_state = s.clone();
    try {
        const can_continue = new_state.step_forward({
            print_update: printout_handler
        });
        return [new_state, can_continue];
    } catch(e) {
        globalThis.MSG_EMITTER.err("Exception during runtime (" + (e as Error).name + ")", (e as Error).message);   
        if(globalThis.DEBUG) console.error(e);
        return [s, false];
    }
}

export function run(s: C0VM_RuntimeState, printout_handler: (s: string) => void): [C0VM_RuntimeState, boolean] {
    const new_state = s.clone();
    let can_continue = true;
    while (can_continue) {
        try {
            can_continue = new_state.step_forward({
                print_update: printout_handler
            });
        } catch(e) {
            globalThis.MSG_EMITTER.err("Exception during runtime (" + (e as Error).name + ")", (e as Error).message);
            if(globalThis.DEBUG) console.error(e);
            return [s, false];
        }
        if (globalThis.EDITOR_BREAKPOINTS.has(new_state.state.CurrLineNumber)) break;
    }
    return [new_state, can_continue];
}
