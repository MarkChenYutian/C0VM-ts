import React from "react";
import BC0Editor from "./bc0-editor";
import C0EditorGroup from "./c0-editor-group";

import { Switch } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCode } from "@fortawesome/free-solid-svg-icons";

export default class CodeEditor extends React.Component
<CodeEditorProps, CodeEditorState>
{
    constructor(props: CodeEditorProps) {
        super(props);
        this.state = {
            mode: "c0",

            C0_tabTitle: [{name: "Untitled_0.c0", key: 0}],
            C0_nextKey : 1
        }
    }

    render() {
        let content = undefined;
        if (this.state.mode === "c0") {
            content = <C0EditorGroup
                activeTab   ={this.props.C0_ActiveTab}
                
                currTabs    ={this.state.C0_tabTitle}
                currContents={this.props.C0_Contents}

                updateContent={(s: string, key: number) => {
                    const ns = structuredClone(this.props.C0_Contents);
                    ns[key] = s;
                    this.props.set_app_state({C0SourceCodes: ns});
                }}
                setActiveTab = {(i: number) => {
                    this.props.set_app_state({ActiveEditor: i})
                }}
                setTabName   = {(key: number, name: string) => {
                    this.setState(
                        (state) => {return {C0_tabTitle: state.C0_tabTitle.map(
                            (tab) => {
                                if (tab.key === key) return {key: tab.key, name: name};
                                return tab;
                            }
                        )}}
                    );
                }}

                newPanel = {() => {
                    const new_content = structuredClone(this.props.C0_Contents);
                    new_content.push("");

                    const new_title: EditorTabTitle[] = structuredClone(this.state.C0_tabTitle);
                    new_title.push({name: `Untitled_${this.state.C0_nextKey}.c0`, key: this.state.C0_nextKey });

                    this.props.set_app_state({C0SourceCodes: new_content, ActiveEditor: this.state.C0_nextKey});
                    this.setState((state) => {return {C0_tabTitle: new_title, C0_nextKey: state.C0_nextKey + 1}})
                }}
                removePanel = {(key: string) => {
                    const key_tbr = parseInt(key);
                    
                    const new_tabs = [];
                    const new_content = [];
                    
                    for (let i = 0; i < this.state.C0_tabTitle.length; i ++) {
                        if (this.state.C0_tabTitle[i].key !== key_tbr) {
                            new_tabs.push(this.state.C0_tabTitle[i]);
                            new_content.push(this.props.C0_Contents[i]);
                        }
                    }

                    if (this.props.C0_ActiveTab === key_tbr) {
                        this.props.set_app_state({ActiveEditor: new_tabs[0].key});
                    }

                    this.setState({C0_tabTitle: new_tabs});
                    this.props.set_app_state({C0SourceCodes: new_content});
                }}
            />;
        } else {
            content = <BC0Editor
                updateContent={(s: string) => this.props.set_app_state({EditorContent: s})}
                editorValue  ={this.props.BC0_Content}
            />;
        }
        return (
        <div className="code-editor">
            <div style={{display: "flex", justifyContent: "space-between", alignItems: "baseline"}}>
                <h3 style={{marginTop: 0, marginBottom: this.state.mode === "c0" ? 0 : "2.8rem"}}>
                    <FontAwesomeIcon icon={faCode}/> Code Editor
                </h3>
                <Switch
                    unCheckedChildren="C0"
                    checkedChildren="BC0"
                    style={{marginBottom: "0.4rem"}}
                    onChange={() => {
                        this.setState((state) => {
                            return {mode: state.mode === "c0" ? "bc0" : "c0"};
                        })
                    }}
                />
            </div>
            {content}
        </div>);
    }
}
