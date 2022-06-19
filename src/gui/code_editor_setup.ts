import { EditorView, basicSetup } from "codemirror";

import { keymap } from "@codemirror/view";
import { indentWithTab } from "@codemirror/commands";
import { indentUnit, language } from "@codemirror/language";
import { Compartment, EditorState } from "@codemirror/state";
import { javascript } from "@codemirror/lang-javascript";

import { BC0, BC0Language } from "./syntax/bc0";

import funcHeadGutter from "./extensions/funchead_marker";
import breakpointGutter from "./extensions/breakpoint_marker";
import execLineHighlighter from "./extensions/exec_position";
import LoadDocumentPlugin from "./extensions/loader_ui";
import { disable_ctrbtn, enable_ctrbtn } from "./ui_handler";


// Auto-detect language
// https://codemirror.net/examples/config/

const languageConf = new Compartment();
const autoLanguage = EditorState.transactionExtender.of(tr => {
    if (!tr.docChanged) return null;
    const is_BC0 = (tr.newDoc.sliceString(0, 11).toUpperCase() === "C0 C0 FF EE");
    const curr_lang_is_BC0 = tr.startState.facet(language) == BC0Language;
    if (is_BC0 === curr_lang_is_BC0) return null;
    return {
        effects: languageConf.reconfigure(
            is_BC0 ? BC0() : javascript()
        )
    };
})


export function editor_init() {
    globalThis.EDITOR_VIEW = new EditorView({
        parent: document.getElementById(globalThis.UI_INPUT_ID),
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
            }),
            // languageConf.of(BC0()),
            language.of(BC0Language),
            // autoLanguage
        ]
    });
    console.log(`C0 Editor Initialized.`);
}

