import React from "react";

import TabularStackFrame from "./tabular_component/tabular_stackframe";

export default class TabularDebugEvaluation extends React.Component<
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