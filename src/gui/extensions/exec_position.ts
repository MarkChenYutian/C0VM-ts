import { EditorView } from "codemirror";
import { Decoration, ViewPlugin } from "@codemirror/view";

const currExecLineDeco = Decoration.line({ class: "cm-execLine" });
const execLineHighlighter = ViewPlugin.fromClass(class {
    public decorations;

    constructor(view) {
        this.decorations = this.getDeco(view)
    }
    update(update) {
        this.decorations = this.getDeco(update.view)
        return;
    }
    getDeco(view: EditorView) {
        if (globalThis.C0_RUNTIME === undefined || 
            globalThis.EDITOR_VIEW.state.doc.lines < globalThis.C0_RUNTIME.state.CurrLineNumber) {
            return Decoration.none; // When we are not running, no line to highlight
        }
        const execLineStart = view.state.doc.line(globalThis.C0_RUNTIME.state.CurrLineNumber).from;
        return Decoration.set([currExecLineDeco.range(execLineStart)]);
    }
}, {
    decorations: v => v.decorations
});

export default execLineHighlighter;
