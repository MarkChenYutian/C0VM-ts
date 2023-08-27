import { toBase64 } from "../utility/ui_utility";

interface RetrieveContentResult {error: string, result: string};

async function retrieve_content(content: File): Promise<RetrieveContentResult> {
    const stringify_content = await toBase64(content);
    const content_result = await fetch(
        globalThis.COMPILER_BACKEND_URL + `decode?` + new URLSearchParams({
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
    return content_result;
}


export default retrieve_content
