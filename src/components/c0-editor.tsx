import React from "react";
import ReactCodeMirror, { basicSetup } from "@uiw/react-codemirror";

import LoadDocumentPlugin from "./editor_extension/blank_load";
import { C0, C0Language } from "./editor_extension/syntax/c0";

// import { keymap } from "@codemirror/view";
// import { indentWithTab } from "@codemirror/commands";
import { indentUnit } from "@codemirror/language";
import { snippetCompletion } from "@codemirror/autocomplete";


export default class C0Editor extends React.Component<C0EditorProps>
{
    render() {
        return <div className="code-editor">
                    <ReactCodeMirror
                        theme="dark"
                        basicSetup={false}
                        onUpdate={(v) => 
                            {
                                if (v.docChanged) this.props.updateContent(v.state.doc.toString());
                            }
                        }
                        value = {this.props.editorValue}
                        extensions={[
                            LoadDocumentPlugin(".c0", this.props.updateName),
                            basicSetup(),
                            indentUnit.of("    "),
                            C0(),
                            C0Language.data.of({
                                autocomplete: [
                                    snippetCompletion('for(#{int i = 0}; #{condition}; #{i++})\n{\n}', {label: "for loop", type: "text", info: "Snippet: for(init; cond; incr){...}"}),
                                    snippetCompletion('while(#{cond})\n{\n}', {label: "while loop", type: "text", info: "Snippet: while(cond){...}"}),
                                ]
                            }),
                        ]}
                    />
                </div>;
    }
}
