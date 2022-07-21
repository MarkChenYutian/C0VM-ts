import React from "react";
import { NodeProps, Handle, Position } from "react-flow-renderer";
import { calculate_entry_height } from "../graphical_utility";
import { Type2String } from "../../../vm_core/types/c0type_utility";
import { render_c0_value } from "../debug_utility";
import { loadString } from "../../../vm_core/utility/string_utility";
import { isNullPtr } from "../../../vm_core/utility/pointer_ops";
import { stackSrcHandleID } from "../graph_builder";



export default class C0StackFrameNode extends React.Component<NodeProps<C0StackFrameNodeData>> {
    render(): JSX.Element {
        const data = this.props.data;

        const contents: JSX.Element[] = [];
        const handles: JSX.Element[] = [];

        let valid_cnt = 0;

        contents.push(<p className="dbg-func-name">{data.frame.P.name}</p>)
        
        for (let i = 0; i < data.frame.V.length; i ++) {
            const to_be_rendered = data.frame.V[i];
            if (to_be_rendered !== undefined && data.frame.P.varName[i] !== undefined) {
                contents.push(<p key={"s-val-name-" + i}><code>{Type2String(to_be_rendered.type)} {data.frame.P.varName[i]}</code></p>);
                let render_content = undefined;
                if (to_be_rendered.type.type === "value") {
                    render_content = render_c0_value(to_be_rendered as C0Value<"value">);
                } else if (to_be_rendered.type.type === "string") {
                    render_content = `"${loadString(to_be_rendered as C0Value<"string">, data.mem)}"`;
                } else if (to_be_rendered.type.type === "ptr") {
                    render_content = isNullPtr(to_be_rendered.value) ? "NULL" : "Pointer";
                } else {
                    render_content = "Unknown value";
                }
                contents.push(
                    <div>
                        <p key={"s-val-value-" + i} className="dbg-frame-content">{render_content}</p>
                        {
                            to_be_rendered.type.type === "ptr" && !isNullPtr(to_be_rendered.value)?
                            <Handle type="source" key={"s-val-ptr-" + i} id={stackSrcHandleID(i)} position={Position.Right} style={{ top: calculate_entry_height(valid_cnt, "frame"), right: "1.2rem" }}/>
                            : null
                        }
                    </div>
                )
                valid_cnt ++;
            }
        }

        if (contents.length === 1) {
            contents.push(<p key="s-val-value-0" style={{gridColumnStart: 1, gridColumnEnd: 3}}>No Variable in this function</p>)
        }

        return (
        <>
            <div className="dbg-frame-node">
                {contents}
                {handles}
            </div>
        </>);
    }
}
