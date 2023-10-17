import React from "react";

import TabularStackFrame from "./tabular_component/tabular_stackframe";

export default class TabularDebugEvaluation extends React.Component<
    DebugConsoleInterface,
    {}
> {
    render(): React.ReactNode {
        const result = [];
        for (let i = 0; i < this.props.state.CallStack.length; i ++) {
            result.push(
                <TabularStackFrame
                    frame={this.props.state.CallStack[i]}
                    mem={this.props.mem}
                    state={this.props.state}
                    typedef={this.props.typedef}
                    key={i}
                    isActive={false}
                />
            );
        }
        result.push(
            <TabularStackFrame
                frame={this.props.state.CurrFrame}
                mem={this.props.mem}
                state={this.props.state}
                typedef={this.props.typedef}
                key={this.props.state.CallStack.length}
                isActive={true}
            />
        )
        return (<div className="debug-console">
                    {result}
                </div>);
    }
}
