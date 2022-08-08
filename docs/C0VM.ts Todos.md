### C0VM.ts Main Functionality

- [x] **Function**: NativeIO::Readline 
- [x] **Function**: Type Inference System during runtime
- [x] **Function**: Show local variable’s value during runtime
- [ ] **Function**: Heap allocator garbage collection based on ref count
- [x] **Debug**: Check the bug when running `buggy_SSA_test.bc0` problem.
- [x] **Parser**: Deal with “dummy return value” (occurs at `void` functions)
- [ ] **Maybe**: Map the source code line number to bytecode line number **@Iliano**
- [ ] **Type Inference**: ==Unable to relate typedef - it’s possible to wrap a pointer to a “concrete type” using typedef==

### UI/UX Enhancements

- [x] **UI**: Optimize workflow
- [x] **UI**: File import based on popup window dialog
- [x] **UI**: Enable/Disable buttons in main function area based on input area
- [x] **UI**: Fix CSS style of the react application page
- [ ] **React**: Add breakpoint as a component state instead of global variable (which may lead to strange problems, sometimes toggled breakpoint does not work at all)
- [x] **Debugger**: Show function call stack
- [x] **Debugger**: Show struct field value whenever possible
- [x] **Debugger**: Show array content (elements in `arr`) whenever possible
- [ ] <del>**Debugger**: Add a “step over” option?</del> [Maybe in “advanced options”]
- [x] **Debugger**: change pointer value display
- [x] **Debugger**: Expand first level by default
- [x] **Debugger**: Make struct debug display more compact
- [x] **Debugger**: Add a button/arrow on func name collapse/expand
- [x] **Debugger**: When array is not initialized, it’s by default an empty array (currently displayed as NULL)
- [x] **Debugger**: Just show the function name on debug console (not `f main` as it currently shows)
- [ ] **Debugger**: Show ptr address on hover on struct component
- [ ] <s>**Debugger**: flexible grid proportion</s>

### Feature Enhancements

- [x] **Feature**: Breakpoint, Step and Run
- [x] **Feature**: Show execution position
- [x] **Feature**: Compile Multiple Files
- [x] **Feature**: Compile with flags

### Editor Enhancement TODOs

- [ ] <del>**Editor**: Auto language-detection & switch</del>
- [x] **Editor**: Refresh & Render problem when scrolling
- [x] **Editor**: Syntax Highlighting (BC0)
- [ ] **Editor**: Syntax Highlighting (C0)
- [x] **Editor**: Multiple File Editors (Tabs?)
- [ ] **Editor**: Jump to the line executing
- [x] **Syntax Highlighting**: Swap the syntax highlight between instruction and comment

### C0VM.ts Backend Server

- [ ] **Server**: Change the synchronous system-calls to `async`.
- [x] **Server**: Support the -d flag option
- [x] **Server**: Documentation of Compile-code API



