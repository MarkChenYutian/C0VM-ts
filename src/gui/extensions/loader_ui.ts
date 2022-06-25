import { EditorView } from "codemirror";
import { Decoration, DecorationSet, ViewPlugin, ViewUpdate, WidgetType } from "@codemirror/view";

function loadFileThroughDialog(e: Event) {
    const F = (e.target as HTMLInputElement).files[0];
    const reader = new FileReader();
    reader.onloadend = (e) => {
        if (reader.result === null) {
            globalThis.MSG_EMITTER.err("Unable to read the selected file.");
        }
        const res = reader.result.toString();
        globalThis.EDITOR_VIEW.dispatch({
            changes: {
                from: 0, insert: res
            }
        });
    };
    reader.readAsText(F, "utf-8");
}

function onLoadFile() {
    const inputElem = document.createElement("input");
    inputElem.type = "file";
    inputElem.accept = ".c0,.bc0";
    inputElem.onchange = loadFileThroughDialog;
    inputElem.click();
}

// Initialize a dom object
const load_dom = document.createElement("i");
load_dom.appendChild(document.createTextNode("Load a file by "));
let tmp = document.createElement("b");
tmp.textContent = "Drag & Drop"
load_dom.appendChild(tmp);
load_dom.appendChild(document.createTextNode(" or "));
tmp = document.createElement("a");
tmp.className = "active-href";
tmp.onclick = onLoadFile;
tmp.textContent = "Load Manually"
load_dom.appendChild(tmp);
load_dom.appendChild(document.createElement("br"));
load_dom.appendChild(document.createTextNode("Or type anything in editor to remove this message."))
load_dom.className = "editor-load-hint";

// Reference: https://codemirror.net/examples/decoration/

class LoadDocumentWidget extends WidgetType {
    toDOM(view: EditorView): HTMLElement {
        return load_dom;
    }

    eq(widget: WidgetType): boolean {
        return true;    // All load document widget should be the same
    }

    ignoreEvent(event: Event): boolean {
        return false;
    }
}

function loadDOMWidgetInterface(view: EditorView) {
    if (view.state.doc.length !== 0) return Decoration.none;
    return Decoration.set([
        Decoration.widget({
            widget: new LoadDocumentWidget(),
            side: 0,
        }).range(0)
    ]);
}

const LoadDocumentPlugin = ViewPlugin.fromClass(class {
    public decorations: DecorationSet;

    constructor (view: EditorView) {
        this.decorations = loadDOMWidgetInterface(view);
    }
    update(update: ViewUpdate) {
        this.decorations = loadDOMWidgetInterface(update.view);
        return;
    }
}, {
    decorations: v => v.decorations
});

export default LoadDocumentPlugin;
