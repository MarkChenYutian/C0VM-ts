/**
 * @author Yutian Chen <yutianch@andrew.cmu.edu>
 * @description The Root component of the Debug Console, provides switching between tabular
 * debug console and graphical debug console.
 */
import React from "react";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleDown, faAngleRight, faList, faCodeMerge, faBug, faUpRightAndDownLeftFromCenter, faDownLeftAndUpRightToCenter } from "@fortawesome/free-solid-svg-icons";

import { Result, Segmented } from "antd";

import C0VM_RuntimeState from "../../vm_core/exec/state";

import TabularDebugEvaluation from "./tabular_debugger";
import GraphicalDebugEvaluation from "./graphical_debugger";

export default class DebugConsole extends React.Component
    <
    DebugConsoleProps,
    DebugConsoleState
> {
    constructor(props: DebugConsoleProps) {
        super(props);
        this.state = {
            err: false,
            show: true,
            mode: "Table"
        };
    }

    render_no_valid_state() {
        return (
            <Result
                status="info"
                subTitle="There is no currently executing program"
                className="debug-console-info"
            />
        )
    }

    resolve_render_view(): React.ReactNode {
        if (this.state.show === false) return null;
        const S = this.props.state as C0VM_RuntimeState;
        if (S === undefined) return this.render_no_valid_state();
        switch (this.state.mode) {
            case "Table": return <TabularDebugEvaluation state={S.state} mem={S.allocator} />
            case "Graph": return <GraphicalDebugEvaluation state={S.state} mem={S.allocator} />;
        }
    }

    render() {
        if (this.state.err) {
            // Set tag for MS Clarity session for bug tracking purpose
            if (window.clarity !== undefined) {
                window.clarity("set", "VM Error", "Debugger Crashed");
            }
            return (
                <div id="c0vm-debug-console" className="debug-console-box">
                    <h3 onClick={() => this.setState((state) => { return { show: !state.show } })}>
                        <FontAwesomeIcon icon={faBug} />
                        {" Debug Console "}
                        {this.state.show ? <FontAwesomeIcon icon={faAngleDown} /> : <FontAwesomeIcon icon={faAngleRight} />}
                    </h3>
                    {this.state.show ?
                        <Result
                            className="debug-console-info"
                            status="error"
                            title="Debugger Crashed!"
                            extra={
                                <button className="base-btn main-btn" onClick={() => this.setState({ err: false, mode: "Table" })}>
                                    Reload Debugger
                                </button>
                            }
                        /> : null
                    }
                </div>);
        }

        const toggle_full_screen = <button
            className="implicit-btn success-btn"
            onClick={() => {this.props.setFullScreen(true);}}
            style={{marginRight: "1rem"}}
        ><FontAwesomeIcon icon={faUpRightAndDownLeftFromCenter}/></button>;

        const exit_full_screen = <button
            className="implicit-btn danger-btn"
            onClick={() => {this.props.setFullScreen(false);}}
            style={{marginRight: "1rem"}}
        ><FontAwesomeIcon icon={faDownLeftAndUpRightToCenter}/></button>

        const full_screen_btn = (this.props.isFullScreen) ? exit_full_screen : toggle_full_screen;

        return (
            <div
                id="c0vm-debug-console"
                className={ this.state.show ? "debug-console-box" : "" }
            >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                    <h3
                        onClick={() => this.setState((state) => { return { show: !state.show } })}
                    >
                        <FontAwesomeIcon icon={faBug} />
                        {" Debug Console "}
                        {this.state.show ? <FontAwesomeIcon icon={faAngleDown} /> : <FontAwesomeIcon icon={faAngleRight} />}
                    </h3>
                    {
                        this.state.show ?
                            <div>
                                {full_screen_btn}
                                <Segmented
                                    options={[{
                                        label: "Table",
                                        value: "Table",
                                        icon: <FontAwesomeIcon icon={faList} />
                                    }, {
                                        label: "Graph",
                                        value: "Graph",
                                        icon: <FontAwesomeIcon icon={faCodeMerge} />
                                    }]}
                                    defaultValue={this.state.mode}
                                    onChange={(value) => { this.setState({ mode: value as "Table" | "Graph" }) }}
                                />
                            </div>
                            : null
                    }
                </div>
                {this.resolve_render_view()}
            </div>
        )
    }

    componentDidCatch(e: Error) {
        globalThis.MSG_EMITTER.err(
            "Debugger Crashed!",
            e.name + ": " + e.message
        );
        this.setState({ err: true });
    }
}

