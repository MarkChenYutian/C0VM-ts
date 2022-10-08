import React from "react";

import { Result } from "antd";

export default class AppCrashFallbackPage extends React.Component<ApplicationCrashPageProps> {
    constructor(props: ApplicationCrashPageProps) {
        super(props);
        // Set tag for MS Clarity session for bug tracking purpose
        if (window.clarity !== undefined) {
            window.clarity("set", "VM Error", "App Crashed");
        }
    }
    render() {
        if (globalThis.DEBUG) {
            return <Result
                status="error"
                title="Application Crashed (Debug Mode)"
                subTitle={<p>Please report this problem to our GitHub Repo!</p>}
                extra={
                    <>
                        <button
                            className="base-btn main-btn"
                            onClick={() => {
                                this.props.setState({
                                    crashed: false,
                                    C0Runtime: undefined,
                                    PrintoutValue: "",
                                    // C0Editors: [{title: "Untitled_0.c0", key: 0, content: ""}],
                                    ActiveEditor: this.props.state.C0Editors[0].key
                                });
                            }}
                        >
                            Restore Editor Content
                        </button>
                        <div style={{textAlign: "left"}}>
                        <h3>How to report?</h3>
                        <h4>Step 1</h4>
                        <p>Copy the application status dump below: </p>
                        <pre id="c0-output">{
                            JSON.stringify(
                                {
                                    Version: globalThis.C0VM_VERSION,
                                    ReactState: this.props.state,
                                    ReactContext: this.context,
                                    GlobalState: {
                                        configuration: {
                                            DEBUG: globalThis.DEBUG,
                                            DEBUG_DUMP_MEM: globalThis.DEBUG_DUMP_MEM,
                                            DEBUG_DUMP_STEP: globalThis.DEBUG_DUMP_STEP,
                                            MEM_POOL_SIZE: globalThis.MEM_POOL_SIZE,
                                        }
                                    }
                                }, undefined, 4
                            )
                        }</pre>
        
                        <h4>Step 2</h4>
                        <p>
                            Open a new issue and paste the state dump above into issue description.
                        </p>
                        <a href="https://github.com/MarkChenYutian/C0VM-ts/issues" target="_blank" rel="noreferrer">
                            <button className="base-btn main-btn">
                                Open a New Issue
                            </button>
                        </a>
                        </div>
                    </>
                }
            />;
        } else {
            return <Result
                status="error"
                title="Application Crashed"
                subTitle="Reload the page to restart the application."
                extra={
                    <button
                        className="base-btn main-btn"
                        onClick={() => {
                            this.props.setState({crashed: false, dbgFullScreen: false, settingMenuOn: false, C0Runtime: undefined, PrintoutValue: ""});
                        }}
                    >
                        Restore Editor Content
                    </button>
                }
            />;
        }
    }
}
