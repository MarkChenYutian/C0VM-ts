import init_runtime from "./web_runtime_init";

/**
 * Compile the given C0 Source code in backend server and load the 
 * compiled bytecode into C0_RUNTIME accordingly.
 * 
 * @param s The C0 Source code string to be compiled
 */
export function compile(s: string): void {
    fetch(globalThis.COMPILER_BACKEND_URL, {
            method: "POST",
            cache: "no-cache",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                "code": s,
                "d-flag": globalThis.COMPILER_FLAGS["-d"]
            }),
        }
    ).then(
        (res) => res.json()
    ).then(
        (res) => {
            init_runtime(res.bytecode);
        }
    ).catch(
        (e) => {
            if (globalThis.DEBUG) console.error(e);
            globalThis.MSG_EMITTER.err(
                "Failed to compile given C0 code",
                (e as Error).message
            );
        }
    )
}
