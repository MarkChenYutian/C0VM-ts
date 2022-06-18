export function on_clickflag(flag: string) {
    if (globalThis.COMPILER_FLAGS[flag]) {
        document.getElementById("compiler-flag" + flag).classList.remove("flag-selected");
    } else {
        document.getElementById("compiler-flag" + flag).classList.add("flag-selected");
    }
    globalThis.COMPILER_FLAGS[flag] = !globalThis.COMPILER_FLAGS[flag];
}

export function disable_ctrbtn(name: string) {
    const btn = document.getElementById("ctr-btn-" + name);
    btn.classList.contains("disable-btn") ? 0 : btn.classList.add("disable-btn");
}

export function enable_ctrbtn(name: string) {
    const btn = document.getElementById("ctr-btn-" + name);
    btn.classList.contains("disable-btn") ? btn.classList.remove("disable-btn") : 0;
}
