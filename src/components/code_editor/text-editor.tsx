import React from "react";
import ReactCodeMirror, { basicSetup } from "@uiw/react-codemirror";

import BC0LightTheme from "./editor_extension/bc0editor_theme";
import { LoadDocumentPlugin } from "./editor_extension/blank_load";
import CompileLineHighlighter from "./editor_extension/compileline_position";


const cc0_compile_line_regex = /^\s*%\s*cc0/;


function getCompilerLineNumber(s: string, updateCompileLine: (s: string[]) => void): number {
    const lines = s.split("\n");
    let i = 0;
    for (const line of lines) {
        i ++;
        if (! cc0_compile_line_regex.test(line)) continue;
        if (line.includes("-i") || line.includes("--interface")) continue;
        
        const files = line.split(" ").filter(f => f.endsWith(".c0") || f.endsWith(".c1"));

        updateCompileLine(files);
        return i;
    }
    return -1;
}


export default class TextEditor extends React.Component<TextEditorProps>
{
    render() {
        const compilerLine = getCompilerLineNumber(this.props.editorValue, this.props.updateCompileLine);

        return  <ReactCodeMirror
                    theme={BC0LightTheme}
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
                        basicSetup(),
                        CompileLineHighlighter(compilerLine),
                        LoadDocumentPlugin(".txt", this.props.updateName)
                    ]}
                    editable={true}
                />
    }
}
