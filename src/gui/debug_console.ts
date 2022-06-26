import { Type2String } from "../types/c0type_utility";
import { c0_cvt2_js_value } from "../utility/c0_value";
import { internal_error } from "../utility/errors";
import { isNullPtr, read_ptr } from "../utility/pointer_ops";
import { loadString } from "../utility/string_utility";

export function updateDebugConsole(): void {
    const outputArea = document.getElementById(globalThis.UI_DEBUG_OUTPUT_ID);
    // Clear output area
    while (outputArea.lastElementChild) {
        outputArea.removeChild(outputArea.lastElementChild);
    }

    if (globalThis.C0_RUNTIME === undefined) {
        // outputArea.innerHTML = `<i class="fa-solid fa-triangle-exclamation"></i> There is no running C0 Program on C0VM!`
        return;
    }

    for (let i = 0; i < globalThis.C0_RUNTIME.state.CallStack.length; i++) {
        drawStackFrame(
            globalThis.C0_RUNTIME.allocator,
            globalThis.C0_RUNTIME.state.CallStack[i],
            outputArea
        );
    }

    drawStackFrame(
        globalThis.C0_RUNTIME.allocator,
        globalThis.C0_RUNTIME.state.CurrFrame,
        outputArea
    );
}

function drawStackFrame(
    mem: C0HeapAllocator,
    frame: VM_StackFrame,
    outputArea: HTMLElement
): void {
    const funcNameElem = document.createElement("p");
    funcNameElem.className = "dbg-func-name";
    funcNameElem.innerHTML = `<i>f</i>: ${frame.P.name}`;
    const funcNamePlaceholderElem = document.createElement("div");
    outputArea.appendChild(funcNameElem);
    outputArea.appendChild(funcNamePlaceholderElem);

    for (let i = 0; i < frame.P.numVars; i++) {
        if (frame.V[i] === undefined) continue;
        const nameElem = document.createElement("p");
        nameElem.innerHTML = `<code>${Type2String(frame.V[i].type)} ${
            frame.P.varName[i]
        }</code>`;
        const valElem = document.createElement("p");
        valElem.innerHTML = format_print_c0value(mem, frame.V[i]);
        outputArea.appendChild(nameElem);
        outputArea.appendChild(valElem);
    }
}

function format_print_c0value(
    mem: C0HeapAllocator,
    V: C0Value<C0TypeClass>
): string {
    switch (V.type.type) {
        case C0TypeClass.value:
            if (V.type.value === "char") {
                return `'${c0_cvt2_js_value(V as C0Value<C0TypeClass.value>)}'`;
            } else {
                return `${c0_cvt2_js_value(V as C0Value<C0TypeClass.value>)}`;
            }
        case C0TypeClass.string:
            return `"${loadString(V as C0Value<C0TypeClass.string>, mem)}"`;
        case C0TypeClass.ptr:
            if (isNullPtr(V.value)) return "NULL";
            const [addr, offset, block_size] = read_ptr(V.value);
            if (V.type.kind === "arr") {
                // Flatten the value into array and print them recursively
                let result = "[";
                const flattened_arr = expandArrayValue(
                    mem, V as C0Value<C0TypeClass.ptr>
                );
                for (let i = 0; i < flattened_arr.length; i++) {
                    result += format_print_c0value(mem, flattened_arr[i]) + ((i === flattened_arr.length - 1) ? "" : ", ");
                }
                return result + "]";
            } else if (V.type.kind === "ptr") {
                // Dereference the pointer and print them recursively
                return `&${format_print_c0value(
                    mem,
                    derefValue(mem, V as C0Value<C0TypeClass.ptr>)
                )}`;
            } else {
                return `<code>0x${(addr + offset)
                    .toString(16)
                    .padStart(8, "0")}</code> with size of ${block_size} bytes`;
            }
        default:
            return `Can't evaluate unknown type`;
    }
}
// The V here **must be** a pointer
function derefValue(
    mem: C0HeapAllocator,
    V: C0Value<C0TypeClass.ptr>
): C0Value<C0TypeClass> {
    if (V.type.kind !== "ptr")
        throw new internal_error("derefValue receives a non-pointer value");
    const block = mem.deref(V.value);
    if (V.type.value.type === C0TypeClass.value) {
        switch (V.type.value.value) {
            case "bool":
            case "char":
                return {
                    type: V.type.value,
                    value: new DataView(
                        new Uint8Array([0, 0, 0, block.getUint8(0)]).buffer
                    ),
                };
            case "int":
                return {
                    type: V.type.value,
                    value: block,
                };
        }
    }
    if (
        V.type.value.type === C0TypeClass.string ||
        V.type.value.type === C0TypeClass.ptr
    ) {
        return {
            type: V.type.value,
            value: new DataView(
                block.buffer.slice(block.byteOffset, block.byteOffset + 8)
            ),
        };
    }
    if (V.type.value.type === C0TypeClass.unknown) {
        return {
            type: V.type.value,
            value: new DataView(
                block.buffer.slice(
                    block.byteOffset,
                    block.byteOffset + block.byteLength
                )
            ),
        };
    }
}

function expandArrayValue(
    mem: C0HeapAllocator,
    V: C0Value<C0TypeClass.ptr>
): C0Value<C0TypeClass>[] {
    if (V.type.kind !== "arr")
        throw new internal_error(
            "expandArrayValue receives a non-array pointer"
        );
    const [addr, offset, block_size] = read_ptr(V.value);
    const block = mem.deref(V.value);
    const elem_size = block.getInt32(0);
    const result = [];
    if (V.type.value.type === C0TypeClass.value) {
        for (let offset = 4; offset < block_size; offset += elem_size) {
            switch (V.type.value.value) {
                case "bool":
                case "char":
                    result.push({
                        value: new DataView(
                            new Uint8Array([0, 0, 0, block.getUint8(offset)]).buffer
                        ),
                        type: V.type.value,
                    });
                    break;
                case "int":
                    result.push({
                        value: new DataView(
                            new Uint8Array([
                                block.getUint8(offset), block.getUint8(offset + 1), block.getUint8(offset + 2), block.getUint8(offset + 3)
                            ]).buffer
                        ),
                        type: V.type.value,
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
                type: V.type.value,
            });
        }
    }
    return result;
}
