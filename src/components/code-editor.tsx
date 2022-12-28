import React from "react";
import BC0Editor from "./bc0-editor";
import C0EditorGroup from "./c0-editor-group";

import { Segmented } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCode } from "@fortawesome/free-solid-svg-icons";
import C0VM_RuntimeState from "../vm_core/exec/state";

const regex_valid_file_name = /^[0-9a-zA-Z_-]+\.c0$/;

function merge_typedef(original: Map<string, TypeDefInfo>, editor_key: number, newSet: Map<string, string>): Map<string, TypeDefInfo> {
    const newTypedef = new Map<string, TypeDefInfo>();
    original.forEach(
        (value, key) => {
            if (value.key !== editor_key) {
                newTypedef.set(key, value);
            }
        }
    )
    newSet.forEach(
        (value, key) => {
            newTypedef.set(key, {source: value, key: editor_key});
        }
    );
    return newTypedef;
}


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

    set_tab_name(key: number, name: string) {
        if (!regex_valid_file_name.test(name)) {
            globalThis.MSG_EMITTER.warn(
                "Failed to rename editor tab", 
                "Editor tab's name can't contain special character and should end in .c0"
            );
            return;
        }
        if (this.props.app_state.C0Runtime !== undefined && this.props.app_state.C0Runtime.state.CurrLineNumber !== 0) {
            globalThis.MSG_EMITTER.warn(
                "Failed to rename editor tab",
                "Can't rename editor tab when a C0/BC0 program is running in background"
            )
        }
        for (let i = 0; i < this.props.app_state.C0Editors.length; i ++) {
            const tab = this.props.app_state.C0Editors[i];
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

    create_panel() {
        const new_editors = [...this.props.app_state.C0Editors];
        new_editors.push({
            title: `Untitled_${this.state.C0_nextKey}.c0`,
            key: this.state.C0_nextKey,
            content: "",
            breakpoints: []
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

    update_content(s: string, key: number) {
        let ns: C0EditorTab[] = [...this.props.app_state.C0Editors];
        ns = ns.map((tab) => tab.key === key ? {key: tab.key, title: tab.title, content: s, breakpoints: tab.breakpoints} : tab);
        this.props.set_app_state({C0Editors: ns, contentChanged: true});
    }

    render_c0() {
        const read_only = this.props.app_state.C0Runtime !== undefined && this.props.app_state.C0Runtime.state.CurrLineNumber !== 0;
        return (
            <div className="code-editor" data-lang={this.state.mode}>
                <div style={{display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: ".4rem"}}>
                    <h3 style={{marginTop: 0, marginBottom: 0}}>
                        <FontAwesomeIcon icon={faCode}/> Code Editor {read_only ? "(Read Only when Running)" : ""}
                    </h3>
                </div>
                <C0EditorGroup
                    currLine        = {(this.props.app_state.C0Runtime as (C0VM_RuntimeState | undefined))?.state.CurrC0RefLine}
                    activeTab       = {this.props.app_state.ActiveEditor}
                    setActiveTab    = {(i) => this.props.set_app_state({ActiveEditor: i})}
                    currTabs        = {this.props.app_state.C0Editors}
                    setTabs         = {(nt) => this.props.set_app_state({C0Editors: nt})}
                    setTabName      = {(k, s) => this.set_tab_name(k, s)}
                    newPanel        = {() => this.create_panel()}
                    removePanel     = {(key) => this.remove_panel(key)}
                    updateContent   = {(s, key) => this.update_content(s, key)}
                    updateTypedef   = {(key, newMap) => {
                        this.props.set_app_state({TypedefRecord: merge_typedef(this.props.app_state.TypedefRecord, key, newMap)})
                    }}
                />
            </div>);
    }

    render_all() {
        let content = undefined;
        if (this.state.mode === "c0") {
            content = <C0EditorGroup
                currLine        = {(this.props.app_state.C0Runtime as (C0VM_RuntimeState | undefined))?.state.CurrC0RefLine}
                activeTab       = {this.props.app_state.ActiveEditor}
                currTabs        = {this.props.app_state.C0Editors}
                
                setActiveTab    = {(i) => this.props.set_app_state({ActiveEditor: i})}
                setTabs         = {(nt) => this.props.set_app_state({C0Editors: nt})}
                setTabName      = {(k, s) => this.set_tab_name(k, s)}
                newPanel        = {() => this.create_panel()}
                removePanel     = {(key) => this.remove_panel(key)}
                updateContent   = {(s, key) => this.update_content(s, key)}
                updateTypedef   = {(key, newMap) => {
                    this.props.set_app_state({TypedefRecord: merge_typedef(this.props.app_state.TypedefRecord, key, newMap)})
                }}
            />;
        } else {
            const vm: C0VM_RuntimeState | undefined = this.props.app_state.C0Runtime;
            content = <BC0Editor
                updateContent={s => this.props.set_app_state({BC0SourceCode: s})}
                editorValue  ={this.props.app_state.BC0SourceCode}
                execLine     ={vm === undefined ? 0 : vm.state.CurrLineNumber}
                breakpointVal={this.props.app_state.BC0BreakPoints}
                updateBrkPts ={ns => this.props.set_app_state({BC0BreakPoints: new Set(ns)})}
            />;
        }

        const read_only = this.props.app_state.C0Runtime !== undefined && this.props.app_state.C0Runtime.state.CurrLineNumber !== 0;

        return (
        <div className="code-editor" data-lang={this.state.mode} >
            <div style={{display: "flex", justifyContent: "space-between", alignItems: "flex-start"}}>
                <h3 style={{marginTop: 0, marginBottom: 0}}>
                    <FontAwesomeIcon icon={faCode}/> Code Editor {read_only ? "(Read Only when Running)" : ""}
                </h3>
                <Segmented
                    options={[
                        { label: "C0", value: "c0" } , 
                        { label: "BC0",value: "bc0"}
                    ]}
                    defaultValue="c0"
                    onChange={(value) => {this.setState({mode: value as "c0" | "bc0"})}}
                />
            </div>
            {content}
        </div>);
    }

    render() {
        if (this.props.app_state.c0_only) return this.render_c0();
        return this.render_all();
    }
}
