import React from "react";
import ReactCodeMirror, { basicSetup } from "@uiw/react-codemirror";

import { LoadDocumentPlugin } from "./editor_extension/blank_load";
import { C0 } from "./editor_extension/syntax/c0";

import { indentUnit } from "@codemirror/language";
import execLineHighlighter from "./editor_extension/exec_position";
import breakpointGutter from "./editor_extension/breakpoint_marker";
import C0LightTheme from "./editor_extension/c0editor_theme";

export default class C0Editor extends React.Component<C0EditorProps>
{
    /**
     * Interesting ... a C0Editor can hold the state for itself so there's no need
     * to update unless the execLine is changed
     */
    shouldComponentUpdate(nextProps: Readonly<C0EditorProps>, nextState: Readonly<{}>, nextContext: any): boolean {
        const execLineChanged = this.props.execLine !== nextProps.execLine;
        const valueChanged = this.props.editorValue !== nextProps.editorValue;
        const editableStateChanged = this.props.editable !== nextProps.editable;
        return execLineChanged || valueChanged || editableStateChanged;
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
                                    this.props.updateContent(v.state.doc.toString());
                                }
                            }
                        }
                        value = {this.props.editorValue}
                        extensions={[
                            breakpoint_extension,
                            LoadDocumentPlugin(".c0", this.props.updateName, this.props.handle_import_folder),
                            basicSetup(),
                            indentUnit.of("    "),
                            execLineHighlighter(this.props.execLine, "light"),
                            C0(),
                        ]}
                        editable={this.props.editable}
                    />
                </div>;
    }
}
