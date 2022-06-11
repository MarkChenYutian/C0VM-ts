import { keymap } from "@codemirror/view";
import { indentWithTab } from "@codemirror/commands";
import { EditorView, basicSetup } from "codemirror";
import funcHeadGutter from "./extensions/funchead_marker";
import { indentUnit, language } from "@codemirror/language";
import breakpointGutter from "./extensions/breakpoint_marker";
import execLineHighlighter from "./extensions/exec_position";
import { BC0Language } from "./syntax/bc0";

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
            EditorView.updateListener.of((e) => { globalThis.EDITOR_CONTENT = e.state.doc.toString(); }),
            language.of(BC0Language)
        ]
    });
    console.log(`C0 Editor Initialized.`);
}