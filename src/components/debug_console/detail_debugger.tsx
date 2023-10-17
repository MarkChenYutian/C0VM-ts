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
                    state={this.props.state}
                    mem={this.props.mem}
                    typedef={this.props.typedef}
                    key={i}
                    isActive={false}
                />
            );
        }
        result.push(
            <DetailStackFrame
                frame={this.props.state.CurrFrame}
                state={this.props.state}
                mem={this.props.mem}
                typedef={this.props.typedef}
                key={this.props.state.CallStack.length}
                isActive={true}
            />
        )
        return <div className="debug-console">
            {result}
        </div>;
    }
}
