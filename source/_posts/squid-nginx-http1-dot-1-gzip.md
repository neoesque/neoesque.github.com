---
layout: post
title: "squid nginx http1.1 gzip"
date: 2012-07-07 19:23
comments: true
tags: ["Linux", "nginx", "squid"]
categories: ["資訊"]
---

在 nginx 中要啟用 gzip 非常簡單，只要在 http 的段落裡面加入

    gzip  on;
    gzip_http_version 1.0;
    gzip_comp_level 9;
    gzip_proxied any;
    gzip_min_length 1400;
    gzip_types text/css application/x-javascript text/javascript;
    gzip_vary on;

但是加了之後，因為我們前端還有先過 squid，結果發現怎麼有的 css 檔就是沒有被 gzip，但是有些 js 檔卻又有，在網路查到原來是還要在 squid.conf 加入

	cache_vary on
	broken_vary_encoding allow all

這是因為啟用 gzip 後，HTTP Header 也會加入 `Vary:Accept-Encoding`，加了上面的設定才可以讓 squid 保存 gzip 的內容，不會很自作聰明的解壓縮在傳給 client 端，不過網路另有一說是因為 squid 不是完整的支援 HTTP1.1 的 protocol，所以在面對 gzip HTTP1.0 跟 HTTP1.1 的版本的時候就會有問題，不過我有在 nginx 加了 `gzip_http_version 1.0` 了還是一樣有問題，加了那兩行才 ok。

<!--more-->

另外一個問題是在 nginx 裡面預設是有支援 Connection:Keep-Alive ，但是經過 squid 之後每次 Header 都只有直接出 `Connection:Close`，在網路好像沒什麼相關的討論，後來突然想到會不會也是因為 squid 沒有完整支援 HTTP1.1 的 protocol 害得，後來查了 squid 的 Document 發現可以手動打開 HTTP1.1 的方法(不過不是完全支援)，打開的方式如下

    http_port 80 accel vhost http11
    cache_peer 127.0.0.1 parent 80 0 originserver proxy-only no-digest no-query http11

對於 `http_port http11` 來說就是對 Client 端啟用支援 HTTP1.1，我們可以在加入後看到 Header 的部分都會回傳 `HTTP/1.1 200 OK` 而原本沒有 `http11` 的話則預設就是 `HTTP/1.0 200 OK`，後者 `cache_peer http11` 則是對後端 Server 啟用 HTTP1.1 ，我們可以在 nginx 的 access_log 看到 `GET /xxxx/xxxx.jpg HTTP/1.1` 而如果沒有 `http11` 的話則會是 `GET /xxxx/xxxx.jpg HTTP/1.0`，在加了 `cache_peer http11` 之後我們也要把剛剛 nginx gzip 用 1.0 的方式改一下所以把剛剛 nginx 的設定改成

    gzip_http_version 1.1;

改成 HTTP1.1 的方式回給 Client 之後，由於 1.1 的 protocol 規範，預設是啟用 Persistent Connections 的除非 Header 出現 `Connection:Close` 才表示關閉長連接，但是在 HTTP1.0 當中預設是關閉的，除非出現 `Connection： keep-alive` 才表示啟用，在打開 HTTP1.1 之後目前還沒有什麼問題，雖然也不知道到底 Persistent Connections 有沒有生效 = ="

最後在 squid 啟用 HTTP1.1 會跟 POST 的方法打架，因為HTTP1.1 規定 POST 之後不得有任何符號，但是有些瀏覽器會自己補上去 CRCL，結果就是 squid 會回看不懂，不過由於這次的 Server 沒有要收 POST ，所以還是給她大力的開下去！如果真的要避掉 POST 出錯可以在 `squid.conf` 加入

    ignore_expect_100 on

---

參考資料:

+ [broken_vary_encoding](http://blog.xuite.net/happyman/tips/14490890)
+ [Compatibility with HTTP/1.0 Persistent Connections](http://www.freesoft.org/CIE/RFC/2068/248.htm)
+ [Squid TCP_MISS / 417](http://blog.xuite.net/starsand/programming/35922253-Squid+TCP_MISS+%2F+417)
+ [ignore expect 100](http://www.squid-cache.org/Doc/config/ignore_expect_100)
