import { replacer, stdout } from "../utility/ui_utility";
import C0VM_RuntimeState from "./exec/state";

export async function initialize(
    bytecode: string,
    clear_printout: () => void,
    C0Editor : C0EditorTab[],
    print_update: (s: string) => void,
    heapSize ?: number,
): Promise<C0VM_RT | undefined> {
    // Clean up environment before initialize.
    clear_printout();
    try {
        const ns = new C0VM_RuntimeState(bytecode, C0Editor, heapSize);
        globalThis.MSG_EMITTER.ok("Load Successfully", "Program is loaded successfully. Press step or run to see result.");
        if (globalThis.DEBUG_DUMP_MEM) {
            console.log(ns.allocator.debug_getMemPool());
        }

        if (globalThis.DEBUG){
            stdout("info", print_update)(
                "[DEBUG] Parsed Information from C0 Source Code:<br>" + 
                JSON.stringify(
                    { "Typedef": ns.typedef, "Struct Information": ns.state.TypeRecord, "Function Type": ns.state.FuncTypeRecord }
                    , replacer, "&nbsp;"
                ) + 
                "<br>"
            );
            console.log({
                "Code": ns.code,
                "Typedef": ns.typedef,
                "Struct Information": ns.state.TypeRecord
            });
        }

        return ns;
    } catch (e) {
        const err = e as Error;
        stdout("error", print_update)(`Program aborted with error message: <br/>${err.message}`);
        globalThis.MSG_EMITTER.err("Failed to Start Visualizer", `${err.message}`);
        if(globalThis.DEBUG) console.error(e);
        return undefined;
    }
}

export async function step(s: C0VM_RT, c0_only: boolean, print_update: (s: string) => void): Promise<[C0VM_RT, boolean]> {
    const new_state = s.clone();
    if (c0_only && new_state.state.CurrC0RefLine !== undefined) {
        /**
         * In C0_only mode, 1 step = 1 line of C0 source code.
         * In this way, we can completely hide the bytecode implementation from student
         */
        const [start_file, start_line, ] = new_state.state.CurrC0RefLine;
        if (DEBUG_DUMP_STEP) console.log(new_state.state.CurrC0RefLine);
        
        let can_continue = true;
        while (new_state.state.CurrC0RefLine !== undefined &&
               new_state.state.CurrC0RefLine[0] === start_file &&
               new_state.state.CurrC0RefLine[1] === start_line && 
               can_continue) {
            try {
                // BUG FIX (version 1.4.0), when using C0-only mode, step function does not catch error
                // correctly (issue #42)
                can_continue = await new_state.step_forward({print_update: print_update});
            } catch (e) {
                const err = e as Error;
                prettyPrintC0Error(err, s, print_update);
                globalThis.MSG_EMITTER.err("Exception during runtime (" + err.name + ")", err.message);
                if(globalThis.DEBUG) console.error(e);
                return [s, false];
            }
        }
        return [new_state, can_continue];
    } else {
        /**
         * In normal mode, 1 step = 1 step in bytecode execution
         */
        try {
            const can_continue = await new_state.step_forward({print_update: print_update});
            return [new_state, can_continue];
        } catch(e) {
            const err = e as Error;
            prettyPrintC0Error(err, s, print_update);
            globalThis.MSG_EMITTER.err("Exception during runtime (" + err.name + ")", err.message);   
            if(globalThis.DEBUG) console.error(e);
            return [s, false];
        }
    }
}

export async function autoStep(
    s: C0VM_RT,
    bp: Set<number>,
    c0bp: Set<string>,
    signal: {abort: boolean},
    c0_only: boolean,
    resetSig: () => void,
    print_update: (s: string) => void,
    update_state: (s: C0VM_RT|undefined) => void,
    resetC0Running: () => void,
): Promise<void> 
{
    if(globalThis.DEBUG) console.log('Running autostep...');
    if (signal.abort) {
        resetSig();
        stdout("error", print_update)("C0VM.ts: Execution aborted manually.\n");
        globalThis.MSG_EMITTER.warn("Execution Aborted", "Execution is aborted since the user click the 'Abort' button manually.");
        resetSig();
        resetC0Running();
        return;
    }
    let new_state = s.clone();
    let can_continue = true;
    try {
        [new_state,can_continue] = await step(new_state,c0_only,print_update);
    } catch(e) {
        const err = e as Error;
        prettyPrintC0Error(err, s, print_update);
        globalThis.MSG_EMITTER.err("Exception during runtime (" + (e as Error).name + ")", (e as Error).message);
        if(globalThis.DEBUG) console.error(e);
        resetSig();
        resetC0Running();
        return;
    }
    if (!can_continue){
        resetSig();
        update_state(undefined);
        resetC0Running();
        return;
    }
    if (bp.has(new_state.state.CurrLineNumber)){
        resetSig();
        resetC0Running();
        return;
    } 
    if (new_state.state.CurrC0RefLine !== undefined &&
        new_state.state.CurrC0RefLine[2] &&
        c0bp.has(`${new_state.state.CurrC0RefLine[0]}@${new_state.state.CurrC0RefLine[1]}`)){ 
            resetSig();
            resetC0Running();
            return;
    }
    resetSig();
    update_state(new_state);

    let step_interval = 1500;
    if (globalThis.AUTOSTEP_INTERVAL === "Fast") {
        step_interval = 500;
    } else if (globalThis.AUTOSTEP_INTERVAL === "Slow") {
        step_interval = 1500;
    }

    setTimeout(
        () => {
            autoStep(new_state,bp,c0bp,signal,c0_only,resetSig,print_update,update_state,resetC0Running)
        }, step_interval
    );
}

export async function run(
    s: C0VM_RT,
    bp: Set<number>,
    c0bp: Set<string>,
    signal: {abort: boolean},
    resetSig: () => void,
    print_update: (s: string) => void,
    update_state: (s: C0VM_RT) => void,
): Promise<[C0VM_RT, boolean]> {
    const new_state = s.clone();
    let can_continue = true;
    while (can_continue) {
        try {
            can_continue = await new_state.step_forward({print_update: print_update});
            /* 
             * When the C0VM has executed C0_TIME_SLICE steps, we force it to pause and
             * give some time to React in order to response to user action & update UI
             * Accordingly.
             * 
             * This will deduce the speed of C0VM, but make the webpage responsive even when
             * doing tremendous amount of evaluation.
             */
            if (new_state.step_cnt % C0_TIME_SLICE === 0) {
                update_state(new_state);    // Update react UI
                // Since we know that C0_ASYNC_INTERVAL will be a constant, it's safe to disable
                // eslint on next line
                // eslint-disable-next-line
                await new Promise((rs) => setTimeout(rs, C0_ASYNC_INTERVAL));
            }
            /**
             * If signal.abort is true, user must have pressed the "Abort" button.
             * Hence, we abort our program immediately.
             */
            if (signal.abort) {
                resetSig();
                stdout("error", print_update)("C0VM.ts: Execution aborted manually.\n");
                globalThis.MSG_EMITTER.warn("Execution Aborted", "Execution is aborted since the user click the 'Abort' button manually.");
                resetSig();
                return [s, false];
            }
        } catch(e) {
            const err = e as Error;
            prettyPrintC0Error(err, s, print_update);
            globalThis.MSG_EMITTER.err("Exception during runtime (" + (e as Error).name + ")", (e as Error).message);
            if(globalThis.DEBUG) console.error(e);

            resetSig();
            return [s, false];
        }
        if (bp.has(new_state.state.CurrLineNumber)) break;
        if (new_state.state.CurrC0RefLine !== undefined &&
            new_state.state.CurrC0RefLine[2] &&
            c0bp.has(`${new_state.state.CurrC0RefLine[0]}@${new_state.state.CurrC0RefLine[1]}`)) break;
    }
    // We want to reset the abort signal before we exit the run subroutin.
    resetSig();
    return [new_state, can_continue];
}

function getCallstack(s: C0VM_RT): string[] {
    const functionNames: string[] = [];
    for (let funcFrame of s.state.CallStack) {
        functionNames.push(funcFrame.P.name);
    }
    functionNames.push(s.state.CurrFrame.P.name);
    return functionNames;
}

function prettyPrintC0Error(e: Error, s: C0VM_RT, print_update: (s: string) => void) {
    if (s.state.CurrC0RefLine !== undefined && s.state.CurrC0RefLine[0] !== "") {
        stdout("error", print_update)(
            `
Program aborted at ${s.state.CurrC0RefLine[0]}: Line ${s.state.CurrC0RefLine[1]}
            
with error message:
${e.message}

Traceback:
${getCallstack(s).join("\n&nbsp;↪&nbsp;")} &larr; <b><i>Error raised here!</i></b>`
        );
    } else if (s.state.CurrC0RefLine !== undefined && s.state.CurrC0RefLine[0] === "") {
        stdout("error", print_update)(`
Program aborted
    
with error message:
${e.message}`
        );
    } else {
        stdout("error", print_update)(`
Program aborted

with error message:
${e.message}

Traceback:
${getCallstack(s).join("\n&nbsp;↪")} &larr; <b><i>Error raised here!</i></b>
        `)
    }
}
