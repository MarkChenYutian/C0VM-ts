import ReactFlow, { Controls, Background, useNodesState, useEdgesState, NodeChange, Node } from "react-flow-renderer";
import React, { useEffect, useCallback } from "react";
import { build_nodes, merge_nodes } from "./graphical_component/graph_builder";

import C0StackFrameNode from "./graphical_component/stack_node";
import C0StructNode from "./graphical_component/struct_node";
import C0ArrayNode from "./graphical_component/array_node";
import C0PointerNode from "./graphical_component/pointer_node";
import C0ValueNode from "./graphical_component/value_node";

const node_types = {
    stackNode: C0StackFrameNode,
    structNode: C0StructNode,
    arrayNode: C0ArrayNode,
    pointerNode: C0PointerNode,
    valueNode: C0ValueNode
};

/**
 * Graphical visualizer.
 * 
 * I used functional React component here since it's the recommended style in ReactFlow 
 * documentation (all examples in reactflow site are using hooks and functional component
 * , which makes it hard to write a class component for it)
 */
export default function GraphicalDebugEvaluation(props: TabularDebugEvaluationProps) {
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
        }, 
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [props.state, props.mem, props.state.CurrLineNumber, setNodes, setEdges]
    );

    /**
     * On change node, mark the node that is changed as "dragged"
     * 
     * If new nodes are built, remain the "dragged" nodes at their original position
     * designated by the user and put other nodes on the screen.
     */
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

    /**
     * When mouse enter a node, the mouse will be "hovering"
     * on the node, in this case, we update the edges connected
     * with this node to make it easier to track.
     */
    const onEnterNode = useCallback(
        (e: React.MouseEvent, node: Node<any>) => {
            setEdges(edges.map(
                (edge) => {
                    if (edge.id.startsWith(node.id)) {
                        edge.style={stroke: "#CE1C1C"}
                        edge.animated = true;
                    } else if (edge.id.endsWith(node.id)) {
                        edge.style={stroke: "#3577C1"}
                        edge.animated = true;
                    }
                    return edge;
                }
            ));
        },
        [edges, setEdges]
    );

    /**
     * When mouse leave the node, the "hovering" ends, we reset the
     * edges connected to this node to default property.
     */
    const onLeaveNode = useCallback(
        (e: React.MouseEvent, node: Node<any>) => {
            setEdges(edges.map(
                (edge) => {
                    if (edge.id.startsWith(node.id) || edge.id.endsWith(node.id)) {
                        edge.style = undefined;
                        edge.animated = false;
                    }
                    return edge;
                }
            ));
        },
        [edges, setEdges]
    );

    return (
            <ReactFlow className="debug-console"
                nodeTypes={node_types}
                nodes={nodes}
                edges={edges}
                onNodeMouseEnter={onEnterNode}
                onNodeMouseLeave={onLeaveNode}
                onNodesChange={nodesChangeWrapper}
            >
                <Controls/>
                <Background/>
            </ReactFlow>
        );
}
