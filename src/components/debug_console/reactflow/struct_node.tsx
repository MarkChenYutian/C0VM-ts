import React from "react";
import { NodeProps } from "react-flow-renderer";
import { internal_error } from "../../../utility/errors";

export default class C0StructNode extends React.Component<NodeProps<C0StructNodeData>> {
    render() {
        if (this.props.data.ptr.type.kind !== "struct") {
            throw new internal_error("<C0StructNode/> Receives a non-struct pointer");
        }

        return <></>;
    }
}
