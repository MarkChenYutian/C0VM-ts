import { read_ptr } from "../vm_core/utility/pointer_ops";

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
