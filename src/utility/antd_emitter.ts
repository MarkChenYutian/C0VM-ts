/**
 * @author Yutian Chen <yutianch@andrew.cmu.edu>
 * @description A message emitter module that uses Ant-design notification component
 * framework. notification calls are wrapped with functional methods for convenience.
 * 
 * Ant Design Notification Component: https://ant.design/components/notification/
 */

import { notification } from "antd";

export default class AntdEmitter implements MessageEmitter {
    err(msg: string, detail?: string): void {
        notification.error({
            message: msg,
            description: detail,
            placement: "bottomRight",
            duration: globalThis.UI_ERR_DISPLAY_TIME_SEC
        });
    }

    warn(msg: string, detail?: string): void {
        notification.warning({
            message: msg,
            description: detail,
            placement: "bottomRight",
            duration: globalThis.UI_WARN_DISPLAY_TIME_SEC
        });
        
    }

    ok(msg: string, detail?: string): void {
        notification.success({
            message: msg,
            description: detail,
            placement: "bottomRight",
            duration: globalThis.UI_OK_DISPLAY_TIME_SEC
        });
    }
}
