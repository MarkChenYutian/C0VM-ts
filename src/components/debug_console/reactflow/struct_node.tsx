import React from "react";
import { Handle, NodeProps, Position } from "react-flow-renderer";
import { expandStructValue, render_c0_value } from "../../../utility/debug_utility";
import { internal_error } from "../../../utility/errors";
import { calculate_entry_height } from "../../../utility/graphical_utility";
import { isNullPtr } from "../../../vm_core/utility/pointer_ops";
import { loadString } from "../../../vm_core/utility/string_utility";

export default class C0StructNode extends React.Component<NodeProps<C0StructNodeData>> {
    render_content(mem: C0HeapAllocator, type: C0Type<"ptr">, value: C0Pointer, typeRecord: Map<string, Map<number, Struct_Type_Record>>) {
        if (isNullPtr(value)) throw new internal_error("<C0StructNode/> Receives a NULL pointer");

        const fields = expandStructValue(mem, typeRecord, {value: value, type: type});
        
        const struct_type = type.value;
        if (typeof struct_type === "string" || struct_type.type !== "ptr" || struct_type.kind !== "struct") {
            throw new internal_error("<C0StructNode/> Receives a non-struct pointer");
        }

        if (fields.length === 0) {
            return <p className="dbg-error-information dbg-entire-row">No Struct Information</p>;
        }

        const StructFields: JSX.Element[] = [<p className="dbg-entire-row"><code>{struct_type.value}</code></p>];

        for (let i = 0; i < fields.length; i ++) {
            const entry = fields[i];
            StructFields.push(
                <p className="dbg-evaluate-field-name">{entry.name ?? ("Offset @ " + entry.offset)}</p>
            );
            if (entry.value === undefined) {
                StructFields.push(
                    <p className="dbg-error-information">No Type Information</p>
                );
            } else {
                let render_content = null;
                if (entry.value.type.type === "value") {
                    render_content = render_c0_value(entry.value as C0Value<"value">);
                } else if (entry.value.type.type === "string") {
                    render_content = `"${loadString(entry.value as C0Value<"string">, mem)}"`;
                } else if (entry.value.type.type === "ptr") {
                    render_content = isNullPtr(entry.value.value) ? "NULL" : "Pointer";
                }

                StructFields.push(
                    <>
                        <p key={"s-val-value-" + entry.offset} className="dbg-frame-content">{render_content}</p>
                        {
                            entry.value.type.type === "ptr" && !isNullPtr(entry.value.value)?
                            <Handle type="source" key={"s-val-ptr-" + entry.offset} id={"s-val-ptr-" + entry.offset} position={Position.Right} style={{ top: calculate_entry_height(i, "struct"), right: "1.2rem" }}/>
                            : null
                        }
                    </>
                );
            }
        }

        return StructFields;
    }

    render() {
        const data = this.props.data;
        const ValueType = data.ptr.type as C0Type<"ptr">;
        const ValueValue = data.ptr.value;

        return <div className="dbg-frame-node">
            <Handle position={Position.Left} type="target" style={{top: "1rem"}} />
            {this.render_content(data.mem, ValueType, ValueValue, data.typeRecord)}
        </div>;
    }
}
