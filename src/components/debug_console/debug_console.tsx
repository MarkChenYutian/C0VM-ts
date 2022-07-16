/**
 * @author Yutian Chen <yutianch@andrew.cmu.edu>
 * @description The Root component of the Debug Console, provides switching between tabular
 * debug console and graphical debug console.
 */
import React from "react";

import ReactFlow, { Controls, Background } from "react-flow-renderer";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalculator, faAngleDown, faAngleRight } from "@fortawesome/free-solid-svg-icons";

import { Result, Switch } from "antd";

import TabularStackFrame from "./tabular_stackframe";
import C0VM_RuntimeState from "../../vm_core/exec/state";

export default class DebugConsole extends React.Component
<
    DebugConsoleProps,
    DebugConsoleState
> {
    constructor(props: DebugConsoleProps) {
        super(props);
        this.state = { show: true, mode: "tablular" };
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
}


class TabularDebugEvaluation extends React.Component<
    TabularDebugEvaluationProps,
    {}
> {
    render(): React.ReactNode {
        const result = [];
        for (let i = 0; i < this.props.state.CallStack.length; i ++) {
            result.push(
                <TabularStackFrame frame={this.props.state.CallStack[i]} mem={this.props.mem} typeRecord={this.props.state.TypeRecord} key={i}/>
            );
        }
        result.push(
            <TabularStackFrame frame={this.props.state.CurrFrame} mem={this.props.mem} typeRecord={this.props.state.TypeRecord} key={this.props.state.CallStack.length}/>
        )
        return (<div className="debug-console">
                    {result}
        </div>);
    }
}


class GraphicalDebugEvaluation extends React.Component<
    TabularDebugEvaluationProps,
    {}
> {
    componentDidMount() {
        globalThis.MSG_EMITTER.warn(
            "Not Implemented Yet",
            "The graphical heap memory visualizer will be implemented in the near future."
        );
    }
    
    render(): React.ReactNode {
        return (
            <ReactFlow className="debug-console">
                <Controls/>
                <Background/>
            </ReactFlow>
        )
    }
}
