import { toBase64 } from "../utility/ui_utility";

interface RetrieveInterfaceResult {error: string, interface: string};

async function retrieve_interface(content: File): Promise<RetrieveInterfaceResult> {
    const stringify_content = await toBase64(content);
    const interface_result = await fetch(
        globalThis.COMPILER_BACKEND_URL + `interface?` + new URLSearchParams({
            content: stringify_content
        })
        , 
        {   method: "GET",
            cache: "no-cache",
            headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*"
        }}
    ).then(
        (res) => res.json()
    ).catch(
        (err: Error) => {
            return {error: "/* " + err.message + " */", interface: ""}
        }
    )
    return interface_result;
}


export default retrieve_interface
