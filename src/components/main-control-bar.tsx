import React, { useEffect, useState } from "react";

import { Button, Dropdown, MenuProps, Space, Tooltip } from "antd";

import { faAngleDown, faBoltLightning, faBugSlash, faClockRotateLeft, faPlay, faScrewdriverWrench, faStepForward, faUndo } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import * as VM from "../vm_core/vm_interface";
import remote_compile from "../network/remote_compile";

import tsLogo from "../assets/ts-logo-128.svg";
import { ConfigConsumer, ConfigConsumerProps } from "antd/es/config-provider";


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

function convertC0Bpts(C0Editors: C0EditorTab[]): Set<string>{
    const c0BreakPoint = new Set<string>();
    for (let i = 0; i < C0Editors.length; i ++){
    for (const currentEditor of C0Editors)
        for (const bpts of currentEditor.breakpoints){
            c0BreakPoint.add(`${currentEditor.title}@${bpts.line}`);
        }
    }
    return c0BreakPoint;
}

function MainControlBarFC(props: MainControlProps & ContextValue) {
    const appState = props.application_state;
    const is_bc0_valid = props.application_state.BC0SourceCode.toUpperCase().startsWith("C0 C0 FF EE");

    const [abortSignal, abort, reset] = AbortRef();
    const [execMode, setExecMode] = useState<"Run"|"AutoStep">("Run");

    const print_update = (str: string) => props.set_app_state((s) => {return {PrintoutValue: s.PrintoutValue + str}})
    const clear_print  = () => props.set_app_state({PrintoutValue: ""})

    const step_c0runtime = async () => {
        if (appState.contentChanged) {
            RequiresRecompile();
            return;
        }

        let new_runtime, can_continue = undefined;

        if (appState.C0Runtime === undefined) {
            const init_state = await VM.initialize(appState.BC0SourceCode, clear_print, appState.C0Editors, print_update, MEM_POOL_SIZE);
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

    const autoStep_c0runtime = async() =>{
        if (appState.contentChanged) {
            RequiresRecompile();
            return;
        }
        let init_state: undefined | C0VM_RT = undefined;
        //let new_runtime, can_continue = undefined;

        if (appState.C0Runtime === undefined) {
            init_state = await VM.initialize(appState.BC0SourceCode, clear_print, appState.C0Editors, print_update, MEM_POOL_SIZE);
            if (init_state === undefined) return;
        } else {
            init_state = appState.C0Runtime;
        }

        const c0BreakPoint = convertC0Bpts(appState.C0Editors);
        const bc0BreakPointArr = Array.from(appState.BC0BreakPoints).map(bp => bp.line);
        const bc0BreakPoints = new Set(bc0BreakPointArr);

        if (init_state===undefined) return;

        const autoStepFn = VM.autoStep(
            init_state as C0VM_RT,
            bc0BreakPoints,
            c0BreakPoint,
            abortSignal,
            props.application_state.c0_only,
            reset,
            print_update,
            s => props.set_app_state({C0Runtime: s}),
            () => props.set_app_state({C0Running: false})
        )

        props.set_app_state({C0Running: true}, ()=>autoStepFn);
    }

    const run_c0runtime = async () => {
        if (appState.contentChanged) {
            RequiresRecompile();
            return;
        }

        let init_state = undefined;
        let new_runtime, can_continue = undefined;

        if (appState.C0Runtime === undefined) {
            init_state = await VM.initialize(appState.BC0SourceCode, clear_print, appState.C0Editors, print_update, MEM_POOL_SIZE);
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
        const new_state = await VM.initialize(appState.BC0SourceCode, clear_print, appState.C0Editors, print_update, globalThis.MEM_POOL_SIZE);
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

    const compilebtn_disabled = appState.C0Running || appState.C0Editors[0].content === "";
    const stepbtn_disabled    = (!is_bc0_valid) || appState.C0Running || appState.contentChanged;
    const runbtn_disabled     = (!is_bc0_valid) || appState.C0Running || appState.contentChanged;
    const autostepbtn_disabled = (!is_bc0_valid) || appState.C0Running || appState.contentChanged;
    const execbtn_disabled    = execMode === "Run" ? runbtn_disabled : autostepbtn_disabled;

    function onKeyPressWrapper(e: KeyboardEvent): void{
        const is_action_key = e.key==="t" || e.key ==='r' || e.key==="s";
        if (autostepbtn_disabled && is_action_key && e.ctrlKey) {
            if (!is_bc0_valid) globalThis.MSG_EMITTER.warn("Action Unavailable","Invalid BC0 code.");
            else if(appState.C0Running) globalThis.MSG_EMITTER.warn("Action Unavailable","The program is currently running.");
            else if(appState.contentChanged) RequiresRecompile();
        }
        else if (e.ctrlKey) onKeyPress(e.key);
    }
    
    function onKeyPress(key: string): void{
        if(key==='t') autoStep_c0runtime();
        else if(key==='r') run_c0runtime();
        else if(key==='s') step_c0runtime();
    }
   
    useEffect(() =>{
        document.addEventListener('keydown', onKeyPressWrapper)
        return () => document.removeEventListener('keydown',onKeyPressWrapper);
    })

    const CompileNaiveButton = 
        <div style={{fontSize: "1rem", color: "white"}}>
            <FontAwesomeIcon icon={faScrewdriverWrench}/>&nbsp;Compile
        </div>;
    
    const CompileContractButton = 
        <div style={{fontSize: "1rem", color: "white"}}>
            <FontAwesomeIcon icon={faBugSlash}/>&nbsp;Compile (contract)
        </div>;
    
    const StepButton = 
        <Button
            icon={<FontAwesomeIcon icon={faStepForward}/>}
            size = "large"
            type = "primary"
            disabled={stepbtn_disabled}
            onClick={step_c0runtime}
        >
            &nbsp;Step
        </Button>;
    
    const AutoStepButton =
        <div style={{fontSize: "1rem", color: "white"}}>
            <FontAwesomeIcon icon={faClockRotateLeft}/>&nbsp;AutoStep
        </div>;
    
    const RunButton = 
        <div style={{fontSize: "1rem", color: "white"}}>
            <FontAwesomeIcon icon={faPlay}/>&nbsp;Run
        </div>;
    
    const AbortButton = 
        <Button
            icon   ={<FontAwesomeIcon icon={faBoltLightning}/>}
            size = "large"
            danger
            onClick={abort_c0runtime}
        >
            &nbsp;Abort
        </Button>;
    
    const RestartButton = 
        <Button
            icon   ={<FontAwesomeIcon icon={faUndo}/>}
            size = "large"
            danger
            onClick={restart_c0runtime}
        >
            &nbsp;Restart
        </Button>;
    
    // Dropdown menu for execute button
    const ExecBtnIcon = execMode === "Run" ? 
        <FontAwesomeIcon icon={faPlay}/> : 
        <FontAwesomeIcon icon={faClockRotateLeft}/>;

    const ExecBtnFn = execMode === "Run" ? run_c0runtime : autoStep_c0runtime;
    
    const menuItems_ExecBtn: MenuProps["items"] = [
        {
            label: execMode === "Run" ? AutoStepButton : RunButton,
            key: execMode === "Run" ? "AutoStep" : "Run"
        }
    ];

    const menuItems_ChangeModeFn: MenuProps["onClick"] = (info) => {
        if (info.key === "Run" || info.key === "AutoStep") {
            setExecMode(info.key);
        }
    };

    const MenuProp: MenuProps = {
        style: {backgroundColor: props.themeColor},
        items: menuItems_ExecBtn,
        onClick: menuItems_ChangeModeFn
    };

    const ExecBtn = 
        <Dropdown.Button
            disabled={execbtn_disabled}
            type="primary"
            size="large"
            icon={<FontAwesomeIcon icon={faAngleDown}/>}
            onClick={ExecBtnFn}
            menu={MenuProp}
        >
            {ExecBtnIcon}&nbsp;{execMode}
        </Dropdown.Button>;

    // dropdown menu for compile button
    const CompileBtnIcon = appState.CompilerFlags["d"] ?
        <FontAwesomeIcon icon={faBugSlash}/> :
        <FontAwesomeIcon icon={faScrewdriverWrench}/>;
    
    const menuItems_CompileBtn: MenuProps["items"] = [
        {
            label: appState.CompilerFlags["d"] ? CompileNaiveButton : CompileContractButton,
            key: appState.CompilerFlags["d"] ? "naive" : "contract"
        }
    ];

    const menuItems_ChangeCompileFn: MenuProps["onClick"] = (info) => {
        const flags = {...appState.CompilerFlags};
        flags["d"] = !(info.key === "naive");
        props.set_app_state({CompilerFlags: flags});
    };

    const MenuPropCompile: MenuProps = {
        style: {backgroundColor: props.themeColor},
        items: menuItems_CompileBtn,
        onClick: menuItems_ChangeCompileFn
    }

    const CompBtn = 
        <Dropdown.Button
            disabled={compilebtn_disabled}
            type="primary"
            size="large"
            icon={<FontAwesomeIcon icon={faAngleDown}/>}
            onClick={compile_c0source}
            menu={MenuPropCompile}
        >
            {CompileBtnIcon}&nbsp;Compile{appState.CompilerFlags["d"] ? " (contract)" : ""}
        </Dropdown.Button>;
    
    const display_CompileBtn = compilebtn_disabled ?
        <Tooltip placement="bottomRight" color={props.themeColor} title="Write code in editor to Compile">{CompBtn}</Tooltip>
         : CompBtn;
    
    const display_StepBtn = stepbtn_disabled ?
        <Tooltip
            placement="bottomRight"
            color={props.themeColor}
            title="Compile the code / Abort the program before Step"
        >
            {StepButton}
        </Tooltip>
         : StepButton;

    const display_ExecBtn = execbtn_disabled ? 
        <Tooltip
            placement="bottomRight"
            color={props.themeColor}
            title={"Compile the code / Abort the program before " + execMode}
        >
            {ExecBtn}
        </Tooltip>
        : ExecBtn;

    return (
        <div className="main-control">
            <a href="https://github.com/MarkChenYutian/C0VM-ts" style={{cursor: "pointer", color: "black", textDecoration: "none"}}>
                <h3 className="unselectable">C0VM.<img src={tsLogo} style={{display: "inline-block", height: "1rem", marginBottom: "0.4rem"}} alt="ts"/></h3>
            </a>
            <Space size="middle">
                {display_CompileBtn}
                {display_StepBtn}
                {display_ExecBtn}
                {appState.C0Running ? AbortButton : RestartButton}
            </Space>
        </div>
    );
}


export default function MainControlBar(props: MainControlProps){
    return  <ConfigConsumer>
                {(value: ConfigConsumerProps) => 
                    <MainControlBarFC 
                        themeColor={value.theme?.token?.colorPrimary}
                        {...props}
                    />
                }
            </ConfigConsumer>;
}
