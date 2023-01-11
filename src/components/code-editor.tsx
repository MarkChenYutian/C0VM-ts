import React from "react";
import BC0Editor from "./code_editor/bc0-editor";
import C0EditorGroup from "./code_editor/c0-editor-group";

import { Segmented, Space, Tooltip } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCode, faLock } from "@fortawesome/free-solid-svg-icons";
import { ConfigConsumer, ConfigConsumerProps } from "antd/es/config-provider";

export default class CodeEditor extends React.Component
<CodeEditorProps, CodeEditorState>
{
    constructor(props: CodeEditorProps) {
        super(props);

        const tabs = props.app_state.C0Editors;
        this.state = {
            mode: "c0",
            C0_nextKey : tabs.length === 0 ? 1 : Math.max(...tabs.map((tab) => tab.key)) + 1
        }
    }

    create_panel() {
        const new_editors = [...this.props.app_state.C0Editors];
        new_editors.push({
            title: `Untitled_${this.state.C0_nextKey}.c0`,
            key: this.state.C0_nextKey,
            content: "",
            breakpoints: [],
        });
        this.props.set_app_state({C0Editors: new_editors, ActiveEditor: this.state.C0_nextKey});
        this.setState({C0_nextKey: this.state.C0_nextKey + 1})
    }

    remove_panel(key: string) {
        const key_tbr = parseInt(key);
        let new_editors: C0EditorTab[] = [...this.props.app_state.C0Editors];
        new_editors = new_editors.filter((value) => value.key !== key_tbr);
        const new_activeTab = this.props.app_state.ActiveEditor === key_tbr ? new_editors[0].key : this.props.app_state.ActiveEditor;
        this.props.set_app_state({C0Editors: new_editors, ActiveEditor: new_activeTab});
    }

    update_content(key: number, s: string) {
        let ns: C0EditorTab[] = [...this.props.app_state.C0Editors];
        ns = ns.map((tab) => tab.key === key ? {
                key: tab.key, title: tab.title, content: s, breakpoints: tab.breakpoints
            } : tab);
        this.props.set_app_state({C0Editors: ns, contentChanged: true});
    }

    render_c0(selector: JSX.Element | undefined) {
        return (
            <div className="code-editor" data-lang={this.state.mode}>
                <C0EditorGroup
                    currLine        = {this.props.app_state.C0Runtime?.state.CurrC0RefLine}
                    appState        = {this.props.app_state}
                    selector        = {selector}
                    set_app_state   = {(ns) => this.props.set_app_state(ns)}
                    set_group_state = {(mode) => this.setState({mode: mode})}
                    newPanel        = {() => this.create_panel()}
                    removePanel     = {(key) => this.remove_panel(key)}
                    updateContent   = {(key, s) => this.update_content(key, s)}
                />
            </div>);
    }

    render_all(selector: JSX.Element | undefined) {
        let content = undefined;
        if (this.state.mode === "c0") {
            content = <C0EditorGroup
                currLine        = {this.props.app_state.C0Runtime?.state.CurrC0RefLine}
                appState        = {this.props.app_state}
                selector        = {selector}
                set_app_state   = {(ns) => this.props.set_app_state(ns)}
                set_group_state = {(mode) => this.setState({mode: mode})}
                newPanel        = {() => this.create_panel()}
                removePanel     = {(key) => this.remove_panel(key)}
                updateContent   = {(key, s) => this.update_content(key, s)}
            />;
        } else {
            const vm = this.props.app_state.C0Runtime;
            content = <>
                <div style={{display: "flex", flexDirection: "row", justifyContent: "space-between", alignItems: "baseline"}}>
                    <h3 style={{margin: "0"}}><FontAwesomeIcon icon={faCode}/> Bytecode Reader</h3>
                    {selector}
                </div>
                <BC0Editor
                    updateContent={s => this.props.set_app_state({BC0SourceCode: s})}
                    editorValue  ={this.props.app_state.BC0SourceCode}
                    execLine     ={vm === undefined ? 0 : vm.state.CurrLineNumber}
                    breakpointVal={this.props.app_state.BC0BreakPoints}
                    updateBrkPts ={ns => this.props.set_app_state({BC0BreakPoints: new Set(ns)})}
                />
            </>;
        }

        return (
            <div className="code-editor" data-lang={this.state.mode} >
                {content}
            </div>
        );
    }

    render() {
        let selectorArr: JSX.Element[] = [];
        
        if (this.props.app_state.C0Runtime?.state.CurrC0RefLine !== undefined){
            selectorArr.push(
                <ConfigConsumer>
                    {(value: ConfigConsumerProps) => 
                        <Tooltip
                            title="Code editor is read-only now since the program is running."
                            placement="left"
                            color={value.theme?.token?.colorPrimary}
                        >
                            <FontAwesomeIcon icon={faLock} key="status_indicator"/>
                        </Tooltip>
                    }
                </ConfigConsumer>
            );
        }

        if (! this.props.app_state.c0_only){
            selectorArr.push(<Segmented
                            key="language_selector"
                            options={[
                                { label: "Source", value: "c0" }, 
                                { label: "ByteC",value: "bc0"}
                            ]}
                            defaultValue={this.state.mode}
                            onChange={(value) => {this.setState({mode: value as "c0" | "bc0"})}}
                        />);
        }


        let selector = undefined;
        if (selectorArr.length === 1){
            selector = selectorArr[0];
        } else if (selectorArr.length === 2) {
            selector = <Space size="small">{selectorArr[0]} {selectorArr[1]}</Space>
        }
        
        if (this.props.app_state.c0_only) return this.render_c0(selector);
        return this.render_all(selector);
    }
}
