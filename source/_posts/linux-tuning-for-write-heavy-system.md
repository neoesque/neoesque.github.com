---
layout: post
title: "高寫入系統 Linux 效能調教"
date: 2012-11-06 21:26
comments: true
tags: ["squid", "Linux"]
categories: ["資訊"]
---

在我們使用 [squid](http://www.squid-cache.org) 的環境裡，常常遇到一個瓶頸，就是面對高 I/O 的環境底下，整個系統的效能表現會變的特別差，如果看系統的 CPU 線圖會如下(下圖爲 cacti 畫的日圖)：

{% img https://lh5.googleusercontent.com/-WhfEogOVTK8/UJkTvM-bZXI/AAAAAAAAEZE/QRegjwaXFC8/s566/graph_image.png 800 600 %}

<!--more-->

可以看到在深夜時段(也就是大量 request 圖片)時 I/O wait 整個就咬死 CPU，因爲在大量的 request 進來時 squid 會有同時的磁碟寫入跟讀取，不過我們的系統是 IBM 的 blade server 配有 ServerRAID 8k 的卡，上面有 256MB 的 Read/Write Cache/Buffer，所以總覺的讀寫性能應該可以不錯才對，可是偏偏就是在晚上很容易拖慢系統的速度。後來找到了幾個可能的參數調一調之後，現在系統的線圖如下(此爲周圖)：

{% img https://lh4.googleusercontent.com/-oCMaEmuOPGE/UJkTvGOylhI/AAAAAAAAEZI/C_Zla2Tuwzc/s566/graph_image2.png 800 600 %}

可以看到在中間過後(也就是修改後)，整體系統的 I/O waiting 就降低了，這中間的修改其實是動了下列的 Linux kernel 參數：

主要都是在 `/etc/sysctl.conf` 這個檔案 新增/修改 以下參數 (影響的資料夾在 `/proc/sys/vm/`)

+ `vm.dirty_background_ratio = 1` 這個參數主要是降低 Linux 寫檔案(dirty page)的 buffer 大小，如果是寫入的量很大的系統建議降低此值，因爲這樣會讓寫入更連續而且一致，而不會分批次每次都寫入大量的資料，Linux 原本預設的值太大了，這個值的算法是 `MemFree + Cached - Mapped` (指令 `cat /proc/meminfo` 可以看到) 假設我們算出來系統有 3G 而這個值爲 10 時表示 10% 則相當於超過 300MB 的 dirty page 才開始回寫硬碟，我猜是因爲這樣讓 Linux 的 I/O 變的很慢，因爲這個值也大於 RAID 卡的記憶體了，而且邊寫入又一直有 dirty page 一直進來，所以建議把這個值降低，我是直接設定成 1 也就是 1% 約 30M 就開始寫；相對於百分比，Linux 後來的 2.6.29 kernel 加入了 `vm.dirty_background_bytes` 是以 bytes 來計算
+ `vm.dirty_ratio = 2` 相對於 `vm.dirty_background_ratioad` 是所謂的"背景"寫入，實際上是透過 Linux 裏面的一隻叫 `pdflush kernel thread` 來回寫，`vm.dirty_ratio` 是如果 dirty page 真的超過多少就強制回寫，而不是透過背景慢慢回寫，所以 `vm.dirty_ratio` 更硬性，而`vm.dirty_background_ratio` 則相對較於軟性，也因爲這個特性當然 `vm.dirty_background_ratio` 是不會超過 `vm.dirty_ratio` 的，預設上(或者設定錯誤時) `vm.dirty_background_ratio` = `vm.dirty_ratio` /2 ,所以如果 `vm.dirty_background_ratio = 1` 則我們可以設定 `vm.dirty_ratio = 2`，同樣的 2.6.29 之後也有一個 `vm.dirty_bytes`
+ `vm.dirty_writeback_centisecs = 100` 單位是百分之一秒，這個就是多久要觸發回寫，預設也蠻大的好像有 500，也就是 5 秒才寫一次，建議在高寫入的系統設定短一點，我設定成 100 也就是每秒寫入一次(反正是先寫回 raid 卡的 cache)，這樣以來可以讓寫入更均勻。
+ `vm.dirty_expire_centisecs = 1000` 單位也是百分之一秒，這個是表示 dirty page 過了多久之後下次 `pdflush kernel thread` 醒來時就會被寫回硬碟，預設是 3000 也就是 30 秒，一樣可以設低一點讓寫入均勻化，不過太低會一直寫，也不宜太低。

---

參考資料:

+ [Android/Linux Kernel 記憶體管理-入門筆記](http://loda.hala01.com/2012/10/androidlinux-kernel-記憶體管理-入門筆記/)
+ [The Linux Page Cache and pdflush](http://www.westnet.com/~gsmith/content/linux-pdflush.htm)
