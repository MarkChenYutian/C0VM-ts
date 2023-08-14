import React from "react";
import { Tabs, TabsProps } from "antd";
import C0Editor from "./c0-editor";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark, faAdd } from "@fortawesome/free-solid-svg-icons";

import DraggableTab from "./draggable_tabs";
import EditableTab from "./editable_tabs";
import { internal_error } from "../../utility/errors";


const { TabPane } = Tabs;
const regex_valid_file_name = /^[0-9a-zA-Z_-]+\.(c(0|1))$/;


function isValidFileName(name: string): boolean {
    if (!regex_valid_file_name.test(name)) {
        globalThis.MSG_EMITTER.warn(
            "Failed to rename editor tab", 
            "Editor tab's name can't contain special character and should end in .c0 or .c1"
        );
        return false;
    }
    return true;
}

function vmNotRunning(props: C0EditorGroupProps) {
    if (props.app_state.C0Runtime !== undefined && props.app_state.C0Runtime.state.CurrLineNumber !== 0) {
        globalThis.MSG_EMITTER.warn(
            "Failed to rename editor tab",
            "Can't rename editor tab when a C0/C1 program is running in background"
        );
        return false;
    }
    return true;
}

function isUniqueFileName(props: C0EditorGroupProps, key: number, name: string): boolean {
    for (let i = 0; i < props.app_state.C0Editors.length; i ++) {
        const tab = props.app_state.C0Editors[i];
        if (tab.title === name && tab.key !== key) {
            globalThis.MSG_EMITTER.warn(
                "Failed to rename editor tab",
                "Editor tabs must have unique names."
            );
            return false;
        }
    }
    return true;
}


export default class C0EditorGroup extends React.Component <C0EditorGroupProps>
{
    constructor(props: C0EditorGroupProps){
        super(props);
        this.change_tab = this.change_tab.bind(this);
        this.set_tab_name = this.set_tab_name.bind(this);
        this.set_active = this.set_active.bind(this);
        this.set_tab_order = this.set_tab_order.bind(this);
        this.set_breakpoint = this.set_breakpoint.bind(this);
    }

    get_tab(key: number): C0EditorTab {
        for (const tab of this.props.app_state.C0Editors) {
            if (tab.key === key) return tab;
        }
        throw new internal_error("Failed to retrieve the editor tab required.");
    }

    set_tab(key: number, new_tab: C0EditorTab) {
        this.props.set_app_state(
            (S) => {
                let new_tabs = [...S.C0Editors];
                for (let i = 0; i < new_tabs.length; i ++) {
                    if (new_tabs[i].key === key) new_tabs[i] = new_tab
                }
                return { C0Editors: new_tabs };
            }
        );
    }

    set_tab_name(key: number, name: string){
        if (!isValidFileName(name) || !vmNotRunning(this.props) || !isUniqueFileName(this.props, key, name)) {
            return;
        }
        const orig_tab = this.get_tab(key);
        const new_tab: C0EditorTab = {...orig_tab, title: name};
        this.set_tab(key, new_tab);
    }

    set_breakpoint(key: number, bps: BreakPoint[]) {
        const newTab = this.get_tab(key);
        newTab.breakpoints = bps;
        this.set_tab(key, newTab);
    }

    set_active(new_active_key: string) {
        this.props.set_app_state({ActiveEditor: parseInt(new_active_key)});
    }

    set_tab_order(new_order: React.Key[]): void {
        const tab_keymap = new Map<number, C0EditorTab>();
        const result = [];
        this.props.app_state.C0Editors.forEach((tab) => tab_keymap.set(tab.key, tab));
        for (let i = 0; i < new_order.length; i ++) {
            result.push(tab_keymap.get(parseInt(new_order[i] + "")) as C0EditorTab);
        }
        this.props.set_app_state({C0Editors: result});
    }

    change_tab(target_key: any, action: "add" | "remove") {
        if (action === "add") {
            this.props.newPanel();
        } else {
            this.props.removePanel(target_key);
        }
    }

    render() {
        const tabConfig: TabsProps = {
            type: "editable-card",
            size: "small",
            tabBarExtraContent: this.props.selector,
            activeKey: this.props.app_state.ActiveEditor.toString(),
            onChange: (new_key: string) => {this.set_active(new_key)},
            addIcon: <FontAwesomeIcon icon={faAdd}/>
        }

        return (
        <DraggableTab config={tabConfig} onTabEdit={this.change_tab} setTabOrder={this.set_tab_order}>
            {this.props.app_state.C0Editors.map(
                (editor) => {
                    let execLine = 0;
                    if (this.props.currLine !== undefined && editor.title === this.props.currLine[0]) {
                        execLine = this.props.currLine[1];
                    }

                    return (
                    <TabPane
                        tab={
                            <EditableTab title={editor.title} editor_key={editor.key + ""} updateName={(k, s) => this.set_tab_name(k, s)}/>
                        }
                        key={editor.key.toString()}
                        closable = {this.props.app_state.C0Editors.length !== 1}
                        closeIcon={<FontAwesomeIcon icon={faXmark}/>}
                    >
                        <C0Editor
                            execLine    = {execLine}
                            content     = {editor.content}
                            breakPoints = {editor.breakpoints}
                            editable    = {this.props.currLine === undefined}

                            setContent  = {(content) => this.props.set_content(editor.key, content)}
                            setTitle    = {(title) => this.set_tab_name(editor.key, title)}
                            setBreakPts = {(bps)  => this.set_breakpoint(editor.key, bps)}
                            setAllTabs  = {(tabs) => this.props.set_app_state({C0Editors: tabs})}
                            setActiveKey= {(key) => {this.props.set_app_state({ActiveEditor: key})}}
                        />
                    </TabPane>
                    );
                }
            )}
        </DraggableTab>
        );
    }
}
