import { c0_cvt2_js_value } from "../vm_core/utility/c0_value";
import { read_ptr, shift_ptr } from "../vm_core/utility/pointer_ops";
import { internal_error } from "./errors";

/**
 * Expend an array pointer in C0Value into a list of C0Value.
 * 
 * @param mem The heap memory allocator that contains the array
 * @param V The pointer points to the start of array
 * @returns A list of values in the array V points to
 */
export function expandArrayValue(
    mem: C0HeapAllocator,
    V: C0Value<"ptr">
): C0Value<C0TypeClass>[] {
    const [addr, , block_size] = read_ptr(V.value);
    const block = mem.deref(V.value);
    const elem_size = block.getInt32(0);
    const result = [];
    const childType = V.type.value as C0Type<C0TypeClass>
    if (childType.type === "value") {
        for (let offset = 4; offset < block_size; offset += elem_size) {
            switch (childType.value) {
                case "bool":
                case "char":
                    result.push({
                        value: new DataView(
                            new Uint8Array([0, 0, 0, block.getUint8(offset)]).buffer
                        ),
                        type: childType,
                    });
                    break;
                case "int":
                    result.push({
                        value: new DataView(
                            new Uint8Array([
                                block.getUint8(offset), block.getUint8(offset + 1), block.getUint8(offset + 2), block.getUint8(offset + 3)
                            ]).buffer
                        ),
                        type: childType,
                    });
                    break;
            }
        }
    } else {
        for (let offset = 4; offset < block_size; offset += elem_size) {
            result.push({
                value: new DataView(block.buffer.slice(
                    addr + offset,
                    addr + offset + elem_size
                )),
                type: childType,
            });
        }
    }
    return result;
}

/**
 * Dereference a C0Value Pointer and return the C0Value accordingly.
 * @param mem The heap memory allocator
 * @param V The C0Value Pointer you want to dereference
 * @returns The C0Value after dereference
 */
export function derefValue(mem: C0HeapAllocator, V: C0Value<"ptr">): C0Value<C0TypeClass> 
{
    const block = mem.deref(V.value);
    const childType = V.type.value as C0Type<C0TypeClass>;
    if (childType.type === "value") {
        switch (childType.value) {
            case "bool":
            case "char":
                return {
                    type: childType,
                    value: new DataView(
                        new Uint8Array([0, 0, 0, block.getUint8(0)]).buffer
                    ),
                };
            case "int":
                return {
                    type: childType,
                    value: block,
                };
        }
    }
    if (childType.type === "string" || childType.type === "ptr") {
        return {
            type: childType,
            value: new DataView(
                block.buffer.slice(block.byteOffset, block.byteOffset + 8)
            ),
        };
    }
    return {
        type: childType,
        value: new DataView(
            block.buffer.slice(
                block.byteOffset,
                block.byteOffset + block.byteLength
            )
        ),
    };
}

export function expandStructValue(mem: C0HeapAllocator, typeRecord: Map<string, Map<number, Struct_Type_Record>>, v: C0Value<"ptr">): C0StructJSEntry[]{
    const struct_type = v.type.value;
    if (typeof struct_type === "string" || struct_type.type !== "ptr" || struct_type.kind !== "struct") {
        throw new internal_error("Receives a non-struct pointer");
    }

    const StructInformation = typeRecord.get(struct_type.value);
    if (StructInformation === undefined) return [];
    const StructFields: C0StructJSEntry[] = [];
    
    StructInformation.forEach(
        (record, offset) => {
            const record_type = record.type;
            const record_name = record.name;

            if (record_type === undefined) {
                StructFields.push({name: record_name, offset: offset, value: undefined});
                return;
            }

            let ptr_to_field: C0Value<"ptr"> = {
                value: shift_ptr(v.value, offset),
                type: {type: "ptr", kind: "ptr", value: record_type}
            };

            const deref_value = derefValue(mem, ptr_to_field as C0Value<"ptr">);
            StructFields.push({
                name: record_name, offset: offset, value: deref_value
            })
        }
    );
    return StructFields;
}


export function render_c0_value(v: C0Value<"value">): string {
    switch (v.type.value) {
        case "bool":
        case "int":
            return "" + c0_cvt2_js_value(v);
        case "char":
            return "'" + c0_cvt2_js_value(v) + "'";
    }
}

export function is_struct_pointer(ptr: C0Value<"ptr">) {
    const struct_type = ptr.type.value;
    if (typeof struct_type === "string" || struct_type.type !== "ptr" || struct_type.kind !== "struct") {
        return false;
    }
    return true;
}
