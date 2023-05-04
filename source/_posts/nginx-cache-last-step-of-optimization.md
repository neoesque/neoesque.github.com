---
layout: post
title: "nginx cache - last step of optimization"
date: 2012-07-15 21:00
comments: true
tags: ["nginx"]
categories: ["資訊"]
---

最近在把敝單位的 Web Server 從原本的 lighttpd 轉換成 nginx，當然除了複雜的 rewrite rule 要寫，還有就是想盡量榨出 nginx 的效能及所有功能，而 nginx 除了很多參數可以調整之外當然也有更多內建的功能有點類似現在的 All-in-One 小巧但是功能完整！

調整了很多參數之後，說實在的也不知道有什麼可以調整了，查一查網路發現：對呀！ nginx 有 cache 的模組可以用阿，因為這次轉換的機器有 php 的部分，而且大部分是出圖跟利用 php 來做 javascript 模組的合併(就是所謂的 combo loader)，這些幾乎都是做一次就不會在更改結果的，所以就查了一下 nginx 的 fastcgi cache 的設定：

在 `http` 的 section 加入

    fastcgi_cache_path /dev/shm/cache/ levels=1:1 keys_zone=PHP:8m inactive=60m max_size=256m;

然後在 `location ~ \.php$` 的 section 裡面加入
<!--more-->

    fastcgi_cache PHP;
    fastcgi_cache_valid 200 7d;

這樣 nginx 就會利用 `/dev/shm/cache` 當作快取，由於 /dev/shm 是記憶體所以速度相當的快，而記憶體的 cache 則是在 `keys_zone` 的第二部分也就是開了 8MB，而這塊快取的名字叫做 `PHP` 之後會用到，至於 `inactive` 就是用來指定快取裡面的物件多久之後沒有用到就要被剔除掉，然後最後面的 `max_size` 則是硬碟要用多少當 cache，由於通常 /dev/shm 預設會是記憶體大小的一半所以這裡就適當的調整大小。接著在用到 fastcgi 的地方，通常就是 `location ~ \.php$` 這段，加入 `fastcgi_cache PHP;` 的設定，這樣就會讓經過 fastcgi 的 request 也收進PHP 這塊的暫存區了，但是什麼東西才要記起來呢？這個則要透過 `fastcgi_cache_valid` 來指定。

來看看啟用後神奇的效果 : %}

{% img https://lh3.googleusercontent.com/-eoc0HB1J2F8/UALL9fMD1HI/AAAAAAAAELY/K6ChB-3PwBQ/s582/graph_image.php-2.jpg 800 600 "" %}

可以看到啟用後... php 就不工作了(誤)，因為大部分的都在 cache 的階段就出去了，不過注意的是當 nginx 看到 header 有 `Pragma:no-cache` 就不會加進去快取了。所以這個比較適合前面提到的 php 是用來出圖或者合併 javascript 等所謂的靜態內容。當然除了 CPU 的閒置，另外 response time 也增快很多，因為不需要經過 php 的運算了。

結論就是：最佳化的最後一步就是加快取什麼就都解決了 XD

---

參考資料:

+ [nginx fastcgi_cache](http://wiki.nginx.org/HttpFastcgiModule#fastcgi_cache %}
