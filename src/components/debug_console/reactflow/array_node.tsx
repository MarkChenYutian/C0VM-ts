import React from "react";
import { Handle, NodeProps, Position } from "react-flow-renderer";
import { isNullPtr } from "../../../vm_core/utility/pointer_ops";
import { loadString } from "../../../vm_core/utility/string_utility";
import { expandArrayValue, render_c0_value } from "../debug_utility";
import { calculate_entry_height } from "../graphical_utility";
import { arrSrcHandleID, heapNodeTargetHandleID } from "../graph_builder";

export default class C0ArrayNode extends React.Component<NodeProps<C0ArrayNodeData>> {
    render_content() {
        const js_array = expandArrayValue(this.props.data.mem, this.props.data.ptr);
        if (js_array.length === 0) {
            return <p>Empty Array</p>
        }

        const data = this.props.data;
        const result = []
        for (let i = 0; i < js_array.length; i ++) {
            result.push(<p key={"idx-" + i} className="dbg-evaluate-field-name">{i}</p>);
            const to_be_rendered = js_array[i];
            switch (to_be_rendered.type.type) {
                case "string":
                    result.push(<p key={"val-" + i}>
                        {'"' + loadString(to_be_rendered as C0Value<"string">, data.mem) + '"'}
                    </p>)
                    break;
                case "value":
                    result.push(<p key={"val-" + i}>
                        {render_c0_value(to_be_rendered as C0Value<"value">)}
                    </p>);
                    break;
                case "<unknown>":
                    result.push(<p key={"val-" + i} className="dbg-error-information">Unknown Value</p>);
                    break;
                case "ptr":
                    if (isNullPtr(to_be_rendered.value)) {
                        result.push(
                            <p key={"val-" + i}>NULL</p>
                        );
                    } else {
                        result.push(
                            <p key={"val-" + i}>Pointer</p>
                        );
                        result.push(
                            <Handle key={arrSrcHandleID(i)} id={arrSrcHandleID(i)} position={Position.Right} type="source" style={{ top: calculate_entry_height(i, "array"), right: "1.2rem" }}/>
                        );
                    }
                    break;
            }
        }
        return result;
    }

    render(): React.ReactNode {
        return <div className="dbg-frame-node">
            <Handle position={Position.Left} type="target" id={heapNodeTargetHandleID()} style={{top: "1rem"}} />
            <>{this.render_content()}</>
        </div>;
    }
}
