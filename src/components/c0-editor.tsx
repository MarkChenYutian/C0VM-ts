import React from "react";
import ReactCodeMirror, { basicSetup } from "@uiw/react-codemirror";

import { StateField, RangeSet } from "@codemirror/state";
import { GutterMarker } from "@codemirror/view";

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
            ptr.firstChild();
            ptr.nextSibling();
            const source_type = s.sliceDoc(ptr.from, ptr.to);
            ptr.nextSibling();
            const alias_type = s.sliceDoc(ptr.from, ptr.to);
            map.set(alias_type, source_type);
        }
    }
    return map;
}

export default class C0Editor extends React.Component<C0EditorProps>
{
    componentDidMount() {
        this.props.setBreakPts([]);
    }

    render() {
        const breakpoint_extension = breakpointGutter((n) => {this.props.updateBrkPts(n)});
        return <div className="code-editor">
                    <ReactCodeMirror
                        theme={globalThis.UI_EDITOR_THEME}
                        basicSetup={false}
                        onUpdate={(v) => 
                            {
                                if (v.docChanged) {
                                    const F = v.state.field(breakpoint_extension[0] as StateField<RangeSet<GutterMarker>>);
                                    const brk_pts = [];
                                    for (let cursor = F.iter(); cursor.value !== null; cursor.next()) {
                                        brk_pts.push(v.state.doc.lineAt(cursor.from).number);
                                    }
                                    this.props.updateContent(v.state.doc.toString());
                                    this.props.updateTypedef(typedefResolver(v.state));
                                    this.props.setBreakPts(brk_pts);
                                }
                            }
                        }
                        value = {this.props.editorValue}
                        extensions={[
                            LoadDocumentPlugin(".c0", this.props.updateName),
                            breakpoint_extension,
                            basicSetup(),
                            indentUnit.of("    "),
                            execLineHighlighter(this.props.lineNumber, globalThis.UI_EDITOR_THEME),
                            C0(),
                        ]}
                        editable={this.props.editable}
                    />
                </div>;
    }
}
