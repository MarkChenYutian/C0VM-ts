import React from "react";
import { faBoltLightning, faPlay, faScrewdriverWrench, faStepForward, faUndo } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import * as VM from "../vm_core/vm_interface";
import remote_compile from "../network/remote_compile";

import tsLogo from "../assets/ts-logo-128.svg";
import C0VM_RuntimeState from "../vm_core/exec/state";

function AbortRef(): [{abort: boolean}, () => void, () => void] {
    const token = React.useRef({abort: false});
    const cancel = () => {token.current.abort = true;}
    const reset  = () => {token.current.abort = false;}
    return [token.current, cancel, reset];
}

// export default class MainControlBar extends React.Component<MainControlProps>{
export default function MainControlBar(props: MainControlProps) {
    const appState = props.application_state;
    const is_bc0_valid = props.application_state.BC0SourceCode.toUpperCase().startsWith("C0 C0 FF EE");

    const [abortSignal, abort, reset] = AbortRef();

    const step_c0runtime = async () => {
        let new_runtime, can_continue = undefined;
        if (appState.C0Runtime === undefined) {
            const init_state = await VM.initialize(appState.BC0SourceCode, props.clear_print, MEM_POOL_SIZE, appState.C0Editors, appState.TypedefRecord);
            if (init_state === undefined) return;
            [new_runtime, can_continue] = await VM.step(init_state, props.update_print);
        } else {
            [new_runtime, can_continue] = await VM.step(appState.C0Runtime, props.update_print);
        }
        if (!can_continue) props.update_state(undefined);
        else props.update_state(new_runtime);
    }

    const run_c0runtime = async () => {
        let init_state = undefined;
        let new_runtime, can_continue = undefined;
        if (appState.C0Runtime === undefined) {
            init_state = await VM.initialize(appState.BC0SourceCode, props.clear_print, MEM_POOL_SIZE, appState.C0Editors, appState.TypedefRecord);
            if (init_state === undefined) return;
        } else {
            init_state = appState.C0Runtime;
        }

        // Initialize AbortController
        props.update_running(true);

        const run_result = await VM.run(
                init_state,
                appState.BC0BreakPoints,
                abortSignal,
                reset,
                props.update_print,
                props.update_state
            );

        [new_runtime, can_continue] = [undefined, undefined];
        if (typeof run_result !== "undefined") {
            [new_runtime, can_continue] = run_result;
        }
        
        props.update_running(false); // Remove abort controller
        if (!can_continue) props.update_state(undefined);
        else props.update_state(new_runtime);
    }

    const restart_c0runtime = async () => {
        props.clear_print();
        const old_state = appState.C0Runtime as (undefined | C0VM_RuntimeState);
        const new_state = await VM.initialize(appState.BC0SourceCode, props.clear_print, globalThis.MEM_POOL_SIZE, appState.C0Editors, appState.TypedefRecord);
        if (EXP_PRESERVE_TYPE                                   // configuration flag opened
            && old_state !== undefined                          // old_state exists
            && old_state.raw_code === appState.BC0SourceCode    // Have same bytecode source
            && new_state !== undefined) {                       // new_state exists
            new_state.state.TypeRecord = old_state.state.TypeRecord;
        }
        props.update_state(new_state);
    };

    const abort_c0runtime = () => {
        abort()
    }

    const compile_c0source = () => {
        props.clear_print();
        remote_compile(
            appState.C0Editors,
            appState.TypedefRecord,
            props.update_value,
            props.clear_print,
            props.update_print,
            appState.CompilerFlags,
            (s) => {props.update_state(s)}
        );
    };

    // UI Rendering Functions
    const CompileButton = 
        <button
            className={"base-btn main-btn unselectable " + (props.application_state.C0Editors[0].content === "" ? "disable-btn" : "")}
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
