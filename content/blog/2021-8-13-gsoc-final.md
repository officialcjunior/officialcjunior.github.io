---
title: "Google Summer Of Code 2021- Support for CPU and Platform Profiles"
date: '2021-08-13'
draft: false
slug: 'gsoc-2021'
author: 'Aswin'
---

Hi all,

This blog post is a brief summary about the work I did on the summer of 2021 with Rizin on 
adding support for CPU and platform profiles.

---

![rizin-image](https://rizin.re/images/rizin.svg)


### Title of the project 

Support for CPU and platform profiles

### Synopsis

Rizin previously relied upon manually writing code for adding a new CPU or an IO port. This
implementation was unfit as the vast and growing ecology of hardware components such as
CPUs and SoCs regularly implement a part of architecture with custom instructions,
registers, and address configurations with trivial differences, making it infeasible to
maintain all of them inside Rizin. 

Providing a level of abstraction in handling this entropy in embedded systems by
supporting editable CPU and platform profiles was the goal of this project. This also made
adding and maintaining these ports easier with less interaction with Rizin’s core. This
project also added more flexibility in having a way of importing existing hardware
data description documents so that reverse engineering on particular chipsets is easier.
Now, it's also easier to memory map the peripheral accesses and registers to provide a
better reverse engineering experience. Currently, this is being extended to benefit Rizin
in terms of compatibility and the end users in terms of user experience.

---

#### Getting ready

The microtask I had to do before the actual project began was to make an SVD parser plugin.

SVD files are files containing information about a device's peripherals, MMIO registers and other particulars. They are usually
made by the manufacturer. This plugin would load the data from SVD file to Rizin and add them as flags (labels) and comments, 
simplifying the reverse engineering experience.

Here's how the SVD file of the `STM32F030` microcontroller begins:

```xml
<?xml version="1.0" encoding="utf-8" standalone="no"?>
<device schemaVersion="1.1"
xmlns:xs="http://www.w3.org/2001/XMLSchema-instance"
xs:noNamespaceSchemaLocation="CMSIS-SVD_Schema_1_1.xsd">
  <name>STM32F030</name>
  <version>1.0</version>
  <description>STM32F030</description>
  <!--Bus Interface Properties-->
  <!--Cortex-M0 is byte addressable-->
  <addressUnitBits>8</addressUnitBits>
```

This is a very big document with lots of information such as details about peripherals
and registers:

```xml
<register>
  <name>DR</name>
  <displayName>DR</displayName>
  <description>Data register</description>
  <addressOffset>0x0</addressOffset>
  <size>0x20</size>
  <access>read-write</access>
  <resetValue>0xFFFFFFFF</resetValue>
```

The plugin parses all the registers' name, size, base address and its offset to add a flag 
or a label and parses its description to add a comment at its offset.

That was probably the first moderately large piece of software I had ever written from scratch. It was a bit
challenging at the beginning but eventually I got the hang of and got it into a state where I could parse some of the 
register's description and offsets and add it as flags right before receiving the e-mail saying that I got accepted:

![](https://user-images.githubusercontent.com/29057155/127342270-3863038e-aace-44c5-8feb-cc15888d03d6.png)

---

#### Summer time

After being accepted, the first thing I did was to remove the existing implementation of
`RzSyscallPorts` - the module which took care of the architecture and CPU specefic system registers.

* [Deprecate RzSyscallPort and move the existing sysregs to SDB](https://github.com/rizinorg/rizin/pull/1160)

`ioports.c` housed `RzSyscallPorts`, which were hardcoded definitions of system registers which were iteratively searched and
served using `rz_syscall_get_io()` and other APIs. These hardcoded values are moved to SDB in this PR.

A port using `RzSyscallPorts` looked like this:

```c
RzSyscallPort sysport_avr[] = {
    { 0x3e, "SPH: Stack higher bits SP8-SP10" },
    { 0x3d, "SPL: Stack lower bits SP0-SP7" },
    ...
}
```

This PR moved all of those existing definitions to SDB, which follows a format like this:

```
SPH=reg
SPH.address=0x3e
SPH.comment=Stack higher bits SP8 SP10
```
Here, I made two new modules: `RzSysregsDB` and `RzSysregItem` to make this happen. `RzSysregsDB` just housed a hashtable
which paired the address of the port and an `RzSysregItem` which contained the comment, type and all the other 
information related it. This PR also introduced `rz_sysreg_get()` to which you can pass on the type (mmio/reg) and the offset to get the port. This is used where these ports are displayed as comments from `disasm.c`.

After that, I jumped straight into the first phase and the crux of the project: CPU profiles.

* [Introduce RzArchProfile and add support for CPU profiles](https://github.com/rizinorg/rizin/pull/1193)

The CPU profiles, basically the files containing information about the CPUS were stored in SDB files at `librz/asm/cpus` 
following a naming convention `arch-cpu` are loaded up at`rz_arch_profiles_init()` at the beginning. 
Then, it's parsed and stored into various data structures inside `RzArchProfile`, where `RzArchTarget` will house 
the name of the CPU and architecture and a pointer to `RzArchProfile` (`RzArchTarget` is currently under `RzAnalysis`). 
The IO registers and Extended IO registers were put inside a hashtable and the other data in normal `ut64` and
character array variables for easy and fast access.

```c++
typedef struct rz_arch_profile_t {
  ut64 rom_size;
  ut64 ram_size;
  ...
  HtUP /* <ut64 , char *> */ *registers_mmio;
  HtUP /* <ut64 , char *> */ *registers_extended;
} RzArchProfile;

typedef struct rz_arch_target_t {
  char *cpu;
  char *arch;
  RzArchProfile *profile;
} RzArchTarget;
```

The information is integrated during the analysis loop. During analysis (`aa`), `rz_arch_profile_add_flag_every_io()` 
is called, which parses the two hashtables and adds the information as flags. For that, two new flagspaces were 
realized: `registers.mmio` and `registers.extended` for the corresponding ones.

You can see the CPU specific registers being added as flags here. This is when loaded up with an AVR firmware and CPU set 
to `ATmega168`.
You can see the registers from the CPU profiles added as flags (labels) right near
the offsets:
![cpu-profiles-in-action](https://user-images.githubusercontent.com/29057155/120918200-c7a66480-c6d0-11eb-80bc-de97c50e04d9.png)

* [Support for memory mapping the ROM](https://github.com/rizinorg/rizin/pull/1228)

Since we already have size of the ROM and its starting address on the CPU profile, it makes good sense to add its range as a
section (`iS` command). To implement that, I introduced `rz_analysis_add_io_registers_map()` which takes care of the job 
when during the analysis loop.

```bash
$ rizin test/bins/firmware/arduino_avr.bin
[0x00000158]> aaa
[x] Analyze all flags starting with sym. and entry0 (aa)
[x] Analyze function calls (aac)
(...)
[0x00000158]> iS~.rom
 8   0x00001fff  0x4000 0x00001fff  0x4000 -r-x .rom      NULL  
```

It was time to set my sails jolly for the next phase.

---

* [Introduce RzArchPlatform and support for platform profiles](https://github.com/rizinorg/rizin/pull/1254)

In this patch series, I introduced `RzArchPlatformTarget` and `RzArchPlatformItem` for platform profiles.

The platform profiles stored as SDB files in `librz/asm/platforms` following a file naming convention similar to a 
triple target `arch-cpu-platform`, are firstly loaded up 
at `rz_arch_platform_init()`. Subsequently, it's parsed and stored in a hashtable inside `RzArchPlatformTarget` which is a pair of `ut64` 
address and a `RzArchPlatformItem`. `RzArchPlatformItem` is a struct/module which houses the name and the comment (if it exists) of 
the corresponding port. The names are added as flags and comments as comments (`CCu` command) in `rz_arch_platform_add_flags_comments()`.

```c++
typedef struct rz_platform_item_t {
  char *name;
  char *comment;
} RzArchPlatformItem;

typedef struct rz_platform_target_t {
  HtUP /* <ut64 , RzArchPlatformItem> */ *platforms;
} RzArchPlatformTarget;
```

Platform Profiles also follow a format similar to the CPU profiles that you saw earlier.
Here's an excerpt BCM 2835's platform profile:

```xml
AUX_MU_IER_REG=name
AUX_MU_IER_REG.address=0x7e215044
AUX_MU_IER_REG.comment=Mini UART Interrupt Enable

AUX_MU_IIR_REG=name
AUX_MU_IIR_REG.address=0x7e215048
AUX_MU_IIR_REG.comment=Mini UART Interrupt Identify
```

A new configuration variable `asm.platform` was also [added](https://github.com/rizinorg/rizin/pull/1254/commits/92e6777ca2e56f2f4d575d476f288a8589b0a572)
to choose the platform profile. This will let the user choose the name of the profile they want to load and Rizin will load the profile 
based upon the CPU and the architecture that the user have previously set. For that, I added a new variable `platforms` 
to `RzAsmPlugin` which will hold the list of all supported platforms of that architecture.

<img src="/images/gsoc/asm-platform.png" alt="Italian Trulli" width="600" height="116">

After that, I spend a lot of time writing unit and integration tests for both CPU and platform profiles. A lot of time went to debugging and
fixing bugs and other memory leaks. Thanks to Coverity Scan, wargio and other Continous Integration tests, it was very easy to spot them with their
help!

* [Add x86 IO ports and support for more platforms](https://github.com/rizinorg/rizin/pull/1263)

In the previous PR, I had only added support for one platform profile - the one for BCM2835, which one of the Raspberry Pi runs on.

And over here, more profiles: BCM2711 and OMAP 3430 were added along with the x86 IO ports. Since the code for the module was already in,
it was just as simple as getting the data in the right format, putting it on the corresponding directory and adding it to its `meson.build` :)

Onwards!

* [Port r2-uefi to Rizin-land](https://github.com/officialcjunior/rz-uefi)

Folks at [binarly.io](https://binarly.io) had made wonderful a tool named [uefi_r2](https://github.com/binarly-io/uefi_r2) which can be used to analyze
UEFI modules. I ported that to Rizin.

This tool works by analyzing the firmware using Rizin's `RzAnalysis` utilities and then by checking out with the analyzed functions, strings and 
all (For example, while searching for the UEFI guilds). Here, the tool is a Python package 
and all the interaction with `rizin` is done through `rz-pipe`'s Python module.

Finally, I added some tests (pytests) and a good CI and put it over at my GitHub profile.
This was not particularly challenging but it was indeed very informative. UEFI is insanely complex!

Alright, that's done. It was time to get back on improving the SVD plugin again.

* [Improvements in the SVD Parser plugin](https://github.com/rizinorg/rizin-extras/pull/4)

As I said, SVD files are basically XML files. Still, it wasn't so easy to parse them, at least with [yxml](https://dev.yorhel.nl/yxml) due to its small size and compact design.
We decided not to use any other XML parses since `yxml` is already used inside Rizin.
Thanks to xvilka and his comments, after a couple of days of painful debugging, I was able to parse the SVD files from 
STM and add the necessary information as flags and comments!

Here's a quick demo!                                                        
![](https://github.com/officialcjunior/rz-svd/raw/master/readme-example.gif)

Actually, the plan to end the second phase was to create a plugin inside [rz-lang](https://github.com/rizinorg/rz-lang/)- to create a
sort of wrapper above the C structs with `PyObject` and its friends so that you can interact with it from Python. Since, a solid
module for architecture (`RzArch`) hasn't been implemented yet, we switched plans and worked on improving the SVD plugin and other things.
Still, I hope I can create the plugin when it's time. That's just one of the things I'm staying for at Rizin :)

### Thanks

I would like to thank my mentors [xvilka](https://github.com/xvilka) and [wargio](https://github.com/wargio) for their guidance.
I was regularly in touch with them and they were constantly trying make sure that everything was going smooth.

I have gained amazing insights and feel very grateful to have worked and learned from one of the smartest, kindest and 
knowledgeable people I’ve ever known. Huge respect!

Also kudos to all the folks at `#Rizin-dev` and the other channels where my queries were cleared.

I'm forever indebted to the community for this amazing experience.

Best regards,

Aswin