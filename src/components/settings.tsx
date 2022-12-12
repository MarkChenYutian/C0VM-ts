import { faAngleDown, faAngleRight, faGear } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Switch, Modal, Select } from "antd";
import React from "react";

const { Option } = Select;

export default class SettingPopup extends React.Component<SettingMenuProps> {
    render() {
        return <Modal
                title={<h3 style={{margin: "0"}}><FontAwesomeIcon icon={faGear}/> Settings</h3>}
                visible ={true}
                closable={false}
                centered
                footer  ={[
                    <button
                        key="apply-setting"
                        className="base-btn main-btn"
                        onClick={() => this.props.set_app_state({settingMenuOn: false})}
                    >Apply</button>
                ]}
                style={{maxHeight: "80vh", overflowY: "auto"}}
                >
            <div className="settings-grid">
                <p>Contract Check (<code>-d</code> Flag)</p> <Switch size="small" style={{justifySelf: "right"}} defaultChecked={this.props.state.CompilerFlags['d']} onChange={() => {
                    this.props.set_app_state((state) => {
                        return {CompilerFlags: {...state.CompilerFlags,
                                                d: !state.CompilerFlags["d"]}
                                }
                    });
                }}/>
                <p>Editor Theme</p>
                <Select defaultValue={UI_EDITOR_THEME} onChange={(value) => {UI_EDITOR_THEME = value}}>
                    <Option value="dark">Dark</Option>
                    <Option value="light">Light</Option>
                </Select>
                <AdvancedSetting {...this.props}/>
            </div>
        </Modal>
    }
}


class AdvancedSetting extends React.Component<
    SettingMenuProps,
    {expand: boolean}
> {
    constructor(props: SettingMenuProps){
        super(props);
        this.state = {expand: false};
    }
    render(): React.ReactNode {
        if (this.state.expand) {
            return <>
            <h3 onClick={() => {this.setState({expand: false})}} className="dbg-entire-row">
                <FontAwesomeIcon icon={faAngleDown}/> Advanced Settings
            </h3>
            <p>Expose Bytecode</p> <Switch size="small" style={{justifySelf: "right"}} defaultChecked={!this.props.state.c0_only} onChange={() => {this.props.set_app_state((state) => {return {c0_only: !state.c0_only}})}}/>
            <p>Debug Mode</p> <Switch size="small" style={{justifySelf: "right"}} defaultChecked={DEBUG} onChange={() => {DEBUG = !DEBUG}}/>
            <p>Debug - Dump Step</p> <Switch size="small" style={{justifySelf: "right"}} defaultChecked={DEBUG_DUMP_STEP} onChange={() => {DEBUG_DUMP_STEP = !DEBUG_DUMP_STEP}}/>
            <p>Debug - Dump Heap</p> <Switch size="small" style={{justifySelf: "right"}} defaultChecked={DEBUG_DUMP_MEM} onChange={() => {DEBUG_DUMP_MEM = !DEBUG_DUMP_MEM}}/>
            </>;
        } else {
            return <h3 onClick={() => {this.setState({expand: true})}}>
                <FontAwesomeIcon icon={faAngleRight}/> Advanced Settings
            </h3>;
        }
    }
}
