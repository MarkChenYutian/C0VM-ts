import Tutorial_RenameGif  from "../assets/tutorial_rename.gif";
import Tutorial_TabNames   from "../assets/Tab_Names.png";
import Tutorial_SortTabGif from "../assets/tutorial_sorttab.gif";
import Tutorial_SetBpGif   from "../assets/tutorial_setbp.gif";

import React, { useState } from "react";

import { Button, Checkbox, Divider, Image, Modal, Space, Tabs, Tooltip, Typography } from "antd";
import type { CheckboxChangeEvent } from "antd/es/checkbox";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBoltLightning, faClockRotateLeft, faGear, faPlay, faScrewdriverWrench, faStepForward } from "@fortawesome/free-solid-svg-icons";
import { ConfigConsumer, ConfigConsumerProps } from "antd/es/config-provider";

const {Link} = Typography;

const RenameEditor = 
    <>
        <p>To change file name, double click on the editor tab and enter the new file name. When finished, press <code>Enter</code> or click outside of editor tab.</p>
        <Image src={Tutorial_RenameGif} width="50%"/>
    </>;

const SortEditor = (languageName: string) => 
    <>
        <p>When compiling a {languageName} project, the order of files does matter.</p>
        <p>In C0VM.ts, the order of file names fed into <code>cc0</code> compiler is defined by the order of editor tabs. For instance, the following editor tab order:</p>
        <Image src={Tutorial_TabNames} width="50%"/>
        <p>corresponds to the following compilation command:</p>
        <pre>   cc0 tbuf.c0 tbuf-test.c0 tbuf-main.c0</pre>
        <p>By dragging editor tab around, you can change their order, thus change the how <code>cc0</code> compiles your files</p>
        <Image src={Tutorial_SortTabGif} width="50%"/>
    </>;

const Execution = (languageName: string) =>
    <>
        <p>
            To run a {languageName} program, you need to <Button size="middle"><FontAwesomeIcon icon={faScrewdriverWrench}/>&nbsp;Compile</Button> it first.
        </p>
        <p>
            If it compiles successfully, you can either press &nbsp;
            <Button type="primary" size="middle"><FontAwesomeIcon icon={faStepForward}/>&nbsp;Step</Button> 
            &nbsp;,&nbsp;
            <Button type="primary" size="middle"><FontAwesomeIcon icon={faPlay}/>&nbsp;Run</Button>
            &nbsp;or&nbsp;
            <Button type="primary" size="middle"><FontAwesomeIcon icon={faClockRotateLeft}/>&nbsp;AutoStep</Button>
            &nbsp;to execute the program.
        </p>
        <p>
            <b><FontAwesomeIcon icon={faStepForward}/>&nbsp;Step</b> Stepping means to execute <i>1 line</i> of program. Every time you press the <i>Step</i> button, one line of {languageName} code will be executed.
            <i>(Under current setting, 1 line of {languageName === "C0" ? "Source code" : "Bytecode"} will be executed)</i>
        </p>
        <p>
            <b><FontAwesomeIcon icon={faPlay}/>&nbsp;Run</b> Running means to execute the program until: 1. The program terminates (finished running) 2. The program prompts error 3. A breakpoint is met <span className="dbg-extra-information">(Breakpoint is explained next tab)</span>
        </p>
        <p>
            <b><FontAwesomeIcon icon={faClockRotateLeft}/>&nbsp;AutoStep</b> AutoStep also runs the program, but in a slower way - for instance, execute one step every 1.5 seconds (Slow mode) or .5 second (Fast mode). This can be helpful if you want to trace the program but don't want to press "Step" all the time. <br/> Specifically, you can set the time interval by adjusting the settings <FontAwesomeIcon icon={faGear}/> on the bottom-left of this page.
        </p>
        <p>
            When the program is running, you can always <b>Abort</b> the program to avoid dead loop or <b>pause the AutoStep</b> by pressing the <Button danger type="default"><FontAwesomeIcon icon={faBoltLightning}/>&nbsp;Abort</Button> button.
        </p>
        <p><i>Pro Tip: You can also trigger Step, AutoStep and Run using <code>ctrl + s</code>, <code>ctrl + t</code> and <code>ctrl + r</code> as keyboard shortcut!</i></p>
    </>;


const Breakpoint = (language: string) => 
    <> 
        <p>A breakpoint 🔴 is a marker for C0VM.ts to know where to pause execution.</p>
        <p>When Running or AutoStepping, if a line marked with 🔴 is reached, the C0VM.ts will pause automatically <b>before</b> executing that line so that you can use debug console to inspect the variables or check printout values etc.</p>
        <p>To set a breakpoint, click on the left of line number in code editor. To remove a breakpoint, click on the 🔴 again.</p>
        <Image src={Tutorial_SetBpGif} width="50%"/>
        {language === "C0" ? null : <p>
            <i>Pro Tip:</i> You can also set breakpoint on Bytecode editor!
        </p>}
    </>;


const About = 
    <>  
        <p>Welcome to the C0 Visualizer: a remarkable tool that originated from a simple idea conceived by <Link href="https://markchenyutian.github.io/blog/">Yutian</Link> in the summer of 2022. What began as a modest concept—a webpage for running C0 source code and obtaining standard outputs on web browsers—has since evolved into a great C0 visualizer. After a year of dedicated development and continuous improvement, we proudly present a platform that not only executes C0/C1 programs but also offers a plethora of useful debugging features like memory diagram, breakpoints and auto-stepping.</p>
        <p><Link href="https://www.cs.cmu.edu/~iliano/">Prof. Illiano</Link>, <Link href="http://www.cs.cmu.edu/~fp/">Prof. Pfenning</Link>, <Link href="https://www.cs.cmu.edu/~dilsun/">Prof. Dilsun</Link>, Many 122TAs, and some students have contributed a lot to this project by reporting bugs, brining up new feature request, and contributing codes. Without their help and contribution, I will never be able to finish this great project.</p>
        <br/>
        <p>If you are interested in becomming a developer / mainteiner in this project and have some basic knowledge about javascript & react, please do not hesitate to contact with Prof. Iliano!</p>
    </>;


function TutorialEditor(props: TutorialPanelProps & {themeColor: string | undefined}): JSX.Element {
    const [notAgain, setNotAgain] = useState<boolean>(false);

    const languageName = props.app_state.c0_only ? "C0" : "C0/BC0";

    const onCheckBoxChange = (e: CheckboxChangeEvent) => {
        setNotAgain(e.target.checked);
    };

    const onTutorialClose = () => {
        if (notAgain) {
            localStorage.setItem("hideTutorial", "true");
        }
        props.set_app_state({tutorialOn: false});
    }

    const editorTutorialTabItems = [
        {key: "rename", label: "Rename Tabs", children: RenameEditor},
        {key: "sort", label: "Sort Tabs", children: SortEditor(languageName)},
        {key: "execute", label: "Run Program", children: Execution(languageName)},
        {key: "breakpoint", label: "Use Breakpoint", children: Breakpoint(languageName)},
        {key: "about", label: "About", children: About}
    ]

    return (
    <Modal
        title={<h2>🎉 C0 Visualizer Tutorial</h2>}
        open={props.app_state.tutorialOn}
        closable={false}
        footer={[
            <Space key="actions" size="large">
                <Tooltip color={props.themeColor} title="Don't worry! You can always have them back by 'Reset Tutorial' in settings panel.">
                    <Checkbox key="hide" onChange={onCheckBoxChange}>Do not show again</Checkbox>
                </Tooltip>
                <Button key="confirm" type="primary" size="middle" onClick={onTutorialClose}>Got It!</Button>
            </Space>
        ]}
        width="70%"
        bodyStyle={{overflowY: "auto", maxHeight: "80%"}}
    >
        <Space size="small" direction="vertical">
            <div>
                <Tabs
                    items   ={editorTutorialTabItems}
                    type    ="card"
                    size    ="large"
                />
            </div>
            <Divider/>
        </Space>
    </Modal>
    );
}



export default function TutorialEditorWrapper(props: TutorialPanelProps) {
    return  <ConfigConsumer>
                {(value: ConfigConsumerProps) => <TutorialEditor {...props} themeColor={value.theme?.token?.colorPrimary}/>}
            </ConfigConsumer>;
};

