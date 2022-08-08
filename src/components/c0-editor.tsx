import React from "react";
import ReactCodeMirror, { basicSetup } from "@uiw/react-codemirror";

import LoadDocumentPlugin from "./editor_extension/blank_load";
import { C0, C0Language } from "./editor_extension/syntax/c0";

// import { keymap } from "@codemirror/view";
// import { indentWithTab } from "@codemirror/commands";
import { indentUnit } from "@codemirror/language";
import { snippetCompletion } from "@codemirror/autocomplete";
import { C0ContractAutoComplete } from "./editor_extension/c0_auto_complete";


export default class C0Editor extends React.Component<C0EditorProps>
{
    render() {
        return <div className="code-editor">
                    <ReactCodeMirror
                        theme="light"
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
                                    snippetCompletion('/*@requires #{condition}; @*/', {label: "requires", type: "interface", info: "Contract: Describe the precondition of a function"}),
                                    snippetCompletion('/*@ensures #{condition}; @*/', {label: "ensures", type: "interface", info: "Contract: Describe the postcondition of a function"}),
                                    snippetCompletion('/*@assert #{condition}; @*/', {label: "assert", type: "interface", info: "Contract: assert some condition to be true during runtime"}),
                                    snippetCompletion('/*@loop_invariant #{condition}; @*/', {label: "loop_invariant", type: "interface", info: "Contract: Describe a loop invariant"}),
                                ]
                            }),
                        ]}
                    />
                </div>;
    }
}
