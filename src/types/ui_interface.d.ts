interface C0VMApplicationState {
    EditorContent: string,
    PrintoutValue: string,
    C0Runtime: C0VM_RuntimeState | undefined,
    ShowCompilerOption: boolean,
    CompilerFlags: Record<string, boolean>
};

interface MainControlProps {
    isbc0: boolean,
    curr_content: string,
    curr_state: C0VM_RuntimeState | undfined,
    // update_state: (ns: Pick<C0VMApplicationState, keyof C0VMApplicationState>) => void
    update_state: (ns: C0RuntimeState | undefined) => void
    update_print: (ns: string) => void
    clear_print: () => void
};

interface CompilerOptionPropInterface {
    flag_state: Record<string, boolean>,
    flip_d_flag: () => void
};

interface C0OutputPropInterface {
    printContent: string
};