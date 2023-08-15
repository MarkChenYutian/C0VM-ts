import React from "react";

import * as TypeUtil from "../../../utility/c0_type_utility";

import { Handle, NodeProps, Position } from "reactflow";
import { expand_C0Struct, c0_value_cvt2_js_string } from "../../../utility/c0_value_utility";
import { internal_error } from "../../../utility/errors";
import { calculate_entry_height } from "./graphical_utility";
import { isNullPtr } from "../../../utility/pointer_utility";
import { loadString } from "../../../utility/string_utility";
import { heapNodeTargetHandleID, structSrcHandleID } from "./graph_builder";
import { read_funcPtr } from "../../../utility/func_ptr_utility";

export default class C0StructNode extends React.Component<NodeProps<C0StructNodeData>> {
    render_content(mem: C0HeapAllocator, type: C0Type<"ptr">, value: C0Pointer, typedef: Map<SourceType, AliasType>, typeRecord: Map<string, Map<number, Struct_Type_Record>>) {
        if (isNullPtr(value)) throw new internal_error("<C0StructNode/> Receives a NULL pointer");

        const c0_val = {value: value, type: type};
        const fields = expand_C0Struct(mem, typeRecord, c0_val);
        if (!TypeUtil.is_struct_pointer(c0_val)) {
            throw new internal_error("<C0StructNode/> Receives a non-struct pointer");
        }

        const struct_type = c0_val.type.value;
        if (fields.length === 0) {
            return <p className="dbg-error-information dbg-entire-row">No Struct Information</p>;
        }

        const StructFields: JSX.Element[] = [
                <p className="dbg-entire-row" key="struct-name"><code>{TypeUtil.Type2String(struct_type, typedef)}</code></p>
            ];
        for (let i = 0; i < fields.length; i ++) {
            const entry = fields[i];
            const to_be_rendered = entry.value;
            StructFields.push(
                <p className="dbg-evaluate-field-name right-aligned" key={"s-val-name-" + entry.offset}>
                    {entry.name ?? ("Offset @ " + entry.offset)}
                </p>
            );
            
            if (to_be_rendered === undefined) {
                StructFields.push(
                    <p className="dbg-error-information" key={"s-val-value-" + entry.offset}>No Type Info</p>
                );
            } else {
                let render_content = null;
                if (TypeUtil.isValueType(to_be_rendered)) {
                    render_content = c0_value_cvt2_js_string(to_be_rendered);
                } else if (TypeUtil.isStringType(to_be_rendered)) {
                    render_content = `"${loadString(to_be_rendered, mem)}"`;
                } else if (TypeUtil.isPointerType(to_be_rendered)) {
                    render_content = isNullPtr(to_be_rendered.value) ? "NULL" : " ";
                } else if (TypeUtil.isTagPointerType(to_be_rendered)) {
                    render_content = isNullPtr(to_be_rendered.value) ? "NULL" : " ";
                } else if (TypeUtil.isFuncPointerType(to_be_rendered)) {
                    const [idx, native] = read_funcPtr(to_be_rendered);
                    const nativeDisplay = native ? "native" : "static";
                    const functionName  = native ? this.props.data.state.P.nativePool[idx].functionType
                                                    : this.props.data.state.P.functionPool[idx].name;
                    render_content = isNullPtr(to_be_rendered.value) ? "NULL" : `&${functionName}, ${nativeDisplay}`;
                }

                StructFields.push(<p key={"s-val-value-" + entry.offset} className="dbg-frame-content">{render_content}</p>);

                if ((
                    TypeUtil.isPointerType(to_be_rendered) || 
                    TypeUtil.isTagPointerType(to_be_rendered)
                ) && !isNullPtr(to_be_rendered.value)) {
                    StructFields.push(
                        <Handle type="source"
                            key={"key-" + structSrcHandleID(entry.offset)}
                            id={structSrcHandleID(entry.offset)}
                            position={Position.Right}
                            style={{ top: calculate_entry_height(i, "struct"), right: "2rem" }}
                        />
                    );
                }
            }
        }

        return StructFields;
    }

    render() {
        const data = this.props.data;
        const ValueType = data.ptr.type as C0Type<"ptr">;
        const ValueValue = data.ptr.value;

        return  <div className="dbg-struct-node dbg-node-base">
                    <Handle position={Position.Left} type="target" id={heapNodeTargetHandleID()} style={{top: "1rem", visibility: "hidden"}} />
                    {this.render_content(data.mem, ValueType, ValueValue, data.typedef, data.state.TypeRecord)}
                </div>;
    }
}
