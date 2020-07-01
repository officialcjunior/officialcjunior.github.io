---
title : Reversing Nanomites
tags : notes writeups reversing
---

One particular challenge over there rootme.org taught me a couple of things and I thought it'd be great to share some of them.

The challenge name is **'ELF x64 - Nanomites - Introduction'** and you can get it from [here](https://www.root-me.org/en/Challenges/Cracking/ELF-x64-Nanomites-Introduction). It just asks for an input, which is the flag.

Nanomites are programs where you have two processes: a father and a son. A parent and a child, if you will.

Let's try running it, now.

<br />objective c:
{% highlight objective_c %}
➜ ./ch28.bin
Please input the flag:
i'm just a fan of cjunior
Wrong! try hard! :)
{% endhighlight %}

The function at _0x00400871_ is where the real game begins and what's interesting here, is the call to _fork()_

And if you don't know what fork does, now's a good time to look it up because that's the crux of the challenge. Particularly the return value, upon which the further program flow clearly depend. To put it gently, fork() creates two processes: the child and the parent.

Here's something from the manpage of fork:

```
RETURN VALUE
       On success, the PID of the child process is returned in the parent, and 0 is returned in the child.  On failure, -1 is returned in the par‐
       ent, no child process is created, and errno is set appropriately.  
```

So, to put it clearly:

<br />objective c:
{% highlight objective_c %}pid=fork()
if (pid != 0) {
	instruction_for_child;
	}
else {
	instruction_for_parent;
}
{% endhighlight %}

Which means, we'll need to tell the debugger which process to debug.

On radare2, you can do that by : _e  dbg.follow.child=true_ and on GDB, _set follow-fork-mode child_

---

Okay, so moving onto the challenge now: all the comparisons will fall into place if you're following the child and you'll find yourself the function at _fcn.00400736_.

Just check out the comparisons over there :)

-cjunior
10/06/20
