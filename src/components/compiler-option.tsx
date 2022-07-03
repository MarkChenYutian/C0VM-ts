import React from "react";



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
                    flag_state={this.props.flag_state}
                    flip_d_flag={this.props.flip_d_flag}
                /> : null}
            </>
        );
    }
}

function CompilerOptionBtnGroup(props: CompilerOptionPropInterface){
    return (
        <div>
            <button
                className={"base-btn main-btn" + (props.flag_state["d"] ? " flag-selected" : "")}
                onClick={props.flip_d_flag}
            >
                Check Contract
            </button>
        </div>
    );
}