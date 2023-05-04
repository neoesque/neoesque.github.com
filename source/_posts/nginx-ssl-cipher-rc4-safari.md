title: Safari 無法建立 nginx ssl_ciphers 使用 RC4 的連線
date: 2013-04-27 13:52:58
tags: ['nginx', 'Mac']
categories: ["資訊"]
---

前幾天幫部門把原本提供 HTTPS 的 squid 換成 nginx，結果馬上被反應 Mac 上面的 Agent 不能連線但是又不知道為什麼，因為其他的瀏覽器 Chrome Firefox 不管作業系統 Windows Linux Mac 上的都可以連真的很弔詭，麻煩同事用跟 Agent 一樣的 Framework 重寫一個簡單的版本也不行，測了很久也找不太到癥結點，後來靈機一動，何不試看看 Safari ... 結果果然不出所料... `Unable to establish a secure connection` XDDD 搞什麼連 Safari 也連不了，這樣子要 Debug 我就可以自己來了，不然要一直麻煩同事跟我對測不好意思，一開始先用 `tcpdump` 發現 Server 送 Certificate 給 Client 之後 Client 就自己斷掉 connection ?! WTF 這太沒有頭緒了吧，後來上網搜尋 `ssl connection fail safari`，結果一路看看看就看到了這個 [HTTPS requests fail on sites which immediately close the connection if TLS 1.1 negotiation is attempted, on Ubuntu 12.04](https://bugs.launchpad.net/ubuntu/+source/openssl/+bug/965371)，起因是 OpenSSL 1.0.1 的一個 Bug，版上建議降成 OpenSSL 1.0.0 就可以了，因為我要啟用 nginx 的 spdy 所以一定要用 OpenSSL 1.0.1 才可以，不過秉持實驗的精神只好先解除這個功能，於是我就編譯了 nginx with openssl 1.0.0k，然後結果...靠背還是一樣 Safri 不能連其他都可以！不信邪改用 0.9.8y，結果在一模一樣的設定下這個 Safari 就可以連了 = = (這哪招)，總之越來越神秘，只好先回到 nginx with openssl 1.0.1e，(就是死命要 spdy 就對了 XD)，後來在沒什麼想法的情況下只好打開 nginx 的 debug mode `error_log xxxxx debug;`，瞧瞧裡面有什麼。

結果就看到

```
SSL handshake handler: 0
[debug] 7585#0: *1 SSL_do_handshake: 0
[debug] 7585#0: *1 SSL_get_error: 5
[info] 7585#0: *1 peer closed connection in SSL handshake while SSL handshaking, client: x.x.x.x, server: 0.0.0.0:443                                  
[debug] 7585#0: *1 close http connection: 14
[debug] 7585#0: *1 SSL_shutdown: 1
```

<!--more-->

啊靠，搞屁 Safari 直接斷掉 connection，這哪招，於是再用 Chrome 連看看

```
SSL handshake handler: 0
[debug] 8398#0: *1 ssl new session: 67979935:32:139
[debug] 8398#0: *1 SSL_do_handshake: 1
[debug] 8398#0: *1 SSL: TLSv1.1, cipher: "ECDHE-RSA-RC4-SHA SSLv3 Kx=ECDH Au=RSA Enc=RC4(128) Mac=SHA1"
[debug] 8398#0: *1 reusable connection: 1
```

Bingo，看到一個關鍵的地方，在 SSL handshake 中，client 發一個簡單的 Hello 給 Sever 後，Server 也會回一個 Hello 給 Client，其中這兩個 Hello 會把自己支援的 SSL版本、加密法包在裡面給對方知道，於是這就回到 nginx 的 ssl 設定了，在 nginx 的 doc [Configuring HTTPS servers](http://nginx.org/en/docs/http/configuring_https_servers.html) 中，提到了因為要防禦 [CVE-2011-3389 BEAST Attack](http://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2011-3389)，建議把 SSL 設置如下

```
ssl_protocols       SSLv3 TLSv1 TLSv1.1 TLSv1.2;
ssl_ciphers RC4:HIGH:!aNULL:!MD5;
ssl_prefer_server_ciphers on;
```

這個表示優先使用 RC4 的加密，然後是高安全(超過 128bit)的加密法，不接受 MD5 digest 的方式，所以我們可以看到 Chrome 是採用了 `ECDHE-RSA-RC4-SHA` (Firefox 也是)，但是 Safari 就這樣直接斷掉 connection... 我真是搞不懂你啊！這時候只好參考一些網路網站(就是拜一拜 Google 大神了)，就看到有個網站可以列出你的瀏覽器支援的 SSL cipher 在此 [SSL Cipher Suite Details of Your Browser](https://cc.dcsec.uni-hannover.de) 用 Safari 開了一下，如下

```
Cipher Suites Supported by Your Browser (ordered by preference):

SpecCipher Suite NameKey SizeDescription
(00,ff)EMPTY-RENEGOTIATION-INFO-SCSV0 BitUsed for secure renegotation.
(c0,0a)ECDHE-ECDSA-AES256-SHA256 BitKey exchange: ECDH, encryption: AES, MAC: SHA1.
(c0,09)ECDHE-ECDSA-AES128-SHA128 BitKey exchange: ECDH, encryption: AES, MAC: SHA1.
(c0,07)ECDHE-ECDSA-RC4128-SHA128 BitKey exchange: ECDH, encryption: RC4, MAC: SHA1.
(c0,08)ECDHE-ECDSA-3DES-EDE-SHA168 BitKey exchange: ECDH, encryption: 3DES, MAC: SHA1.
(c0,14)ECDHE-RSA-AES256-SHA256 BitKey exchange: ECDH, encryption: AES, MAC: SHA1.
(c0,13)ECDHE-RSA-AES128-SHA128 BitKey exchange: ECDH, encryption: AES, MAC: SHA1.
(c0,11)ECDHE-RSA-RC4128-SHA128 BitKey exchange: ECDH, encryption: RC4, MAC: SHA1.
(c0,12)ECDHE-RSA-3DES-EDE-SHA168 BitKey exchange: ECDH, encryption: 3DES, MAC: SHA1.
(c0,04)ECDH-ECDSA-AES128-SHA128 BitKey exchange: ECDH, encryption: AES, MAC: SHA1.
(c0,05)ECDH-ECDSA-AES256-SHA256 BitKey exchange: ECDH, encryption: AES, MAC: SHA1.
(c0,02)ECDH-ECDSA-RC4128-SHA128 BitKey exchange: ECDH, encryption: RC4, MAC: SHA1.
(c0,03)ECDH-ECDSA-3DES-EDE-SHA168 BitKey exchange: ECDH, encryption: 3DES, MAC: SHA1.
(c0,0e)ECDH-RSA-AES128-SHA128 BitKey exchange: ECDH, encryption: AES, MAC: SHA1.
(c0,0f)ECDH-RSA-AES256-SHA256 BitKey exchange: ECDH, encryption: AES, MAC: SHA1.
(c0,0c)ECDH-RSA-RC4128-SHA128 BitKey exchange: ECDH, encryption: RC4, MAC: SHA1.
(c0,0d)ECDH-RSA-3DES-EDE-SHA168 BitKey exchange: ECDH, encryption: 3DES, MAC: SHA1.
(00,2f)RSA-AES128-SHA128 BitKey exchange: RSA, encryption: AES, MAC: SHA1.
(00,05)RSA-RC4128-SHA128 BitKey exchange: RSA, encryption: RC4, MAC: SHA1.
(00,04)RSA-RC4128-MD5128 BitKey exchange: RSA, encryption: RC4, MAC: MD5.
(00,35)RSA-AES256-SHA256 BitKey exchange: RSA, encryption: AES, MAC: SHA1.
(00,0a)RSA-3DES-EDE-SHA56 BitKey exchange: RSA, encryption: 3DES, MAC: SHA1.
(00,33)DHE-RSA-AES128-SHA128 BitKey exchange: DH, encryption: AES, MAC: SHA1.
(00,39)DHE-RSA-AES256-SHA256 BitKey exchange: DH, encryption: AES, MAC: SHA1.
(00,16)DHE-RSA-3DES-EDE-SHA168 BitKey exchange: DH, encryption: 3DES, MAC: SHA1.

Further information:

User-Agent:Mozilla/5.0 (Macintosh; Intel Mac OS X 10_8_3) AppleWebKit/536.29.13 (KHTML, like Gecko) Version/6.0.4 Safari/536.29.13
Preferred SSL/TLS version: TLSv1
SNI information: cc.dcsec.uni-hannover.de
SSL stack current time: Sat, 27 Apr 2013 08:20:54

This connection uses TLSv1 with AES128-SHA and a 128 Bit key for encryption.
```

干，Safari 有支援 RC4 卻不給我使用，跑去用什麼 AES128-SHA 0rz...，所以我就想說奇怪為什麼有支援但是 nginx 單純設定 RC4 卻會失敗，於是在好奇之下就改成設定了

```
ssl_ciphers RC4-SHA:HIGH:!aNULL:!MD5;
```

結果... Safari 就好了... Fxck 真的很想罵髒話，nginx 送 RC4 給 curl、Chrome、Firefox 都看的懂，你 Safari 就看不懂直接中斷連線是怎樣 = =

Okay~ anyway，後來在網路也查不到什麼相關文章，不過我在網路上找到 BEAST Attack 的[白皮書](https://docs.google.com/viewer?url=http%3A%2F%2Fwww.phonefactor.com%2Fresources%2FCipherSuiteMitigationForBeast.pdf) 裡面推薦把 Web Server Cipher 設定成 `!aNULL:!eNULL:!EXPORT:!DSS:!DE
S:!SSLv2:RC4-SHA:RC4-MD5:ALL`，經過測試這樣的順序 Safari 也可以正確的判讀 (因為 RC4-SHA:RC4-MD5 都明確說明了啊！)，不過基於 MD5 的 digest 似乎有 collision 的機率現在好像都不推薦使用，所以原本有個 `!MD5`，於是最後我在我們 Server 上就改成了

```
ssl_ciphers !aNULL:!eNULL:!EXPORT:!DSS:!DES:!MD5:RC4-SHA:ALL;
```

也就是不要 NULL， EXPORT 家族的，也不要 DSS、DES 的加密法，不要 MD5 的 digest，優先使用 RC4-SHA 跟剩下的其他加密/訊息驗證法，因為 RC4 跟 3DES 幾乎所有的 OS 都有支援，但是 3DES 效能是在太低會把 Server 拖一些下來，所以建議儘量使用 RC4 優先，這個網頁有速度的比較 [OpenSSL: Cipher Selection](http://zombe.es/post/4078724716/openssl-cipher-selection) 可以看到 RC4 是快很多的，但是在有支援 AESNI 指令集的 CPU 上用 AES 速度更快 (可用 `grep aes /proc/cpuinfo` 檢查)，所以目前使用 RC4 是安全又快速的。最後如果要檢查 HTTPS 到底是不是安全，可以使用 [SSL Server Test](https://www.ssllabs.com/ssltest/) 來檢查。

如果對 BEAST 攻擊有興趣可以看這篇 [SSL Beast – SSL Assessments and How to Fix](http://securitystreetknowledge.com/?p=882)

後來在測試 Mac 的 Agent 也可以連了，看起來是底層的 Framework 可能有問題。

#### 後記

關於 SSL 其實有很多傳說 XDD，我還有看到人家說 OpenSSL 1.0.0 產生的憑證不能用在 Apache 上，跟我們的問題有點類似，因為我們自己內部網站用的 SSL 加一模一樣的 nginx 設定 (也就是只開 `RC4`) Safari 是完全沒問題的，這次出事的是我們對外服務的網站，但是因為憑證當初不是我申請的，所以問題已經無從追了，網路沒什麼反應也許 nginx 官網推薦的設定是真的 OK 的只是我們剛好踩到這個雷 %>_<%

另外也許文章一開始提到的，nginx 改用 OpenSSL 0.9.8y 可以是因為 Safari fallback 回去 SSLv3 的連線，所以就沒有使用奇奇怪怪的加密法，不然預設 Safari 也會優先使用 TLSv1。然後一用 TLSv1 配上我們的憑證也許 Safari 就傻了之類的 XD

#### 後記 x2

目前 SSL/TSL key 都是直接交換的方式也就是同一把 key 用久久，去年爆出 NSA 其實有在偷偷側錄 SSL/TSL 的流量，所以有個名詞突然紅了起來，就是 `Perfect Forward Secrecy`  (PFS)，他是建立在 D-H 上，也就是動態產生一組 session key 交換，這樣可以確保全部訊息沒有辦法被用同一把 key 給解開。因此參考 [Configuring Apache, Nginx, and OpenSSL for Forward Secrecy](https://community.qualys.com/blogs/securitylabs/2013/08/05/configuring-apache-nginx-and-openssl-for-forward-secrecy) 這裡，建議把設定改成下列：

{% codeblock %}
ssl_protocols TLSv1 TLSv1.1 TLSv1.2;
ssl_prefer_server_ciphers on;
ssl_ciphers "EECDH+ECDSA+AESGCM EECDH+aRSA+AESGCM EECDH+ECDSA+SHA384 EECDH+ECDSA+SHA256 EECDH+aRSA+SHA384 EECDH+aRSA+SHA256 EECDH+aRSA+RC4 EECDH EDH+aRSA RC4-SHA !aNULL !eNULL !LOW !3DES !MD5 !EXP !PSK !SRP !DSS";
{% endcodeblock %}

我把原文章的 RC4 改成 RC4-SHA，經過測試後，Safari 也可用！

不過需要注意的是因為要打開橢圓曲線加密所以搭配 nginx 的 OpenSSL 最低需求要 1.0.1c 以上。

----

參考資料

+ [SSL/TLS & Perfect Forward Secrecy](http://vincent.bernat.im/en/blog/2011-ssl-perfect-forward-secrecy.html)
+ [SSL Ciphersuite Configuration for External HTTPS Connections](https://techzone.ergon.ch/ciphersuite)