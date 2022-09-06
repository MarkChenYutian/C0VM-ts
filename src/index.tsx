import React from 'react';
import ReactDOM from 'react-dom/client';

import './index.less';
import 'antd/dist/antd.less';

import C0VMApplication from './application';
import AntdEmitter from './utility/antd_emitter';
import AppCrashFallbackPage from './components/app_crash_fallback';

// Global Variables
global.C0VM_VERSION = "0.2.10-alpha";

globalThis.DEBUG = true;
globalThis.DEBUG_DUMP_MEM = false;
globalThis.DEBUG_DUMP_STEP = false;

globalThis.MEM_POOL_SIZE = 1024 * 50;
globalThis.MEM_POOL_DEFAULT_SIZE = 1024 * 50;
globalThis.MEM_POOL_MAX_SIZE = 0xFFFF_FFFE;
globalThis.MEM_POOL_MIN_SIZE = 0x0000_0001;

globalThis.MEM_BLOCK_MAX_SIZE = 0xFFFF;

// For style specification only, writing to printout should be done
// by calling react hooks
globalThis.UI_EDITOR_THEME = "light";
globalThis.UI_ERR_DISPLAY_TIME_SEC = 5;
globalThis.UI_WARN_DISPLAY_TIME_SEC = 5;
globalThis.UI_OK_DISPLAY_TIME_SEC = 3;

globalThis.COMPILER_BACKEND_URL = "http://127.0.0.1:8000/compile";

globalThis.C0_MAX_RECURSION = 999;
globalThis.C0_TIME_SLICE = 500;
globalThis.C0_ASYNC_INTERVAL = 1;

globalThis.EXP_PRESERVE_TYPE = true;

if (globalThis.MSG_EMITTER === undefined) {
  globalThis.MSG_EMITTER = new AntdEmitter();
}
//

const htmlRoots = document.querySelectorAll('#c0vm-root') as NodeListOf<HTMLElement>;

htmlRoots.forEach(
  (htmlRoot) => {
    const root = ReactDOM.createRoot(htmlRoot);
    
    const displayModeContext: React.Context<ApplicationContextInterface> = React.createContext<ApplicationContextInterface>({
      mode: htmlRoot.dataset["mode"] === "full-page" ? "full-page" : "embeddable",
      std_out: htmlRoot.dataset["stdoutput"] === "on",
      debug_console: htmlRoot.dataset["debugconsole"] === "on"
    });
    
    C0VMApplication.contextType = displayModeContext;
    AppCrashFallbackPage.contextType = displayModeContext;
    
    root.render(
      <React.StrictMode>
        <C0VMApplication/>
      </React.StrictMode>
    );
  }
);

