import React from "react";
import ReactCodeMirror, { basicSetup } from "@uiw/react-codemirror";

import { C0 }              from "./editor_extension/syntax/c0";
import C0LightTheme        from "./editor_extension/c0editor_theme";
import execLineHighlighter from "./editor_extension/exec_position";
import retrieve_interface from "../../network/remote_interface";

const O0ViewerDefaultContent = (content: string) => 
`// ⚠ This editor is read-only, you cannot modify the content of this file 
// or set breakpoint on it. 

/*  This file is an object file for library code.
 * 
 *  You should not rely on the implementation detail inside the library to
 *  write your code.
 */

${content}
`


export default class O0Viewer extends React.Component<O0ViewerProps, O0ViewerState>
{
    constructor(props: O0ViewerProps) {
        super(props);
        this.state = { content: props.content, interface_str: undefined, is_error: false };
    }

    componentDidMount(): void {
        retrieve_interface(this.state.content)
        .then((result) => {
            if (result.error !== "") {
                this.setState({ interface_str: result.error, is_error: true })
            } else {
                this.setState({ interface_str: result.interface, is_error: false })
            }
        })
    }

    render() {
        return <div className="code-editor">
                    <ReactCodeMirror
                        theme={C0LightTheme}
                        basicSetup={false}
                        value = {
                            this.state.interface_str === undefined
                            ? "/* Loading object file interface ... */"
                            : O0ViewerDefaultContent(this.state.interface_str)
                        }
                        extensions={[
                            basicSetup(),
                            execLineHighlighter(1, "dark"),
                            execLineHighlighter(2, "dark"),
                            C0(),
                        ]}
                        editable={false}
                    />
                </div>;
    }
}
