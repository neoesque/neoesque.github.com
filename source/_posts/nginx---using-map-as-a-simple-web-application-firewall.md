title: 用 map 的功能把 nginx 變成簡單的應用程式防火牆
date: 2013-04-14 11:44:22
tags: nginx
categories: ["資訊"]
---

要幫 nginx 增加安全性的話，大概首推 [modsecurity](http://www.modsecurity.org/projects/modsecurity/nginx/) 這個模組了，不過目前他只有支援 nginx 1.2 穩定版，尚未支援 1.3 開發版，基本上具有下列功能

1. 超過 16000 規則防範下列攻擊
 * SQL injection
 * Cross-site Scripting (XSS)
 * Local File Include
 * Remote File Include
2. 可客製化規則，保護下列的應用
 * WordPress
 * cPanel
 * osCommerce
 * Joomla
3. 包含了 OWASP Core Rule Set
4. IP 聲望偵測
5. Malware Detection

不過有一些在更簡單的功能，像是有時候會自己想擋一些 bot，或者要判斷合法的 referrer 才給過之類的就不在這個之內了，這時候我們可以利用 [map](http://wiki.nginx.org/HttpMapModule) 來幫我們做簡單的過濾。

<!--more-->

首先 `map` 只能夠放在 `http` 的 scope 內，所以我們可以在 `http` 內擺下列規則

```
map $request_method $bad_method {
	default 1;
	~*(get|head|post) 0;
}
map $http_user_agent $bad_bot {
	default 0;
	~*^curl 1;
	~*^flashget 1;
	~*^java 1;
	~^$ 1;
}
map $query_string $bad_query {
	default 0;
	~[a-zA-Z0-9_]=(\.\.%2F(%2F)?)+ 1;
	~[a-zA-Z0-9_]=%2F([a-z0-9_.]+%2F(%2F)?)+ 1;
}
```

`map` 的用法很簡單，第一個參數給的是要做比較的對象通常就是 http core 可以使用的那些變數可以參考 [這裡](http://wiki.nginx.org/HttpCoreModule#Variables)，然後第二個參數就是覆寫過後的變數名稱，再來大刮號內首先給這個變數一個預設值也就是 `default xxx;`，後面就開始接比較的方法跟如果 match 到要給第二個變數什麼值，通常有三種表示法以 `~` `~*` 跟不是這兩個開頭的，以 `~` 跟 `~*` 開頭的表示要用正規表示式來比對，沒有的就表示是常規的方式比對(直接比對)，所以剛剛的範例來說可以用下面的來解釋

```
# 比對 $request_method 然後比對後的值放 $bad_method
map $request_method $bad_method {
	# 把 $bad_method 設定成 0
	default 1;
	# 如果 $request_method 是 GET 或 HEAD 或 POST 就把 $bad_method 設成 0
	~*(get|head|post) 0;
}

# 比對 $http_user_agent 比對的值放 $bad_bot
map $http_user_agent $bad_bot {
	# $bad_bot 預設是 0
	default 0;
	# user agent 遇到 curl / flashget / java 或者完全是空的就設成 1
	~*^curl 1;
	~*^flashget 1;
	~*^java 1;
	~^$ 1;
}

# 比對 ? 後面的參數
map $query_string $bad_query {
	default 0;
	# 如果遇到要 access 檔案的 比方說 a=..%2Fetc%2Fpasswd 之類的 $bad_query 就設成 1
	~[a-zA-Z0-9_]=(\.\.%2F(%2F)?)+ 1;
	# 這個是 a=%2Fetc%2F 之類的
	~[a-zA-Z0-9_]=%2F([a-z0-9_.]+%2F(%2F)?)+ 1;
}
# 註: %2F 就是 /
```

然後我們要在 `server` 的 context 擺下面的設定才會生效(建議擺在最上面就可以了

```
if ($bad_method = 1) {
	return 444;
}
if ($bad_bot = 1) {
	return 444;
}
if ($bad_query = 1) {
	return 444;
}
```

這樣就會把我們不想要的 request 都過濾掉了。




