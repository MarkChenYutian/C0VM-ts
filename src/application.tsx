import React from "react";
import "./application.css";

import MainControlBar from "./components/main-control-bar";
import C0VMApplicationFooter from "./components/main-footer";
import C0Editor from "./components/c0-editor";
import CompilerOption from "./components/compiler-option";
import C0Output from "./components/c0-output";
import C0VM_RuntimeState from "./vm_core/exec/state";



export default class C0VMApplication extends React.Component<{}, C0VMApplicationState> {
    constructor(props: {}) {
        super(props);
        this.state = {
            EditorContent : "",
            PrintoutValue : "",
            C0Runtime: undefined,
            CompilerFlags: {"d": false}
        }
    }

    render() {
        return (
            <div className="page-framework">
                <MainControlBar
                    isbc0={this.is_bc0_content(this.state.EditorContent)}
                    update_state={(s: C0VM_RuntimeState | undefined) => {
                        if (s === undefined) globalThis.EDITOR_HIGHLIGHT_LINENUM = 0;
                        else globalThis.EDITOR_HIGHLIGHT_LINENUM = s.state.CurrLineNumber;
                        this.setState({C0Runtime: s})
                    }}
                    update_print={
                        (s) => this.setState((state, props) => {return {PrintoutValue: state.PrintoutValue + s}})
                    }
                    clear_print ={
                        ()  => this.setState((state, props) => {return {PrintoutValue: ""}})
                    }
                    curr_content={
                        this.state.EditorContent
                    }
                    curr_state  ={
                        this.state.C0Runtime
                    }
                />
                <div className="main-ui-framework">
                    <C0Editor updateContent={(s) => {this.setState({EditorContent: s})}}/>
                    <div className="io-area">
                        <CompilerOption
                            flip_d_flag={() => this.setState((state, props) => {return {CompilerFlags: {...state.CompilerFlags, "d": !state.CompilerFlags["d"]}}})}
                        />
                        <C0Output
                            printContent={this.state.PrintoutValue}
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
}
