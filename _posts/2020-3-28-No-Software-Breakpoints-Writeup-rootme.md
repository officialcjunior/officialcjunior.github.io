---
tags : writeups
---


# No Software Breakpoints - ELF x86

I saw a very interesting challenge, named [No Software breakpoints](https://www.root-me.org/en/Challenges/Cracking/ELF-x86-No-software-breakpoints) on root-me.org that I spent days on, to wrap my head around it, so I thought, it would be great to write a bit about it.

The file, named 'ch20.bin' is a stripped binary which asks for a password when run:

```
➜ ./ch20.bin
Welcome to Root-Me Challenges
Pass: 
```
I used [Cutter](github.com/radareorg/cutter) to get an overview of what's at stake here and GDB-[PEDA](github.com/longld/peda) for debugging.

Let's begin, with the part at entry0. At ```0x08048080``` is where the execution starts, as you can see below: 

```
0x08048085      mov     ebx, 1
0x0804808a      mov     ecx, str.Welcome_to_Root_Me_Challenges____Pass: ; 0x80491a1
0x0804808f      mov     edx, 0x26  ; '&' ; 38
0x08048094      int     0x80 ; system call for printing the banner
0x08048096      mov     eax, 3
0x0804809b      xor     ebx, ebx
0x0804809d      mov     ecx, 0x8049188
0x080480a2      mov     edx, 0x33  ; '3' ; 51
0x080480a7      int     0x80 ; system call for the input and stores it in 0x8049188
0x080480a9      xor     ecx, ecx
0x080480ab      mov     eax, 0x8048080 ; which is the starting address.
0x080480b0      mov     ebx, 0x8048123 ; and this is the the address at the end.
0x080480b5      call    0x8048115 
```

Okay, so it prints the welcome-string, stores the input and then calls this mysterious function at 0x8048115 with the starting address and the address at the end as arguments, let's see what's up over there.

```
	0x08048115      sub     ebx, eax ; the actual length/lines of codes of the binary
	0x08048117      xor     ecx, ecx ; zeroes out ecx
  ->0x08048119      add     cl, byte [eax] ; 
  |	0x0804811b      rol     ecx, 3
  |	0x0804811e      inc     eax
  |	0x0804811f      dec     ebx
  --0x08048120      jne     0x8048119
	0x08048122      ret
```

Well, it adds the stuff at eax is currently pointing to (weird, isn't that an instruction?), adds it to the register ecx, rotates the bits to the left by 3, until ebx equals zero, that is, the- number-of-lines-of-code times.

Wait, so what does that mean? Adding a byte of an assembly instruction? Well, what are these instructions one more level down the ladder? Opcodes! This code snippet is adding up all the opcodes, rol-ing it by 3.

Apparently, this is a popular anti-debugging technique. Because, when we put a breakpoint somehwere in the binary, the debugger is actually placing a 0xCC (INT 3, a software interrupt, could also be the answer to our the challenge name!) on that line. So, a computation like this will be different, as these interrupts also will be added up, which would create a disparity in the totality.

I'd suggest you to read more about that on this thread on [StackOverflow](https://stackoverflow.com/questions/3747852/how-do-debuggers-guarantee-correctness-when-using-int-3-0xcc-software-breakpoi) and on this wonderful article over [here](https://www.deepinstinct.com/2017/12/27/common-anti-debugging-techniques-in-the-malware-landscape/)

Alright, after calculating that, move on to the crux of the program:

```
0x080480ba      mov     edx, ecx  				 ; the sum of opcodes is moved onto edx
0x080480bc      mov     ecx, 0x19  				 ; 25, hmm, it must loop 25 times?
0x080480c1      mov     eax, 0x8049155			         ; what's in this?
0x080480c6      mov     ebx, 0x8049188 			         ; that's where our input was stored.
0x080480cb      ror     edx, 1					 ; rotate to the right, by one
0x080480cd      mov     al, byte [eax + ecx - 1] 		 ; a byte from the list of 25 characters, from behind as ecx is 0x19 and is decremented later on.
0x080480d1      mov     bl, byte [ebx + ecx - 1]                 ; a byte from our input
0x080480d5      xor     al, bl  				 ; XOR-s one from the input with one from the list of characters, stores it in eax,
0x080480d7      xor     al, dl 					 ; XOR-s with edx and check it's zero.
0x080480d9      jne     0x80480f6
```
Therefore:

			`input^(stuff inside 0x8049155)^(the sum of opcodes)=0`

And what's fun about XOR is that:

			`(stuff inside 0x8049155)^(the sum of opcodes)=input`
			
So, what's inside 0x8049155? 

```
gdb-peda$ x /s 0x8049155
0x8049155:	"\036\315*\325\064\207\374xd5\235\354\336\025\254\227\231\257\226\332y&O2\340", ' ' <repeats 25 times>, "\ntest\n" ; well, well, well, 0x19 is back again!
gdb-peda$ x /25c0x8049155
0x8049155:	0x1e	0xcd	0x2a	0xd5	0x34	0x87	0xfc	0x78
0x804915d:	0x64	0x35	0x9d	0xec	0xde	0x15	0xac	0x97
0x8049165:	0x99	0xaf	0x96	0xda	0x79	0x26	0x4f	0x32
0x804916d:	0xe0
```
So, we can conclude that the length of the input is also 25.


As, we have cracked the logic, let's get our hands dirty.

## Solving No Software Breakpoints

You can extract all the opcodes of the binary, using this lovely command. (God bless bash)

```
objdump -d ./ch20.bin |grep '[0-9a-f]:'|grep -v 'file'|cut -f2 -d:|cut -f1-6 -d' '|tr -s ' '|tr '\t' ' '|sed 's/ $//g'|paste -d '' -s |sed 's/^/"/'|sed 's/$/"/g'
```

I wrote a code that computes the sum of opcodes here:

{% gist ea6bdbf1be6ed7d76e1327fb370358f9 sum-of-opcodes.s %}
```
➜ ./sum-of-opcodes
The sum of opcodes is 0xac77e166
```

And the code for computing the flag:

{% gist ea6bdbf1be6ed7d76e1327fb370358f9 print-flag.s %}


```
➜ ./printflag
flag : Skc0r_TNioPka3rB_er@WdraH��8
the flag, reversed : �HardW@re_Br3akPoiNT_r0ckS⏎ 
```
That was fun!
