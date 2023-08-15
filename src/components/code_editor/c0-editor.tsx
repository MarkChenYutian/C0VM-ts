import React from "react";
import ReactCodeMirror, { basicSetup } from "@uiw/react-codemirror";
import { indentUnit } from "@codemirror/language";

import { LoadDocumentPlugin } from "./editor_extension/blank_load";
import { C0 }              from "./editor_extension/syntax/c0";
import execLineHighlighter from "./editor_extension/exec_position";
import breakpointGutter    from "./editor_extension/breakpoint_marker";
import C0LightTheme        from "./editor_extension/c0editor_theme";
import FilesLoad from "./editor_extension/files_load";


export default class C0Editor extends React.Component<C0EditorProps, C0EditorState>
{
    constructor(props: C0EditorProps) {
        super(props);
        this.state = {show: false};
    }

    /**
     * Interesting ... a C0Editor can hold the state for itself so there's no need
     * to update unless the execLine is changed
     */
    shouldComponentUpdate(nextProps: Readonly<C0EditorProps>, nextState: Readonly<C0EditorState>, nextContext: any): boolean {
        const execLineChanged = this.props.execLine !== nextProps.execLine;
        const valueChanged = this.props.content !== nextProps.content;
        const editableStateChanged = this.props.editable !== nextProps.editable;
        const showChanged = this.state.show !== nextState.show;
        return execLineChanged || valueChanged || editableStateChanged || showChanged;
    }

    render() {
        const breakpoint_extension = breakpointGutter({
            currBps: this.props.breakPoints,
            setBps: this.props.setBreakPts
        });
        
        return <div className="code-editor">
                    <ReactCodeMirror
                        theme={C0LightTheme}
                        basicSetup={false}
                        onUpdate={(v) => 
                            {
                                if (v.docChanged) {
                                    this.props.setContent(v.state.doc.toString());
                                }
                            }
                        }
                        value = {this.props.content}
                        extensions={[
                            breakpoint_extension,
                            LoadDocumentPlugin(
                                ".c0, .c1",
                                this.props.setTitle,
                                (show) => this.setState({show})
                            ),
                            basicSetup(),
                            indentUnit.of("    "),
                            execLineHighlighter(this.props.execLine, "light"),
                            C0(),
                        ]}
                        editable={this.props.editable}
                    />
                    <FilesLoad
                        app_state={this.props.app_state}
                        set_app_state={(s, cb) => this.props.set_app_state(s, cb)}
                        show={this.state.show}
                        setShow={(s) => this.setState(({show: s}))}
                    />
                </div>;
    }
}
