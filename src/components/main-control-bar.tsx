import React from "react";
import { faBoltLightning, faPlay, faScrewdriverWrench, faStepForward, faUndo } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import * as VM from "../vm_core/vm_interface";
import remote_compile from "../network/remote_compile";

import tsLogo from "../assets/ts-logo-128.svg";

/**
 * Use AbortRef() to allow us interrupt current VM execution outside
 * of React Component Life Cycle
 */
function AbortRef(): [{abort: boolean}, () => void, () => void] {
    const token = React.useRef({abort: false});
    const cancel = () => {token.current.abort = true;}
    const reset  = () => {token.current.abort = false;}
    return [token.current, cancel, reset];
}

function RequiresRecompile(){
    globalThis.MSG_EMITTER.warn(
        "Requires Recompile",
        "The content in code editor has been changed. Recompile the code before executing the program."
    );
}

// export default class MainControlBar extends React.Component<MainControlProps>{
export default function MainControlBar(props: MainControlProps) {
    const appState = props.application_state;
    const is_bc0_valid = props.application_state.BC0SourceCode.toUpperCase().startsWith("C0 C0 FF EE");

    const [abortSignal, abort, reset] = AbortRef();

    const print_update = (str: string) => props.set_app_state((s) => {return {PrintoutValue: s.PrintoutValue + str}})
    const clear_print  = () => props.set_app_state({PrintoutValue: ""})

    const step_c0runtime = async () => {
        if (appState.contentChanged) {
            RequiresRecompile();
            return;
        }

        let new_runtime, can_continue = undefined;
        if (appState.C0Runtime === undefined) {
            const init_state = await VM.initialize(appState.BC0SourceCode, clear_print, appState.C0Editors, appState.TypedefRecord, print_update, MEM_POOL_SIZE);
            if (init_state === undefined) return;
            [new_runtime, can_continue] = await VM.step(init_state, appState.c0_only, print_update);
        } else {
            [new_runtime, can_continue] = await VM.step(appState.C0Runtime, appState.c0_only, print_update);
        }

        // Program complete execution
        if (!can_continue) props.set_app_state({C0Runtime: undefined});

        // Program can still step in future
        else props.set_app_state({C0Runtime: new_runtime});
    }

    const run_c0runtime = async () => {
        if (appState.contentChanged) {
            RequiresRecompile();
            return;
        }

        let init_state = undefined;
        let new_runtime, can_continue = undefined;
        if (appState.C0Runtime === undefined) {
            init_state = await VM.initialize(appState.BC0SourceCode, clear_print, appState.C0Editors, appState.TypedefRecord, print_update, MEM_POOL_SIZE);
            if (init_state === undefined) return;
        } else {
            init_state = appState.C0Runtime;
        }

        const c0BreakPoint = new Set<string>();
        for (let i = 0; i < appState.C0Editors.length; i ++){
            const currentEditor = appState.C0Editors[i];
            for (let j = 0; j < currentEditor.breakpoints.length; j ++){
                c0BreakPoint.add(`${currentEditor.title}@${currentEditor.breakpoints[j].line}`);
            }
        }

        const bc0BreakPointArr = Array.from(appState.BC0BreakPoints).map(bp => bp.line);
        const bc0BreakPoints = new Set(bc0BreakPointArr);

        // Initialize AbortController
        props.set_app_state({C0Running: true});

        const run_result = await VM.run(
                init_state,
                bc0BreakPoints,
                c0BreakPoint,
                abortSignal,
                reset,
                print_update,
                s => props.set_app_state({C0Runtime: s})
            );

        [new_runtime, can_continue] = [undefined, undefined];
        if (typeof run_result !== "undefined") {
            [new_runtime, can_continue] = run_result;
        }
        
        // Remove abort controller
        props.set_app_state({C0Running: false});

        // Program complete execution
        if (!can_continue) props.set_app_state({C0Runtime: undefined});

        // Program can still step in future, now paused due to breakpoint
        else props.set_app_state({C0Runtime: new_runtime});
    }

    const restart_c0runtime = async () => {
        clear_print();
        const new_state = await VM.initialize(appState.BC0SourceCode, clear_print, appState.C0Editors, appState.TypedefRecord, print_update, globalThis.MEM_POOL_SIZE);
        props.set_app_state({C0Runtime: new_state});
    };

    const abort_c0runtime = () => {
        abort()
    }

    const compile_c0source = () => {
        clear_print();
        remote_compile(
            appState,
            props.set_app_state,
            clear_print,
            print_update,
        );
    };

    // UI Buttons
    const CompileButton = 
        <button
            className={"base-btn main-btn unselectable " + (appState.C0Editors[0].content === "" ? "disable-btn" : "")}
            onClick={compile_c0source}
        >
            <FontAwesomeIcon icon={faScrewdriverWrench} className="hide-in-mobile"/> {" Compile "}
        </button>;
    
    const StepButton = 
        <button
            className={"base-btn success-btn unselectable " + (is_bc0_valid && !appState.C0Running ? "" : "disable-btn")}
            onClick={step_c0runtime}
        >
            <FontAwesomeIcon icon={faStepForward} className="hide-in-mobile"/>{" Step "}
        </button>;
    
    const RunButton = 
        <button
            className={"base-btn success-btn unselectable " + (is_bc0_valid && !appState.C0Running ? "" : "disable-btn")}
            onClick={run_c0runtime}
        >
            <FontAwesomeIcon icon={faPlay} className="hide-in-mobile"/>{" Run "}
        </button>;
    
    const AbortButton = 
        <button
            className="base-btn danger-btn unselectable"
            onClick={abort_c0runtime}
        >
            <FontAwesomeIcon icon={faBoltLightning} className="hide-in-mobile"/>{" Abort "}
        </button>;
    
    const RestartButton = 
        <button
            className="base-btn danger-btn unselectable"
            id="ctr-btn-restart"
            onClick={restart_c0runtime}
        >
            <FontAwesomeIcon icon={faUndo} className="hide-in-mobile"/>{" Restart "}
        </button>;

    return (
        <div className="main-control">
            <a href="https://github.com/MarkChenYutian/C0VM-ts" style={{cursor: "pointer", color: "black", textDecoration: "none"}}>
                <h3 className="unselectable">C0VM.<img src={tsLogo} style={{display: "inline-block", height: "1rem", marginBottom: "0.4rem"}} alt="ts"/></h3>
            </a>
            <div className="control-btn-group">
                {CompileButton}
                {StepButton}
                {RunButton}
                {appState.C0Running ? AbortButton : RestartButton}
            </div>
        </div>
    );
}
