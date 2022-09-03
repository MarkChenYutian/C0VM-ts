import React from "react";
import BC0Editor from "./bc0-editor";
import C0EditorGroup from "./c0-editor-group";

import { Segmented } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCode } from "@fortawesome/free-solid-svg-icons";

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
    rename_current_tab() {
        const new_title = prompt(`New Filename for Tab:`);
        if (new_title === null) return;
        if (new_title === "") {
            globalThis.MSG_EMITTER.warn(
                "Invalid File Name for Editor Tab",
                "Can't have empty file name, no change is applied."
            );
            return;
        }

        this.props.set_app_state((S) => {return {
            C0TabTitles: S.C0TabTitles.map(
                    (value) => {
                        if (value.key === this.props.C0_ActiveTab) return {key: value.key, name: new_title};
                        return value;
                    }
                )
            };
        })
    }

    render() {
        let content = undefined;
        if (this.state.mode === "c0") {
            content = <C0EditorGroup
                activeTab   ={this.props.C0_ActiveTab}
                currTabs    ={this.props.C0_TabTitles}
                currContents={this.props.C0_Contents}

                setActiveTab = {(i: number) => {
                    this.props.set_app_state({ActiveEditor: i})
                }}

                setTabName   = {(key: number, name: string) => {
                    this.props.set_app_state(
                        (S) => {return {C0TabTitles: S.C0TabTitles.map(
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

                    const new_title: EditorTabTitle[] = structuredClone(this.props.C0_TabTitles);
                    new_title.push({name: `Untitled_${this.state.C0_nextKey}.c0`, key: this.state.C0_nextKey });

                    this.props.set_app_state({
                        C0TabTitles: new_title,
                        C0SourceCodes: new_content,
                        ActiveEditor: this.state.C0_nextKey,
                    });
                    this.setState((state) => {return {C0_nextKey: state.C0_nextKey + 1}})
                }}

                renameCurrTab = {() => {this.rename_current_tab()}}

                removePanel = {(key: string) => {
                    const key_tbr = parseInt(key);
                    
                    const new_tabs = [];
                    const new_content = [];
                    
                    for (let i = 0; i < this.props.C0_TabTitles.length; i ++) {
                        if (this.props.C0_TabTitles[i].key !== key_tbr) {
                            new_tabs.push(this.props.C0_TabTitles[i]);
                            new_content.push(this.props.C0_Contents[i]);
                        }
                    }

                    if (this.props.C0_ActiveTab === key_tbr) {
                        this.props.set_app_state({ActiveEditor: new_tabs[0].key});
                    }

                    this.props.set_app_state({C0SourceCodes: new_content, C0TabTitles: new_tabs});
                }}

                updateContent={(s: string, key: number) => {
                    const ns = structuredClone(this.props.C0_Contents);
                    ns[key] = s;
                    this.props.set_app_state({C0SourceCodes: ns});
                }}

                updateTypedef={this.props.set_typedef}
            />;
        } else {
            content = <BC0Editor
                updateContent={(s: string) => this.props.set_app_state({BC0SourceCode: s})}
                editorValue  ={this.props.BC0_Content}
                execLine     ={this.props.BC0_Execline}
                breakpointVal={this.props.BC0_Breakpoint}
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
