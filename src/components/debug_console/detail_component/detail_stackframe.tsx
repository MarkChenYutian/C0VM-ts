import React from "react";

import { faCaretDown, faCaretRight } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { Type2String } from "../../../utility/c0_type_utility";
import C0ValueTabularDisplay from "../tabular_component/tabular_c0value";
import C0ValueStackDisplay from "./detail_stackvalue";
import { render_address } from "../../../utility/pointer_utility";

export default class DetailStackFrame extends React.Component<
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

        const pc_linenum = this.props.frame.P.comment.get(this.props.frame.PC)?.lineNumber;
        const pc_opcode  = this.props.frame.P.code[this.props.frame.PC];
        const pc_display = pc_linenum === undefined ? "" : "(Next: Line " + pc_linenum + ", OP Code 0x" + render_address(pc_opcode, 2) + ")"
        const vm_information = <div className="dbg-vm-info dbg-entire-row">
                <p>Program Counter:<code>{this.props.frame.PC}</code> <i>{pc_display}</i></p>
                <p>Stack Size:<code>{this.props.frame.S.length}</code></p>
                <p>Variable Count:<code>{this.props.frame.V.length}</code></p>
            </div>;
        
        // Evaluate All variables in stack
        const stack_info : React.ReactNode[] = [];
        for (let i = this.props.frame.S.length - 1; i >= 0; i --) {
            const to_be_rendered = this.props.frame.S[i];
            stack_info.push(
                <p key={i + "-stack-name"}>{i} - <code>{Type2String(to_be_rendered.type, this.props.typedef)}</code></p>
            );
            stack_info.push(
                <C0ValueStackDisplay
                    key={i + "-value"}
                    value={to_be_rendered}
                    mem={this.props.mem}
                    typedef={this.props.typedef}
                    typeRecord={this.props.typeRecord}
                    default_expand={true}
                />
            );
        }

        // Evaluate All variables in variable array
        const var_info : React.ReactNode[] = [];
        for (let i = 0; i < this.props.frame.V.length; i ++) {
            const to_be_rendered = this.props.frame.V[i];
            if (to_be_rendered === undefined) {
                var_info.push(
                    <p key={i + "-var-name"} className="dbg-entire-row dbg-extra-information">{i} - (Uninitialized)</p>
                );
            } else{
                var_info.push(
                    <p key={i + "-var-name"}>{i} - <code>{Type2String(to_be_rendered.type, this.props.typedef)} {this.props.frame.P.varName[i]}</code></p>
                );
                var_info.push(
                    <C0ValueTabularDisplay
                        key={i + "-value"}
                        value={to_be_rendered}
                        mem={this.props.mem}
                        typedef={this.props.typedef}
                        typeRecord={this.props.typeRecord}
                        default_expand={true}
                    />
                );
            }
        }
        
        if (stack_info.length === 0) {
            stack_info.push(<p className="dbg-entire-row dbg-extra-information" key="empty-value">(Empty)</p>);
        }
        if (var_info.length === 0) {
            var_info.push(<p className="dbg-entire-row dbg-extra-information" key="empty-value">(Empty)</p>);
        }

        return(
            <>
            <div className="dbg-func-name" onClick={() => this.setState({expand: false})}>
                <button className="implicit-btn">
                    <FontAwesomeIcon icon={faCaretDown} />
                </button>
                {this.props.frame.P.name} {var_info.length === 0 ? "(No variable to evaluate)" : ""}
            </div>
            <p className="dbg-entire-row"><b><i>Runtime Information</i></b></p>
            {vm_information}
            <p className="dbg-entire-row"><b><i>Stack</i></b></p>
            {stack_info}
            <p className="dbg-entire-row"><b><i>Variable</i></b></p>
            {var_info}
            </>
        )
    }
}
