---
layout: post
title: "ifconfig.me - the web ifconfig"
date: 2012-06-26 15:57
comments: true
tags: ["Linux"]
categories: ["資訊"]
---

前幾天公司同事在問我們的機器出去的 public ip 是多少，突然發現原來大家好像都不知道有一個方便的網站可以查，對於會 Unix 的來說網址是在好記不過了，就是跟 Unix 看 ip 的 ``ifconfig`` 同樣的名稱 *http://ifconfig.me*

[ifconfig.me](http://ifconfig.me) 可以取得你現在 ip 資訊的網站，不過他跟一般顯示 ip 的網站不同的是他功能比較強！

除了會顯示一些基本的資訊

{% img https://lh3.googleusercontent.com/-5BSm9ZrTOco/T-lyYRUgngI/AAAAAAAAEHM/eG84iuti-UI/s640/%25E8%259E%25A2%25E5%25B9%2595%25E5%25BF%25AB%25E7%2585%25A7%25202012-06-26%2520%25E4%25B8%258B%25E5%258D%25884.25.56.png 800 600 "" %}

他還支援了不同的網址只顯示需要的部分，比方說我們可以在 Terminal 打 `` curl ifconfig.me/ip `` 就會得到 `` 61.219.37.20 `` ，又或者 `` curl ifconfig.me/port `` 就可以知道本地端出去的 port `` 51081 ``，如果有經過 Proxy 的話 `` curl ifconfig.me/forwarded `` 還會顯示 `` 61.219.66.125, 172.30.4.166, 61.219.37.20 ``

甚至更有趣的是他也支援 XML / json ，網址分別是 *http://ifconfig.me/all.xml* 與 *http://ifconfig.me/all.json* 詳細的內容可以看 [ifconfig.me](http://ifconfig.me %}
