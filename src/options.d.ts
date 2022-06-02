declare global {
    var DEBUG: boolean;
    var DEBUG_DUMP_MEM: boolean;

    var MEM_BLOCK_MAX_SIZE: number;

    var MEM_POOL_SIZE: number;
    var MEM_POOL_MIN_SIZE: number;
    var MEM_POOL_MAX_SIZE: number;
    var MEM_POOL_DEFAULT_SIZE: number;

    var UI_INUPUT_ID: string;
    var UI_PRINTOUT_ID: string;
    var UI_MSG_ID: string;

    var C0_RUNTIME: undefined | C0VM_RT;
    var MSG_EMITTER: MessageEmitter;
}

export {}
