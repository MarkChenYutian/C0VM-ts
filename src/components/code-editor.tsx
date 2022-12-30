import React from "react";
import BC0Editor from "./bc0-editor";
import C0EditorGroup from "./c0-editor-group";

import { Segmented } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCode } from "@fortawesome/free-solid-svg-icons";

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
                    currLine        = {this.props.app_state.C0Runtime?.state.CurrC0RefLine}
                    appState        = {this.props.app_state}
                    set_app_state   = {(ns) => this.props.set_app_state(ns)}
                    newPanel        = {() => this.create_panel()}
                    removePanel     = {(key) => this.remove_panel(key)}
                    updateContent   = {(key, s) => this.update_content(key, s)}
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
                currLine        = {this.props.app_state.C0Runtime?.state.CurrC0RefLine}
                appState        = {this.props.app_state}
                set_app_state   = {(ns) => this.props.set_app_state(ns)}
                newPanel        = {() => this.create_panel()}
                removePanel     = {(key) => this.remove_panel(key)}
                updateContent   = {(key, s) => this.update_content(key, s)}
                updateTypedef   = {(key, newMap) => {
                    this.props.set_app_state({TypedefRecord: merge_typedef(this.props.app_state.TypedefRecord, key, newMap)})
                }}
            />;
        } else {
            const vm = this.props.app_state.C0Runtime;
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
                        { label: "C0", value: "c0" }, 
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
