import React from "react";

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAngleDown, faAngleUp, faPrint } from '@fortawesome/free-solid-svg-icons';

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
                <h3
                    onClick={() => this.setState((state, props) => {
                                return {show: !state.show}
                            })}
                >
                    <FontAwesomeIcon icon={faPrint}/>
                    {" Standard Output "}
                    {this.state.show ? <FontAwesomeIcon icon={faAngleDown}/> : <FontAwesomeIcon icon={faAngleUp} />}
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
