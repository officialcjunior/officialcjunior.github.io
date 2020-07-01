---
tags: blog
---


## Phishing the router administrator page of TP-Link Wireless N Router WR840N


## Summary
A phishing website of the administrator login page is set up. An attacker is then able to harvest the login credentials entered by the victim.
&nbsp;

The exploit is a four step process.

  * The administrator login page is cloned.
  * The login page is hosted locally.
  * The local web server is port-forwarded to a server on the internet.
  * The credentials are harvested by listening to the local server

### Step 1
Firstly, the administrator login page is cloned using the wget command.
For this, connect to the router and run the ``wget`` command with the router administrator login page's URL as argument.

![shot1](/images/11.jpg)

&nbsp;

### Step 2
Then, a server is hosted locally on your computer using the code we just cloned in **Step 1**. This is done using PHP, which is a powerful server scripting language.

Set up your local server with your desired port number on localhost.

&nbsp;

![shot2](/images/22.jpg) 

&nbsp;

### Step 3
Then, the server is connected to the internet using a port-forwarding software called [ngrok](ngrok.io). ngrok is a reverse proxy that creates a secure tunnel from a public endpoint to a locally running web service. With ngrok, every request to the web server, now comes back to the server which has been hosted locally. 

&nbsp;

After downloading ngrok, just running ``./ngrok http <port_number>``, where you must specfy the port you've turned on while setting up localhost. This will connect the locally hosted server to ngrok's online server.
Now, every request that reaches the server connected to the internet will also reach the server hosted locally.

&nbsp;
Hence, we can see all the connections and data requests reaching the server.

![shot2](/images/ngrok.jpg) 

&nbsp;
### Step 4

Then, we listen to everything happening on the server, which is sent back to you, on the host terminal. Data about every HTTP request will be logged here. From the whole data created by the victim, the login credentials are filtered out.

Additionaly, IP lookups can be done to retrieve more data about the victim.

&nbsp;
![shot3](/images/33.jpg)
