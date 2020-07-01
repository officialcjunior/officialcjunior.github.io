---
layout: post 
title: Booting up my first Raspberry Pi
tags: blog

---
&nbsp;

Lately, I happened  to lay my hands on one of the hottest topic on the tech world, the Raspberry Pi. For those who haven't heard about it, the Raspberry Pi is a low cost, credit-card sized computer that plugs into monitor or TV, and uses a standard keyboard and mouse.
&nbsp;


When I held the Pi in my palm, the first thing I realized is that, like a real raspberry, it was indeed, very small.
&nbsp;


So, I connected it to my laptop using an Ethernet cable, pulled up my USB Type C connecter for the power supply, and connected the HDMI cable of the monitor and keyboard to the Pi.
&nbsp;


My Ubuntu told me that the my Wired connection is alright, so I ran the command ''hostname-I'' on the Pi, got the IP address. I also turned on the SSH in ''raspi-config'', so that it recieves my SSH request.
&nbsp;

So, it all looked fine, I ran the command to establish a connection to the Pi, only to recieve:

**ssh: connect to host 192.168.1.201 port 22: No route to host**

Dang!
&nbsp;

What did I miss?
&nbsp;

I tried reconnecting a million times and almost read all the articles related to connecting a Raspberry Pi to Linux on the web when I realized that the problem lies in the network.
&nbsp;

In the IPv4 settings of the wired connection, you have to pick the option **Link to local** rather than DHCP to make the connection happen.
&nbsp;

I ran my command again.

![Connecting to my Pi](/images/1.jpg)

Yes!
&nbsp;
I could remotely control my Raspberry Pi now!

&nbsp;

Then, I made a file small text file named text.txt and copied it to my Pi.
&nbsp;

For that I used ''scp''
 
![Transferring to my Pi](/images/2.jpg)
&nbsp;

Raspberry Pi is indeed an engineering marvel and a wonder to work with. Looking back, I feel like I've learned more about how networks work and their settings than Raspberry Pi.
&nbsp;

Looking forward to do more awesome stuff with my Raspberry Pi soon!


