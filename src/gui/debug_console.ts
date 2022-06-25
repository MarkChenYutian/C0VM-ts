import { Type2String } from "../types/c0type_utility";
import { c0_cvt2_js_value } from "../utility/c0_value";
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

    // Draw output area
    for (let i = 0; i < globalThis.C0_RUNTIME.state.CurrFrame.P.numVars; i ++) {
        if (globalThis.C0_RUNTIME.state.CurrFrame.V[i] === undefined) continue;
        const nameElem = document.createElement("p");
        nameElem.innerHTML = `<code>${Type2String(globalThis.C0_RUNTIME.state.CurrFrame.V[i].type)} ${globalThis.C0_RUNTIME.state.CurrFrame.P.varName[i]}</code>`;
        const valElem = document.createElement("p");
        valElem.innerText = format_print_c0value(
            globalThis.C0_RUNTIME.allocator,
            globalThis.C0_RUNTIME.state.CurrFrame.V[i]
        );
        outputArea.appendChild(nameElem);
        outputArea.appendChild(valElem);
    }
}


function format_print_c0value(mem: C0HeapAllocator, V: C0Value<C0TypeClass>): string {
    switch (V.type.type) {
        case C0TypeClass.value:
            return "" + c0_cvt2_js_value(V as C0Value<C0TypeClass.value>)
        case C0TypeClass.string:
            return `"${loadString(V as C0Value<C0TypeClass.string>, mem)}"`;
        case C0TypeClass.ptr:
            if (isNullPtr(V.value)) return "NULL";
            const [addr, offset, block_size] = read_ptr(V.value);
            if (V.type.kind === "arr") {
                return `0x${(addr + offset).toString(16).padStart(8, "0")} with length ${(block_size - 4) / mem.deref(V.value).getInt32(0)}`
            } else {
                return `0x${(addr + offset).toString(16).padStart(8, "0")} with size of ${block_size} bytes`;
            }
        default:
            return `Can't evaluate unknown type`
    }
}