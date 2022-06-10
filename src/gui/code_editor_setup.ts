import { keymap } from "@codemirror/view";
import { indentWithTab } from "@codemirror/commands";
import { EditorView, basicSetup } from "codemirror";
import funcHeadGutter from "./extensions/funchead_marker";
import { indentUnit } from "@codemirror/language";
import breakpointGutter from "./extensions/breakpoint_marker";
import execLineHighlighter from "./extensions/exec_position";

export function editor_init() {
    globalThis.EDITOR_VIEW = new EditorView({
        parent: document.getElementById(globalThis.UI_INPUT_ID),
        extensions: [
            breakpointGutter,
            basicSetup,
            funcHeadGutter,
            execLineHighlighter,
            keymap.of([indentWithTab]),
            indentUnit.of("    "),
            EditorView.updateListener.of((e) => { globalThis.EDITOR_CONTENT = e.state.doc.toString(); })
        ]
    });
    console.log(`C0 Editor Initialized.`);
}
