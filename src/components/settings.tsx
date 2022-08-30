import { faGear } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Switch, Modal, Divider, Select } from "antd";
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
                <Divider className="dbg-entire-row">Appearance</Divider>
                <p>Editor Theme</p>
                <Select defaultValue={UI_EDITOR_THEME} onChange={(value) => {UI_EDITOR_THEME = value}}>
                    <Option value="dark">Dark</Option>
                    <Option value="light">Light</Option>
                </Select>

                <Divider className="dbg-entire-row">Developer Settings</Divider>
                <p>Debug Mode</p> <Switch size="small" style={{justifySelf: "right"}} defaultChecked={DEBUG} onChange={() => {DEBUG = !DEBUG}}/>
                <p>Debug - Dump Step</p> <Switch size="small" style={{justifySelf: "right"}} defaultChecked={DEBUG_DUMP_STEP} onChange={() => {DEBUG_DUMP_STEP = !DEBUG_DUMP_STEP}}/>
                <p>Debug - Dump Heap</p> <Switch size="small" style={{justifySelf: "right"}} defaultChecked={DEBUG_DUMP_MEM} onChange={() => {DEBUG_DUMP_MEM = !DEBUG_DUMP_MEM}}/>
                <p>Experimental - Type Reuse</p> <Switch size="small" style={{justifySelf: "right"}} defaultChecked={EXP_PRESERVE_TYPE} onChange={() => {EXP_PRESERVE_TYPE = !EXP_PRESERVE_TYPE}}/>
            </div>
        </Modal>
    }
}
