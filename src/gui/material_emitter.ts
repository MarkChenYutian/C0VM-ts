/**
 * A message emitter that will emit message with Material UI
 */
export default class MaterialEmitter implements MessageEmitter {
  private msg_counter: number;
  private msg_root: HTMLElement;

  constructor() {
    this.msg_counter = 0;
    this.msg_root = document.getElementById(globalThis.UI_MSG_ID);
  }

  // Construct HTML element with more ease
  private createElement(
    tagName: string,
    attrs = {},
    ...children: any[]
  ): HTMLElement {
    const elem = Object.assign(document.createElement(tagName), attrs);
    for (const child of children) {
      if (Array.isArray(child)) elem.append(...child);
      else elem.append(child);
    }
    return elem;
  }

  err(msg: string, detail?: string): void {
    if (globalThis.DEBUG) {
      console.error(msg, "\n", detail);
    }
    const tobe_removed_id = "message-id-" + this.msg_counter;
    const new_msg = this.createElement(
      "div",
      {
        id: tobe_removed_id,
        className: "err-msg",
      },
      detail === undefined
        ? [
          this.createElement("h4", {}, [
            this.createElement("i", {
              className: "fas fa-exclamation-circle",
              style: "color: rgb(239, 83, 80);"
            }), "   ",
            msg
          ])
        ]
        : [
          this.createElement("h4", {}, [
            this.createElement("i", {
              className: "fas fa-exclamation-circle",
              style: "color: rgb(239, 83, 80);"
            }), "   ",
            msg
          ]),
          this.createElement("p", {}, detail),
        ]
    );
    this.msg_root.appendChild(new_msg);

    // Remove this message after 4000ms.
    setTimeout(() => {
      const pending_remove = document.querySelector("div#" + tobe_removed_id) as HTMLElement;
      pending_remove.parentNode.removeChild(pending_remove);
    }, globalThis.UI_ERR_DISPLAY_TIME_MS);
    this.msg_counter++;
  }

  warn(msg: string, detail?: string): void {
    const tobe_removed_id = "message-id-" + this.msg_counter;
    const new_msg = this.createElement(
      "div",
      {
        id: tobe_removed_id,
        className: "warn-msg",
      },
      detail === undefined
        ? [
          this.createElement("h4", {}, [
            this.createElement("i", {
              className: "fas fa-exclamation-triangle",
              style: "color: rgb(255, 152, 0);"
            }), "   ",
            msg
          ])
        ]
        : [
          this.createElement("h4", {}, [
            this.createElement("i", {
              className: "fas fa-exclamation-triangle",
              style: "color: rgb(255, 152, 0);"
            }), "   ",
            msg
          ]),
          this.createElement("p", {}, detail),
        ]
    );
    this.msg_root.appendChild(new_msg);

    // Remove this message after 4000ms.
    setTimeout(() => {
      const pending_remove = document.querySelector("div#" + tobe_removed_id) as HTMLElement;
      pending_remove.parentNode.removeChild(pending_remove);
    }, globalThis.UI_WARN_DISPLAY_TIME_MS);
    this.msg_counter++;
  }
  //   <i class="fas fa-check-circle"></i>
  ok(msg: string, detail?: string): void {
    const tobe_removed_id = "message-id-" + this.msg_counter;
    const new_msg = this.createElement(
      "div",
      {
        id: tobe_removed_id,
        className: "ok-msg",
      },
      detail === undefined
        ? [
          this.createElement("h4", {}, [
            this.createElement("i", {
              className: "fas fa-check-circle",
              style: "color: rgb(76, 175, 80);"
            }), "   ",
            msg
          ])
        ]
        : [
          this.createElement("h4", {}, [
            this.createElement("i", {
              className: "fas fa-check-circle",
              style: "color: rgb(76, 175, 80);"
            }), "   ",
            msg
          ]),
          this.createElement("p", {}, detail),
        ]
    );
    this.msg_root.appendChild(new_msg);

    // Remove this message after UI_OK_DISPLAY_TIME_MS.
    setTimeout(() => {
      const pending_remove = document.querySelector("div#" + tobe_removed_id) as HTMLElement;
      pending_remove.parentNode.removeChild(pending_remove);
    }, globalThis.UI_OK_DISPLAY_TIME_MS);
    this.msg_counter++;
  }
}
