import React from "react";
import BC0Editor from "./bc0-editor";
import C0EditorGroup from "./c0-editor-group";

import { Segmented } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCode } from "@fortawesome/free-solid-svg-icons";
import { merge_typedef } from "../utility/ui_helper";
import C0VM_RuntimeState from "../vm_core/exec/state";

export default class CodeEditor extends React.Component
<CodeEditorProps, CodeEditorState>
{
    constructor(props: CodeEditorProps) {
        super(props);
        this.state = {
            mode: "c0",
            C0_nextKey : 1
        }
    }

    /**
     * Set a new name for the tab currently selected
     */
    render() {
        let content = undefined;
        if (this.state.mode === "c0") {
            content = <C0EditorGroup
                activeTab   ={this.props.app_state.ActiveEditor}
                setActiveTab = {(i: number) => {
                    this.props.set_app_state({ActiveEditor: i})
                }}

                currTabs    ={this.props.app_state.C0Editors}
                setTabs  = {(nt) => this.props.set_app_state({C0Editors: nt})}
                setTabName   = {(key: number, name: string) => {
                    this.props.set_app_state(
                        (S) => {return {C0Editors: S.C0Editors.map(
                            (tab) => tab.key === key ? {key: tab.key, title: name, content: tab.content} : tab
                        )}}
                    );
                }}

                newPanel = {() => {
                    const new_editors = structuredClone(this.props.app_state.C0Editors);
                    new_editors.push({
                        title: `Untitled_${this.state.C0_nextKey}.c0`, key: this.state.C0_nextKey, content: ""
                    });
                    this.props.set_app_state({C0Editors: new_editors, ActiveEditor: this.state.C0_nextKey});
                    this.setState({C0_nextKey: this.state.C0_nextKey + 1})
                }}

                removePanel = {(key: string) => {
                    const key_tbr = parseInt(key);
                    let new_editors: C0EditorTab[] = structuredClone(this.props.app_state.C0Editors);
                    new_editors = new_editors.filter((value) => value.key !== key_tbr);
                    const new_activeTab = this.props.app_state.ActiveEditor === key_tbr ? new_editors[0].key : this.props.app_state.ActiveEditor;
                    this.props.set_app_state({C0Editors: new_editors, ActiveEditor: new_activeTab});
                }}

                updateContent={(s: string, key: number) => {
                    let ns: C0EditorTab[] = structuredClone(this.props.app_state.C0Editors);
                    ns = ns.map((tab) => tab.key === key ? {key: tab.key, title: tab.title, content: s} : tab);
                    this.props.set_app_state({C0Editors: ns});
                }}

                updateTypedef={(key, newMap) => {
                    this.props.set_app_state({TypedefRecord: merge_typedef(this.props.app_state.TypedefRecord, key, newMap)})
                }}
            />;
        } else {
            const vm: C0VM_RuntimeState | undefined = this.props.app_state.C0Runtime;
            content = <BC0Editor
                updateContent={(s: string) => this.props.set_app_state({BC0SourceCode: s})}
                editorValue  ={this.props.app_state.BC0SourceCode}
                execLine     ={vm === undefined ? 0 : vm.state.CurrLineNumber}
                breakpointVal={this.props.app_state.BC0BreakPoints}
                updateBrkPts ={(ns: Set<number>) => {this.props.set_app_state({BC0BreakPoints: ns})}}
            />;
        }

        return (
        <div className="code-editor" data-lang={this.state.mode} >
            <div style={{display: "flex", justifyContent: "space-between", alignItems: "flex-start"}}>
                <h3 style={{marginTop: 0, marginBottom: 0}}>
                    <FontAwesomeIcon icon={faCode}/> Code Editor
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
}
