import React from "react";
import "./application.css";
import "./embeddable.css";

import MainControlBar from "./components/main-control-bar";
import C0VMApplicationFooter from "./components/main-footer";
import CompilerOption from "./components/compiler-option";
import C0Output from "./components/c0-output";
import C0VM_RuntimeState from "./vm_core/exec/state";
import DebugConsole from "./components/debug_console/debug_console";
import CodeEditor from "./components/code-editor";
import AppCrashFallbackPage from "./components/app_crash_fallback";




export default class C0VMApplication extends React.Component<{}, C0VMApplicationState> {
    constructor(props: {}) {
        super(props);
        this.state = {
            crashed         : false,
            EditorContent   : "",
            PrintoutValue   : "",
            C0SourceCodes   : [""],
            ActiveEditor    : 0,
            C0Runtime       : undefined,
            CompilerFlags   : {"d": false}
        };
    }

    render() {
        if (this.state.crashed) {
            return <AppCrashFallbackPage state={this.state} setState={(ns) => this.setState(ns)}/>
        }

        const context: ApplicationContextInterface = this.context as ApplicationContextInterface;

        return (
            <div className="page-framework">
                <MainControlBar
                    isbc0        = { this.is_bc0_content(this.state.EditorContent)}
                    curr_bc0_content = { this.state.EditorContent }
                    curr_c0_contents = { this.state.C0SourceCodes }
                    curr_state   = { this.state.C0Runtime }
                    flags        = { this.state.CompilerFlags }
                    update_value = { (s: string) => {this.setState({EditorContent: s})} }
                    update_state = { (s: C0VM_RuntimeState | undefined) => {
                            if (s === undefined) globalThis.EDITOR_HIGHLIGHT_LINENUM = 0;
                            else globalThis.EDITOR_HIGHLIGHT_LINENUM = s.state.CurrLineNumber;
                            this.setState({C0Runtime: s})
                        }}
                    update_print = { (s) => this.setState((state) => {return {PrintoutValue: state.PrintoutValue + s}}
                        )}
                    clear_print  = { ()  => this.setState(() => {return {PrintoutValue: ""}}
                        )}
                />
                <div className="main-ui-framework">
                    <CodeEditor
                        C0_Contents  = {this.state.C0SourceCodes}
                        C0_ActiveTab = {this.state.ActiveEditor}
                        BC0_Content  = {this.state.EditorContent}
                        set_app_state= {(ns: any) => this.setState(ns)}
                    />
                    <div className="io-area">
                        { context.compiler_option ? <CompilerOption
                            flip_d_flag={ 
                                () => this.setState(
                                    (state, props) => {
                                        return {CompilerFlags: {...state.CompilerFlags, "d": !state.CompilerFlags["d"]}};
                                    }
                                )
                            }
                        /> : null }
                        { context.std_out ? <C0Output
                            printContent={this.state.PrintoutValue}
                        /> : null}
                        { context.debug_console ? <DebugConsole
                            state={this.state.C0Runtime}
                        /> : null }
                    </div>
                </div>
                <C0VMApplicationFooter/>
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
