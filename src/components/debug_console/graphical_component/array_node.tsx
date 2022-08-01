import React from "react";

import * as TypeUtil from "../../../utility/c0_type_utility";

import { Handle, NodeProps, Position } from "react-flow-renderer";
import { isNullPtr } from "../../../utility/pointer_utility";
import { loadString } from "../../../utility/string_utility";
import { expand_C0Array, c0_value_cvt2_js_string } from "../../../utility/c0_value_utility";
import { calculate_entry_height } from "./graphical_utility";
import { arrSrcHandleID, heapNodeTargetHandleID } from "./graph_builder";

export default class C0ArrayNode extends React.Component<NodeProps<C0ArrayNodeData>> {
    render_content() {
        const js_array = expand_C0Array(this.props.data.mem, this.props.data.ptr);
        if (js_array.length === 0) {
            return <p>Empty Array</p>
        }

        const data = this.props.data;
        const result = []
        for (let i = 0; i < js_array.length; i ++) {
            const to_be_rendered = js_array[i];
            if (TypeUtil.isStringType(to_be_rendered)) {
                result.push(
                    <div className="dbg-elem-box">
                        <p key={"idx-" + i} className="dbg-evaluate-arr-idx">{i}</p>
                        <p key={"val-" + i}>"{loadString(to_be_rendered, data.mem)}"</p>
                    </div>
                );
            }
            else if (TypeUtil.isValueType(to_be_rendered)) {
                result.push(
                    <div className="dbg-elem-box">
                        <p key={"idx-" + i} className="dbg-evaluate-arr-idx">{i}</p>
                        <p key={"val-" + i} className="dbg-evaluate-arr-val">{c0_value_cvt2_js_string(to_be_rendered)}</p>
                    </div>);
            }
            else if (TypeUtil.isUnknownType(to_be_rendered)) {
                result.push(
                    <div className="dbg-elem-box">
                        <p key={"idx-" + i} className="dbg-evaluate-arr-idx">{i}</p>
                        <p key={"val-" + i} className="dbg-error-information dbg-evaluate-arr-val">Unknown Value</p>
                    </div>
                );
            }
            else if (TypeUtil.isPointerType(to_be_rendered)) {
                if (isNullPtr(to_be_rendered.value)) {
                    result.push(
                        <div className="dbg-elem-box">
                            <p key={"idx-" + i} className="dbg-evaluate-arr-idx">{i}</p>
                            <p key={"val-" + i} className="dbg-evaluate-arr-val">NULL</p>
                        </div>
                    );
                } else {
                    result.push(
                        <div className="dbg-elem-box">
                            <p key={"idx-" + i} className="dbg-evaluate-arr-idx">{i}</p>
                            <p key={"val-" + i} className="dbg-evaluate-arr-val">&nbsp;</p>
                        </div>
                    );
                    result.push(<Handle
                        key={arrSrcHandleID(i)}
                        id={arrSrcHandleID(i)}
                        position={Position.Bottom}
                        type="source"
                        style={{ left: calculate_entry_height(i, "array"), top: "2.5rem" }}
                    />);
                }
            }
        }
        return result;
    }

    render(): React.ReactNode {
        return <div className="dbg-array-node dbg-node-base">
            <Handle position={Position.Left} type="target" id={heapNodeTargetHandleID()} style={{top: "2rem", visibility: "hidden"}} />
            <>{this.render_content()}</>
        </div>;
    }
}
