/**
 * @author Yutian Chen <yutianch@andrew.cmu.edu>
 * @description The Root component of the Debug Console, provides switching between tabular
 * debug console and graphical debug console.
 */
import React, { useCallback, useEffect } from "react";

import ReactFlow, { Controls, Background, useNodesState, useEdgesState, NodeChange } from "react-flow-renderer";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalculator, faAngleDown, faAngleRight } from "@fortawesome/free-solid-svg-icons";

import { Result, Switch } from "antd";

import TabularStackFrame from "./tabular_stackframe";
import C0VM_RuntimeState from "../../vm_core/exec/state";
import C0StackFrameNode from "./reactflow/stack_node";
import { build_nodes, merge_nodes } from "./graph_builder";
import C0StructNode from "./reactflow/struct_node";
import C0ArrayNode from "./reactflow/array_node";
import C0PointerNode from "./reactflow/pointer_node";
import C0ValueNode from "./reactflow/value_node";

const node_types = {
    stackNode: C0StackFrameNode,
    structNode: C0StructNode,
    arrayNode: C0ArrayNode,
    pointerNode: C0PointerNode,
    valueNode: C0ValueNode
};

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



function GraphicalDebugEvaluation(props: TabularDebugEvaluationProps) {
    const [calc_node, calc_edge] = build_nodes(props.state, props.mem);
    const [nodes, setNodes, onNodesChange] = useNodesState(calc_node);
    const [edges, setEdges, ] = useEdgesState(calc_edge);

    /** 
     * NOTE: The useEffect hook below will lead to eslint warning, this
     * is a deliberate result. Adding "nodes" or remove the dependency 
     * array in this useEffect hook will lead to inf recursion and nodes
     * will therefore be "undraggable"
     */
    useEffect(
        () => {
            const [new_node, new_edge] = build_nodes(props.state, props.mem);
            setNodes(merge_nodes(nodes, new_node));
            setEdges(new_edge);
        }, [props.state,
            props.mem,
            props.state.CurrLineNumber,
            setNodes,
            setEdges
        ]
    );

    const nodesChangeWrapper = useCallback(
        (nodeChangeList: NodeChange[]) => {
            if (nodeChangeList.length === 1 && nodeChangeList[0].type === "position") {
                const nid = nodeChangeList[0].id;
                setNodes(nodes.map(
                    (node) => {
                        if (node.id === nid) {
                            node.data.dragged = true;
                        }
                        return node;
                    }
                ));
            }
            onNodesChange(nodeChangeList);
        },
        [onNodesChange, setNodes, nodes]
    );

    return (
            <ReactFlow className="debug-console"
                nodeTypes={node_types}
                nodes={nodes}
                edges={edges}
                onNodesChange={nodesChangeWrapper}
            >
                <Controls/>
                <Background/>
            </ReactFlow>
        );
}
