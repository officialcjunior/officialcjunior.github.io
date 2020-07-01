---
tags : blog
---


A simple mannual to help you start working with your [Bus Pirate](http://dangerousprototypes.com/docs/Bus_Pirate).

# Useful links

To learn about what the device can do for you, I'd suggest starting somewhere near [Sparkfun's article](https://learn.sparkfun.com/tutorials/bus-pirate-v36a-hookup-guide/all) or the [Bus Pirate 102 mannual](http://dangerousprototypes.com/docs/Bus_Pirate_102_tutorial)

# Flashing the firmware

After connecting the Bus Pirate, and cloning the [Bus Pirate repository](https://github.com/BusPirate/Bus_Pirate), simply navigate to the folder `package`. You should know about the version of the Bus Pirate you own and navigate to the corresponding folder

You can flash the firmware using the `pirate-loader`, which is an executable file present in the folder.

It requires only the firmware hex file and the device port name as arguments.

So, if you are running a Linux distribution, you can flash the firmware through the terminal, just by running:

`chmod +x ./pirate-loader_lnx`
`./pirate-loader_lnx --dev=/dev/ttyUSB0 --hex=firmware.hex`

Where, `/dev/ttyUSB0` is the port to which the Bus Pirate is connected.
And `firmare.hex` will be the filename of the firmware, which you want to flash.

Keep in mind that you have to connect the PGC and PGD pins of the Bus Pirate using a jumper cable to trigger the Bus Pirate bootloader. This is will make the MODE LED turn on.

## Interfacing with the Bus Pirate

The Bus Pirate uses a baud rate of 115200. Using GNU Screen, we can talk to the device just by running:

`sudo screen /dev/ttyUSBO 115200`

Press enter, and you'll enter a shell with prompt `<HiZ>`. Congratulations! You can now interface with your Bus Pirate.

I tried to interface the Bus Pirate with [Miniterm](https://pyserial.readthedocs.io/en/latest/tools.html), but I was unable to choose an option from the Mode Menu, as I guess, some data was already being sent and Bus Pirate misunderstood it as an input.

## Debugging
You can use a logic analyzer to see if the wirings are perfect. I used the [Saleae Logic Analyzer](https://www.saleae.com/downloads/) to make sure that there's data being sent through the wires.

## UART

To, sniff data being sent using the UART protocol, choose 3, from the mode menu.
Then, you'll be asked to set the UART mode, with port speed, data bits per frame, polarity, stop bits and output type.
Go with the default options, unless you're sure about which one to choose. On the menu where you can set speed, choose the baud rate the chip (of which you are sniffing) use.

So, use the macro (2), the Live UART monitor to view the data.

## I2C

To get started, connect the MOSI pin of the Buspirate to the SDA pin and the Clock pin to the SCL pin of the ciruit.

To set up the Bus Pirate to read data being sent through I2C, choose 4 from the Mode Menu.

Set the speed and run the macro (2) to see the data.

It is also possible to find the addresses of all the I2C chips on the network using the macro (1), as each I2C chip addressis a 7 bit address and there can only be 128 unique devices on the same wire.

## SPI

Connect MOSI and MISO of the Bus Pirate to the MOSI and MISO of the circuit. You'll also need to connect pins for the Chip Select and the Clock Signal. Don't forget about grounding it commonly.

Choose the SPI mode from the Mode menu and go with the default settings for everything except the speed, unless you're really sure about what you're doing.


### Good luck hacking!
