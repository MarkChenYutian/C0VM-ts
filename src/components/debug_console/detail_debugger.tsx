import React from "react";
import DetailStackFrame from "./detail_component/detail_stackframe";

export default class DetailDebugEvaluation extends React.Component<
    DebugConsoleInterface,
    {}
> {
    render(): React.ReactNode {
        const result = [];
        for (let i = 0; i < this.props.state.CallStack.length; i ++) {
            result.push(
                <DetailStackFrame
                    frame={this.props.state.CallStack[i]}
                    mem={this.props.mem}
                    typeRecord={this.props.state.TypeRecord}
                    typedefRec={this.props.typedef}
                    key={i}
                />
            );
        }
        result.push(
            <DetailStackFrame
                frame={this.props.state.CurrFrame}
                mem={this.props.mem}
                typeRecord={this.props.state.TypeRecord}
                typedefRec={this.props.typedef}
                key={this.props.state.CallStack.length}
            />
        )
        return <div className="debug-console">
            {result}
        </div>;
    }
}
