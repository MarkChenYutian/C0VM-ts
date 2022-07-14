import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGithub } from "@fortawesome/free-brands-svg-icons";


export default function C0VMApplicationFooter() {
    return (
        <footer>
            <div style={{display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap"}}>
                <ul>
                    <li>
                        <FontAwesomeIcon icon={faGithub}/> &nbsp;
                        <a href="https://github.com/MarkChenYutian/C0VM-ts">GitHub Repo</a></li>
                    <li>C0VM.ts, The C0 Virtual Machine on Modern Browser.</li>
                </ul>
                <p>Build Version: 0.2.1-alpha {globalThis.DEBUG ? "(debug mode)" : ""}</p>
            </div>
        </footer>
    );
}
