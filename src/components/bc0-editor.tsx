import React from "react";
import ReactCodeMirror, { basicSetup } from "@uiw/react-codemirror";

import breakpointGutter from "./editor_extension/breakpoint_marker";
import execLineHighlighter from "./editor_extension/exec_position";
import { BC0Language } from "./editor_extension/syntax/bc0";

import { language } from "@codemirror/language";


export default class BC0Editor extends React.Component<BC0EditorProps>
{
    shouldComponentUpdate(nextProps: Readonly<BC0EditorProps>, nextState: Readonly<{}>, nextContext: any): boolean {
        return false;
    }

    render() {
        const breakpoint_extension = breakpointGutter({
            currBps : Array.from(this.props.breakpointVal),
            setBps  : this.props.updateBrkPts
        });

        return  <ReactCodeMirror
                    theme={globalThis.UI_EDITOR_THEME}
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
                        breakpoint_extension,
                        basicSetup(),
                        language.of(BC0Language),
                        execLineHighlighter(this.props.execLine, globalThis.UI_EDITOR_THEME),
                    ]}
                    editable={true}
                />
    }
}
