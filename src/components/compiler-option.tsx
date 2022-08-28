import React from "react";

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAngleDown, faAngleRight, faToggleOff } from '@fortawesome/free-solid-svg-icons';

import { Switch } from "antd";


export default class CompilerOption extends React.Component
<
    CompilerOptionPropInterface,
    {show: boolean}
>
{
    constructor(props: CompilerOptionPropInterface) {
        super(props);
        this.state = {show: false}
    }

    render() {
        return (
            <>
                <h3
                    onClick={() => this.setState((state, props) => {
                        return {show: !state.show}
                    })}
                >
                        <FontAwesomeIcon icon={faToggleOff}/>
                        {" Compiler Options "}
                        {this.state.show ? <FontAwesomeIcon icon={faAngleDown}/> : <FontAwesomeIcon icon={faAngleRight} />}
                </h3>
                {this.state.show ? <CompilerOptionBtnGroup
                    flip_d_flag={this.props.flip_d_flag}
                    d_flag_stat={this.props.d_flag_stat}
                /> : null}
            </>
        );
    }
}

function CompilerOptionBtnGroup(props: CompilerOptionPropInterface){
    return (
        // display: flex;flex-direction: row;flex-wrap: nowrap;justify-content: space-between;align-items: flex-start;
        <div style={{display: "flex",
                     flexDirection: "row",
                     flexWrap: "nowrap",
                     justifyContent: "space-between",
                     alignItems: "flex-start",
                     margin: "0 5%"}}>
            <p style={{margin: "0"}}>Check Contract (<code>-d</code> flag)</p> <Switch onChange={props.flip_d_flag} defaultChecked={props.d_flag_stat} size="small"/> 
        </div>
    );
}