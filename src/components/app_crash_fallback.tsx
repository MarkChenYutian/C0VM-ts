import React from "react";

import { Button, Result } from "antd";

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
                        <Button
                            size="large"
                            type="primary"
                            onClick={() => {
                                this.props.setState({
                                    crashed: false,
                                    C0Runtime: undefined,
                                    ActiveEditor: this.props.state.C0Editors[0].key
                                });
                            }}
                        >
                            Restore Editor Content
                        </Button>
                        <a href="https://github.com/MarkChenYutian/C0VM-ts/issues" target="_blank" rel="noreferrer">
                            <Button size="large">
                                Open a New Issue
                            </Button>
                        </a>
                        <div style={{textAlign: "left"}}>
                        <h3>How to report?</h3>
                        <h4>Step 1</h4>
                        <p>Copy the application status dump below: </p>
                        <pre id="c0-output">{
                            JSON.stringify(
                                {
                                    Version: globalThis.C0VM_VERSION,
                                    SourceCode: this.props.state.C0Editors,
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
                        </div>
                    </>
                }
            />;
        } else {
            return <Result
                status="error"
                title="Application Crashed"
                subTitle="Click 'Reload Application' to restore your source code files."
                extra={[
                    <Button
                        key="restore-btn"
                        size="large"
                        type="primary"
                        onClick={() => {
                            this.props.setState({crashed: false, dbgFullScreen: false, settingMenuOn: false, C0Runtime: undefined, PrintoutValue: ""});
                        }}
                    >
                        Reload Application
                    </Button>,
                    <a key="report-btn" href="https://docs.google.com/forms/d/e/1FAIpQLSezT1KhMgCNw0Uuk2nnqQnDtYlpXvbYnQW7VEef9xN759APYA/viewform?usp=sf_link" target="_blank" rel="noreferrer">
                        <Button type="default" size="large">
                            Report Problem
                        </Button>
                    </a>
                ]}
            />;
        }
    }
}
