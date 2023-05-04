---
layout: post
title: "popclip upgrading to Mountain Lion"
date: 2012-08-06 20:55
comments: true
tags: ["Mac"]
categories: ["資訊"]
---

最近把 MacBook Pro 從 OS X 10.7 (aka. Lion) 升級成 OS X 10.8 (aka. Mountain Lion) 之後，大部分的軟體都還蠻無痛升級的，其中 PopClip 在升級之後就開始秀逗秀逗，在 Safari 裡面有時 Work 有時不 Work (就是不太靈敏-偶爾會出現彈出選項，偶爾又沒有)，官方有一個解決方法是把原本的設定刪除掉讓她重新產生即可。步驟如下

<!--more-->

+ 結束 PopClip (到 Finder 點開 PopClip 後看到工作列，關了它 %}

{% img https://lh3.googleusercontent.com/-jdmTenw-Wxk/UB_C4uep6MI/AAAAAAAAEMA/kd3wpY9V4q0/s0/%2525E8%25259E%2525A2%2525E5%2525B9%252595%2525E5%2525BF%2525AB%2525E7%252585%2525A7%2525202012-08-06%252520%2525E4%2525B8%25258B%2525E5%25258D%2525889.07.49.png 800 600 "" %}

+ 打開 **終端機** (終端機的位置在 **應用程式** 裡面的 **工具程式** 資料夾裡面)，輸入下列指令：

	defaults delete com.pilotmoon.popclip

如下圖

{% img https://lh6.googleusercontent.com/-yBrqPLbIHeA/UB_C4lk8iCI/AAAAAAAAEME/u4wldwGefQA/s0/%2525E8%25259E%2525A2%2525E5%2525B9%252595%2525E5%2525BF%2525AB%2525E7%252585%2525A7%2525202012-08-06%252520%2525E4%2525B8%25258B%2525E5%25258D%2525889.09.00.png 800 600 "" %}

+ 打開 PopClip

這樣應該就解決了 PopClip 偶爾不靈敏的問題了 : %}
