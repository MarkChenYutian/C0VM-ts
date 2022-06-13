import { EditorView } from "codemirror";
import { Decoration, ViewPlugin, ViewUpdate, WidgetType } from "@codemirror/view";

function onLoadFile() {
    globalThis.MSG_EMITTER.err("Not Implemented Yet!");
}

// Initialize a dom object
const load_dom = document.createElement("i");
load_dom.appendChild(document.createTextNode("Load a file by "));
let tmp = document.createElement("b");
tmp.textContent = "Drag & Drop"
load_dom.appendChild(tmp);
load_dom.appendChild(document.createTextNode(" or "));
// tmp = document.createElement("input");
// tmp.setAttribute("type", "file");
// tmp.style.display = "none";
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
    public decorations;

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
