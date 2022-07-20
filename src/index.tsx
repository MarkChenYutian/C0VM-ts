import React from 'react';
import ReactDOM from 'react-dom/client';

import './index.css';
import "antd/lib/result/style/index.css";
import "antd/lib/tabs/style/index.css";
import "antd/lib/notification/style/index.css";
import "antd/lib/switch/style/index.css";

import C0VMApplication from './application';
import AntdEmitter from './utility/antd_emitter';

// Global Variables
globalThis.DEBUG = true;
globalThis.DEBUG_DUMP_MEM = false;
globalThis.DEBUG_DUMP_STEP = false;

globalThis.MEM_POOL_SIZE = 1024 * 50;
globalThis.MEM_POOL_DEFAULT_SIZE = 1024 * 50;
globalThis.MEM_POOL_MAX_SIZE = 0xFFFF_FFFE;
globalThis.MEM_POOL_MIN_SIZE = 0x0000_0001;

globalThis.MEM_BLOCK_MAX_SIZE = 0xFFFF;

globalThis.EDITOR_BREAKPOINTS = new Set<number>();
globalThis.EDITOR_HIGHLIGHT_LINENUM = 0;

globalThis.UI_INPUT_ID = "c0-code-input";

// For style specification only, writing to printout should be done
// by calling react hooks
globalThis.UI_PRINTOUT_ID = "c0-output";

globalThis.UI_MSG_ID = "message-terminal";
globalThis.UI_DEBUG_OUTPUT_ID = "debug-output";

globalThis.UI_ERR_DISPLAY_TIME_SEC = 4;
globalThis.UI_WARN_DISPLAY_TIME_SEC = 4;
globalThis.UI_OK_DISPLAY_TIME_SEC = 1;

globalThis.COMPILER_BACKEND_URL = "http://172.18.90.173:8081/compile";

globalThis.C0_ENVIR_MODE = "web";
globalThis.C0_MAX_RECURSION = 999;

globalThis.MSG_EMITTER = new AntdEmitter();
//


const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <C0VMApplication/>
  </React.StrictMode>
);
