import React from "react";

import MainControlBar from "./components/main-control-bar";
import C0VMApplicationFooter from "./components/main-footer";
import C0Output from "./components/c0-output";
import DebugConsole from "./components/debug_console/debug_console";
import CodeEditor from "./components/code-editor";
import AppCrashFallbackPage from "./components/app_crash_fallback";
import SettingPopup from "./components/settings";
import { Row, Col } from "antd";
import TutorialEditor from "./components/tutorial_editor";

export default class C0VMApplication extends React.Component<
    C0VMApplicationProps,
    C0VMApplicationState
> {
    constructor(props: C0VMApplicationProps) {
        super(props);

        const hideTutorialPanel = localStorage.getItem("hideTutorial");
        let showTutorial = false;
        if (hideTutorialPanel === null) showTutorial = true;

        this.state = {
            crashed        : false,
            c0_only        : true,
            contentChanged : true,
            dbgFullScreen  : false,

            tutorialOn     : showTutorial,
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

    render() {
        if (this.state.crashed) {
            return (
                <AppCrashFallbackPage
                    app_state={this.state}
                    set_app_state={(ns) => this.setState(ns)}
                />
            );
        }

        const MainControlBarComponent = (
            <MainControlBar
                app_state     ={this.state}
                set_app_state ={(s) => this.setState(s)}
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

        const TutorialPanelComponent = <TutorialEditor app_state={this.state} set_app_state={(ns) => this.setState(ns)}/>;
        const SettingMenuComponent   = <SettingPopup app_state={this.state} set_app_state={(ns) => this.setState(ns)}/>;

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
                {TutorialPanelComponent}
                {SettingMenuComponent}
                {MainControlBarComponent}
                <Row className="main-ui-framework">
                    <Col xs={24} sm={12} lg={12} xxl={11}>
                        <CodeEditor
                            app_state={this.state}
                            set_app_state={(ns, cb) => this.setState(ns, cb)}
                        />
                    </Col>
                    <Col xs={24} sm={12} lg={12} xxl={13} className="io-area">
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
