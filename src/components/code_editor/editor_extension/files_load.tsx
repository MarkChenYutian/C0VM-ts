import { Button, Modal, Typography } from "antd";
import React, { useState } from "react";

import { asyncLoadDirectory, asyncLoadExternalFile } from "./external_fs";
import { internal_error } from "../../../utility/errors";

const { Text } = Typography;
const regex_valid_cc0_command = /^\s*%\s*cc0/;

function onLoadProjectReadme(
    update_files: (tabs: CodeFile[]) => void,
) {
    asyncLoadExternalFile(".txt")
    .then(({ content }) => {
        const lines = content === undefined ? "" : content.split("\n");
        for (const line of lines) {
            if (!regex_valid_cc0_command.test(line)) continue;
            if (line.includes("-i") || line.includes("--interface")) continue;

            const files = line.split(" ").filter(f => f.endsWith(".c0") || f.endsWith(".c1") || f.endsWith(".o0") || f.endsWith(".o1"));
            let notSupportFlag = false;
            for (const file of files) notSupportFlag = notSupportFlag || file.endsWith(".o0") || file.endsWith(".o1");
            if (notSupportFlag) continue;

            if (files === undefined || files.length === 0) {
                globalThis.MSG_EMITTER.warn(
                    "Failed to load 15-122 Project",
                    "Did not find valid CC0 compile line in the *.txt file provided."
                )
                throw new internal_error("Failed to import 15-122 project (reason: Can't find cc0 compile line)");
            };
            return files;
        }
        globalThis.MSG_EMITTER.warn(
            "Failed to load 15-122 Project",
            "Did not find valid CC0 compile line in the *.txt file provided."
        )
        throw new internal_error("Failed to import 15-122 project (reason: Can't find cc0 compile line)");
    })
    .then((files) => {
        const code_files: CodeFile[] = files?.map((title) => {return {title: title, content: undefined}});
        update_files(code_files);
    })
    .catch((rej) => {
        if (DEBUG) console.error(rej);
    })
}

async function onLoadProjectCode(expectFiles: CodeFile[], setFiles: (fs: CodeFile[]) => void) {
    const readFiles = await asyncLoadDirectory();
    const expected_map = new Map<string, string | undefined>();
    for (const expect_file of expectFiles) {
        expected_map.set(expect_file.title, undefined);
    }
    for (const actual_file of readFiles) {
        if (!expected_map.has(actual_file.title)) continue;
        expected_map.set(actual_file.title, actual_file.content);
    }
    
    const resultFiles = [...expectFiles];
    for (let idx = 0; idx < resultFiles.length; idx ++) {
        resultFiles[idx].content = expected_map.get(resultFiles[idx].title);
    }
    setFiles(resultFiles);
}


const FilesLoad: React.FC<FilesLoadProps> = (props: FilesLoadProps) => {
    const [files, setFiles] = useState<CodeFile[]>([]);
    const showFileStatus = (loaded: boolean) => loaded ? <Text type="success">Loaded</Text> : <Text type="warning">Not Loaded</Text>;
    const notFinished = files.length !== 0 && files.reduce((prev, curr) => prev && curr.content !== undefined, true);    

    let content = null;
    let step = 0;
    if (files.length === 0) {
        step = 1;
        content = <>
            <p>To import a 15-122 project, please select the <code>README.txt</code> file using the upload button below</p>
            <div style={{display: "flex", flexDirection: "row-reverse"}}>
                <Button type="primary" size="large" onClick={() => {onLoadProjectReadme(setFiles)}}>Upload README</Button>
            </div>
            <hr/>
        </>
    } else {
        step = 2;
        content = <>
            <p>Successfully read the <code>*.txt</code> file selected. The compile line for project will be:</p>
            <pre>$cc0 {files.map(f => f.title).join(" ")}</pre>
            <p>Now, please select the folder containing the files listed below using the Upload button:</p>
            <div className="app-project-import-progress-grid">
                {files.map((file, idx) => <>
                    <span key={idx.toString() + "-code"}><code>{file.title}</code></span>
                    <div key={idx.toString() + "-stat"}>{showFileStatus(file.content !== undefined)}</div>
                </>)}
            </div>
            <div style={{display: "flex", flexDirection: "row-reverse"}}>
                <Button type="primary" size="large" onClick={() => {onLoadProjectCode(files, setFiles)}}>Upload Code</Button>
            </div>
            <hr/>
        </>;
    }

    return  <Modal
                open={props.show} maskClosable={false}
                onCancel={() => props.setShow(false)}
                onOk={() => {
                    props.setAllTabs(
                        files.map((f, idx) => {
                            return {title: f.title, content: (f.content as string), breakpoints: [], key: -1 * idx}
                        })
                    );
                    props.setShow(false);
                    props.setActiveEditor(0);
                }}
                okButtonProps={{disabled: !notFinished}}
                title={`15-122 Project Import Guide (Step ${step})`}
            >
                {content}
            </Modal>
}

export default FilesLoad;
