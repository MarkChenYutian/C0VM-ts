import React from "react";
import BC0Editor from "./bc0-editor";
import C0EditorGroup from "./c0-editor-group";
import { Upload } from 'antd';

import type { RcFile } from 'antd/lib/upload';

import { Segmented, Tooltip } from "antd";
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
        this.handle_import_folder = this.handle_import_folder.bind(this);
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

    // this function is called for every file in the uploaded directory, recursive.
    handle_import_folder(F: RcFile, FList: RcFile[]) {

        if (!(F.name.endsWith('.c0') || F.name.endsWith('.c1'))) {
            globalThis.MSG_EMITTER.warn(`${F.name} is not a c0/c1 file and is thus ignored`);
            return Upload.LIST_IGNORE;
        }
                
        const reader = new FileReader();

        reader.onload = e => {
            if (reader.result === null) { 
                console.error("Failed to read input file")
                return Upload.LIST_IGNORE;
            }

            const res = reader.result.toString();
           
            this.props.push_populated_tab({
                title: F.name,
                key: null, // will get overwritten when push
                content: res,
                breakpoints: [],
            })
            this.setState({C0_nextKey: Math.max(this.state.C0_nextKey, ...this.props.app_state.C0Editors.map((tab) => tab.key)) + 1})
    
        };
        reader.readAsText(F, "utf-8");

        // Prevent upload traffic
        return false;
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
                    handle_import_folder={(F: RcFile, FList: RcFile[]) => this.handle_import_folder(F, FList)}
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
                handle_import_folder={(F: RcFile, FList: RcFile[]) => this.handle_import_folder(F, FList)}
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
            selectorArr.push(
                <Segmented
                    key="language_selector"
                    options={[
                        { label: "C0", value: "c0" }, 
                        { label: "BC0",value: "bc0"}
                    ]}
                    defaultValue={this.state.mode}
                />
            );
        }


        let selector = undefined;
        if (selectorArr.length === 1){
            selector = selectorArr[0];
        } else if (selectorArr.length === 2) {
            selector = <div>{selectorArr[0]} {selectorArr[1]}</div>
        }
        
        if (this.props.app_state.c0_only) return this.render_c0(selector);
        return this.render_all(selector);
    }
}
