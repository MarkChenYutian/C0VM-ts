import React from "react";

export default class C0Output extends React.Component
<
    C0OutputPropInterface,
    {show: boolean}
>
{
    constructor(props: C0OutputPropInterface) {
        super(props);
        this.state = {show: true}
    }

    render() {
        return (
            <>
                <h3><i className="fa-solid fa-print"></i> Standard Output
                    <button
                            className="implicit-btn"
                            onClick={() => this.setState((state, props) => {
                                return {show: !state.show}
                            })}
                        >
                        {this.state.show ? "➖" : "➕"}
                    </button>
                </h3>
                {this.state.show ? <C0OutputMonitor printContent={this.props.printContent}/> : null}
            </>
        )
    }
}


function C0OutputMonitor(props: C0OutputPropInterface) {
    return (
        <pre id={globalThis.UI_PRINTOUT_ID}>
            {props.printContent}
        </pre>
    );
}
