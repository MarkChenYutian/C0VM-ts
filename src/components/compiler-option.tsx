import React from "react";

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAngleDown, faAngleRight, faToggleOff } from '@fortawesome/free-solid-svg-icons';

import { Switch } from "antd";
import "antd/lib/switch/style/index.css";



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
                    style={{marginTop: 0}}
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
                /> : null}
            </>
        );
    }
}

function CompilerOptionBtnGroup(props: CompilerOptionPropInterface){
    return (
        <div>
            <Switch onChange={props.flip_d_flag} defaultChecked={false} size="small"/><label> Check Contract</label>
        </div>
    );
}