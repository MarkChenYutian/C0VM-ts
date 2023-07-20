import React from "react";
import ReactCodeMirror, { basicSetup } from "@uiw/react-codemirror";

import BC0LightTheme from "./editor_extension/bc0editor_theme";
import LoadDocumentPluginNaive from "./editor_extension/blank_load_naive";
import CompileLineHighlighter from "./editor_extension/compileline_position";


const cc0_compile_line_regex = /^\s*%\s*cc0/;


function getCompilerLineNumber(s: string, updateCompileLine: (s: string[]) => void, updateCompileFlag: (k: string, v: boolean) => void) {
    const lines = s.split("\n");
    let results: Record<"ok"|"interface"|"notsupport"|"override", number[]> = {
        "ok": [], "interface": [], "notsupport": [], "override": []
    }

    let i = 0, triggered = false;
    for (const line of lines) {
        i ++;
        if (! cc0_compile_line_regex.test(line)) continue;
        if (line.includes("-i") || line.includes("--interface")) {
            results.interface.push(i);
            continue;
        }
        
        const files = line.split(" ").filter(f => f.endsWith(".c0") || f.endsWith(".c1") || f.endsWith(".o0") || f.endsWith(".o1"));

        let notSupportFlag = false;
        for (let file of files) notSupportFlag = notSupportFlag || file.endsWith(".o0") || file.endsWith(".o1");

        if (notSupportFlag) {
            results.notsupport.push(i);
            continue;
        }
        if (triggered) {
            results.override.push(i);
            continue;
        }

        triggered = true;
        results.ok.push(i);
        updateCompileLine(files);
        updateCompileFlag("d", line.includes("-d"));
    }
    return results;
}


export default class TextEditor extends React.Component<TextEditorProps>
{
    render() {
        const compilerLine = getCompilerLineNumber(this.props.editorValue, this.props.updateCompileLine, this.props.updateCompilerFlag);
        console.log(compilerLine);

        const notSupportIndicator = compilerLine.notsupport.map(
            (line) => CompileLineHighlighter(line, "notsupport")
        );
        const interfaceIndicator = compilerLine.interface.map(
            (line) => CompileLineHighlighter(line, "interface")
        );
        const overridenIndicator = compilerLine.override.map(
            (line) => CompileLineHighlighter(line, "override")
        );
        const okIndicator = compilerLine.ok.map(
            (line) => CompileLineHighlighter(line, "ok")
        );

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
                        notSupportIndicator,
                        interfaceIndicator,
                        overridenIndicator,
                        okIndicator,
                        LoadDocumentPluginNaive(".txt", this.props.updateName)
                    ]}
                    editable={true}
                />
    }
}
