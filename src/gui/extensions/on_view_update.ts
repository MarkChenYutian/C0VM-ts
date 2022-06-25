import { ViewUpdate } from "@codemirror/view";
import { disable_ctrbtn, enable_ctrbtn } from "../ui_handler";

export default function onViewUpdate(e: ViewUpdate) {
    if (e.docChanged) {
        globalThis.EDITOR_CONTENT = e.state.doc.toString();
        if (globalThis.EDITOR_CONTENT.slice(0, 11).toUpperCase().startsWith("C0 C0 FF EE")){
            enable_ctrbtn("run"); enable_ctrbtn("step"); disable_ctrbtn("compile");
        } else if (globalThis.EDITOR_CONTENT.length !== 0) {
            disable_ctrbtn("run"); disable_ctrbtn("step"); enable_ctrbtn("compile");
        } else {
            disable_ctrbtn("run"); disable_ctrbtn("step"); disable_ctrbtn("compile");
        }
    }
}