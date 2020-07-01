---
title : Look Into The Past - Writeup from NeverlanCTF
tags : writeups
---


# Neverlan CTF: Look into the past

We played NeverLAN CTF and had so much fun playing it.

In the Forensics section, there was this task named Look into the past, which was really fun to solve.
So, I thought I'd just write something about it.

You can find the challenge file [here](https://github.com/victorazzam/stash/blob/master/Challenges/NeverLAN%202020/Forensics/Look%20into%20the%20past/look_into_the_past.tar.gz).

After taking a look at the filesystem unzipping the challenge file, it is clear that this is a snapshot of a Linux file system. 

Let's take a look at the clue again.

 `'but it seems the user was able to encrypt a file before we got to it'`

Let's see what the user did, and that is, the bash history.

`vim home/User/./bash_history`

![1](/images/neverlan/1.png)

There's quite a lot to unpack here.

Clearly, the flag.txt.enc is AES encrypted with a key that has three parts.

One has something to do with `stegihde`, another with `sqllie3` and and the other with `useradd`.

We must hunt for all of those three passwords.
Let's start with the easiest one.

As you can see, `pass3` is inserted into a database called `table.db` using sqlite3. Let's go check what's happenning over there at `/opt/table.db`.

You'll encounted a zipped package and a database file when unzipped. Open it with a DBMS if you have one, otherwise, just take a look at the ASCII strings.

![2](/images/neverlan/2.png)

`nBNfDKbP5n` is pass3, the third part of our password.

Now for pass2.
You can see that the name of the user added was pass2.
So, let's go over there  `/etc/shadows/ and see who the new user is.


![3](/images/neverlan/3.png)

`KI6VWx09JJ`

So, that's pass2.

Now for pass1.
Well, pass1 was used to hide something inside doggo.jpg using steghide(More about steghide and other image forensics tools [here](https://wiki.bi0s.in/forensics/Tools/)).

Let's try to extract that out.

Just hit enter while prompted to enter the passphrase.

![4](/images/neverlan/4.png)

pass3 is JXrTLzijLb

Now, that you've got them all, you just need to decrypt it, using `openssl`.

Combining them all, decrypting the .enc with the combined string as the key,

![5](/images/neverlan/5.png)

`flag{h1st0ry_1n_th3_m4k1ng}`

Fun!




