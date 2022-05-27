export default class ConsoleEmitter implements MessageEmitter {
    err(msg: string, detail?: string): void {
        console.log("[ERROR]: " + msg);
        if (detail) {console.log("  " + detail);}
    }

    warn(msg: string, detail?: string): void {
        console.log("[WARN]: " + msg);
        if (detail) {console.log("  " + detail);}
    }

    ok(msg: string, detail?: string): void {
        console.log("[OK]: " + msg);
        if (detail) {console.log("  " + detail);}
    }
}
