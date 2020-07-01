---
layout: post 
title: Working with Arduino
tags: blog

---
&nbsp;

Hello! &nbsp;

Recently, I started the learn the basics of Arduino. For those who haven't heard about Arduino, it is basically an open source programmable circuit board which contains a microcontroller, to which we can a wide array of devices.
&nbsp;

I didn't have accesss to a physical Arduino, so I did my learning on [Tinkercad](https://www.tinkercad.com), which is a virtual lab where you can make circuits.
&nbsp;

I also referred to Arduino For Dummies, from John Nussey to make sure that I'm learning it right.
&nbsp;

**Challenge- 1**
First one was to write an Arduino program to read a password until it is correct. For that, you don't need to connect just running the code is enough, said that you have a Serial Monitor open.
&nbsp;

So, I began with initalizing my serial pin, then saved my password as a string and prompted the user to enter the password using the **readString()** command. And finally, I compared the string using a simple if command.
&nbsp;

You can find the code here:
[Challenge 1](https://github.com/officialcjunior/bi0s-tasks/blob/master/task-1/challenge-1/)
&nbsp;


**Challenge- 2**
Even though it looked quite hard, getting the LED on when the temperature reaches a limit is just a piece of cake.
&nbsp;

Just connect the analog pins of the temperature sensor to one of the analog pins and an LED to one of the digital pins. The only thing is that you have to convert the analog value from the temeperature sensor to the digital value, ie, volts to degree celesius. Then I used compared it with the limit using an if command.

You can find the code here:
[Challenge 2](https://github.com/officialcjunior/bi0s-tasks/blob/master/task-1/challenge-2)

**Challenge- 3**
In this challenge, I connected 4 LED bulbs in parallel and two wires to 9 and 10 digital pin ports of the Arduino board. And using the **digitalWrite()** function, I turned them on.
&nbsp;

You can check out the code here:
[Challenge 3](https://github.com/officialcjunior/bi0s-tasks/tree/master/task-1/challenge-3)
&nbsp;

**Challenge- 4**
To control 4 DC motors, I connected each of their anodes to four different digital pin ports and cathode to the ground and turned each of them, left them running for 5 seconds and turned them off.

You can find the code here:
[Challenge 4](https://github.com/officialcjunior/bi0s-tasks/tree/master/task-1/challenge-4)

**Challenge- 5**
To create a password manager using a keypad and an LCD screen, I had to refer to a page from [Instructables](https://www.instructables.com/id/Arduino-16x2-LCD-Display-and-4x4-Matrix-Keypad/) for the connections on the board.
&nbsp;

Here, I used the LiquidCrystal library for the LCD screen and Keypad for the keypad to function. Similary from the first challenge, I prompted and user and retrieved the password and compared it with the saved password using an if statement. I've handled the scenario where the character keys are pressed, to give out a simple error message.

Here's the code I've made:
[Challenge 5](https://github.com/officialcjunior/bi0s-tasks/tree/master/task-1/challenge-5)
&nbsp;


Looking back, I've learned a lot about basic electronics, how microcontrollers work, and picked up some new knowledge about circuits and programming.





 
