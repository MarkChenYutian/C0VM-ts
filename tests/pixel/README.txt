15-122 Principles of Imperative Computation
Pixels

==========================================================

Files you will modify:
   quantize.c0          - tasks 1-2
   multireturn.c0       - task 3
   pixel-int.c0         - skeleton pixel implementation
   respect.c0           - code that doesn't respect the pixel interface
   pixel-test.c0        - testing the pixel interface

Files you may modify:
   respect-test.c0      - runs tests for respect.c0

Files you won't modify:
   pixel.o0             - alternate implementation of the pixel interface
   quantize-test.c0     - runs all the tests for tasks.c0
   multireturn-test.c0  - runs all the tests for tasks.c0

Files that don't exist yet:
   pixel-bad.c0         - a copy of your finished pixel-int.c0, with added bugs

==========================================================

Compiling quantize.c0:
   % cc0 -d -W -o quantize1 pixel.o0 quantize.c0 quantize-test.c0
   % ./quantize1

Compiling pixel-int.c0
   % cc0 -d -W -o pixel-test pixel-int.c0 pixel-test.c0
   % ./pixel-test

Compiling quantize.c0 against pixel-int.c0:
   % cc0 -d -W -o quantize-test2 pixel-int.c0 quantize.c0 quantize-test.c0
   % ./quantize-test2

Compiling respect.c0:
   % cc0 -d -W -o respect-test pixel-int.c0 respect.c0 respect-test.c0
   % ./respect-test

Compiling multireturn.c0:
   % cc0 -d -W  pixel.o0 multireturn.c0 multireturn-test.c0
   % ./a.out

==========================================================

Submitting from the command line on andrew:
   % autolab122 handin pixels quantize.c0 multireturn.c0 pixel-int.c0 respect.c0 pixel-bad.c0 pixel-test.c0
then display autolab's feedback by running:
   % autolab122 feedback

Creating a tarball to submit with autolab.andrew.cmu.edu web interface:
   % tar -czvf handin.tgz quantize.c0 multireturn.c0 pixel-int.c0 respect.c0 pixel-bad.c0 pixel-test.c0
