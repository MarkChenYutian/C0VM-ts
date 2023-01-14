import React from "react";

import MainControlBar from "./components/main-control-bar";
import C0VMApplicationFooter from "./components/main-footer";
import C0Output from "./components/c0-output";
import DebugConsole from "./components/debug_console/debug_console";
import CodeEditor from "./components/code-editor";
import AppCrashFallbackPage from "./components/app_crash_fallback";
import SettingPopup from "./components/settings";
import { Row, Col } from "antd";

export default class C0VMApplication extends React.Component<
    C0VMApplicationProps,
    C0VMApplicationState
> {
    constructor(props: C0VMApplicationProps) {
        super(props);
        this.state = {
            crashed        : false,
            c0_only        : false,
            contentChanged : true,
            dbgFullScreen  : false,
            settingMenuOn  : false,
            
            BC0SourceCode: "",
            BC0BreakPoints: new Set(),

            C0Editors: [{ title: "Untitled_0.c0", key: 0, content: "", breakpoints: [] }],
            ActiveEditor: 0,

            PrintoutValue: "",

            C0Running: false,
            C0Runtime: undefined,
            CompilerFlags: { d: false },
        };
    }

    push_populated_tab(tab: C0EditorTab) {
        // check if there's already file with this name and append _num if exists
        var try_suffix = 1;
        while (this.state.C0Editors.map((tab) => tab.title).includes(tab.title)) {
            if (!(this.state.C0Editors.map((tab) => tab.title)).includes(tab.title.substr(0, tab.title.lastIndexOf('.')) + '_' + try_suffix + tab.title.substr(tab.title.lastIndexOf('.')))) {
                tab.title = tab.title.substr(0, tab.title.lastIndexOf('.')) + '_' + try_suffix + tab.title.substr(tab.title.lastIndexOf('.'))
                globalThis.MSG_EMITTER.warn(`${tab.title} already exists. It will suffixed with the lowest positive integer that makes its file name unique.`);
                break
            }
            try_suffix++
        }

        this.state.C0Editors.push({
            title: tab.title,
            key: (Math.max(...this.state.C0Editors.map((tab) => tab.key)) + 1),
            content: tab.content,
            breakpoints: tab.breakpoints,
        });
    }

    render() {
        if (this.state.crashed) {
            return (
                <AppCrashFallbackPage
                    state={this.state}
                    setState={(ns) => this.setState(ns)}
                />
            );
        }

        const MainControlBarComponent = (
            <MainControlBar
                application_state   ={this.state}
                set_app_state       ={(s) => this.setState(s)}
            />
        );

        const StandardOutputComponent = this.props.showStdOut ? (
            <C0Output printContent={this.state.PrintoutValue} />
        ) : null;

        const DebugConsoleComponent   = this.props.showDebug ? (
            <DebugConsole 
                state={this.state.C0Runtime}
                c0_only={this.state.c0_only}
                isFullScreen={this.state.dbgFullScreen}
                setFullScreen={(s) => this.setState({dbgFullScreen: s})}
            />
        ) : null;

        const SettingMenuComponent = <SettingPopup state={this.state} set_app_state={(ns) => this.setState(ns)}/>;

        if (this.state.dbgFullScreen) {
            return <div className="page-framework">
                {SettingMenuComponent}
                {MainControlBarComponent}
                <div className="main-ui-framework">
                    {DebugConsoleComponent}
                </div>
                <C0VMApplicationFooter state={this.state} open_setting={() => this.setState({settingMenuOn: true})}/>
            </div>;
        }

        return (
            <div className="page-framework">
                {SettingMenuComponent}
                {MainControlBarComponent}
                <Row className="main-ui-framework">
                    <Col xs={24} sm={24} lg={12} xxl={11}>
                        <CodeEditor
                            app_state={this.state}
                            set_app_state={(ns: any) => this.setState(ns)}
                            push_populated_tab={(tab: C0EditorTab) => this.push_populated_tab(tab)}
                        />
                    </Col>
                    <Col xs={24} sm={24} lg={12} xxl={13} className="io-area">
                        {StandardOutputComponent}
                        {DebugConsoleComponent}
                    </Col>
                </Row>
                <C0VMApplicationFooter state={this.state} open_setting={() => this.setState({settingMenuOn: true})}/>
            </div>
        );
    }

    is_bc0_content(s: string): boolean {
        return s.slice(0, 11).toUpperCase() === "C0 C0 FF EE";
    }

    componentDidCatch(error: Error | null): void {
        if (globalThis.DEBUG) console.error(error);
        globalThis.MSG_EMITTER.err(
            "Internal User Interface Error",
            error === null ? undefined : error.message
        );
        this.setState({ crashed: true });
    }
}
