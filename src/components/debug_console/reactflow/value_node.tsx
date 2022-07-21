import React from "react";
import { Handle, NodeProps, Position } from "react-flow-renderer";
import { internal_error } from "../../../utility/errors";
import { loadString } from "../../../vm_core/utility/string_utility";
import { derefValue, render_c0_value } from "../debug_utility";
import { heapNodeTargetHandleID } from "../graph_builder";

export default class C0ValueNode extends React.Component<NodeProps<C0ValueNodeData>> {
    render(): React.ReactNode {
        const data = this.props.data;
        const to_be_rendered = derefValue(data.mem, data.val);
        let content = "";
        switch (to_be_rendered.type.type) {
            case "value":
                content = render_c0_value(to_be_rendered as C0Value<"value">);
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
