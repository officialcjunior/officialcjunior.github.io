---
title: "Hello OpenBSD"
date: '2022-06-28'
draft: false
slug: 'hello-openbsd'
author: 'Aswin'
---

Oh, hi!

This is a blog post about the things I stumbled upon when I
thought I'll give [OpenBSD](https://www.openbsd.org) a go. Therefore, this post is going
to sound more like a walkthrough than an ordinary blog post.

The reason why I decided to try it out was primarily for the learning experience, and to
use it as a hobby OS- something you boot up every once in a while when you want to slow
down and relax a bit. Moreover, I also wanted to see why many people love and endorse
OpenBSD, and wanted to see if it is my cup of tea.

For those who are not much into the history of UNIX and operating systems, OpenBSD
is a UNIX-like operating system based on the Berkeley Software Distribution (BSD). A very talented
person named Theo de Raadt created OpenBSD in 1995 by forking [NetBSD](https://netbsd.org)-
which is another UNIX-like operating system.
On a macroscopic level, all BSDs are pretty much the same: complete (more than just
the kernel, unlike Linux), open-source, secure and very well-trusted.

## Installation

I backed my data up (even though Linus Torvalds has told us that- "Real men don't
use backups, they post their stuff on a public FTP server and let the rest of the
world make copies") and downloaded the ISO image from their website. To be precise,
the one which has all the [file sets](https://www.openbsd.org/faq/faq4.html#FilesNeeded) in it.

The idea of filesets comes down to the founding principles of BSDs and UNIX: freedom. You can actually 
install _just_ the kernel, compile
and configure everything to the top, exactly as you prefer, like you do in 
[Linux From Scratch](https://www.linuxfromscratch.org/). This is clearly not for the ones
who are just starting out, so I got the ISO image which has everything: manual pages,
X11 (the windowing system/display servers), fonts and everything you expect in a
modern operating system.

Of course, I wasn't intending to wipe my hard drive and go all in. And that was a problem:
Almost all of the installation guides out there went for a full-disk installation and hence skipped the part where they set up the disks.

<blockquote class="twitter-tweet" data-lang="en"><p lang="en" dir="ltr">I guess, if I really want to give OpenBSD a go, I think I have to find a guide where they install it on a single partition, compared to the usual, default (messy, I&#39;d say, but secure- yes) way the partitions are done.<br><br>Plus, the fdisk equivalent tool looks terrifying to me.</p>&mdash; aswin c ☯️ (@chandanaveli) <a href="https://twitter.com/chandanaveli/status/1471158304487346187?ref_src=twsrc%5Etfw">December 15, 2021</a></blockquote> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>


Luckily, I found out a YouTube video from 'The OpenBSD Guy'
which seemed to have what I wanted:

<iframe width="782" height="440" src="https://www.youtube.com/embed/sYDUgJHbHgM" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>

Being a long-time (almost two years) and a _proud_ user of Arch Linux, I
found the installation process fairly straightforward until it got into the disk setup.
Firstly, it asks you the basics: time zones, user information, network interfaces, and
finally, it gets into disks.


The disk setup is tricky- you really can mess everything up by the press of a button. What I
had to do was to format the existing partition as an OpenBSD partition and choose that as
the place to install it.
Thanks to Chapter 4 of the video from The OpenBSD Guy, I could cross this chasm that I almost
dared not to.

## Booting up

I was aiming at dual-booting (triple booting, to be precise) Arch Linux and OpenBSD through GRUB. 
This is indeed possible and is what The OpenBSD Guy demonstrates in the video, and is also fairly
straightforward as you'd expect: you edit a particular GRUB configuration file, recompile it, and
you reboot- similar to what you do when you want to change the kernel parameters on Linux. But in 
my case, the chain loader spit out some errors during the compilation, and I couldn't
completely figure out why. I believe it was something to do with GRUB not being able to figure
out the type of the disk partition.

In the end, I settled with booting OpenBSD from the UEFI boot menu:

<blockquote class="twitter-tweet" data-conversation="none"><p lang="en" dir="ltr">I finally joined the OpenBSD gang today.<br><br>Couldn&#39;t set up GRUB to dualboot properly, so I just used efibootmgr and booted it from the UEFI menu.<br><br>The view looks ancient (ew) and I have probably have to find a guide to set up things.<br><br>A good start for 2022, I guess.<br><br>More later!</p>&mdash; aswin c! ☯️ (@chandanaveli) <a href="https://twitter.com/chandanaveli/status/1477295882676494340?ref_src=twsrc%5Etfw">January 1, 2022</a></blockquote> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>


This was also the time I learned about [efibootmgr](https://linux.die.net/man/8/efibootmgr)-
which is a tool with which one can manage UEFI boot entries. With efibootmgr, I just had to
run:

```bash
# /dev/sda5 was where I installed OpenBSD 
$ sudo efibootmgr -c -p 1 -d /dev/sda5 -L OpenBSD -l /EFI/Boot/bootx64.efi

# set timeout to 10 seconds
$ sudo efibootmgr -t 10
BootCurrent: 0000
Timeout: 10 seconds
BootOrder: 0000,0002,0001
Boot0000* linux
Boot0001* OpenBSD
Boot0002* Windows Boot Manager
Boot0007* windows
Boot0008* Diskette Drive
Boot0009* Internal HDD
Boot000A* USB Storage Device
Boot000B* CD/DVD/CD-RW Drive
Boot000C* Onboard NIC
```

## Hello OpenBSD

Booting it up for the first time felt like hacking the Pentagon from the movies, as it prints
all the [dmesg](http://man.openbsd.org/dmesg)-es. On a first look, it looked like it an
operating system stuck in the 90s (in a good way :).

![](/images/openbsd/boot.jpeg)

### Getting Wi-Fi

By default, OpenBSD doesn't distribute firmwares along with the kernel. So, there's
no Wi-Fi.


![](/images/openbsd/iwm0.jpg)

And there's two ways to get around this:

1. Install the firmware inside the ISO image before installation using [fw_update](https://man.openbsd.org/fw_update), like you do when handling Raspberry Pis.

The official documentation says one needs an existing OpenBSD installation to do this,
although I'm sure that it can be somehow done from Linux, as well.

2. Download the firmware package, put it on a  drive, plug it in and then install it
using [pkg_add](http://man.openbsd.org/pkg_add)- the package manager.

I didn't know that I didn't have the firmware for WiFi until I booted it up, so I had
to resort to the second method. And thanks to [jmarhee](https://dev.to/jmarhee)'s
[article](https://dev.to/jmarhee/configuring-wifi-firmware-at-installation-for-openbsd-25pl),
I was able to get it done in no time.

My [university](https://amrita.edu) Wi-Fi uses WPA 802.1X encryption with a WPA-EAP
authentication scheme. I knew this one was going to be a _hard_ nut to crack. But thankfully, I found
a [blog post]( https://azarus.ch/posts/2018-02-09-openbsd-wifi-802.1x-wpa-eap.html) from
a fine gentleman named Azarus who explained how to do it. It was straightforward:
I had to get [wpa_supplicant](https://linux.die.net/man/8/wpa_supplicant),
add the network-specific devices to its configuration file, manually authenticate with
the device to connect to the access point and get a DHCP lease.

```bash
# wpa_supplicant -i iwm0 -c /etc/wpa_supplicant.conf
# dhclient iwm0
# ping 1.1.1.1
PING 1.1.1.1 (1.1.1.1) 56(84) bytes of data.
64 bytes from 1.1.1.1: icmp_seq=1 ttl=55 time=168 ms
```
I installed Firefox and sent out a Tweet:

<blockquote class="twitter-tweet" data-conversation="none"><p lang="en" dir="ltr">Just booted into my OpenBSD and upgraded it to 7.1 and I must say, it was an exciting process. It was my first time updating a BSD. I did it through my university Wi-Fi, which I finally ended up doing after an hour&#39;s hack.<br><br>Maybe I should write a blog about the experience so far.</p>&mdash; aswin c! ☯️ (@chandanaveli) <a href="https://twitter.com/chandanaveli/status/1520058496791846915?ref_src=twsrc%5Etfw">April 29, 2022</a></blockquote> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>

## Updates

The OpenBSD ecosystem is much fabled and praised when it comes to many things, especially
in handling updates as it offers easy rollbacks and many other features.

Recently, OpenBSD 7.1 had come out and the upgrade process was _flawless_:

![](/images/openbsd/update.jpg)

## cwm- the calm window manager

Even before diving into BSDs, I had come to know about
[cwm](http://man.openbsd.org/cwm) from a [blog](https://icyphox.sh/blog/openbsd-hp-envy/)
written by one of my Twitter friends who runs OpenBSD. So, cwm was definitely on my radar.

cwm is pragmatic: you write your configuration down in `.cwmrc` and you load it up. And
the key bindings can be tweaked and it is as easy as changing the bindings in vim.


And this was when I had my first experience with the quality of OpenBSD's manual pages. When it
comes to tweaking configuration files of software I just installed, I usually seek refuge
in some blog post written for laymen. In this case, information about the keybindings, how to change them, 
and the notations that are used for the special keys- all were written in plain English in the manual 
page for [cmw](http://man.openbsd.org/cwm#CM-Return).

## Experience

The overall experience has been great - I learned a lot about GPT, UEFI,
firmware and many other things along the way. I plan to keep updating this blog post if I
run into something that's hard to do or is just interesting, so I can have one place to keep all of 
my thoughts related to my experience with OpenBSD.

For a person looking for a hobby OS or just some fresh air, I'd totally recommend OpenBSD!

<blockquote class="twitter-tweet" data-conversation="none" data-dnt="true"><p lang="en" dir="ltr">Anyway, if you want to learn about UEFI, BIOS, MBR, dual booting, bootloaders, disk partitions and other related shenanigans, I suggest you to try dualbooting Linux and OpenBSD with GRUB.<br><br>I think, there literally no other option more worse than this.<br><br>It&#39;ll teach you everything.</p>&mdash; aswin c! ☯️ (@chandanaveli) <a href="https://twitter.com/chandanaveli/status/1478238362523758594?ref_src=twsrc%5Etfw">January 4, 2022</a></blockquote> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>

![](/images/openbsd/final.jpeg)
