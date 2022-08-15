declare global {
    var C0VM_VERSION: string;               // Version number of C0VM Build
    var DEBUG: boolean;                     // Log debug information
    var DEBUG_DUMP_MEM: boolean;            // Dump the heap memory (arraybuffer) to console when init vm
    var DEBUG_DUMP_STEP: boolean;           // Log vital information (PC, V, S) of each step to console

    var MEM_BLOCK_MAX_SIZE: number;         // Maximum allowed size of one memory block

    var MEM_POOL_SIZE: number;              // Memory pool size (by default, bytes)
    var MEM_POOL_MIN_SIZE: number;          // Memory pool minimum size (bytes)
    var MEM_POOL_MAX_SIZE: number;          // Memory pool maximum size (bytes)
    var MEM_POOL_DEFAULT_SIZE: number;      // Default size of memory pool

    var COMPILER_BACKEND_URL: string;       // The URL for compile API
    
    var UI_EDITOR_THEME: "dark" | "light";  // Theme of code editors
    var UI_ERR_DISPLAY_TIME_SEC: number;    // How many time (sec) an err message will display
    var UI_WARN_DISPLAY_TIME_SEC: number;   // How many time (sec) a warn message will display
    var UI_OK_DISPLAY_TIME_SEC: number;     // How many time (sec) an OK mssage will display

    var C0_MAX_RECURSION: number;           // Maximum allowed recursion level for C0 runtime

    // Experimental features
    
    // Preserve state.TypeRecord when bytecode does not change on restart
    var EXP_PRESERVE_TYPE: boolean;

    var MSG_EMITTER: MessageEmitter;
}

export {}
