![image](https://user-images.githubusercontent.com/47029019/177197388-a7884f33-ae32-45bb-91de-139a8ff04cbf.png)

# 🤗 About C0VM.ts

> 🎉 C0VM.ts is now part of the Course infrastructure for **15-122 Principles of Imperative Computation**!
> 
> Visit us at: https://cs122.andrew.cmu.edu/visualc0/

This project is my project for Summer Undergraduate Research Fellowship (SURF) in CMU. More importantly, it's an attempt to improve students' 15-122 learning experience.

By employing various visualization and front-end technology, we made it possible to execute and visualize C0 Language on any device that supports modern browser. This project also allows instructors of 15-122 to embed runnable code exerciese in Learning Material System (LMS) like Canvas or Diderot thus creating a more interactive learning environment.

![image](https://user-images.githubusercontent.com/47029019/177198127-8f17d13b-e09f-4d1c-b214-b3bcad33e9ae.png)

# Features

![Slide2](https://user-images.githubusercontent.com/47029019/188786107-2c936dd6-f0c8-4102-9e97-f93d9c37dd39.png)
![Slide4](https://user-images.githubusercontent.com/47029019/188786411-43c66821-0f21-434f-a270-c0f500c5f5d2.png)
![Slide3](https://user-images.githubusercontent.com/47029019/188786109-3a2f0b60-d1ed-4edd-a8c8-74effcd206e2.png)
![Slide5](https://user-images.githubusercontent.com/47029019/188787516-47821a85-5cd3-4394-9b8a-318138442aa0.png)


# Developer Zone

## Documentation

Link: https://yutian-chen.gitbook.io/c0vm.ts-dev-documentation/

## Ongoing Developments 

<details>
<summary><b>C0VM.ts Main Functionality</b></summary>

- [ ] **Function**: Improve type inference system - allow struct on stack **[Breaking change required]**
- [ ] **Allocator**: Implement memory allocator with garbage collection. *(Nice to have)*
- [ ] **Error Msg**: Show readable error message on AADDS access out of bound.
<!-- - [x] **Error Handling**: Friendly Error Message
- [x] **Function**: Type Inference System during runtime
- [x] **Function**: Show local variable’s value during runtime
- [x] **Function**: `NativeIO::Readline`
- [x] **Debug**: Check the bug when running `buggy_SSA_test.bc0` problem.
- [x] **Parser**: Deal with “dummy return value” (occurs at `void` functions)
- [x] **Future**: Map the source code line number to bytecode line number **@Iliano**
- [x] **Type Inference**: Resolve `typedef` in C0 source code automatically
- [x] **Function**: Support `NativeParse` functions
- [x] **Function**: Partially support `NativeFloat` functions (`printint` and `printhex`)
- [x] **Debugger**: Add `Details` panel in debugger options. Show all C0VM details (`V`, `S`, etc.) -->
- [ ] **Function**: <del>Change `NativeIO::Readline` to `async` function</del>
- [ ] **Function**: <del>Heap allocator garbage collection based on ref count</del>

</details>

<details>
<summary><b>Debug Console</b></summary>

- [ ] **Debugger**: Add garbage collection sign (pacman)
- [ ] **Debugger**: Show pointer address on hover on struct component
- [ ] **Debugger**: When a function is called, display variable boxes for all of its local variables right away rather than incrementally (add the names as the declaration for them are executed) &rarr; CC0 will reuse variable slots, see Issue@34
- [ ] **Debugger**: Hide the detailed structure in `o0` and `o1` file.
<!-- - [x] **Debugger**: Store break point state when user switch between BC0 and C0 mode using `toJSON` and `fromJSON` serialization methods in CodeMirror.
- [x] **Debugger**: Show function call stack
- [x] **Debugger**: Show struct field value whenever possible
- [x] **Debugger**: Show array content (elements in `arr`) whenever possible
- [x] **Debugger**: change pointer value display
- [x] **Debugger**: Expand first level by default
- [x] **Debugger**: Make struct debug display more compact
- [x] **Debugger**: Add a button/arrow on func name collapse/expand
- [x] **Debugger**: When array is not initialized, it’s by default an empty array (currently displayed as NULL)
- [x] **Debugger**: Just show the function name on debug console (not `f main` as it currently shows)
- [x] **Debugger**: Darken breakpoint column on hover -->
- [ ] <del>**Debugger**: Add a "step over" option?</del>

</details>

<details>
<summary><b>C0VM.ts Backend Server</b></summary>

<!-- - [x] **Server**: Change the synchronous system-calls to `async`.
- [x] **Server**: Support the -d flag option
- [x] **Server**: Documentation of Compile-code API
- [x] **Server**: Extended Bytecode format to allow c0 - bc0 correspondence
- [x] **Server**: Fix domain name problem -->

</details>

<details>
<summary><b>UI/UX Enhancements</b></summary>

- [ ] **UI**: Flexible grid proportion (editor resize)
- [ ] **React**: Encapsulate the application using `shadowRoot` in HTML *(Nice to have)*
- [ ] **UI**: Garbage collection on graphical debug console &rarr; User click the isolated node to "collect" them.
<!-- - [x] **UX**: Shortcut key for Run and Step
- [x] **UX**: Auto Step - step the code with certain interval
- [x] **UX**: Settings - allow user to set interval
- [x] **UX**: Make it clear how to use breakpoint feature
- [x] **UI**: Replace the 🔴 Emoji for bp into CSS-based element
- [x] **UX**: Rename editor tab on <del>second-key click</del> double click
- [x] **UI**: Add gap between rows in `stacknode` of graphical debugger
- [x] **UI**: Add border to values in `stacknode`
- [x] **UI**: Optimize user workflow
- [x] **UI**: File import based on popup window dialog
- [x] **UI**: Enable/Disable buttons in main function area based on input area
- [x] **UI**: Fix CSS style of the react application page
- [x] **UI**: Right aligned variable names in stack
- [x] **UI**: Right aligned struct field names
- [x] **React**: Add breakpoint as a component state instead of global variable (which may lead to strange problems, sometimes toggled breakpoint does not work at all)
- [x] **React**: Add execution line (highlight line) as component state instead of global state -->

</details>

<details>
<summary><b>Feature Enhancements</b></summary>

<!-- - [x] **Feature**: Breakpoint, Step and Run
- [x] **Feature**: Show execution position
- [x] **Feature**: Compile Multiple Files
- [x] **Feature**: Compile with flags -->

</details>


<details>
<summary><b>Editor Enhancement</b></summary>

- [ ] **Syntax Highlighting**: Rewrite the parser generator profile to match with formal definition in `C0Reference.pdf`
- [ ] **Editor**: Import object file (`.o0` and `.o1` file)
- [ ] **Editor**: Jump to the line executing *(Nice to have)*
- [ ] **Editor**: Autocomplete for C0 Language *(Nice to have)*
<!-- - [x] **Editor**: Import project (folder)
- [x] **Editor**: Refresh & Render problem when scrolling
- [x] **Editor**: Syntax Highlighting (BC0)
- [x] **Editor**: Middle comment in BC0 in another color
- [x] **Editor**: Syntax Highlighting (C0)
- [x] **Editor**: Multiple File Editors (Tabs?)
- [x] **Syntax Highlighting**: Swap the syntax highlight between instruction and comment -->
- [ ] **Debug**: <del>Fix drag & drop import not working problem</del>
- [ ] **Editor**: <del>Replace Codemirror with Monaco https://microsoft.github.io/monaco-editor/</del>
- [ ] **Editor**: <del>Recover editor content based on `localStorage`</del>
- [ ] **Editor**: <del>Auto language-detection & switch</del>

</details>

