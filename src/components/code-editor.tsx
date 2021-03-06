import React from "react";
import BC0Editor from "./bc0-editor";
import C0EditorGroup from "./c0-editor-group";

import { Switch } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCode } from "@fortawesome/free-solid-svg-icons";
import { faSquareCaretLeft, faSquareCaretRight, faPenToSquare } from "@fortawesome/free-regular-svg-icons";

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

    move_current_to_left() {
        let curr_idx = 0;
        for (let i = 0; i < this.state.C0_tabTitle.length; i ++) {
            if (this.state.C0_tabTitle[i].key === this.props.C0_ActiveTab) {
                curr_idx = i;
                break;
            }
        }

        const new_tabs = [...this.state.C0_tabTitle];
        const new_contents = [...this.props.C0_Contents];
        [new_tabs[curr_idx], new_tabs[curr_idx - 1]] = [new_tabs[curr_idx - 1], new_tabs[curr_idx]];
        [new_contents[curr_idx], new_contents[curr_idx - 1]] = [new_contents[curr_idx - 1], new_contents[curr_idx]];

        this.setState({C0_tabTitle: new_tabs});
        this.props.set_app_state({C0SourceCodes: new_contents});
    }

    move_current_to_right() {
        let curr_idx = 0;
        for (let i = 0; i < this.state.C0_tabTitle.length; i ++) {
            if (this.state.C0_tabTitle[i].key === this.props.C0_ActiveTab) {
                curr_idx = i;
                break;
            }
        }

        const new_tabs = [...this.state.C0_tabTitle];
        const new_contents = [...this.props.C0_Contents];
        [new_tabs[curr_idx], new_tabs[curr_idx + 1]] = [new_tabs[curr_idx + 1], new_tabs[curr_idx]];
        [new_contents[curr_idx], new_contents[curr_idx + 1]] = [new_contents[curr_idx + 1], new_contents[curr_idx]];

        this.setState({C0_tabTitle: new_tabs});
        this.props.set_app_state({C0SourceCodes: new_contents});
    }

    rename_current_tab() {
        const new_title = prompt("New title for tab:");
        if (new_title === null) return;
        if (new_title === "") {
            globalThis.MSG_EMITTER.warn(
                "Invalid Name for Editor Tab",
                "Can't give an editor tab a empty title, no change is applied."
            );
            return;
        }

        this.setState((state) => {return {
            C0_tabTitle: state.C0_tabTitle.map(
                (value) => {
                    if (value.key === this.props.C0_ActiveTab) return {key: value.key, name: new_title};
                    return value;
                }
            )
        };})
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

        let btn_groups = null;
        if (this.state.mode === "c0") {
            btn_groups = 
            <>
                    <button
                        className="implicit-btn editor-tab-btn"
                        onClick={() => this.rename_current_tab()}
                    >
                        <FontAwesomeIcon icon={faPenToSquare}/>
                    </button>
                    <button
                        className={"implicit-btn " + (this.props.C0_ActiveTab === this.state.C0_tabTitle[0].key ? "editor-tab-btn-disable" :"editor-tab-btn")}
                        onClick={() => this.move_current_to_left()}
                    >
                        <FontAwesomeIcon icon={faSquareCaretLeft}/>
                    </button>
                    <button
                        className={"implicit-btn " + (this.props.C0_ActiveTab === this.state.C0_tabTitle[this.state.C0_tabTitle.length - 1].key ? "editor-tab-btn-disable" :"editor-tab-btn")}
                        onClick={() => this.move_current_to_right()}
                    >
                        <FontAwesomeIcon icon={faSquareCaretRight}/>
                    </button>
            </>;
        }

        return (
        <div className="code-editor" data-lang={this.state.mode} >
            <div style={{display: "flex", justifyContent: "space-between", alignItems: "baseline"}}>
                <h3 style={{marginTop: 0}}>
                    <FontAwesomeIcon icon={faCode}/> Code Editor
                </h3>
                <div>
                    {btn_groups}
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
            </div>
            {content}
        </div>);
    }
}
