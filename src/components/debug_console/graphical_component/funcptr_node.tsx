import React from "react";
import { Handle, NodeProps, Position } from "reactflow";
import { deref_C0Value } from "../../../utility/c0_value_utility";
import { read_funcPtr } from "../../../utility/func_ptr_utility";
import { isNullPtr } from "../../../utility/pointer_utility";
import { heapNodeTargetHandleID } from "./graph_builder";

export default class C0FuncPtrNode extends React.Component<NodeProps<C0FuncPtrNodeData>> {
    render(): React.ReactNode {
        const fp = deref_C0Value(this.props.data.mem, this.props.data.ptr) as C0Value<"funcptr">;

        if (isNullPtr(fp.value)) {
            return  <div className="dbg-struct-node dbg-node-base">
                        <Handle
                            position={Position.Left}
                            type="target"
                            id={heapNodeTargetHandleID()}
                            style={{top: "1rem", visibility: "hidden"}}
                        />
                        NULL
                    </div>
        } else {
            const [idx, native] = read_funcPtr(fp);
            const nativeDisplay = native ? "native" : "static";
            const functionName  = native ? this.props.data.state.P.nativePool[idx].functionType
                                            : this.props.data.state.P.functionPool[idx].name;
    
            return  <div className="dbg-struct-node dbg-node-base">
                        <Handle position={Position.Left} type="target" id={heapNodeTargetHandleID()} style={{top: "1rem", visibility: "hidden"}} />
                        <p className="dbg-entire-row"><code>&{functionName}</code>, {nativeDisplay}</p>
                    </div>;
        }
    }
}
