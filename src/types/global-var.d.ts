declare global {
    var DEBUG: boolean;
    var DEBUG_DUMP_MEM: boolean;
    var DEBUG_DUMP_STEP: boolean;

    var MEM_BLOCK_MAX_SIZE: number;

    var MEM_POOL_SIZE: number;
    var MEM_POOL_MIN_SIZE: number;
    var MEM_POOL_MAX_SIZE: number;
    var MEM_POOL_DEFAULT_SIZE: number;

    var COMPILER_BACKEND_URL: string;
    var EDITOR_HIGHLIGHT_LINENUM: number;
    
    var UI_INPUT_ID: string;
    var UI_PRINTOUT_ID: string;
    var UI_MSG_ID: string;
    var UI_DEBUG_OUTPUT_ID: string;

    var UI_ERR_DISPLAY_TIME_SEC: number;
    var UI_WARN_DISPLAY_TIME_SEC: number;
    var UI_OK_DISPLAY_TIME_SEC: number;

    var C0_ENVIR_MODE: "web" | "nodejs";
    var C0_MAX_RECURSION: number;

    var MSG_EMITTER: MessageEmitter;
}

export {}
