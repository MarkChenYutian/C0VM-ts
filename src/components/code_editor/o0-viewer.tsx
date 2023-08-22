import React from "react";
import ReactCodeMirror, { basicSetup } from "@uiw/react-codemirror";

import { C0 }              from "./editor_extension/syntax/c0";
import C0LightTheme        from "./editor_extension/c0editor_theme";
import retrieve_interface from "../../network/remote_interface";


export default class O0Viewer extends React.Component<O0ViewerProps, O0ViewerState>
{
    constructor(props: O0ViewerProps) {
        super(props);
        this.state = { interface_str: undefined, is_error: false };
        retrieve_interface(props.content)
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
                            ? "Loading object file interface ..."
                            : this.state.interface_str
                        }
                        extensions={[
                            basicSetup(),
                            C0(),
                        ]}
                        editable={false}
                    />
                </div>;
    }
}
