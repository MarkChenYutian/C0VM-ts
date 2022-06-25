import { EditorView, basicSetup } from "codemirror";

import { keymap } from "@codemirror/view";
import { indentWithTab } from "@codemirror/commands";
import { indentUnit, language } from "@codemirror/language";

import { BC0Language } from "./syntax/bc0";

import funcHeadGutter from "./extensions/funchead_marker";
import breakpointGutter from "./extensions/breakpoint_marker";
import execLineHighlighter from "./extensions/exec_position";
import LoadDocumentPlugin from "./extensions/loader_ui";
import { onViewUpdate } from "./extensions/on_view_update";
import { EditorState } from "@codemirror/state";

export function new_editor_state(s: string): EditorState {
    return EditorState.create({
        extensions: [
            breakpointGutter,
            basicSetup,
            funcHeadGutter,
            execLineHighlighter,
            LoadDocumentPlugin,
            basicSetup,
            keymap.of([indentWithTab]),
            indentUnit.of("    "),
            EditorView.updateListener.of((e) => {
                onViewUpdate(e);
            }),
            language.of(BC0Language),
        ],
        doc: s
    });
}

// Auto-detect language
// https://codemirror.net/examples/config/
export function editor_init() {
    globalThis.EDITOR_VIEW = new EditorView({
        parent: document.getElementById(globalThis.UI_INPUT_ID),
        state: new_editor_state("")
    });
    console.log(`[C0VM.ts] C0 Editor Initialized.`);
}

