import React from "react";
import { Tabs } from 'antd';
import C0Editor from "./c0-editor";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark, faAdd } from "@fortawesome/free-solid-svg-icons";
import DraggableTabs from "./draggable_tabs";

const { TabPane } = Tabs;
const regex_valid_file_name = /^[0-9a-zA-Z_-]+\.c0$/;


export default class C0EditorGroup extends React.Component <C0EditorGroupProps>
{
    constructor(props: C0EditorGroupProps){
        super(props);
        this.on_edit = this.on_edit.bind(this);
        this.set_tab_name = this.set_tab_name.bind(this);
        this.on_change_key = this.on_change_key.bind(this);
        this.update_tab_order = this.update_tab_order.bind(this);
        this.set_brkpt_for_editor = this.set_brkpt_for_editor.bind(this);
    }

    set_tab_name(key: number, name: string){
        if (!regex_valid_file_name.test(name)) {
            globalThis.MSG_EMITTER.warn(
                "Failed to rename editor tab", 
                "Editor tab's name can't contain special character and should end in .c0"
            );
            return;
        }
        if (this.props.appState.C0Runtime !== undefined && this.props.appState.C0Runtime.state.CurrLineNumber !== 0) {
            globalThis.MSG_EMITTER.warn(
                "Failed to rename editor tab",
                "Can't rename editor tab when a C0/BC0 program is running in background"
            )
        }
        for (let i = 0; i < this.props.appState.C0Editors.length; i ++) {
            const tab = this.props.appState.C0Editors[i];
            if (tab.title === name) {
                globalThis.MSG_EMITTER.warn("Failed to rename editor tab", "Editor tabs must have different name.");
                return;
            }
        }
        this.props.set_app_state(
            (S) => {
                let new_tabs = [...S.C0Editors];
                for (let i = 0; i < new_tabs.length; i ++) {
                    if (new_tabs[i].key === key) new_tabs[i].title = name;
                }
                return { C0Editors: new_tabs };
            }
        );
    }

    on_change_key(new_active_key: string) {
        this.props.set_app_state({ActiveEditor: parseInt(new_active_key)});
    }

    update_tab_order(new_order: React.Key[]): void {
        const tab_keymap = new Map<number, C0EditorTab>();
        const result = [];
        this.props.appState.C0Editors.forEach((tab) => tab_keymap.set(tab.key, tab));
        for (let i = 0; i < new_order.length; i ++) {
            result.push(tab_keymap.get(parseInt(new_order[i] + "")) as C0EditorTab);
        }
        this.props.set_app_state({C0Editors: result});
    }

    set_brkpt_for_editor(key: number, bps: BreakPoint[]) {
        const newTabs = [...this.props.appState.C0Editors];
        for (let i = 0; i < newTabs.length; i ++) {
            if (newTabs[i].key === key) newTabs[i].breakpoints = bps;
        }
        this.props.set_app_state({C0Editors: newTabs});
    }

    on_edit(target_key: any, action: "add" | "remove") {
        switch (action) {
            case "add":
                this.props.newPanel();
                break;
            case "remove":
                this.props.removePanel(target_key);
                break;
        }
    };    

    render() {
        return (
        <DraggableTabs
            config={{
                type: "editable-card",
                activeKey: this.props.appState.ActiveEditor + "",
                size: "small",
                onChange: (new_key: string) => {this.on_change_key(new_key)},
                onTabClick: (key: string, e)   => {
                    // TODO: Find some way to let alt-key (second key click) toggle rename
                    if (e.altKey) {
                        const s = prompt("File name for tab:");
                        this.set_tab_name(parseInt(key), s === null ? "" : s)
                    }
                },
                addIcon: <FontAwesomeIcon icon={faAdd}/>
            }}
            onTabEdit={this.on_edit}
            setTabOrder={this.update_tab_order}
        >
            {
                this.props.appState.C0Editors.map(
                    (editor) => {
                        let lineNumber = 0;
                        if (this.props.currLine !== undefined && editor.title === this.props.currLine[0]) {
                            lineNumber = this.props.currLine[1];
                        }

                        return <TabPane
                            tab={editor.title}
                            key={editor.key + ""}
                            closable = {this.props.appState.C0Editors.length !== 1}
                            closeIcon={<FontAwesomeIcon icon={faXmark}/>}
                        >
                            <C0Editor
                                execLine      = {lineNumber}
                                editorValue   = {editor.content}
                                breakPoints   = {editor.breakpoints}
                                updateContent = {(s) => this.props.updateContent(editor.key, s)}
                                updateName    = {(name) => this.set_tab_name(editor.key, name)}
                                setBreakPts   = {(bps)  => this.set_brkpt_for_editor(editor.key, bps)}
                                editable      = {this.props.currLine === undefined}
                            />
                        </TabPane>;
                    }
                )
            }
        </DraggableTabs>
        );
    }
}
