import { EditorView } from "codemirror";
import { Decoration, ViewPlugin } from "@codemirror/view";



function CompileLineHighlighter(lineNum: number, type: "ok" | "notsupport" | "interface" | "override") {
    const currExecLineDeco = Decoration.line({ class: "cm-compileLine-" + type });
    return ViewPlugin.fromClass(class {
        public decorations;

        constructor(view: EditorView) {
            this.decorations = this.getDeco(view)
        }
        update(update: any) {
            this.decorations = this.getDeco(update.view)
            return;
        }
        getDeco(view: EditorView) {
            if (lineNum <= 0 ||
                view.state.doc.lines < lineNum) {
                return Decoration.none; // When we are not running, no line to highlight
            }
            const execLineStart = view.state.doc.line(lineNum).from;
            return Decoration.set([currExecLineDeco.range(execLineStart)]);
        }
        }, {
            decorations: v => v.decorations
        }
    );
}

export default CompileLineHighlighter;
