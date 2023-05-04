---
layout: post
title: "Unix 另一個分段下載程式(也是 bt downloader) - aria2"
date: 2011-05-20
comments: false
tags: ["Gentoo","Linux"]
categories: ["資訊"]
---

之前我在 Gentoo 上因為 portage 都要下載原始碼做編譯安裝的動作<br /><br />所以為了加快下載會另外安裝 <a href="http://axel.alioth.debian.org/">axel</a><br /><br />但是今天我發現有更多功能的程式可以用(顯然違背 Unix 哲學 do one thing and do it well)<br /><br />不過不管哪個 反正好用的程式一定要多推廣的 XD<br /><br />就是 <a href="http://aria2.sourceforge.net/">aria2</a><br /><br />他具有以下特色<br /><!--more--><ol><li>支援 HTTP/HTTPS/FTP/BitTorrent</li><li>支援多段下載</li></ol><br />所以就把它裝起來吧<br /><br />{% gist 982987 %}<br />然後修改 <em>/etc/make.conf</em> 加入下段<br /><br />{% gist 982992 %}<br />然後下次在 <strong>emerge</strong> 的時候<br /><br />就會改用 aria2 下載啦~
