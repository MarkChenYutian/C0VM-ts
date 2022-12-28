import React from "react";
import ReactCodeMirror, { basicSetup } from "@uiw/react-codemirror";

import LoadDocumentPlugin from "./editor_extension/blank_load";
import { C0 } from "./editor_extension/syntax/c0";

import { indentUnit, syntaxTree } from "@codemirror/language";
import { EditorState } from "@codemirror/state";
import execLineHighlighter from "./editor_extension/exec_position";
import breakpointGutter from "./editor_extension/breakpoint_marker";


function typedefResolver(s: EditorState): Map<string, string> {
    const tree = syntaxTree(s);
    const map = new Map<string, string>();
    for (let ptr = tree.cursor(); ptr.next() !== false; ) {
        if (ptr.type.is("TypeDefinition")) {
            ptr.firstChild();       // ptr = typedef keyword itself
            ptr.nextSibling();      // ptr = Source Type
            const source_type = s.sliceDoc(ptr.from, ptr.to);
            ptr.nextSibling();      // ptr = Target Type
            const alias_type = s.sliceDoc(ptr.from, ptr.to);
            map.set(alias_type, source_type);
        }
    }
    return map;
}

export default class C0Editor extends React.Component<C0EditorProps>
{
    /**
     * Interesting ... a C0Editor can hold the state for itself so there's no need
     * to update unless the execLine is changed
     */
    shouldComponentUpdate(nextProps: Readonly<C0EditorProps>, nextState: Readonly<{}>, nextContext: any): boolean {
        const execLineChanged = this.props.execLine !== nextProps.execLine;
        const valueChanged = this.props.editorValue !== nextProps.editorValue;
        return execLineChanged || valueChanged;
    }

    render() {
        const breakpoint_extension = breakpointGutter({
            currBps: this.props.breakPoints,
            setBps: this.props.setBreakPts
        });
        
        return <div className="code-editor">
                    <ReactCodeMirror
                        theme={globalThis.UI_EDITOR_THEME}
                        basicSetup={false}
                        onUpdate={(v) => 
                            {
                                if (v.docChanged) {
                                    this.props.updateContent(v.state.doc.toString());
                                    this.props.updateTypedef(typedefResolver(v.state));
                                }
                            }
                        }
                        value = {this.props.editorValue}
                        extensions={[
                            LoadDocumentPlugin(".c0", this.props.updateName),
                            basicSetup(),
                            indentUnit.of("    "),
                            execLineHighlighter(this.props.execLine, globalThis.UI_EDITOR_THEME),
                            C0(),
                            breakpoint_extension,
                        ]}
                        editable={this.props.editable}
                    />
                </div>;
    }
}
