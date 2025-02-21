import React from "react";
import { Handle, NodeProps, Position } from "reactflow";
import { heapNodeTargetHandleID } from "./graph_builder";

export default class C0UnknownNode extends React.Component<NodeProps<C0ArrayNodeData>> {
    render(): React.ReactNode {
        return <div className="dbg-struct-node dbg-node-base">
            <Handle position={Position.Left} type="target" id={heapNodeTargetHandleID()} style={{top: "1rem", visibility: "hidden"}} />
            <p className="dbg-error-information dbg-entire-row">Unknown Value</p>
        </div>;
    }
}
