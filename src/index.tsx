import React from 'react';
import { createRoot } from 'react-dom/client';

import './index.css';
import './application.css';
import './embeddable.css';
import 'antd/dist/reset.css'
import 'reactflow/dist/style.css';
import { ConfigProvider } from 'antd';

import C0VMApplication from './application';
import AntdEmitter from './utility/antd_emitter';

// Global Variables
global.C0VM_VERSION = "1.2.0";

globalThis.DEBUG = false;
globalThis.DEBUG_DUMP_MEM = false;
globalThis.DEBUG_DUMP_STEP = false;

globalThis.MEM_POOL_SIZE = 1024 * 100;
globalThis.MEM_POOL_DEFAULT_SIZE = 1024 * 100;
globalThis.MEM_POOL_MAX_SIZE = 0xFFFF_FFFE;
globalThis.MEM_POOL_MIN_SIZE = 0x0000_0001;

globalThis.MEM_BLOCK_MAX_SIZE = 0xFFFF;

globalThis.COMPILER_BACKEND_URL = "https://cs122.andrew.cmu.edu/visualc0/";

globalThis.C0_MAX_RECURSION = 999;
globalThis.C0_TIME_SLICE = 500;
globalThis.C0_ASYNC_INTERVAL = 1;
globalThis.AUTOSTEP_INTERVAL = "Slow";

if (globalThis.MSG_EMITTER === undefined) {
  globalThis.MSG_EMITTER = new AntdEmitter();
}
//

const htmlRoots = document.querySelectorAll('#c0vm-root') as NodeListOf<HTMLElement>;

htmlRoots.forEach(
  (htmlRoot) => {
    const root = createRoot(htmlRoot);

    const displayMode = htmlRoot.dataset["mode"] === "full-page" ? "full-page" : "embeddable";
    const showStdOut  = htmlRoot.dataset["stdoutput"] === "on";
    const showDebug   = htmlRoot.dataset["debugconsole"] === "on";
    
    root.render(
      <React.StrictMode>
        <ConfigProvider theme={{token: {colorPrimary: "#3577C1"}}}>
        <C0VMApplication displayMode={displayMode} showStdOut={showStdOut} showDebug={showDebug}/>
        </ConfigProvider>
      </React.StrictMode>
    );
  }
);

