import React from "react";
import { Tabs } from "antd";
import C0Editor from "./c0-editor";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark, faAdd } from "@fortawesome/free-solid-svg-icons";
import DraggableTabs from "./draggable_tabs";

const { TabPane } = Tabs;

export default class C0EditorGroup extends React.Component <C0EditorGroupProps>
{
    on_change_key(new_active_key: string) {
        this.props.setActiveTab(parseInt(new_active_key));
    }

    update_tab_order(new_order: React.Key[]): void {
        const tab_keymap = new Map<number, C0EditorTab>();
        const result = [];
        this.props.currTabs.forEach((tab) => tab_keymap.set(tab.key, tab));
        for (let i = 0; i < new_order.length; i ++) {
            result.push(tab_keymap.get(parseInt(new_order[i] + "")) as C0EditorTab);
        }
        this.props.setTabs(result);
    }

    render() {
        const on_edit = (target_key: any, action: "add" | "remove") => {
            switch (action) {
                case "add":
                    this.props.newPanel();
                    break;
                case "remove":
                    this.props.removePanel(target_key);
                    break;
            }
        };

        return (
        <DraggableTabs
            //@ts-ignore
            type="editable-card"
            activeKey={this.props.activeTab + ""}
            size="small"
            onTabEdit={on_edit}
            onChange={(new_key: string) => {this.on_change_key(new_key)}}
            addIcon={<FontAwesomeIcon icon={faAdd}/>}
            setTabOrder={(s) => this.update_tab_order(s)}
        >
            {
                this.props.currTabs.map(
                    (editor) => 
                    <TabPane
                        tab={editor.title}
                        key={editor.key + ""}
                        closable = {this.props.currTabs.length !== 1}
                        closeIcon={<FontAwesomeIcon icon={faXmark}/>}
                    >
                        <C0Editor
                            updateContent = {(s: string) => {
                                this.props.updateContent(s, editor.key);
                            }}
                            updateTypedef = {(nt: Map<string, string>) => {
                                this.props.updateTypedef(editor.key, nt)
                            }}
                            updateName    = {(s: string) => {
                                this.props.setTabName(editor.key, s);
                            }}
                            editorValue   = {editor.content}
                        />
                    </TabPane>
                )
            }
        </DraggableTabs>
        );
    }
}
