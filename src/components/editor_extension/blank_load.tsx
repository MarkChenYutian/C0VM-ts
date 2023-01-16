import React, { useEffect, useRef } from "react";
import ReactDOM from "react-dom/client";

import { Upload, Button } from 'antd';
import { EditorView } from "codemirror";
import type { RcFile } from 'antd/lib/upload';

import { Decoration, DecorationSet, ViewPlugin, ViewUpdate, WidgetType } from "@codemirror/view";
import { internal_error } from "../../utility/errors";

function loadFileThroughDialog(e: Event, v: EditorView, update_title?: (s: string) => void) {
    if (e.target === null) throw new internal_error("Failed to read input file");
    const fileList = (e.target as HTMLInputElement).files;
    if (fileList === null) throw new internal_error("Failed to read input file");

    const F = fileList[0];
    if (update_title !== undefined) {
        update_title(F.name);
    }
    const reader = new FileReader();

    reader.onloadend = (e) => {
        if (reader.result === null) { throw new internal_error("Failed to read input file")}
        const res = reader.result.toString();
        v.dispatch({
            changes: {
                from: 0, insert: res
            }
        });
    };
    reader.readAsText(F, "utf-8");
}

function onLoadFile(view: EditorView, accept_format: string, update_title?: (s: string) => void) {
    const inputElem = document.createElement("input");
    inputElem.type = "file";
    inputElem.accept = accept_format;
    inputElem.onchange = (e) => loadFileThroughDialog(e, view, update_title);
    inputElem.click();
}

// Fake button used to trigger the Ant Design Upload Component...
function GhostImportFolderButton() {
    const buttonRef = useRef() as React.MutableRefObject<HTMLInputElement>;

    useEffect(() => {
        buttonRef.current.click();
    }, [buttonRef]);

    return (
        <Button ref={buttonRef} id="GhostImportFolderButton">
            Import Folder
        </Button>
    );
}

function onLoadFolder(
    handle_import_folder?: (F: RcFile, FList: RcFile[]) => void
) {
    let tmp_dom = document.createElement("div");
    const root = ReactDOM.createRoot(tmp_dom as HTMLElement);

    root.render(
        <Upload
            name="code-import-folder"
            directory
            beforeUpload={handle_import_folder}
            showUploadList={false}
        >
            {<GhostImportFolderButton />}
        </Upload>
    );
}


// Reference: https://codemirror.net/examples/decoration/
class LoadDocumentWidget extends WidgetType {
    public update_title ?: (s: string) => void;
    public handle_import_folder ?: (F: RcFile, FList: RcFile[]) => void
    public accept_format : string;

    constructor(accept_format: string, update_title?: (s: string) => void, handle_import_folder ?: (F: RcFile, FList: RcFile[]) => void) {
        super();
        this.update_title = update_title;
        this.handle_import_folder = handle_import_folder;
        this.accept_format = accept_format;
    } 

    toDOM(view: EditorView): HTMLElement {
        const load_dom = document.createElement("i");
        load_dom.appendChild(document.createTextNode("Load a file by "));
        let tmp = document.createElement("a");
        tmp.className = "active-href";
        tmp.onclick = () => onLoadFile(view, this.accept_format, this.update_title);
        tmp.textContent = "Load Manually"
        load_dom.appendChild(tmp);

        load_dom.appendChild(document.createElement("br"));
        load_dom.appendChild(document.createTextNode("Or "))
        let tmp2 = document.createElement("a");
        tmp2.className = "active-href";
        tmp2.textContent = "Import Folder"
        tmp2.onclick = () => onLoadFolder(this.handle_import_folder);
        load_dom.appendChild(tmp2);

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

function loadDOMWidgetInterface(view: EditorView, accept_format: string, update_title ?: (s: string) => void, handle_import_folder ?: (F: RcFile, FList: RcFile[]) => void) {
    if (view.state.doc.length !== 0) return Decoration.none;
    return Decoration.set([
        Decoration.widget({
            widget: new LoadDocumentWidget(accept_format, update_title, handle_import_folder),
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
 * @param handle_import_folder Antd component call back function to add files to 
 * the editor state. Handles duplicate names and key assignment. [Optional]
 * Argument is the same as what antd passes to the beforeUpload callback on the 
 * Upload component.
 * 
 * @returns ViewPlugin that can be installed on code mirror editor
 */
function LoadDocumentPlugin(accepted_format: string, update_name ?: (s: string) => void, handle_import_folder ?: (F: RcFile, FList: RcFile[]) => void) {
    return ViewPlugin.fromClass(class {
        public decorations   : DecorationSet;
        public update_title ?: (s: string) => void;
        public handle_import_folder ?: (F: RcFile, FList: RcFile[]) => void
        public accept_format : string;
    
        constructor (view: EditorView) {
            this.update_title = update_name;
            this.accept_format = accepted_format;
            this.handle_import_folder = handle_import_folder
            this.decorations = loadDOMWidgetInterface(view, this.accept_format, this.update_title, this.handle_import_folder);
        }

        update(update: ViewUpdate) {
            this.decorations = loadDOMWidgetInterface(update.view, this.accept_format, this.update_title, this.handle_import_folder);
            return;
        }
    }, {
        decorations: v => v.decorations
    });
}

export { LoadDocumentPlugin };