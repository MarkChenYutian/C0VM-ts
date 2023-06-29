import ReactFlow, { Controls, Background, applyNodeChanges, NodeChange, Node, MarkerType, Edge } from "react-flow-renderer";
import React, { useEffect, useCallback, useState } from "react";
import { build_nodes, merge_nodes } from "./graphical_component/graph_builder";

import C0StackFrameNode from "./graphical_component/stack_node";
import C0StructNode from "./graphical_component/struct_node";
import C0ArrayNode from "./graphical_component/array_node";
import C0PointerNode from "./graphical_component/pointer_node";
import C0ValueNode from "./graphical_component/value_node";
import C0UnknownNode from "./graphical_component/unknown_node";
import C0TagPtrNode from "./graphical_component/tagptr_node";
import C0FuncPtrNode from "./graphical_component/funcptr_node";

const node_types = {
    stackNode: C0StackFrameNode,
    structNode: C0StructNode,
    arrayNode: C0ArrayNode,
    pointerNode: C0PointerNode,
    valueNode: C0ValueNode,
    unknownNode: C0UnknownNode,
    tagPtrNode: C0TagPtrNode,
    funcPtrNode: C0FuncPtrNode
};

/**
 * Graphical visualizer.
 * 
 * I used functional React component here since it's the recommended style in ReactFlow 
 * documentation (all examples in reactflow site are using hooks and functional component
 * , which makes it hard to write a class component for it)
 */
export default function GraphicalDebugEvaluation(props: DebugConsoleInterface) {
    const [init_nodes, init_edges] = build_nodes(props.state, props.mem, props.typedef)
    const [nodes, setNodes] = useState<Node<VisData>[]>(init_nodes);
    const [edges, setEdges] = useState<Edge[]>         (init_edges);
    const onNodesChange = useCallback((changes: NodeChange[]) => setNodes((nds) => applyNodeChanges(changes, nds)), []);

    /** 
     * NOTE: The useEffect hook below will lead to eslint warning, this
     * is a deliberate result. Adding "nodes" or remove the dependency 
     * array in this useEffect hook will lead to inf recursion and nodes
     * will therefore be "undraggable"
     */
    useEffect(
        () => {
            const [new_node, new_edge] = build_nodes(props.state, props.mem, props.typedef);
            const merged_nodes = merge_nodes(nodes, new_node);
            setNodes(merged_nodes);
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
                        if (node.id === nid) node.data.dragged = true;
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
                    if (edge.source === node.id) {
                        edge.style={stroke: "#CE1C1C"}
                        edge.markerEnd={type: MarkerType.Arrow, color: "#CE1C1C"}
                        edge.animated = true;
                        edge.zIndex = 1000;
                    } else if (edge.target === node.id) {
                        edge.style={stroke: "#3577C1"}
                        edge.markerEnd={type: MarkerType.Arrow, color: "#3577C1"}
                        edge.animated = true;
                        edge.zIndex = 1000;
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
                        edge.markerEnd = {type: MarkerType.Arrow};
                        edge.style = undefined;
                        edge.animated = false;
                        edge.zIndex = 999;
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
