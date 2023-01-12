import React from "react";
import "./application.less";
import "./embeddable.less";

import MainControlBar from "./components/main-control-bar";
import C0VMApplicationFooter from "./components/main-footer";
import C0Output from "./components/c0-output";
import DebugConsole from "./components/debug_console/debug_console";
import CodeEditor from "./components/code-editor";
import AppCrashFallbackPage from "./components/app_crash_fallback";
import SettingPopup from "./components/settings";
import { Row, Col } from "antd";
import * as VM from "./vm_core/vm_interface";

// import ApplicationContextInterface from "types/react-interface.js";

export default class C0VMApplication extends React.Component<
    {},
    C0VMApplicationState
> {
    constructor(props: {}) {
        super(props);
        console.log("C0VMApplicaiton state initialized");
        this.state = {
            crashed        : false,
            c0_only        : false,
            contentChanged : false,
            dbgFullScreen  : false,
            settingMenuOn  : false,
            
            BC0SourceCode: "",
            BC0BreakPoints: new Set(),
            TypedefRecord: new Map(),

            C0Editors: [{ title: "Untitled_0.c0", key: 0, content: "", breakpoints: []}],
            ActiveEditor: 0,

            PrintoutValue: "",

            C0Running: false,
            C0Runtime: undefined,
            CompilerFlags: { d: false },
        };
        this.handleShortCut();
    }

    handleShortCut(){
        document.addEventListener('keydown',(e)=>{
            if (e.key === "s" || e.key==='S'){
                console.log('Run mainControlBar_step...');
                this.mainControlBar_step();
            }
        });
    }

    async mainControlBar_step(){
        const oldS = this.state;

        const print_update = (str:string) => this.setState
        (
            (oldState) => {return {PrintoutValue: oldState.PrintoutValue+str}}
        );
        if (this.state.contentChanged){console.log("code content changed after creating print_update")};
        if (oldS!== this.state) {console.log("print_update modified state")};
        
        const clear_print = () => this.setState({PrintoutValue: ""});
        if (this.state.contentChanged){console.log("code content changed after creating print_clear")};
        if (oldS!== this.state) {console.log("clear_print modified state")};
        
        if (this.state.contentChanged){
            RequiresRecompile();
            return;
        }
        let new_runtime, can_continue = undefined;
        let init_state;
        if (this.state.C0Runtime === undefined){
            init_state = await VM.initialize(this.state.BC0SourceCode, clear_print,this.state.C0Editors, this.state.TypedefRecord,print_update,MEM_POOL_SIZE); 
            if (init_state === undefined) return;
            console.log("state initialized");
            if (this.state.contentChanged){console.log("code content changed after initialization")};
            [new_runtime, can_continue] = await VM.step(init_state, this.state.c0_only, print_update);
            console.log("first step completed");
            if (this.state.contentChanged){console.log("code content changed after first step")};
        } else {
            console.log("stepping...");
            [new_runtime, can_continue] = await VM.step(this.state.C0Runtime, this.state.c0_only, print_update);
            if (this.state.contentChanged){console.log("code content changed after stepping")};
        }
        if (!can_continue) this.setState({C0Runtime: undefined});
        else this.setState({C0Runtime: new_runtime});
    }

    async mainControlBar_run(){
        const [abortSignal, abort, reset] = AbortRef();

        const print_update = (str:string) => this.setState
        (
            (oldState) => {return {PrintoutValue: oldState.PrintoutValue+str}}
        );
        if (this.state.contentChanged){console.log("code content changed after creating print_update")};
        //if (oldS!== this.state) {console.log("print_update modified state")};
        
        const clear_print = () => this.setState({PrintoutValue: ""});
        if (this.state.contentChanged){console.log("code content changed after creating print_clear")};
        //if (oldS!== this.state) {console.log("clear_print modified state")};
        
        if (this.state.contentChanged){
            RequiresRecompile();
            return;
        }
        let new_runtime, can_continue = undefined;
        let init_state;
        if (this.state.C0Runtime === undefined){
            init_state = await VM.initialize(this.state.BC0SourceCode, clear_print,this.state.C0Editors, this.state.TypedefRecord,print_update,MEM_POOL_SIZE); 
            if (init_state === undefined) return;
            console.log("state initialized");
            
            [new_runtime, can_continue] = await VM.step(init_state, this.state.c0_only, print_update);
            console.log("first step completed");
            
        } else {
            init_state = this.state.C0Runtime;
        }
        const c0BreakPoint = new Set<string>();
        for (let i = 0; i < this.state.C0Editors.length; i ++){
            const currentEditor = this.state.C0Editors[i];
            for (let j = 0; j < currentEditor.breakpoints.length; j ++){
                c0BreakPoint.add(`${currentEditor.title}@${currentEditor.breakpoints[j].line}`);
            }
        }
        const bc0BreakPointArr = Array.from(this.state.BC0BreakPoints).map(bp => bp.line);
        const bc0BreakPoints = new Set(bc0BreakPointArr);
        this.setState({C0Running: true});

        const run_result = await VM.run(
            init_state,
            bc0BreakPoints,
            c0BreakPoint,
            abortSignal,
            reset,
            print_update,
            s => this.setState({C0Runtime: s})
        );

        [new_runtime, can_continue] = [undefined, undefined];
        if (typeof run_result !== "undefined") {
            [new_runtime, can_continue] = run_result;
        }

        this.setState({C0Running: false});

        // Program complete execution
        if (!can_continue) this.setState({C0Runtime: undefined});

        // Program can still step in future, now paused due to breakpoint
        else this.setState({C0Runtime: new_runtime});
    }

    async mainControlBar_autoStep(){
        const [abortSignal, abort, reset] = AbortRef();
        const print_update = (str:string) => this.setState
        (
            (oldState) => {return {PrintoutValue: oldState.PrintoutValue+str}}
        );
        const clear_print = () => this.setState({PrintoutValue: ""});

        const autoStep_c0runtime = async() => 
        {
            if (this.state.contentChanged){
                RequiresRecompile();
                return;
            }
        
            let init_state = undefined;
            if (this.state.C0Runtime === undefined){
                init_state = await VM.initialize(this.state.BC0SourceCode, clear_print,this.state.C0Editors, this.state.TypedefRecord,print_update,MEM_POOL_SIZE); 
                if (init_state === undefined) return;
            } else {
                init_state = this.state.C0Runtime;
            }
            const c0BreakPoint = new Set<string>();
            for (let i = 0; i < this.state.C0Editors.length; i ++){
                const currentEditor = this.state.C0Editors[i];
                for (let j = 0; j < currentEditor.breakpoints.length; j ++){
                    c0BreakPoint.add(`${currentEditor.title}@${currentEditor.breakpoints[j].line}`);
                }
            }

            const bc0BreakPointArr = Array.from(this.state.BC0BreakPoints).map(bp => bp.line);
            const bc0BreakPoints = new Set(bc0BreakPointArr);

            this.setState({C0Running: true});

            VM.autoStep(
                init_state,
                bc0BreakPoints,
                c0BreakPoint,
                abortSignal,
                this.state.c0_only,
                reset,
                print_update,
                s => this.setState({C0Runtime: s}),
                () => this.setState({C0Running: false})
            )
        }
    }


    render() {
        if (this.state.crashed) {
            return (
                <AppCrashFallbackPage
                    state={this.state}
                    setState={(ns) => this.setState(ns)}
                />
            );
        }

        const context: ApplicationContextInterface = this
            .context as ApplicationContextInterface;

        const MainControlBarComponent = (
            <MainControlBar
                application_state   ={this.state}
                set_app_state       ={(s) => this.setState(s)}
                step                ={() => this.mainControlBar_step()}
                run                 ={() => this.mainControlBar_run()}
            />
        );

        const StandardOutputComponent = context.std_out ? (
            <C0Output printContent={this.state.PrintoutValue} />
        ) : null;

        const DebugConsoleComponent = context.debug_console ? (
            <DebugConsole 
                state={this.state.C0Runtime}
                c0_only={this.state.c0_only}
                isFullScreen={this.state.dbgFullScreen}
                typedef={this.state.TypedefRecord}
                setFullScreen={(s) => this.setState({dbgFullScreen: s})}
            />
        ) : null;

        const SettingMenuComponent =  this.state.settingMenuOn ? 
            <SettingPopup state={this.state} set_app_state={(ns) => this.setState(ns)}/>
            : null;

        if (this.state.dbgFullScreen) {
            return <div className="page-framework">
                {SettingMenuComponent}
                {MainControlBarComponent}
                <div className="main-ui-framework">
                    {DebugConsoleComponent}
                </div>
                <C0VMApplicationFooter state={this.state} open_setting={() => this.setState({settingMenuOn: true})}/>
            </div>;
        }

        return (
            <div className="page-framework">
                {SettingMenuComponent}
                {MainControlBarComponent}
                <Row className="main-ui-framework">
                    <Col xs={24} sm={12} lg={11} xxl={9}>
                        <CodeEditor
                            app_state={this.state}
                            set_app_state={(ns: any) => this.setState(ns)}
                        />
                    </Col>
                    <Col xs={24} sm={12} lg={13} xxl={15} className="io-area">
                        {StandardOutputComponent}
                        {DebugConsoleComponent}
                    </Col>
                </Row>
                <C0VMApplicationFooter state={this.state} open_setting={() => this.setState({settingMenuOn: true})}/>
            </div>
        );
    }

    is_bc0_content(s: string): boolean {
        return s.slice(0, 11).toUpperCase() === "C0 C0 FF EE";
    }

    componentDidCatch(error: Error | null): void {
        if (globalThis.DEBUG) console.error(error);
        globalThis.MSG_EMITTER.err(
            "Internal User Interface Error",
            error === null ? undefined : error.message
        );
        this.setState({ crashed: true });
    }

}

function AbortRef(): [{abort: boolean}, () => void, () => void] {
    const token = React.useRef({abort: false});
    const cancel = () => {token.current.abort = true;}
    const reset  = () => {token.current.abort = false;}
    return [token.current, cancel, reset];
}

function RequiresRecompile(){
    globalThis.MSG_EMITTER.warn(
        "Requires Recompile",
        "The content in code editor has been changed. Recompile the code before executing the program."
    );
}
// function autoStepShortcut(props: C0VMApplication){
//     useEffect(() => {
//         document.addEventListener('keydown',detectKeyDown, true)
//     }, [])

//     const detectKeyDown = (e: KeyboardEvent) => {
//         console.log('Clicked key: ', e.key); 
//     };
// }

// export function C0VMApplicationFn() {
//     const [crashed, setCrashed] = useState(false);
//     const [c0_only, setC0_only] = useState(false);
//     const [contentChanged,setContentChanged] = useState(true);
//     const [dbgFullScreen, setDbgFullScreen] = useState(false);
//     const [settingMenuOn, setSettingMenuOn] = useState(false);

//     const [BC0SourceCode, setBC0SourceCode] = useState("");
//     const [BC0BreakPoints, setBC0BreakPoints] = useState(new Set());
//     const [TypedefRecord, setTypedefRecord] = useState(new Map());

//     const [C0Editors, setC0Editors] = useState([{ title: "Untitled_0.c0", key: 0, content: "", breakpoints: []}])
//     const [ActiveEditor, setActiveEditor] = useState(0);

//     const [PrintoutValue, setPrintoutValue] = useState("");

//     const [C0Running, setC0Running] = useState(false);
//     const [C0Runtime, setC0Runtime] = useState(undefined);
//     const [CompilerFlags, setCompilerFlags] = useState({ d: false });
    

//     if (crashed){
//         return (
//             <AppCrashFallbackPage
//                 state={this.state}
//                 setState={(ns) => this.setState(ns)}
//         />
//         );
//     }

//     const context: ApplicationContextInterface = context as ApplicationContextInterface;

//     const MainControlBarComponent = (
//         <MainControlBar
//             application_state   ={this.state}
//             set_app_state       ={(s) => this.setState(s)}
//         />
//     );

//     const is_bc0_content = (s: string) => {{
//         return s.slice(0, 11).toUpperCase() === "C0 C0 FF EE"};
//     }

//     const componentDidCatch = (error: Error | null) => {
//         if (globalThis.DEBUG) console.error(error);
//         globalThis.MSG_EMITTER.err(
//             "Internal User Interface Error",
//             error === null ? undefined : error.message
//         );
//         setCrashed(true);
//     }
// } 