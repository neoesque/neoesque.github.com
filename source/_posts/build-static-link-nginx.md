title: build static link nginx
date: 2014-04-09 18:06:43
tags: ['nginx', 'Linux']
categories: ["資訊"]
---

因為敝公司系統的環境有 OpenSUSE 跟 SUSE Linux Enterprise Sever SP2/SP3 混合，所以要更新 nginx 時往往要生出三個版本，實在有點搞人，不過其實也可以不要理會 libcrypt 版本不合的訊息啦，可是還是覺得編譯一個萬用的版本比較方便維護。

nginx 一共需要用到 libpthread, libcrypt, libpcre, libssl, libcrypto, libz, libdl，其中可以另外設定的有 OpenSSL, PCRE, Zlib 這三種，可以提供 libcrypt, libpcre, libssl, libcrypto, libz, libdl，然後 pthread 的就靠系統提供的 static 的 .a 了，所以要生出編譯的指令如下：

{% gist 27c86d8318500a239858 %}

備註：假設 我們自己 Download 的 openssl, pcre, zlib 的原始碼都放在 /usr/src 底下