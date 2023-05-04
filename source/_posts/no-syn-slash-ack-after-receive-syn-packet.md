---
layout: post
title: "Server 收到 SYN packet 後沒有 SYN/ACK 回應"
date: 2012-04-17 15:40
comments: true
tags: ["Linux"]
categories: ["資訊"]
---

這是最近管發生的怪現象，就是公司某個單位一直跟我們說他們的 Server 要連我們的 Server，結果我們這邊時好時壞，... 什麼?! 我們這邊時好時壞? 從沒有聽過用戶說我們的 Server 連不上阿，於是就跟他們一起 Debug，開了 `` tcpdump `` 來看，發現我們這邊的確有時候收到 SYN 結果就不回 SYN/ACK kernel 直接 drop 封包 XD 這是什麼鬼，kernel 也太不聽話了，不過我們這邊 kernel 沒有打開 iptables 也沒有什麼 drop 封包的規則，於是就 Google 了一下，原來有人跟我們遇到一樣的狀況 [Why would a server not send a SYN/ACK packet in response to a SYN packet](http://serverfault.com/questions/235965/why-would-a-server-not-send-a-syn-ack-packet-in-response-to-a-syn-packet)

簡單的來說跟我們一模一樣，隨機的不回 SYN ，根據那篇文章說的，解法有下列兩種：

+ 關掉 client 的 tcp window scaling

不過這個顯然不是什麼好的方法，因為我們不能限制 client 阿

+ 關掉 server 的 tcp window scaling 跟 tcp timestamps

看起來是因為 client 送的 tcp window size 不被 server 接受所以就 drop 掉，可是為什麼是 SYN 就被 drop 實在是不可得知。不過我們的 Server 後來加了以下設定後的確就好了：

	net.ipv4.tcp_tw_reuse = 0
	net.ipv4.tcp_tw_recycle = 0
	net.ipv4.tcp_window_scaling = 0
	net.ipv4.tcp_timestamps = 0
	net.ipv4.tcp_sack = 0

---

參考資料:

+ [sysctl](https://wiki.archlinux.org/index.php/Sysctl)
+ [Handling TCP Window Scaling](http://www.ecr6.ohio-state.edu/window-scaling.html)
+ [Ipsysctl tutorial](http://www.frozentux.net/ipsysctl-tutorial/ipsysctl-tutorial.html)
