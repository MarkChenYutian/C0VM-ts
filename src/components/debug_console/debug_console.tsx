/**
 * @author Yutian Chen <yutianch@andrew.cmu.edu>
 * @description The Root component of the Debug Console, provides switching between tabular
 * debug console and graphical debug console.
 */
import React from "react";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalculator, faAngleDown, faAngleRight } from "@fortawesome/free-solid-svg-icons";

import { Result, Switch } from "antd";

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
        this.state = { show: true, mode: "tablular", err: false };
    }

    render_no_valid_state() {
        return (
            <Result
                status="info"
                subTitle="There is no currently executing C0/C0 Bytecode"
                className="debug-console-info"
            />
        )
    }

    resolve_render_view(): React.ReactNode {
        if (this.state.show === false) return null;
        const S = this.props.state as C0VM_RuntimeState;
        if (S === undefined) return this.render_no_valid_state();
        switch (this.state.mode) {
            case "tablular": return <TabularDebugEvaluation state={S.state} mem={S.allocator}/>
            case "graphical": return <GraphicalDebugEvaluation state={S.state} mem={S.allocator}/>;
        }
    }

    render() {
        if (this.state.err) {
            return (
            <>
                <h3 onClick={() => this.setState((state) => {return {show: !state.show}})}>
                    <FontAwesomeIcon icon={faCalculator}/>
                    {" Debug Console "}
                    {this.state.show ? <FontAwesomeIcon icon={faAngleDown}/> : <FontAwesomeIcon icon={faAngleRight} />}
                </h3>
                {this.state.show ? 
                    <Result 
                    className="debug-console-info"
                    status="error"
                    title="Debugger Crashed!"
                    extra={
                        <button className="base-btn main-btn" onClick={() => this.setState({err: false, mode: "tablular"})}>
                            Reload Debugger
                        </button>
                    }
                    /> : null
                }
            </>);
        }

        return (
            <>
                <div style={{display: "flex", justifyContent: "space-between", alignItems: "baseline"}}>
                    <h3
                        onClick={() => this.setState((state) => {return {show: !state.show}})}
                    >
                        <FontAwesomeIcon icon={faCalculator}/>
                        {" Debug Console "}
                        {this.state.show ? <FontAwesomeIcon icon={faAngleDown}/> : <FontAwesomeIcon icon={faAngleRight} />}
                    </h3>
                    {
                    this.state.show ? 
                        <Switch
                            unCheckedChildren="Table"
                            checkedChildren="Graph"
                            style={{marginBottom: "0.4rem"}}
                            onChange={() => {
                                this.setState((state) => {
                                    return {mode: state.mode === "graphical" ? "tablular" : "graphical"};
                                })
                            }}
                        />
                        : null
                    }
                </div>
                {this.resolve_render_view()}
            </>
        )
    }

    componentDidCatch(e: Error) {
        globalThis.MSG_EMITTER.err(
            "Debugger Interface Exception",
            e.name + ": " + e.message
        );
        this.setState({err: true});
    }
}

