import React from "react";
import ReactCodeMirror, { basicSetup } from "@uiw/react-codemirror";

import LoadDocumentPlugin from "./editor_extension/blank_load";
import { C0, C0Language } from "./editor_extension/syntax/c0";

import { indentUnit, syntaxTree } from "@codemirror/language";
import { snippetCompletion } from "@codemirror/autocomplete";
import { EditorState } from "@codemirror/state";


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
    render() {
        return <div className="code-editor">
                    <ReactCodeMirror
                        theme={globalThis.UI_EDITOR_THEME}
                        basicSetup={false}
                        onUpdate={(v) => 
                            {
                                if (v.docChanged) {
                                    this.props.updateContent(v.state.doc.toString());
                                    this.props.updateTypedef(typedefResolver(v.state));
                                };
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
                                    snippetCompletion('for(#{init}; #{cond}; #{incr})\n{\n}', {label: "for loop", type: "text", info: "Snippet: for(init; cond; incr){...}"}),
                                    snippetCompletion('while(#{cond})\n{\n}', {label: "while loop", type: "text", info: "Snippet: while(cond){...}"}),
                                ]
                            }),
                        ]}
                    />
                </div>;
    }
}
