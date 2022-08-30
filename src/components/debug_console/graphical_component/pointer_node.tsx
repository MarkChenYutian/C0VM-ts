import React from "react";
import { Handle, NodeProps, Position } from "react-flow-renderer";
import { isNullPtr } from "../../../utility/pointer_utility";
import { deref_C0Value } from "../../../utility/c0_value_utility";
import { calculate_entry_height } from "./graphical_utility";
import { heapNodeTargetHandleID, ptrSrcHandleID } from "./graph_builder";

export default class C0PointerNode extends React.Component<NodeProps<C0PointerNodeData>> {
    render(): React.ReactNode {
        const deref_val = deref_C0Value(this.props.data.mem, this.props.data.ptr);
        if (isNullPtr(deref_val.value)) {
            return <div className="dbg-pointer-node dbg-node-base">
                <Handle
                    position={Position.Left}
                    type="target"
                    id={heapNodeTargetHandleID()}
                    style={{top: "1rem", visibility: "hidden"}}
                />
                <p>NULL</p>
            </div>;    
        }
        return (
        <div className="dbg-pointer-node dbg-node-base">
            <Handle
                position={Position.Left}
                type="target"
                id={heapNodeTargetHandleID()}
                style={{top: "1rem", visibility: "hidden"}}
            />
            <p>&nbsp;</p>
            <Handle
                position={Position.Right}
                type="source"
                id={ptrSrcHandleID()}
                style={{ top: calculate_entry_height(1, "pointer"), right: "1.8rem" }}
            />
        </div>);
    }
}
