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
            onEdit={on_edit}
            //@ts-ignore
            onChange={(new_key) => {this.on_change_key(new_key)}}
            addIcon={<FontAwesomeIcon icon={faAdd}/>}
            onDoubleClick={() => this.props.renameCurrTab()}
        >
            {
                this.props.currTabs.map(
                    (title: EditorTabTitle, index: number) => 
                    <TabPane
                        tab={title.name}
                        key={title.key + ""}
                        closable = {this.props.currTabs.length !== 1}
                        closeIcon={<FontAwesomeIcon icon={faXmark}/>}
                    >
                        <C0Editor
                            updateContent = {(s: string) => {
                                this.props.updateContent(s, index);
                            }}
                            updateTypedef = {(nt: Map<string, string>) => {
                                this.props.updateTypedef(title.key, nt)
                            }}
                            updateName    = {(s: string) => {
                                this.props.setTabName(title.key, s);
                            }}
                            editorValue   = {this.props.currContents[index]}
                        />
                    </TabPane>
                )
            }
        </DraggableTabs>
        );
    }
}
