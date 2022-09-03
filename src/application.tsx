import React from "react";
import "./application.less";
import "./embeddable.less";

import MainControlBar from "./components/main-control-bar";
import C0VMApplicationFooter from "./components/main-footer";
import C0Output from "./components/c0-output";
import DebugConsole from "./components/debug_console/debug_console";
import CodeEditor from "./components/code-editor";
import AppCrashFallbackPage from "./components/app_crash_fallback";
import SettingPopup from "./components/settings";

export default class C0VMApplication extends React.Component<
    {},
    C0VMApplicationState
> {
    constructor(props: {}) {
        super(props);
        this.state = {
            crashed: false,
            dbgFullScreen: false,
            settingMenuOn: false,
            
            BC0SourceCode: "",
            BC0BreakPoints: new Set(),
            TypedefRecord: new Map(),

            C0Editors: [{ title: "Untitled_0.c0", key: 0, content: ""}],
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
                    state={this.state}
                    setState={(ns) => this.setState(ns)}
                />
            );
        }

        const context: ApplicationContextInterface = this
            .context as ApplicationContextInterface;

        const MainControlBarComponent = (
            <MainControlBar
                application_state={this.state}
                update_running={(s) => this.setState({ C0Running: s })}
                update_value={(s) => this.setState({ BC0SourceCode: s })}
                update_state={(s) => this.setState({ C0Runtime: s })}
                update_print={(s) =>
                    this.setState((state) => {
                        return { PrintoutValue: state.PrintoutValue + s };
                    })
                }
                clear_print={() => this.setState({ PrintoutValue: "" })}
            />
        );

        const StandardOutputComponent = context.std_out ? (
            <C0Output printContent={this.state.PrintoutValue} />
        ) : null;

        const DebugConsoleComponent = context.debug_console ? (
            <DebugConsole state={this.state.C0Runtime} isFullScreen={this.state.dbgFullScreen} setFullScreen={(s) => this.setState({dbgFullScreen: s})}/>
        ) : null;

        const SettingMenuComponent =  this.state.settingMenuOn ? 
            <SettingPopup state={this.state} set_app_state={(ns) => this.setState(ns)}/>
            : null;

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
                <div className="main-ui-framework">
                    <CodeEditor
                        app_state={this.state}
                        set_app_state={(ns: any) => this.setState(ns)}
                    />
                    <div className="io-area">
                        {StandardOutputComponent}
                        {DebugConsoleComponent}
                    </div>
                </div>
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
