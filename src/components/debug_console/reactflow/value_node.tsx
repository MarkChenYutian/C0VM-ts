import React from "react";
import { Handle, NodeProps, Position } from "react-flow-renderer";
import { internal_error } from "../../../utility/errors";
import { loadString } from "../../../utility/string_utility";
import { deref_C0Value, c0_value_cvt2_js_string } from "../../../utility/c0_value_utility";
import { heapNodeTargetHandleID } from "../graph_builder";

export default class C0ValueNode extends React.Component<NodeProps<C0ValueNodeData>> {
    render(): React.ReactNode {
        const data = this.props.data;
        const to_be_rendered = deref_C0Value(data.mem, data.val);
        let content = "";
        switch (to_be_rendered.type.type) {
            case "value":
                content = c0_value_cvt2_js_string(to_be_rendered as C0Value<"value">);
                break;
            case "string":
                content = `"${loadString(to_be_rendered as C0Value<"string">, data.mem)}"`;
                break;
            default:
                throw new internal_error("<C0ValueNode/> Receives unexpected value that is not 'value'|'string' typed.");
        }
        return <div className="dbg-frame-node">
            <Handle position={Position.Left} type="target" id={heapNodeTargetHandleID()} style={{top: "1rem"}} />
            <p className="dbg-entire-row">{content}</p>
        </div>;
    }
}
