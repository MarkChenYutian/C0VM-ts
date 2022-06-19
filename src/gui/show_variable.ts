import { Type2String } from "../types/c0type_utility";
import { c0_cvt2_js_value } from "../utility/c0_value";
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
        nameElem.innerHTML = `<code>${globalThis.C0_RUNTIME.state.CurrFrame.P.varName[i]}</code>`;
        const typeElem = document.createElement("p");
        typeElem.innerHTML = `<code>${Type2String(globalThis.C0_RUNTIME.state.CurrFrame.V[i].type)}</code>`;
        const valElem = document.createElement("p");
        if (globalThis.C0_RUNTIME.state.CurrFrame.V[i].type.type === C0TypeClass.value) {
            valElem.innerText = "" + c0_cvt2_js_value((globalThis.C0_RUNTIME.state.CurrFrame.V[i] as C0Value<C0TypeClass.value>));
        } else if (globalThis.C0_RUNTIME.state.CurrFrame.V[i].type.type === C0TypeClass.string){
            valElem.innerText = "\"" + loadString(
                    (globalThis.C0_RUNTIME.state.CurrFrame.V[i] as C0Value<C0TypeClass.string>)
                    , globalThis.C0_RUNTIME.allocator) + "\"";
        }
        
        outputArea.appendChild(nameElem);
        outputArea.appendChild(typeElem);
        outputArea.appendChild(valElem);
    }
}
