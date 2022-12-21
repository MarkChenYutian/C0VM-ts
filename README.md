![image](https://user-images.githubusercontent.com/47029019/177197388-a7884f33-ae32-45bb-91de-139a8ff04cbf.png)

# About

This project is my project for Summer Undergraduate Research Fellowship (SURF) in CMU. More importantly, it's an attempt to improve students' 15-122 learning experience.

By employing various visualization and front-end technology, we make it possible to execute and visualize C0 Language on any device that supports modern browser. This project also allows instructors of 15-122 to embed runnable code exerciese in Learning Material System (LMS) like Canvas or Diderot thus creating a more interactive learning environment.

![image](https://user-images.githubusercontent.com/47029019/177198127-8f17d13b-e09f-4d1c-b214-b3bcad33e9ae.png)

See the demo of this project at: https://markchenyutian.github.io/C0VM-ts/build/

# Features

![Slide2](https://user-images.githubusercontent.com/47029019/188786107-2c936dd6-f0c8-4102-9e97-f93d9c37dd39.png)
![Slide3](https://user-images.githubusercontent.com/47029019/188786109-3a2f0b60-d1ed-4edd-a8c8-74effcd206e2.png)
![Slide4](https://user-images.githubusercontent.com/47029019/188786411-43c66821-0f21-434f-a270-c0f500c5f5d2.png)
![Slide5](https://user-images.githubusercontent.com/47029019/188787516-47821a85-5cd3-4394-9b8a-318138442aa0.png)

# User Manual

Link: https://yutian-chen.gitbook.io/c0vm.ts-dev-documentation/user-manual/user-manual

# Developer Documentation

Link: https://yutian-chen.gitbook.io/c0vm.ts-dev-documentation/

# Ongoing Developments 

## C0VM.ts Main Functionality

- [ ] **Error Handling**: Friendly Error Message
- [ ] **Function**: Improve type inference system - allow struct on stack **[Breaking change required]**
- [ ] **Function**: <del>Change `NativeIO::Readline` to `async` function</del>
- [x] **Function**: Type Inference System during runtime
- [x] **Function**: Show local variable’s value during runtime
- [x] **Function**: `NativeIO::Readline`
- [x] **Debug**: Check the bug when running `buggy_SSA_test.bc0` problem.
- [x] **Parser**: Deal with “dummy return value” (occurs at `void` functions)
- [x] **Future**: Map the source code line number to bytecode line number **@Iliano**
- [x] **Type Inference**: Resolve `typedef` in C0 source code automatically
- [x] **Function**: Support `NativeParse` functions
- [x] **Function**: Partially support `NativeFloat` functions (`printint` and `printhex`)
- [x] **Debugger**: Add `Details` panel in debugger options. Show all C0VM details (`V`, `S`, etc.)
- [ ] <del>**Function**: Heap allocator garbage collection based on ref count</del>

## UI/UX Enhancements

- [ ] **UX**: Shortcut key for Run and Step
- [ ] **UX**: Auto Step - step the code with certain interval
- [ ] **UX**: Settings - allow user to set interval
- [ ] **UX**: Make it clear how to use breakpoint feature
- [ ] **UI**: Replace the 🔴 Emoji for bp into CSS-based element
- [ ] **UX**: Rename editor tab on second-key click
- [ ] **UI**: flexible grid proportion *(Nice to have)*
- [ ] **React**: Encapsulate the application using `shadowRoot` in HTML *(Nice to have)*
- [x] **UI**: Add gap between rows in `stacknode` of graphical debugger
- [x] **UI**: Add border to values in `stacknode`
- [x] **UI**: Optimize user workflow
- [x] **UI**: File import based on popup window dialog
- [x] **UI**: Enable/Disable buttons in main function area based on input area
- [x] **UI**: Fix CSS style of the react application page
- [x] **UI**: Right aligned variable names in stack
- [x] **UI**: Right aligned struct field names
- [x] **React**: Add breakpoint as a component state instead of global variable (which may lead to strange problems, sometimes toggled breakpoint does not work at all)
- [x] **React**: Add execution line (highlight line) as component state instead of global state

## Debug Console

- [ ] **Debugger**: Show pointer address on hover on struct component
- [ ] **Debugger**: Store break point state when user switch between BC0 and C0 mode using `toJSON` and `fromJSON` serialization methods in CodeMirror.
- [ ] **Debugger**: Add garbage collection sign (pacman)
- [x] **Debugger**: Show function call stack
- [x] **Debugger**: Show struct field value whenever possible
- [x] **Debugger**: Show array content (elements in `arr`) whenever possible
- [x] **Debugger**: change pointer value display
- [x] **Debugger**: Expand first level by default
- [x] **Debugger**: Make struct debug display more compact
- [x] **Debugger**: Add a button/arrow on func name collapse/expand
- [x] **Debugger**: When array is not initialized, it’s by default an empty array (currently displayed as NULL)
- [x] **Debugger**: Just show the function name on debug console (not `f main` as it currently shows)
- [x] **Debugger**: Darken breakpoint column on hover
- [ ] <del>**Debugger**: Add a “step over” option?</del>


## Feature Enhancements

- [x] **Feature**: Breakpoint, Step and Run
- [x] **Feature**: Show execution position
- [x] **Feature**: Compile Multiple Files
- [x] **Feature**: Compile with flags

## Editor Enhancement

- [ ] **Syntax Highlighting**: Rewrite the parser generator profile to match with formal definition in `C0Reference.pdf`
- [ ] **Editor**: Import object file (`.o0` and `.o1` file)
- [ ] **Editor**: Jump to the line executing
- [ ] **Debug**: Fix drag & drop import not working problem
- [ ] **Editor**: Import project (folder)
- [ ] **Editor**: Autocomplete for C0 Language *(Nice to have)*

- [ ] **Editor**: Replace Codemirror with Monaco https://microsoft.github.io/monaco-editor/ *Need investigation*
* Support C0/BC0 Highlighter
* Import file?
* Access to syntax tree generated by syntax highlighter


- [x] **Editor**: Refresh & Render problem when scrolling
- [x] **Editor**: Syntax Highlighting (BC0)
- [x] **Editor**: Middle comment in BC0 in another color
- [x] **Editor**: Syntax Highlighting (C0)
- [x] **Editor**: Multiple File Editors (Tabs?)
- [x] **Syntax Highlighting**: Swap the syntax highlight between instruction and comment
- [ ] <del>**Editor**: Recover editor content based on `localStorage`</del>
- [ ] <del>**Editor**: Auto language-detection & switch</del>

## C0VM.ts Backend Server

- [x] **Server**: Change the synchronous system-calls to `async`.
- [x] **Server**: Support the -d flag option
- [x] **Server**: Documentation of Compile-code API
- [x] **Server**: Extended Bytecode format to allow c0 - bc0 correspondence
- [ ] **Server**: Fix domain name problem

