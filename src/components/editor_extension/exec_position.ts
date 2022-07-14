import { EditorView } from "codemirror";
import { Decoration, ViewPlugin } from "@codemirror/view";

const currExecLineDeco = Decoration.line({ class: "cm-execLine" });
const execLineHighlighter = ViewPlugin.fromClass(class {
    public decorations;

    constructor(view: EditorView) {
        this.decorations = this.getDeco(view)
    }
    update(update: any) {
        this.decorations = this.getDeco(update.view)
        return;
    }
    getDeco(view: EditorView) {
        if (globalThis.EDITOR_HIGHLIGHT_LINENUM <= 0 ||
            view.state.doc.lines < globalThis.EDITOR_HIGHLIGHT_LINENUM) {
            return Decoration.none; // When we are not running, no line to highlight
        }
        const execLineStart = view.state.doc.line(globalThis.EDITOR_HIGHLIGHT_LINENUM).from;
        return Decoration.set([currExecLineDeco.range(execLineStart)]);
    }
}, {
    decorations: v => v.decorations
});

export default execLineHighlighter;
