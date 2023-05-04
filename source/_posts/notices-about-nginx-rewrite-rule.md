title: nginx 設定檔規則概要
date: 2013-02-26 17:47:44
tags: nginx
categories: ["資訊"]
---

這篇是記錄一些 lighttpd 轉 nginx rewrite rule 的實作與一些注意事項，最後會講一些 squid 轉 nginx 的技巧。

這裡先講一些跟 nginx rewrite 有關的重點。

首先 nginx 算是分成 `location` 跟 `rewrite`，lighttpd 是有 `url.rewrite`、`url.rewrite-repeat` 跟 `url.redirect`，其中 lighttpd 的 `url.rewrite` 就是 rewrite once 而 `url.rewrite-repeat` 則是重複一直 rewrite 的意思，這個則對應到 nginx `rewrite` 後面接的參數，也就是 `break` 跟 `last`，`break` 就是 rewrite 到此為止不要再跑 `rewrite` 了，但是 `last` 就會在重頭跑 rewrite 一次，而且 `last` 也是 `rewrite` 這個 directive 的預設值，所以如果你的 rewrite 不小心變成 loop (nginx 預設是 rewrite 10 次後就噴 500)請加上 `break`。至於 lighttpd 的 `url.redirect` 其實在 nginx 也是透過 `rewrite` 完成的，主要是加 `redirect` 跟 `permanent` 的參數，分別是回 302 跟 301。`rewrite` 的用法大約如下：

<!--more-->

```
rewrite  ^(/download/.*)/media/(.*)\..*$  $1/mp3/$2.mp3  last;
rewrite  ^(/download/.*)/media/(.*)\..*$  $1/mp3/$2.mp3  break;
rewrite ^ http://example.com$request_uri? permanent;
```

注意的是 `rewrite` 可以擺在 `server` `location` `if` 這三種 block 裡。

在完成了 `rewrite` 這個階段之後，也就是不管是被 `break` 或是 `last` 後重跑了一輪沒比對到，之後會開始比對所謂的 `location`，`location` 是用來處理 url 地址(被 rewrite 後)真正的地方，大概會長的像下面這樣。

```
location = / {
  [ configuration A ] 
}
location / {
  [ configuration B ] 
}
location /documents/ {
  [ configuration C ] 
}
location ^~ /images/ {
  [ configuration D ] 
}
location ~* \.(gif|jpg|jpeg)$ {
  [ configuration E ] 
}
```

要注意的是 `location` 有比對的順序，依序是先從有 `=` 的，然後是 `^~`，再來就是依照順序，而 location / 則可以當成一個預設值，因為他會 match 到剩下的所有 url。`location` 可以放在 `server` block 裡。

粗略的介紹完，接下來進入一些實務的介紹：

* lighttpd 原本的 `url.redirect` 就對應成 nginx 的 `rewrite http://foo.bar/ redirect`
* 如果原本的 lighttpd 後端因為是 zend 所以就會有一些 rewrite (像是特定的 static file) 是不能送到 zend 去做的，在 lighttpd 就會在 `url.rewrite-once` 看到一些 `"^/images/.*$" => "$0"` 這種的寫法，但是 nginx 沒有 $0 這種東西，這時候就直接把 $0 轉成 $uri 即可，也就是 `rewrite ^/images/ $uri last`
* 承上面那點，如果 nginx 背後的 php 是跑 zend 這類有 single entry point (什麼都交給 index.php 做 route)的架構，那樣設定會如下

```
location ~ \.php$ {
	try_files $uri =404;
	include fastcgi.conf;
	fastcgi_pass unix:/tmp/php.socket;
}

location / {
	try_files $uri $uri/ /index.php$is_args$args;
}

rewrite ^/images/ $uri last;
```

* 因為 lighttpd 的 rewrite 可以連 arguments (也就是 ? 後面的那串參數)都一起 rewrite，但是 nginx 不行，所以就變成需要在 location 裡面做(也就是先 rewrite 完 uri)，因此會變成類似這樣

```
location ^~ /abc {
    if ($args ~* "(post|put)"){
        set $args type=$1;
        rewrite ^ /dispatch;
    }
}
```

像這個例子就會把 /abc?post 變成 /dispatch?type=post 然後丟給 dispatch 這個 location (假設存在 location = /dispatch 之類的)

* 前面提到的 location 有比較順序，要注意的是只有兩種是可以接正規表示式的也就是 `~` 跟 `~*`，`~` 是有大小寫區分的，`~*` 則不分大小寫，然後 `=` 跟 `^~` 後面都是接一般的表示法，也就是下面這種都是不合法的

```
# misusing
location = ^/regular$ {}
location ^~ ^/regular2$ {}
```

但是下列的就是合法的

```
# right
location ~ ^/regular$ {} # matches $uri = '/regular'
location ^~ ^/regular2$ {} # matches $uri = '/Regular2' or '/rEgular2' ...
location = /regular3 {} # matches exactly $uri = '/regular3' with higher priority
location ^~ /regular4 {} # matches $uri = '/regular4' or '/regular41' or 'regular4a' ...
```

* 另外就是關於 `last` 跟 `break` 的詳細用法，`rewrite` 預設是 `last`，兩個最基本的差異前面有提到 `break` 會停止任何 `rewrite` 進入找 `location` 的階段，但是 `last` 會從第一個 `rewrite` 重新 rewrite 階段，但是這裡其實隱含了一個潛規則，就是如果你的 `rewrite` 是在 `location` 裡面的話，搭配 `last` 就會回到 `server` 這個 scope 的 `rewrite` 重新跑一次，但是搭配 `break` 就只會在這個 `location` 裡面找 `location`，這是值得注意的規則，所以有時候建議把 location ~ \.php$ {...} 擺在第一個，因為有時候 `location` 內的 `rewrite` 又會不小心掉回來這個 `location`，把 ~ \.php$ 擺最前面時，這樣 `rewrite ... last` 回到 server scope 遇到 php 就會給 ~ \.php$ 處理了。