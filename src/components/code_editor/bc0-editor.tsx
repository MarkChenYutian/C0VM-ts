import React from "react";
import ReactCodeMirror, { basicSetup } from "@uiw/react-codemirror";
import { language } from "@codemirror/language";

import breakpointGutter    from "./editor_extension/breakpoint_marker";
import execLineHighlighter from "./editor_extension/exec_position";
import { BC0Language }     from "./editor_extension/syntax/bc0";
import BC0LightTheme       from "./editor_extension/bc0editor_theme";


export default class BC0Editor extends React.Component<BC0EditorProps>
{
    shouldComponentUpdate(nextProps: Readonly<BC0EditorProps>, nextState: Readonly<{}>, nextContext: any): boolean {
        const execLineChanged = this.props.execLine !== nextProps.execLine;
        const valueChanged = this.props.editorValue !== nextProps.editorValue;
        return execLineChanged || valueChanged;
    }

    render() {
        const breakpoint_extension = breakpointGutter({
            currBps : Array.from(this.props.breakpointVal),
            setBps  : this.props.updateBrkPts
        });

        return  <ReactCodeMirror
                    theme={BC0LightTheme}
                    basicSetup={false}
                    value = {this.props.editorValue}
                    extensions={[
                        breakpoint_extension,
                        basicSetup(),
                        language.of(BC0Language),
                        execLineHighlighter(this.props.execLine, "light"),
                    ]}
                    editable={false}
                />
    }
}
