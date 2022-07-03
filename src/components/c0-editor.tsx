import React from "react";
import ReactCodeMirror, { basicSetup } from "@uiw/react-codemirror";

import breakpointGutter from "./editor_extension/breakpoint_marker";
import LoadDocumentPlugin from "./editor_extension/blank_load";
import execLineHighlighter from "./editor_extension/exec_position";
import { BC0Language } from "./editor_extension/syntax/bc0";

import { keymap } from "@codemirror/view";
import { indentWithTab } from "@codemirror/commands";
import { indentUnit, language } from "@codemirror/language";


export default class C0Editor extends React.Component<
    {
        updateContent: (s: string) => void,
    }
>
{
    render() {
        return <div className="code-editor">
                    <ReactCodeMirror
                    theme="light"
                    basicSetup={false}
                    onUpdate={(v) => {if (v.docChanged) this.props.updateContent(v.state.doc.toString())}}
                    extensions={[
                        breakpointGutter,
                        LoadDocumentPlugin,
                        execLineHighlighter,
                        basicSetup(),
                        keymap.of([indentWithTab]),
                        indentUnit.of("    "),
                        language.of(BC0Language)
                    ]}/>
                </div>;
    }
}
