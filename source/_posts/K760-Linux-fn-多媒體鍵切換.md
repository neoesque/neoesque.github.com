title: "K760 Linux fn/多媒體鍵切換"
date: 2015-03-12 15:38:17
tags: ["Linux"]
categories: ["3C"]
---

羅技 [K760](http://support.logitech.com/product/wireless-solar-keyboard-k760-for-mac) 鍵盤是一個一對三的藍芽鍵盤，而且是太陽能的，免換電池，使用上還蠻方便的，可是原生是適用 Mac / iOS 裝置，小弟公司電腦裝的是 Linux，其實拿來用也不錯，不過就是有個缺點就是羅技沒有針對 Linux 出鍵盤管理程式，所以沒辦法改掉多媒體鍵，在 Linux 很少用到多媒體鍵，反而是 function key 比較常用。

所以在網路先找到了 [K810 on Linux 的解法](http://www.trial-n-error.de/posts/2012/12/31/logitech-k810-keyboard-configurator/) ，這個人有 OpenSource 他的程式碼，並且搭配了 udev 的修改，這樣電腦藍芽連接到鍵盤就會自動設定了，但是 K760 的 KeyCode 跟 K810 不一樣，所以又找了一下發現 [這篇](http://askubuntu.com/questions/326959/how-can-i-make-the-function-keys-the-default-on-a-logitech-k760-bluetooh-keyboar) 有人抓出 KeyCode 了。

<!--more-->

於是小弟就改了一下程式碼，然後放在 [GitHub](https://github.com/neoesque/k760-linux-fn-conf)，請直接 `git clone https://github.com/neoesque/k760-linux-fn-conf.git`，然後 `./build.sh` 生出來的執行檔就可以控制了。但是注意的是你的 Linux Kernel 要記得編譯進去 [Device Drivers]-[HID support]-[/dev/hidraw raw HID device support]，確定 /dev/hidraw* 有出現之後就可以打 `k760_conf -d /dev/hidraw0 -f off` 就可以把多媒體鍵變成 function key 了。

如果出現 `write: 0 were written instead of 7` 也沒關係，還是會設定進去才對。

---

相關資料

- [Logitech K810 Keyboard Configurator](http://www.trial-n-error.de/posts/2012/12/31/logitech-k810-keyboard-configurator/)
- [How can I make the function keys the default on a Logitech K760 Bluetooh keyboard?](http://askubuntu.com/questions/326959/how-can-i-make-the-function-keys-the-default-on-a-logitech-k760-bluetooh-keyboar)