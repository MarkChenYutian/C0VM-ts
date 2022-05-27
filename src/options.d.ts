declare const DEBUG = true;

declare const MEM_POOL_DEFAULT_SIZE = 51200;    // 1024 * 50
declare const MEM_POOL_MIN_SIZE = 0;            // 0
declare const MEM_POOL_MAX_SIZE = 0xFFFF_FFFE;
declare const MEM_BLOCK_MAX_SIZE = 0xFFFF;

declare global {
    var DEBUG: boolean;

    var MEM_BLOCK_MAX_SIZE: number;

    var MEM_POOL_MIN_SIZE: number;
    var MEM_POOL_MAX_SIZE: number;
    var MEM_POOL_DEFAULT_SIZE: number;
}

export {}
