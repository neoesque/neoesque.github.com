---
layout: post
title: "在 SLES 11 SP1 追加 repository"
date: 2011-04-02
comments: false
tags: ["SUSE","Linux"]
categories: ["資訊"]
---

最近敝單位在更新一些機器，長官決定採用 SLES (SUSE Linux Enterprise Sever)<br /><br />不過我最熟悉的其實是 Gentoo 對於其他 distro 像 SLES, Ubuntu 之類的都不熟<br /><br />所以大概花了一整個禮拜在研究 SLES (目前最新的是 SLES 11 service pack 1)<br /><br />其實最大的問題在於軟體 (software) 的處理不同<br /><br />Gentoo 的 portage system 實在太強大，從版本控制到 USE 控制哪些小功能要編入<br /><br />而 SLES 因為是 rpm based 的系統，而且 Enterprise Server 版似乎又很保守，一堆套件不是舊就是根本沒有 囧mm<br /><br />所以只能自己找 repository 了<br /><br />以下是新增 repository 的方法<br /><br /><code class="prettyprint"> </code> <!--more-->首先到這裡 <a href="http://software.opensuse.org/">Software OpenSUSE</a> 搜尋想要的軟體<br /><br />比方說 spawn-fcgi (這是原本 SLES 11 sp1 裡面沒有的)<br /><br />如圖 把 1. 2. 3. 都依序選好後 按搜尋<br /><br /><div class="separator" style="clear: both; text-align: center;"><img border="0" src="http://2.bp.blogspot.com/-6bpk4yDJJiA/TZcs5YpnSRI/AAAAAAAAA2g/FVIhgz3P6TY/s640/%25E8%259E%25A2%25E5%25B9%2595%25E5%25BF%25AB%25E7%2585%25A7+2011-04-02+%25E4%25B8%258B%25E5%258D%25889.56.28.jpg" width="480" /></div><br />瀏覽到想要的軟體後 對 4. 點右鍵複製網址 http://download.opensuse.org/repositories/openSUSE:/Tools/SLE_11_SP1 <br /><br />然後到終端機去打指令<br /><br />{% gist 941641 %}<br />加進 repository 之後就可以用  zypper install spawn-fcgi 安裝了!
