import React from "react";
import { Handle, NodeProps, Position } from "react-flow-renderer";
import { isNullPtr } from "../../../vm_core/utility/pointer_ops";
import { derefValue } from "../debug_utility";
import { calculate_entry_height } from "../graphical_utility";
import { heapNodeTargetHandleID, ptrSrcHandleID } from "../graph_builder";

export default class C0PointerNode extends React.Component<NodeProps<C0PointerNodeData>> {
    render(): React.ReactNode {
        const deref_val = derefValue(this.props.data.mem, this.props.data.ptr);
        if (isNullPtr(deref_val.value)) {
            return <div className="dbg-frame-node">
                <Handle position={Position.Left} type="target" id={heapNodeTargetHandleID()} style={{top: "1rem"}} />
                <p>NULL</p>
            </div>;    
        }
        return <div className="dbg-frame-node">
            <Handle position={Position.Left} type="target" id={heapNodeTargetHandleID()} style={{top: "1rem"}} />
            <p>Pointer</p>
            <Handle position={Position.Right} type="source" id={ptrSrcHandleID()} style={{ top: calculate_entry_height(1, "pointer"), right: "1.2rem" }}/>
        </div>;
    }
}
