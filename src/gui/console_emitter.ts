/**
 * A message emitter that emits message to console. Used for test & debug.
 */
export default class ConsoleEmitter implements MessageEmitter {
    err(msg: string, detail?: string): void {
        console.error("[ERROR]: " + msg);
        if (detail) {console.log("  " + detail);}
    }

    warn(msg: string, detail?: string): void {
        console.warn("[WARN]: " + msg);
        if (detail) {console.log("  " + detail);}
    }

    ok(msg: string, detail?: string): void {
        console.log("[OK]: " + msg);
        if (detail) {console.log("  " + detail);}
    }
}
