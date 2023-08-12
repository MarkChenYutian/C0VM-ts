import { EditorView } from "codemirror";
import { Decoration, DecorationSet, ViewPlugin, ViewUpdate, WidgetType } from "@codemirror/view";

import { asyncLoadExternalFile } from "./external_fs";

function do_support_directory_upload(): boolean {
    const inputElem = document.createElement("input");
    inputElem.type = "file";
    return "webkitdirectory" in inputElem;
}

function loadFileThroughDialog(view: EditorView, accept_format: string, update_title: (s: string) => void) {
    asyncLoadExternalFile(accept_format)
    .then(({title, content}) => {
        update_title(title);
        view.dispatch({changes: {from: 0, insert: content}});
    })
}

// Reference: https://codemirror.net/examples/decoration/
class LoadDocumentWidget extends WidgetType {
    public update_title : (s: string) => void;
    public update_show  : (show: boolean) => void;
    public accept_format: string;

    constructor(
        accept_format: string,
        update_title: (s: string) => void,
        update_show: (show: boolean) => void
    ) {
        super();
        this.update_title = (s) => update_title(s);
        this.accept_format= accept_format;
        this.update_show  = update_show;
    } 

    toDOM(view: EditorView): HTMLElement {
        const load_dom = document.createElement("i");
        load_dom.appendChild(document.createTextNode("Load a file by "));
        let tmp = document.createElement("a");
        tmp.className = "active-href";
        tmp.onclick = () => loadFileThroughDialog(view, this.accept_format, this.update_title);
        tmp.textContent = "Upload File"
        load_dom.appendChild(tmp);

        if (do_support_directory_upload()) {
            load_dom.appendChild(document.createElement("br"));
            load_dom.appendChild(document.createTextNode("Or "))
            let tmp2 = document.createElement("a");
            tmp2.className = "active-href";
            tmp2.textContent = "Import 15-122 Project"
            tmp2.onclick = () => this.update_show(true);
            load_dom.appendChild(tmp2);
        }

        load_dom.appendChild(document.createElement("br"));
        load_dom.appendChild(document.createTextNode("Or type anything in editor to remove this message."))

        load_dom.className = "editor-load-hint";
        return load_dom;
    }

    eq(widget: WidgetType): boolean {
        return true;    // All load document widget should be the same
    }

    ignoreEvent(event: Event): boolean {
        return false;
    }
}

function loadDOMWidgetInterface(
    view: EditorView,
    accept_format: string,
    update_title: (s: string) => void,
    update_show : (show: boolean) => void,
) {
    if (view.state.doc.length !== 0) return Decoration.none;
    
    return Decoration.set([
        Decoration.widget({
            widget: new LoadDocumentWidget(accept_format, update_title, update_show),
            side: 0,
        }).range(0)
    ]);
}

/**
 * Entry point of LoadDocumentPlugin
 * 
 * @param accepted_format File formats supported by this loader, seperated by comma
 * example: ".bc0,.c0" or ".bc0"
 * 
 * @param update_name React call back function to update some internal states in 
 * react component. When the file is loaded, this function will be called with 
 * argument (s: string) where s is the file name of loaded file. [Optional]
 * 
 * @returns ViewPlugin that can be installed on code mirror editor
 */
function LoadDocumentPlugin(
    accepted_format: string,
    update_title : (s: string) => void,
    update_show  : (show: boolean) => void
) {
    return ViewPlugin.fromClass(class {
        public decorations   : DecorationSet;
        public update_title  : (s: string) => void;
        public update_show   : (show: boolean) => void
        public accept_format : string;
    
        constructor (view: EditorView) {
            this.update_title  = (s) => update_title(s);
            this.accept_format = accepted_format;
            this.update_show   = update_show;
            this.decorations   = loadDOMWidgetInterface(view, this.accept_format, this.update_title, this.update_show);
        }

        update(update: ViewUpdate) {
            this.decorations = loadDOMWidgetInterface(update.view, this.accept_format, this.update_title, this.update_show);
            return;
        }
    }, {
        decorations: v => v.decorations
    });
}

export { LoadDocumentPlugin };
