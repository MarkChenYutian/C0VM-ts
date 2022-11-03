import React from "react";
import ReactCodeMirror, { basicSetup } from "@uiw/react-codemirror";

import { StateField, RangeSet } from "@codemirror/state";
import { GutterMarker } from "@codemirror/view";

import breakpointGutter from "./editor_extension/breakpoint_marker";
import LoadDocumentPlugin from "./editor_extension/blank_load";
import execLineHighlighter from "./editor_extension/exec_position";
import { BC0Language } from "./editor_extension/syntax/bc0";

import { keymap } from "@codemirror/view";
import { indentWithTab } from "@codemirror/commands";
import { indentUnit, language } from "@codemirror/language";


export default class BC0Editor extends React.Component<BC0EditorProps>
{
    auto_update(n: number) {
        const ns: Set<number> = new Set(this.props.breakpointVal);
        if (ns.has(n)) {
            ns.delete(n);
            this.props.updateBrkPts(ns);
        } else {
            ns.add(n);
            this.props.updateBrkPts(ns);
        }
    }

    componentDidMount() {
        this.props.updateBrkPts(new Set());
    }

    render() {
        const breakpoint_extension = breakpointGutter((n: number) => this.auto_update(n));
        return  <ReactCodeMirror
                    theme={globalThis.UI_EDITOR_THEME}
                    basicSetup={false}
                    onUpdate={(v) => 
                        {
                            if (v.docChanged) {
                                this.props.updateContent(v.state.doc.toString());
                                // Update breakpoints stored in react state from breakpoints in CodeMirror State
                                const F = v.state.field(breakpoint_extension[0] as StateField<RangeSet<GutterMarker>>);
                                const brk_pts = new Set<number>();
                                for (let cursor = F.iter(); cursor.value !== null; cursor.next()) {
                                    brk_pts.add(v.state.doc.lineAt(cursor.from).number);
                                }
                                this.props.updateBrkPts(brk_pts);
                            }
                        }
                    }
                    value = {this.props.editorValue}
                    extensions={[
                        breakpoint_extension,
                        LoadDocumentPlugin(".bc0", undefined),
                        basicSetup(),
                        keymap.of([indentWithTab]),
                        indentUnit.of("    "),
                        language.of(BC0Language),
                        execLineHighlighter(this.props.execLine, globalThis.UI_EDITOR_THEME),
                    ]}
                    editable={this.props.execLine === 0}
                />
    }
}
