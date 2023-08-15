import { internal_error } from "../../../utility/errors";

function _loadExternalFile(F: File): Promise<ExternalFile> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onloadend = () => {
            if (reader.result === null) throw new internal_error("Failed to read input file");
            return resolve({title: F.name, content: reader.result.toString()});
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
            _loadExternalFile(F).then(resolve);
        }

        const inputElem = document.createElement("input");
        inputElem.type = "file";
        inputElem.accept = accept_format;
        inputElem.onchange = (e) => resolveLoadFile(e);
        inputElem.click();
    });
}

export async function asyncLoadDirectory(): Promise<ExternalFile[]> {
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
                
                const result: ExternalFile[] = [];

                for (let i = 0; i < fileList.length; i ++) {
                    const F = await _loadExternalFile(fileList[i]);
                    result.push(F);
                }

                resolve(result);
            }
        );
        hidden_elem.click();
    });
}
