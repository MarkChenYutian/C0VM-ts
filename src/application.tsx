import React from "react";
import "./application.css";

import MainControlBar from "./components/main-control-bar";
import C0VMApplicationFooter from "./components/main-footer";
import CompilerOption from "./components/compiler-option";
import C0Output from "./components/c0-output";
import C0VM_RuntimeState from "./vm_core/exec/state";
import DebugConsole from "./components/debug_console/debug_console";
import CodeEditor from "./components/code-editor";
import { Result } from "antd";



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
        if (this.state.crashed && !globalThis.DEBUG) {
            return <Result
                status="error"
                title="Application Crashed"
                subTitle="Reload the page to restart the application."
                extra={
                    <button
                        className="base-btn main-btn"
                        onClick={() => {
                            globalThis.EDITOR_HIGHLIGHT_LINENUM = 0;
                            this.setState({crashed: false, C0Runtime: undefined, PrintoutValue: ""});
                        }}
                    >
                        Restore Editor Content
                    </button>
                }
            />
        } else if (this.state.crashed && globalThis.DEBUG) {
            return <Result
                status="error"
                title="Application Crashed (Debug Mode)"
                subTitle={<p>Please report this problem to our GitHub Repo!</p>}
                extra={
                    <>
                        <button
                            className="base-btn main-btn"
                            onClick={() => {
                                globalThis.EDITOR_HIGHLIGHT_LINENUM = 0;
                                this.setState({crashed: false, C0Runtime: undefined, PrintoutValue: ""});
                            }}
                        >
                            Restore Editor Content
                        </button>
                        <div style={{textAlign: "left"}}>
                        <h3>How to report?</h3>
                        <h4>Step 1</h4>
                        <p>Copy the application status dump below: </p>
                        <pre id={globalThis.UI_PRINTOUT_ID}>{
                            JSON.stringify(
                                {
                                    ReactState: this.state,
                                    GlobalState: {
                                        exec_line: globalThis.EDITOR_HIGHLIGHT_LINENUM,
                                        breakpoints: Array.from(globalThis.EDITOR_BREAKPOINTS),
                                        configuration: {
                                            DEBUG: globalThis.DEBUG,
                                            DEBUG_DUMP_MEM: globalThis.DEBUG_DUMP_MEM,
                                            DEBUG_DUMP_STEP: globalThis.DEBUG_DUMP_STEP,
                                            MEM_POOL_SIZE: globalThis.MEM_POOL_SIZE,
                                        }
                                    }
                                }, undefined, 4
                            )
                        }</pre>

                        <h4>Step 2</h4>
                        <p>
                            Open a new issue and paste the state dump above into issue description.
                        </p>
                        <a href="https://github.com/MarkChenYutian/C0VM-ts/issues" target="_blank" rel="noreferrer">
                            <button className="base-btn main-btn">
                                Open a New Issue
                            </button>
                        </a>
                        </div>
                    </>
                }
            />
        }
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
                        <CompilerOption
                            flip_d_flag={ 
                                () => this.setState(
                                    (state, props) => {
                                        return {CompilerFlags: {...state.CompilerFlags, "d": !state.CompilerFlags["d"]}};
                                    }
                                )
                            }
                        />
                        <C0Output
                            printContent={this.state.PrintoutValue}
                        />
                        <DebugConsole
                            state={this.state.C0Runtime}
                        />
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
