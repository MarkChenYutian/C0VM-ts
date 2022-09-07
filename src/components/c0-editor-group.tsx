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

    set_brkpt_for_editor(title: string, lns: number[]) {
        let brkpt: string[] = Array.from(structuredClone(this.props.c0BreakPoints));
        brkpt = brkpt.filter((elem) => {
            const [fileName, ] = elem.split("@");
            return fileName !== title;
        });
        for (let i = 0; i < lns.length; i ++) {
            brkpt.push(`${title}@${lns[i]}`);
        }
        this.props.writeC0BrkPts(new Set(brkpt));
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
            config={{
                type: "editable-card",
                activeKey: this.props.activeTab + "",
                size: "small",
                onChange: (new_key: string) => {this.on_change_key(new_key)},
                onTabClick: (key: string, e)   => {
                    // TODO: Find some way to let alt-key (second key click) toggle rename
                    if (e.altKey) {
                        const s = prompt("File name for tab:");
                        this.props.setTabName(parseInt(key), s === null ? "" : s)
                    }
                },
                addIcon: <FontAwesomeIcon icon={faAdd}/>
            }}
            onTabEdit={on_edit}
            setTabOrder={(s) => this.update_tab_order(s)}
        >
            {
                this.props.currTabs.map(
                    (editor) => {
                        let lineNumber = 0;
                        if (this.props.currLine !== undefined && editor.title === this.props.currLine[0]) {
                            lineNumber = this.props.currLine[1];
                        }
                        return <TabPane
                            tab={editor.title}
                            key={editor.key + ""}
                            closable = {this.props.currTabs.length !== 1}
                            closeIcon={<FontAwesomeIcon icon={faXmark}/>}
                        >
                            <C0Editor
                                lineNumber    = {lineNumber}
                                updateContent = {(s: string) => this.props.updateContent(s, editor.key)}
                                updateTypedef = {(nt: Map<string, string>) => this.props.updateTypedef(editor.key, nt)}
                                updateName    = {(s: string) => this.props.setTabName(editor.key, s)}
                                editorValue   = {editor.content}
                                updateBrkPts  = {(ln) => this.props.setC0BrkPoint(editor.title, ln)}
                                setBreakPts   = {(lns) => this.set_brkpt_for_editor(editor.title, lns)}
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
