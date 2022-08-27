import React from "react";
import "./application.less";
import "./embeddable.less";

import MainControlBar from "./components/main-control-bar";
import C0VMApplicationFooter from "./components/main-footer";
import CompilerOption from "./components/compiler-option";
import C0Output from "./components/c0-output";
import DebugConsole from "./components/debug_console/debug_console";
import CodeEditor from "./components/code-editor";
import AppCrashFallbackPage from "./components/app_crash_fallback";

import { merge_typedef } from "./utility/ui_helper";
import C0VM_RuntimeState from "./vm_core/exec/state";

export default class C0VMApplication extends React.Component<{}, C0VMApplicationState> {
    constructor(props: {}) {
        super(props);
        this.state = {
            crashed         : false,
            BC0SourceCode   : "",
            BC0BreakPoints  : new Set(),
            TypedefRecord   : new Map(),
            C0TabTitles     : [{name: "Untitled_0.c0", key: 0}],
            C0SourceCodes   : [""],
            ActiveEditor    : 0,
            PrintoutValue   : "",
            C0Runtime       : undefined,
            CompilerFlags   : {"d": false}
        };
    }

    render() {
        if (this.state.crashed) {
            return <AppCrashFallbackPage state={this.state} setState={(ns) => this.setState(ns)}/>
        }

        const context: ApplicationContextInterface = this.context as ApplicationContextInterface;

        const state = this.state.C0Runtime as (C0VM_RuntimeState | undefined);
        let lineNum = 0;
        if (state !== undefined) { lineNum = state.state.CurrLineNumber }

        const CompilerOptionComponent = context.compiler_option ? <CompilerOption 
            flip_d_flag={() => this.setState((state) => {
                                return {CompilerFlags: {...state.CompilerFlags, "d": !state.CompilerFlags["d"]}};
                        })}
            d_flag_stat={this.state.CompilerFlags["d"]}
            /> : null;
        
        const StandardOutputComponent = context.std_out ? <C0Output printContent={this.state.PrintoutValue}/> : null;

        const DebugConsoleComponent = context.debug_console ? <DebugConsole state={this.state.C0Runtime}/> : null;

        return (
            <div className="page-framework">
                <MainControlBar
                    application_state = { this.state }
                    update_value = { (s) => {this.setState({BC0SourceCode: s})}}
                    update_state = { (s) => {
                                        if (s === undefined) {this.setState({C0Runtime: s})}
                                        else {this.setState({C0Runtime: s});}
                                   }}
                    update_print = { (s) => this.setState((state) => { return {PrintoutValue: state.PrintoutValue + s} })}
                    clear_print  = { ()  => this.setState({PrintoutValue: ""})}
                />
                <div className="main-ui-framework">
                    <CodeEditor
                        C0_TabTitles    = {this.state.C0TabTitles}
                        C0_Contents     = {this.state.C0SourceCodes}
                        C0_ActiveTab    = {this.state.ActiveEditor}
                        BC0_Content     = {this.state.BC0SourceCode}
                        BC0_Breakpoint  = {this.state.BC0BreakPoints}
                        BC0_Execline    = {lineNum}
                        set_app_state   = {(ns: any) => this.setState(ns)}
                        set_typedef     = {(key, newMap) => {
                            this.setState(
                                (old_state) => { 
                                    return {TypedefRecord: merge_typedef(old_state.TypedefRecord, key, newMap)};
                                }
                            );
                        }}
                    />
                    <div className="io-area">
                        { CompilerOptionComponent }
                        { StandardOutputComponent }
                        { DebugConsoleComponent }
                    </div>
                </div>
                <C0VMApplicationFooter state={this.state}/>
            </div>
        );
    }

    is_bc0_content(s: string): boolean {
        return s.slice(0, 11).toUpperCase() === "C0 C0 FF EE";
    }

    componentDidCatch(error: Error | null): void {
        if (globalThis.DEBUG) console.error(error);
        globalThis.MSG_EMITTER.err(
            "Internal User Interface Error",
            (error === null) ? undefined : error.message
        );
        this.setState({crashed: true});
    }
}
