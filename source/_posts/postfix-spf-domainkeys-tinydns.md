---
layout: post
title: "設定 SPF 跟 DomainKeys 在 postfix 和 tinydns"
date: 2012-04-18 20:22
comments: true
toc: true
tags: ["Linux"]
categories: ["資訊"]
---

部門最近有架 Mail Server 的需求，要架 Mail Server 首先要搞定不讓自己寄出去的信被當作 Spam，參考 Google 的 [電子郵件驗證](https://support.google.com/mail/bin/answer.py?hl=zh-TW&answer=180707) 中說的，要可以被 [驗證和識別](http://support.google.com/mail/bin/answer.py?hl=zh-Hant&answer=81126#authentication)，通常就是 Domain 要發佈 SPF 跟簽署 DKIM(DomainKeys Identified Mail) 或最古老的 DomainKeys，不過有了 DKIM 後原本單純 DomainKeys 就被廢棄了(當然目前還是可以用的)。我們單位用的 mail server 是 Postfix 而 DNS 則是 tinydns (djbdns %}

### 設定 SPF

SPF 只是簡單的 DNS TXT 發佈而已，可以利用 [easySPF](http://spfwizard.com) 製作。於是在 tinydns 的設定檔加入下列資訊：

	'foo.bar:v=spf1 ip4\07211.22.33.44/32 ~all:600

這裡用 `` foo.bar `` 當作 domain，而 `` 11.22.33.44 `` 則是 Server 寄信出來的 public ip，這樣子就完成啦~

我們用 `` dig TXT foo.bar @8.8.8.8 +tcp `` 可以觀察到

	;; ANSWER SECTION:
	foo.bar.		600 	IN	TXT	"v=spf1 ip4:11.22.33.44/32 ~all"

### 設定 DKIM
<!--more-->
先到 [DKIM](http://www.opendkim.org) 的官網下載，然後編譯的參數用 `` ./configure --with-openssl --with-milter ``， `` make install `` 裝好之後我們先編輯 _/etc/postfix/opendkim.conf_

	Domain                  foo.bar
	KeyFile                 /etc/postfix/rsa.private
	InternalHosts           /etc/postfix/ilist
	Selector                dk
	Socket                  inet:8891@localhost
	Syslog                  Yes
	UserID                  postfix

以下分開說明每個參數的作用：

* Domain : 就是我們要 sign 的 domain
* KeyFile : 由於 DKIM 或者 Domainkeys 都是靠非對稱加解密方式(像 RSA)作驗證，所以需要一把 private/public key，這裡填入的是 sign 需要的 private key

這裡先說明怎麼建立這兩把 key

	openssl genrsa -out /etc/postfix/rsa.private 512
	openssl rsa -in /etc/postfix/rsa.private -out /etc/postfix/rsa.public -pubout -outform PEM

其中第二把分離出來的 public key 就有我們要填到 DNS 的資訊， `` cat /etc/postfix/rsa.public ``大概會長的像下面一樣

	-----BEGIN PUBLIC KEY-----
	MFwwDQYJKoZIhvcNAQEBBQADSwAwSAJBAL+BLtIPf6o3YlrLJUO8b++v4Jc9ppkf
	tBdRZfTB0jprUosjt+QHmY8t8bPFEK83XmRrSTEh94MJOjbXwN7AhGcCAwEAAQ==
	-----END PUBLIC KEY-----

從 MF...(略)...Q== 就是我們要填的資訊

* InternalHosts：這個檔案就是告訴 DKIM 從哪些 ip 來的 relay 我們都要 sign mail，格式如下：


	127.0.0.1
	10.0.0.0/8

事實上官方文件說從 2.2 之後不需要這個檔案， opendkim 會自動判斷 header 的 From 只要等於 Domain 就會自動 sign，可是我實驗的結果沒有成功 = =，所以還是加上去了。

* Selector：這個是驗證時候要用的 subdomain，就隨便定一個名稱吧。
* Socket：由於 opendkim 是一個 daemon，這是他要 listen 的 socket (unix domain socket 也是 ok 的 %}
* Syslog：要不要使用 syslog 來記錄，會被歸類在 mail facility。
* UserID：daemon 的 UID

設定也好了之後我們就來啟動 daemon 吧！指令很簡單 `` opendkim -x /etc/postfix/opendkim.conf -A -l ``，搞定收工。這樣 opendkim 就會 listen 在 port 8891 了。

然後我們要設定讓 postfix 吃到這個 milter，在 _/etc/postfix/main.cf_ 加入下列資訊：

	smtpd_milters = inet:localhost:8891
	non_smtpd_milters = inet:localhost:8891

然後 `` /etc/init.d/postfix restart `` 就完成了 opendkim 的設置。

接下來是 tinydns 的設定，還記得剛剛的 public key 嗎?我們需要它了，打開 tinydns 的設定，加入下列資訊：

	'_domainkey.foo.bar:o=-:600
	'dk._domainkey.foo.bar:k=rsa; p=MFwwDQYJKoZIhvcNAQEBBQADSwAwSAJBAL+BLtIPf6o3YlrLJUO8b++v4Jc9ppkftBdRZfTB0jprUosjt+QHmY8t8bPFEK83XmRrSTEh94MJOjbXwN7AhGcCAwEAAQ==:600


其中的 \_domainkey. 這個 subdomain 是固定的一定要叫這樣才會 work，我後來才發現(因為懶得慢慢嗑 SPEC 試了好久 QQ)，而第二行的 dk.\_domainkey. 的這個 dk 則是對應前面 _/etc/postfix/opendkim.conf_ 的 *Selector*

這樣整個 DKIM 驗證設定就完成了。

### Domainkeys

由於我們已經設定好了 key ，所以接下來要設定 Domainkeys 就簡單多了，首先到 [domainkeys-milter](http://sourceforge.net/projects/dk-milter/) 下載，然後編譯的指令是 `` sh Build -c && sh Build install `` 裝好之後，由於 dk-milter 比較傳統只有支援 command line 的指令所以沒有設定檔支援，要啟動他的指令如下 `` /usr/bin/dk-filter -i /etc/postfix/ilist -l -b sv -p inet:8892@localhost -d foo.bar -H -s /etc/postfix/rsa.private -S dk & ``

指令的內容其實都跟 opendkim 一樣(其實是 opendkim 跟他一樣才對 XD)，應該不難理解，所以就這樣啦，然後注意的是我讓 dk-milter listen 在 8892，而 key 則用剛剛產生的，然後我們一樣要修改 _/etc/postfix/main.cf_

	smtpd_milters = inet:localhost:8891, inet:localhost:8892
	non_smtpd_milters = inet:localhost:8891, inet:localhost:8892

簡單來說就是有幾個 milter 就一直加上去就對了！

至於 DNS 的部分由於 DKIM 跟 domainkeys 都吃一模一樣的 key 所以就不用在設定一次拉~

### 驗證有沒有成功

最簡單的方式就是從 Server 寄一次看看啦~

	telnet localhost 25
	MAIL FROM:xxx@foo.bar
	RCPT TO:xxx@gmail.com
	DATA
	From: xxx@foo.bar
	To: xxx@gmail.com
	Subject: test message
	This is test message!
	.
	QUIT

然後到 GMail 收信，看信件的 Header 應該會有：*spf=pass* 跟 *dkim=pass* 的字樣就表示成功了！而 Yahoo 也是一樣會有 pass 的字樣哦~

{% img https://lh5.googleusercontent.com/-A6MtopadkXk/T47U_sZ8eqI/AAAAAAAAD7Y/TdkEhjis8jE/s640/%25E8%259E%25A2%25E5%25B9%2595%25E5%25BF%25AB%25E7%2585%25A7%25202012-04-18%2520%25E4%25B8%258B%25E5%258D%258810.51.09.png 800 600 "" %}
