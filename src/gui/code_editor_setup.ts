import { EditorState } from "@codemirror/state";
import { EditorView, gutter, lineNumbers, GutterMarker, keymap } from "@codemirror/view";
import { indentWithTab } from "@codemirror/commands";

class emptyMarker extends GutterMarker {
    toDOM() { return document.createTextNode("📦") }
};


export function editor_init() {
    console.log("initializing C0 Editor...");

    const emptyLineGutter = gutter({
        lineMarker(view, line) {
            const s = view.state.doc.toString().slice(line.from, line.to);
            const func_regex = /(int|string|boolean|char|void)(\*|\[\])* [^(=|+|-|*|/)]+\s*\(.*\).*/;
            return func_regex.test(s) ? new emptyMarker : null;
        },
        initialSpacer: () => new emptyMarker()
    });

    const editorState = EditorState.create({
        extensions: [
            emptyLineGutter,
            lineNumbers(),
            keymap.of([indentWithTab]),
            EditorView.updateListener.of((e) => { globalThis.EDITOR_CONTENT = e.state.doc.toString(); })
        ]
    });

    const view = new EditorView({
        parent: document.getElementById(globalThis.UI_INPUT_ID),
        state: editorState
    });
    globalThis.EDITOR_VIEW = view;
}
