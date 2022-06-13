export function tab_event_capture() {
    let inputelem = (document.getElementById(globalThis.UI_INPUT_ID) as HTMLTextAreaElement);
    inputelem.addEventListener(
        'keydown', (e) => {
            if (e.key == 'Tab') {
                e.preventDefault();
                const start = inputelem.selectionStart;
                const end = inputelem.selectionEnd;
                inputelem.value = inputelem.value.substring(0, start) + "    " + inputelem.value.substring(end,);
                inputelem.selectionStart = inputelem.selectionEnd = start + 4;
                
            }
        }
    )
}
