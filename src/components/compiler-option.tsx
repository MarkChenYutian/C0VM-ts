import React from "react";
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
        this.state = {show: true}
    }

    render() {
        return (
            <>
                <h3 style={{marginTop: 0}}><i className="fa-solid fa-toggle-off"></i> Compiler Options
                    <button
                        className="implicit-btn"
                        onClick={() => this.setState((state, props) => {
                            return {show: !state.show}
                        })}
                    >
                        {this.state.show ? "➖" : "➕"}
                    </button>
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
            <Switch onChange={props.flip_d_flag} defaultChecked={false}/><label> Check Contract</label>
        </div>
    );
}