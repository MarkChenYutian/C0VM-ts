/**
 * @author Yutian Chen <yutianch@andrew.cmu.edu>
 * @description The Root component of the Debug Console, provides switching between tabular
 * debug console and graphical debug console.
 */
import React from "react";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalculator, faAngleDown, faAngleRight, faTableCells, faList } from "@fortawesome/free-solid-svg-icons";

import { Result, Segmented } from "antd";

import C0VM_RuntimeState from "../../vm_core/exec/state";

import TabularDebugEvaluation from "./tabular_debugger";
import GraphicalDebugEvaluation from "./graphical_debugger";
import { generateUUID } from "../../utility/ui_helper";

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
            mode: "Table",

            fullscreen: false,
            internalID: generateUUID()
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
            return (
                <div id={"c0vm-debug-console_" + this.state.internalID} className="debug-console-box">
                    <h3 onClick={() => this.setState((state) => { return { show: !state.show } })}>
                        <FontAwesomeIcon icon={faCalculator} />
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

        const toggle_full_screen = document.fullscreenEnabled ? <button
            className="base-btn success-btn"
            onClick={() => {
                document.querySelector("#c0vm-debug-console_" + this.state.internalID)?.requestFullscreen();
                this.setState({fullscreen: true});
            }}
            style={{marginRight: "1rem"}}
        >
            Full Screen
        </button> : null;

        const exit_full_screen = <button
            className="base-btn danger-btn"
            onClick={() => {
                document.exitFullscreen();
                this.setState({fullscreen: false});
            }}
            style={{marginRight: "1rem"}}
        >
            Exit Full Screen
        </button>

        const full_screen_btn = (this.state.fullscreen) ? exit_full_screen : toggle_full_screen;

        return (
            <div
                id={"c0vm-debug-console_" + this.state.internalID}
                className={ this.state.show ? "debug-console-box" : "" }
                style={
                    this.state.fullscreen ? {padding: "1rem", width: "100vw"} : {}
                }
            >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                    <h3
                        onClick={() => this.setState((state) => { return { show: !state.show } })}
                    >
                        <FontAwesomeIcon icon={faCalculator} />
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
                                        icon: <FontAwesomeIcon icon={faTableCells} />
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

