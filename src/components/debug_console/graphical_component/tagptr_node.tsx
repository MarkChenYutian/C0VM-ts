import React from "react";
import { Handle, NodeProps, Position } from "react-flow-renderer";
import { Type2String } from "../../../utility/c0_type_utility";
import { deref_C0Value } from "../../../utility/c0_value_utility";
import { isNullPtr } from "../../../utility/pointer_utility";
import { remove_tag } from "../../../utility/tag_ptr_utility";
import { calculate_entry_height } from "./graphical_utility";
import { heapNodeTargetHandleID, ptrSrcHandleID } from "./graph_builder";

export default class C0TagPtrNode extends React.Component<NodeProps<C0TagPointerData>> {
    render(): React.ReactNode {
        const tagged_ptr = deref_C0Value(this.props.data.mem, this.props.data.tagptr) as C0Value<"tagptr">;

        if (isNullPtr(tagged_ptr.value)) {
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

        const real_ptr = remove_tag(tagged_ptr, this.props.data.mem, this.props.data.tagRecord);

        return  <div className="dbg-struct-node dbg-node-base">
                    <Handle position={Position.Left} type="target" id={heapNodeTargetHandleID()} style={{top: "1rem", visibility: "hidden"}} />
                    <p>Tag: <code>{Type2String(real_ptr.type, this.props.data.typedef)}</code></p>
                    <Handle
                        position={Position.Right}
                        type="source"
                        id={ptrSrcHandleID()}
                        style={{ top: calculate_entry_height(1, "pointer"), right: "1.8rem" }}
                    />
                </div>;
    }
}
