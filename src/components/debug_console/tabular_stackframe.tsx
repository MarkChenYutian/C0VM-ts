import { faCaretDown, faCaretRight } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";
import { Type2String } from "../../utility/c0_type_utility";
import C0ValueTabularDisplay from "./tabular_c0value";

export default class TabularStackFrame extends React.Component<
    TabularStackFrameProps, {expand: boolean}
> {
    constructor(props: TabularStackFrameProps) {
        super(props);
        this.state = {expand: true}
    }

    render(): React.ReactNode {
        if (!this.state.expand) {
            return(
                <div className="dbg-func-name" onClick={() => this.setState({expand: true})}>
                    <button className="implicit-btn">
                        <FontAwesomeIcon icon={faCaretRight}/>
                    </button>
                    {this.props.frame.P.name}(...)
                </div>
            )
        }

        const var_info = [];

        for (let i = 0; i < this.props.frame.V.length; i ++) {
            const to_be_rendered = this.props.frame.V[i];
            if (to_be_rendered === undefined) continue;
            var_info.push(
                <p key={i + "-name"}><code>{Type2String(to_be_rendered.type)} {this.props.frame.P.varName[i]}</code></p>
            )
            var_info.push(
                <C0ValueTabularDisplay
                    key={i + "-value"}
                    value={to_be_rendered}
                    mem={this.props.mem}
                    typeRecord={this.props.typeRecord}
                    default_expand={true}
                />
            )
        }

        return(
            <>
            <div className="dbg-func-name" onClick={() => this.setState({expand: false})}>
                <button className="implicit-btn">
                    <FontAwesomeIcon icon={faCaretDown} />
                </button>
                {this.props.frame.P.name} {var_info.length === 0 ? "(No variable to evaluate)" : ""}
            </div>
            {var_info}
            </>
        )
    }
}
