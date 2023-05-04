title: solve dmesg appeared nouveau No connectors reported connected with modes after upgrading kernel to 3.8 or later
date: 2013-05-31 22:29:10
tags:
- Linux
categories: ["資訊"]
---

  My Linux box installed a nVidia GeForce GT210 (a.k.a. Chipset GT218) graphic card. Before kernel 3.7, I append `video=VGA-1:1440x900@60` to kernel parameters. Because I use a 2-meter-long VGA line to connect my computer and monitor, I have to enforce using VGA port as display output. And it works perfectly.

  The dmesg before kernel 3.7 says

```
[drm] Initialized drm 1.1.0 20060810
[drm] nouveau 0000:01:00.0: Detected an NV50 generation card (0x0a8280a2)
[drm] nouveau 0000:01:00.0: Checking PRAMIN for VBIOS
[drm] nouveau 0000:01:00.0: ... appears to be valid
[drm] nouveau 0000:01:00.0: Using VBIOS from PRAMIN
[drm] nouveau 0000:01:00.0: BIT BIOS found
[drm] nouveau 0000:01:00.0: Bios version 70.18.2c.00
[drm] nouveau 0000:01:00.0: TMDS table version 2.0
[drm] nouveau 0000:01:00.0: MXM: no VBIOS data, nothing to do
[drm] nouveau 0000:01:00.0: DCB version 4.0
[drm] nouveau 0000:01:00.0: DCB outp 00: 01000302 00020030
[drm] nouveau 0000:01:00.0: DCB outp 01: 02000300 00000000
[drm] nouveau 0000:01:00.0: DCB outp 02: 02011362 0f220010
[drm] nouveau 0000:01:00.0: DCB outp 03: 01022310 00020010
[drm] nouveau 0000:01:00.0: DCB conn 00: 00001030
[drm] nouveau 0000:01:00.0: DCB conn 01: 00202161
[drm] nouveau 0000:01:00.0: DCB conn 02: 00000200
[drm] nouveau 0000:01:00.0: Parsing VBIOS init table 0 at offset 0xD0B7
[drm] nouveau 0000:01:00.0: 0xD40D: Condition still not met after 20ms, skipping following opcodes
[drm] nouveau 0000:01:00.0: 0xD411: Condition still not met after 20ms, skipping following opcodes
[drm] nouveau 0000:01:00.0: Parsing VBIOS init table 1 at offset 0xD608
[drm] nouveau 0000:01:00.0: Parsing VBIOS init table 2 at offset 0xE0DA
[drm] nouveau 0000:01:00.0: Parsing VBIOS init table 3 at offset 0xE10F
[drm] nouveau 0000:01:00.0: Parsing VBIOS init table 4 at offset 0xE2C2
[drm] nouveau 0000:01:00.0: Parsing VBIOS init table at offset 0xE327
[drm] nouveau 0000:01:00.0: 0xE327: Condition still not met after 20ms, skipping following opcodes
[TTM] Zone  kernel: Available graphics memory: 3051544 kiB
[TTM] Zone   dma32: Available graphics memory: 2097152 kiB
[TTM] Initializing pool allocator
[TTM] Initializing DMA pool allocator
[drm] nouveau 0000:01:00.0: Detected 512MiB VRAM (DDR2)
mtrr: type mismatch for e0000000,10000000 old: write-back new: write-combining
[drm] nouveau 0000:01:00.0: 512 MiB GART (aperture)
[drm] Supports vblank timestamp caching Rev 1 (10.10.2010).
[drm] No driver support for vblank timestamp query.
[drm] nouveau 0000:01:00.0: 3 available performance level(s)
[drm] nouveau 0000:01:00.0: 0: core 135MHz shader 270MHz memory 135MHz voltage 850mV
[drm] nouveau 0000:01:00.0: 1: core 405MHz shader 810MHz memory 405MHz voltage 900mV
[drm] nouveau 0000:01:00.0: 3: core 589MHz shader 1402MHz memory 400MHz voltage 1000mV
[drm] nouveau 0000:01:00.0: c: core 405MHz shader 810MHz memory 405MHz voltage 900mV
[drm] nouveau 0000:01:00.0: allocated 1440x900 fb: 0x310000, bo ffff8801a78dc000
fbcon: nouveaufb (fb0) is primary device
[drm] nouveau 0000:01:00.0: no native mode, forcing panel scaling
Console: switching to colour frame buffer device 180x56
fb0: nouveaufb frame buffer device
```

  The kernel 3.7 or prior version was enforced using VGA as output successfully. And the resolution is right.

  But after upgrading to 3.8 or above, I found that the parameter `video=VGA-1:1440x900@60` causes a faulty screen after booting. I google it, and find some people bump into the same problem. [No signal to monitor after kernel modesetting fails](https://bugzilla.redhat.com/show_bug.cgi?id=910945) [Problems with kernel-3.8 and kernel-3.9 modesetting](http://forums.fedoraforum.org/showthread.php?t=289189)

  The kernel 3.8 or above says

```
[drm] Initialized drm 1.1.0 20060810
nouveau  [  DEVICE][0000:01:00.0] BOOT0  : 0x0a8280a2
nouveau  [  DEVICE][0000:01:00.0] Chipset: GT218 (NVA8)
nouveau  [  DEVICE][0000:01:00.0] Family : NV50
nouveau  [   VBIOS][0000:01:00.0] checking PRAMIN for image...
nouveau  [   VBIOS][0000:01:00.0] ... appears to be valid
nouveau  [   VBIOS][0000:01:00.0] using image from PRAMIN
nouveau  [   VBIOS][0000:01:00.0] BIT signature found
nouveau  [   VBIOS][0000:01:00.0] version 70.18.2c.00.04
nouveau  [     PFB][0000:01:00.0] RAM type: DDR2
nouveau  [     PFB][0000:01:00.0] RAM size: 512 MiB
nouveau  [     PFB][0000:01:00.0]    ZCOMP: 960 tags
nouveau  [  PTHERM][0000:01:00.0] FAN control: none / external
nouveau  [  PTHERM][0000:01:00.0] fan management: disabled
nouveau  [  PTHERM][0000:01:00.0] internal sensor: yes
[TTM] Zone  kernel: Available graphics memory: 3050978 kiB
[TTM] Zone   dma32: Available graphics memory: 2097152 kiB
[TTM] Initializing pool allocator
[TTM] Initializing DMA pool allocator
mtrr: type mismatch for e0000000,10000000 old: write-back new: write-combining
nouveau  [     DRM] VRAM: 512 MiB
nouveau  [     DRM] GART: 512 MiB
nouveau  [     DRM] TMDS table version 2.0
nouveau  [     DRM] DCB version 4.0
nouveau  [     DRM] DCB outp 00: 01000302 00020030
nouveau  [     DRM] DCB outp 01: 02000300 00000000
nouveau  [     DRM] DCB outp 02: 02011362 0f220010
nouveau  [     DRM] DCB outp 03: 01022310 00020010
nouveau  [     DRM] DCB conn 00: 00001030
nouveau  [     DRM] DCB conn 01: 00202161
nouveau  [     DRM] DCB conn 02: 00000200
[drm] Supports vblank timestamp caching Rev 1 (10.10.2010).
[drm] No driver support for vblank timestamp query.
nouveau  [     DRM] 3 available performance level(s)
nouveau  [     DRM] 0: core 135MHz shader 270MHz memory 135MHz voltage 850mV
nouveau  [     DRM] 1: core 405MHz shader 810MHz memory 405MHz voltage 900mV
nouveau  [     DRM] 3: core 589MHz shader 1402MHz memory 400MHz voltage 1000mV
nouveau  [     DRM] c: core 405MHz shader 810MHz memory 405MHz voltage 900mV
nouveau  [     DRM] MM: using COPY for buffer copies
nouveau 0000:01:00.0: No connectors reported connected with modes
[drm] Cannot find any crtc or sizes - going 1024x768
nouveau  [     DRM] allocated 1024x768 fb: 0x70000, bo ffff8801a7c37c00
fbcon: nouveaufb (fb0) is primary device
```

  The kernel 3.8 says it cannot find a connector?

  I read the documents of KMS, and then I solved the problem.

<!--more-->

  The document [Kernel Mode-setting](http://nouveau.freedesktop.org/wiki/KernelModeSetting/) says if you want to enforce some output, you should append "e" after the parameter. So that's how I solved my problem. The parameter is just modified to `video=VGA-1:1440x900@60e`, and that's all. Test your new kernel now! :)

  That's what my kernel (3.9.3) says now

```
[drm] Initialized drm 1.1.0 20060810
nouveau  [  DEVICE][0000:01:00.0] BOOT0  : 0x0a8280a2
nouveau  [  DEVICE][0000:01:00.0] Chipset: GT218 (NVA8)
nouveau  [  DEVICE][0000:01:00.0] Family : NV50
nouveau  [   VBIOS][0000:01:00.0] checking PRAMIN for image...
nouveau  [   VBIOS][0000:01:00.0] ... appears to be valid
nouveau  [   VBIOS][0000:01:00.0] using image from PRAMIN
nouveau  [   VBIOS][0000:01:00.0] BIT signature found
nouveau  [   VBIOS][0000:01:00.0] version 70.18.2c.00.04
nouveau  [     PFB][0000:01:00.0] RAM type: DDR2
nouveau  [     PFB][0000:01:00.0] RAM size: 512 MiB
nouveau  [     PFB][0000:01:00.0]    ZCOMP: 960 tags
nouveau  [  PTHERM][0000:01:00.0] FAN control: none / external
nouveau  [  PTHERM][0000:01:00.0] fan management: disabled
nouveau  [  PTHERM][0000:01:00.0] internal sensor: yes
nouveau  [  PTHERM][0000:01:00.0] programmed thresholds [ 90(3), 95(3), 105(5), 135(5) 
[TTM] Zone  kernel: Available graphics memory: 3051030 kiB
[TTM] Zone   dma32: Available graphics memory: 2097152 kiB
[TTM] Initializing pool allocator
[TTM] Initializing DMA pool allocator
mtrr: type mismatch for e0000000,10000000 old: write-back new: write-combining
nouveau  [     DRM] VRAM: 512 MiB
nouveau  [     DRM] GART: 512 MiB
nouveau  [     DRM] TMDS table version 2.0
nouveau  [     DRM] DCB version 4.0
nouveau  [     DRM] DCB outp 00: 01000302 00020030
nouveau  [     DRM] DCB outp 01: 02000300 00000000
nouveau  [     DRM] DCB outp 02: 02011362 0f220010
nouveau  [     DRM] DCB outp 03: 01022310 00020010
nouveau  [     DRM] DCB conn 00: 00001030
nouveau  [     DRM] DCB conn 01: 00202161
nouveau  [     DRM] DCB conn 02: 00000200
[drm] Supports vblank timestamp caching Rev 1 (10.10.2010).
[drm] No driver support for vblank timestamp query.
nouveau  [     DRM] 3 available performance level(s)
nouveau  [     DRM] 0: core 135MHz shader 270MHz memory 135MHz voltage 850mV
nouveau  [     DRM] 1: core 405MHz shader 810MHz memory 405MHz voltage 900mV
nouveau  [     DRM] 3: core 589MHz shader 1402MHz memory 400MHz voltage 1000mV
nouveau  [     DRM] c: core 405MHz shader 810MHz memory 405MHz voltage 900mV
nouveau  [     DRM] MM: using COPY for buffer copies
[drm] forcing VGA-1 connector ON
nouveau  [     DRM] allocated 1440x900 fb: 0x70000, bo ffff8801a83f8000
fbcon: nouveaufb (fb0) is primary device
```

  As you can see the line shows "[drm] forcing VGA-1 connector ON".

  I think the problem maybe cause by the parameter check is more strict now.