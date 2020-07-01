---
title : Reversing MIPS
tags : blog notes reversing
---

Lately, I had got a [reversing challenge](https://github.com/s34s0n/multiarch/tree/master/mips/challenges/word_generator) compiled for MIPS architecture and I struggled a bit as I couldn't find a lot information on the web on how to analyze or debug it properly.

The is a small writeup on how I learned about MIPS and completed the challenge.

### Emulator
QEMU is probably the best emulator out there and QEMU lets you emulate a MIPS Malta system

If you are on Ubuntu, you can get QEMU using _aptitude_
> apt install qemu qemu-user qemu-user-static

### Debugger
The GNU Debugger which is probably on your system doesn't support obscure architectures like MIPS. You'll need [gdb-multiarch](https://packages.debian.org/sid/gdb-multiarch) for that.
It can also be installed without any hassle.
> apt install gdb-multiarch

### Disassembler
Looking at the disassembly on gdb-multiarch was pretty challenging to me, so I used [radare2](radare.org) for that. More on that below.

### Debugging setup
The way we are going to reverse this is by emulating the binary on _qemu-mips_ and then use a remote connection from _gdb-multiarch_ using the GDBStub for debugging.

For that, run:

> qemu-mips -g $port_number $file_name

And enter your inputs for the challenge from here.

Then, open up another shell in the directory where the file is, and open it up using GDB-multiarch.

> gdb-multiarch $file_name

You'll need to set your architecture using:
> set architecture mips

Now, we're all set, we can connect to our host now. To do that:
> target remote localhost:$port_number

And that's it! 
You can use your use your normal GDB commands to debug.

## Reversing statically, on radare2

There are various settings that you can check out to get your disassembly more readable on radare2. I'll show you the way around some.

Let's open up the file on r2, with the architecture set as MIPS:

> r2 -a mips $file_name

After doing the analysis (_aaa_), you'll be able to seek to your functions of your choice.

radare2 offers two variants of the disassembly: _mips_ and _mips.gnu_

_mips_ is what you'll see if you had open it with the _-a mips_ flag and
_mips.gnu_ will display it as gdb-multiarch would do.

I find _mips_ comparitevely easier than _mips.gnu_ on readability.

You can set it using _e asm.arch_ command inside the r2 shell.

```
[0x00400610]> e asm.arch = mips
mips       mips.gnu   
```

If you're planning to view the disassembly on one window and debug it on another, I'd suggest _mips.gnu_. 

You can also turn on pseudocode, to turn this:

```
0x004008d0      21204000       move a0, v0
0x004008d4      40000524       addiu a1, zero, 0x40        ; argv
0x004008d8      21306000       move a2, v1
0x004008dc      3880998f       lw t9, -0x7fc8(gp)          ; [0x410d68:4]=0x400c10 sym.imp.fgets
0x004008e0      00000000       nop
0x004008e4      09f82003       jalr t9
0x004008e8      00000000       nop
0x004008ec      1000dc8f       lw gp, 0x10(fp)
0x004008f0      1c00c227       addiu v0, fp, 0x1c
0x004008f4      21204000       move a0, v0
0x004008f8      3c80998f       lw t9, -0x7fc4(gp)          ; [0x410d6c:4]=0x400c00 sym.imp.strlen
0x004008fc      00000000       nop
0x00400900      09f82003       jalr t9
```

into something way more human; to this:

```
0x004008d0      21204000       a0 = v0
0x004008d4      40000524       a1 = 0 + 0x40    ; argv
0x004008d8      21306000       a2 = v1
0x004008dc      3880998f       t9 = [gp - sym.imp.fgets]   ; [0x410d68:4]=0x400c10 sym.imp.fgets
0x004008e0      00000000       nop
0x004008e4      09f82003       call t9
0x004008e8      00000000       nop
0x004008ec      1000dc8f       gp = [fp + 0x10]
0x004008f0      1c00c227       v0 = fp + 0x1c
0x004008f4      21204000       a0 = v0
0x004008f8      3c80998f       t9 = [gp - sym.imp.strlen]  ; [0x410d6c:4]=0x400c00 sym.imp.strlen
0x004008fc      00000000       nop
0x00400900      09f82003       call t9
```

You can turn that on by:
> e asm.pseudo = 1

You can also make radare show the memory locations in stack, just like GDB would show you using the below command, if you're more used to that.

> e asm.var.sub = false

### Why not debug in radare2?
And you might be thinking, we have the visual panels mode and all of those good stuff on the radare2 debugger, so why don't we use that?

Apparently, I had tried it out, but faced some [problems](https://github.com/radareorg/radare2/issues/16680). 

To me debugging MIPS on on radare2 doesn't look [completely stable](https://github.com/radareorg/radare2/issues?q=is%3Aissue+is%3Aopen+MIPS) to me, at the moment, but you're welcome to try out.

> r2 -a mips -d gdb://127.0.0.1:1337 <file_name>

You might also need to set your base address using _-B <base_address>_, to have a better chance of making it work.

If you're facing an error, try reaching the community, if not already being tracked, report your issue, and help to make it better.

You can find the challenge that made me learn all this and its detailed writeup over [here](https://github.com/s34s0n/multiarch/tree/master/mips/challenges/word_generator)

Thanks for stopping by!

And thanks to the loving radare community for helping me with this.
