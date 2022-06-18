import init_runtime from "./web_runtime_init";

export function compile(s: string, flags: string[]): void {
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
            globalThis.MSG_EMITTER.err(
                "Failed to compile given C0 code",
                (e as Error).message
            );
        }
    )
}
