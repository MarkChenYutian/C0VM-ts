import { internal_error } from "../../../utility/errors";

type LoadInstruction = { "binary": string[], "text": string[] }

function _loadExternalFile(F: File, get_path: boolean): Promise<ExternalFile> {
    return new Promise((resolve) => {
        const reader = new FileReader();

        reader.onloadend = () => {
            if (reader.result === null) throw new internal_error("Failed to read input file");
            if (get_path) {
                const raw_path = F.webkitRelativePath;
                return resolve({path: raw_path.split("/").slice(1,undefined).join("/"), content: reader.result.toString()});
            } else {
                return resolve({path: F.name, content: reader.result.toString()});
            }
        };
        reader.readAsText(F, "utf-8");
    })
}

export function asyncLoadExternalFile(accept_format: string): Promise<ExternalFile> {
    return new Promise((resolve, reject) => {
        function resolveLoadFile(e: Event) {
            if (e.target === null) {
                return reject(new internal_error("Failed to read input file"));
            }
            const fileList = (e.target as HTMLInputElement).files;
            if (fileList === null) {
                return reject(new internal_error("Failed to read input file"));
            }

            const F = fileList[0];
            _loadExternalFile(F, false).then(resolve);
        }

        const inputElem = document.createElement("input");
        inputElem.type = "file";
        inputElem.accept = accept_format;
        inputElem.onchange = (e) => resolveLoadFile(e);
        inputElem.click();
    });
}

export async function asyncLoadDirectory(accepted_format: LoadInstruction): Promise<GeneralExternalFile[]> {
    return new Promise((resolve, reject) => {
        const hidden_elem = document.createElement("input");
        hidden_elem.type = "file";
        hidden_elem.webkitdirectory = true;
        hidden_elem.multiple = true;
        hidden_elem.addEventListener(
            "change", 
            async (event: Event) => {
                if (event.target === null) {
                    return reject(new internal_error("Failed to read input file"));
                }
                const fileList = (event.target as HTMLInputElement).files;
                if (fileList === null) {
                    return reject(new internal_error("Failed to read input file"));
                }
                
                const result: GeneralExternalFile[] = [];

                for (let i = 0; i < fileList.length; i ++) {
                    const suffix = fileList[i].name.split(".").at(-1);
                    if (suffix !== undefined && accepted_format.text.includes(suffix)){
                        const F = await _loadExternalFile(fileList[i], true);
                        result.push(F);
                    } else if (suffix !== undefined && accepted_format.binary.includes(suffix)) {
                        const F = fileList[i]
                        const path = F.webkitRelativePath;
                        result.push({path: path.split("/").slice(1,).join("/"), content: F})
                    }
                }
                resolve(result);
            }
        );
        hidden_elem.click();
    });
}
