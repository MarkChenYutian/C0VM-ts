import React from "react";

import * as TypeUtil from "../../../utility/c0_type_utility";

import { NodeProps, Handle, Position } from "react-flow-renderer";
import { calculate_entry_height } from "./graphical_utility";
import { Type2String } from "../../../utility/c0_type_utility";
import { c0_value_cvt2_js_string } from "../../../utility/c0_value_utility";
import { loadString } from "../../../utility/string_utility";
import { isNullPtr } from "../../../utility/pointer_utility";
import { stackSrcHandleID } from "./graph_builder";



export default class C0StackFrameNode extends React.Component<NodeProps<C0StackFrameNodeData>> {
    render(): JSX.Element {
        const data = this.props.data;

        const contents: JSX.Element[] = [];
        const handles: JSX.Element[] = [];

        let valid_cnt = 0;

        contents.push(<p className="dbg-func-name" key="func-name">{data.frame.P.name}</p>)
        
        for (let i = 0; i < data.frame.V.length; i ++) {
            const to_be_rendered = data.frame.V[i];
            if (to_be_rendered !== undefined && data.frame.P.varName[i] !== undefined) {
                contents.push(<p key={"s-val-name-" + i}><code>{Type2String(to_be_rendered.type)} {data.frame.P.varName[i]}</code></p>);
                let render_content = undefined;
                if (TypeUtil.isValueType(to_be_rendered)) {
                    render_content = c0_value_cvt2_js_string(to_be_rendered);
                } else if (TypeUtil.isStringType(to_be_rendered)) {
                    render_content = `"${loadString(to_be_rendered, data.mem)}"`;
                } else if (TypeUtil.isPointerType(to_be_rendered)) {
                    render_content = isNullPtr(to_be_rendered.value) ? "NULL" : " ";
                } else {
                    render_content = "Unknown value";
                }
                contents.push(
                    <div key={"s-val-wrap-" + i}>
                        <p key={"s-val-value-" + i} className="dbg-frame-content">{render_content}</p>
                        {
                            TypeUtil.isPointerType(to_be_rendered) && !isNullPtr(to_be_rendered.value)?
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
            <div className="dbg-node-base dbg-stack-node">
                {contents}
                {handles}
            </div>
        </>);
    }
}
