export default function C0VMApplicationFooter() {
    return (
        <footer>
            <div style={{display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap"}}>
                <p>C0VM.ts, The C0 Runtime on browser</p>
                <p>V{globalThis.C0VM_VERSION} {globalThis.DEBUG ? "(Debug)" : ""}</p>
            </div>
        </footer>
    );
}
