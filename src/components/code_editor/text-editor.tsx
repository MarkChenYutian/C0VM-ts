import React from "react";
import ReactCodeMirror, { basicSetup } from "@uiw/react-codemirror";

import BC0LightTheme from "./editor_extension/bc0editor_theme";
import { LoadDocumentPlugin } from "./editor_extension/blank_load";
import CompileLineHighlighter from "./editor_extension/compileline_position";


// const cc0_compile_line_regex = ;


export default class TextEditor extends React.Component<TextEditorProps>
{
    render() {
        return  <ReactCodeMirror
                    theme={BC0LightTheme}
                    basicSetup={false}
                    onUpdate={(v) => 
                        {
                            if (v.docChanged) {
                                this.props.updateContent(v.state.doc.toString());
                                // for (let lineNum = 1; lineNum < v.state.doc.lines; lineNum ++) {
                                //     if (v.state.doc.line(lineNum).text.)
                                // }
                            }
                        }
                    }
                    value = {this.props.editorValue}
                    extensions={[
                        basicSetup(),
                        CompileLineHighlighter(1),
                        LoadDocumentPlugin(".txt", this.props.updateName)
                    ]}
                    editable={true}
                />
    }
}
