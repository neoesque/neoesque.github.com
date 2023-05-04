title: "Graylog2 安裝"
date: 2014-01-24 21:55:56
tags: ["Linux", "graylog2"]
categories: ["資訊"]
---

{% img https://lh4.googleusercontent.com/-HxbTnQ713EE/UuKP3HTDr_I/AAAAAAAAH0Y/5PqTkSwGYOY/w758-h379-no/Screenshot+2014-01-25+00.04.08.png 800 600 %}

[Graylog2](http://graylog2.org/) 是一個開源的 log 收容器，主要有兩個部份集合而成 `server` 與 `web interface`，兩個都是由 Java 寫的，Server 的部份可以收容 syslog over TCP/UDP, 同時他也有自己的格式 GRLF (Graylog Extended Log Format)，背後的儲存是搭配 [mongodb](http://www.mongodb.org/)，而搜尋引擎則由 [elasticsearch](http://www.elasticsearch.org/) 提供。另外的 web interface 也是 Java 寫成的(早期好像是 Ruby on Rails)，主要的功能就是提供一個漂亮的搜尋與分析的界面。

所以要使用 Graylog2 需要安裝五個元件

|           軟體           |    版本    |
| ------------------------ | ---------- |
| Java Runtime Environment | 7u51       |
| elasticsearch            | 0.90.10    |
| mongodb                  | 2.4.9      |
| graylog2-server          | 0.20.1-1rc |
| graylog2-web-interface   | 0.20.1-1rc |

我們先從 elasticsearch 開始安裝起，以下都用目前最新的版本來示範，基本上不分什麼 Linux Distribution，我們單位都用 SUSE，不過 Gentoo 或 Ubuntu 也都適用就是

<!--more-->

首先因為 elasticsearch 跟 graylog2 都需要 Java，所以我們的系統需要安裝 JRE 先，最低需求是 Java 7.0 的版本，所以我們先到 [Java Download](http://java.com/en/download/manual.jsp) 下載 JRE 7u51 下來，假設下載到 /tmp/jre-7u51-linux-x64.tar.gz 下面，先解壓縮到 /opt 底下 `tar zxvf /tmp/jre-7u51-linux-x64.tar.gz -C /opt` 會產生 /opt/jre1.7.0_51/ 然後我們為了好看做一下 link `ln -s /opt/jre1.7.0_51 /opt/java` 這樣 Java 就裝好了。

接下來來裝 elasticsearch，`curl https://download.elasticsearch.org/elasticsearch/elasticsearch/elasticsearch-0.90.10.tar.gz -o /tmp/elasticsearch.tgz && tar zxvf /tmp/elasticsearch.tgz -C /opt && ln -s /opt/elasticsearch-0.90.10 /opt/elasticsearch` 這樣基本上就裝好了，不過我們還需要建立一些資料夾讓 elasticsearch 可以運作起來。

{% codeblock build basic directory lang:shell %}
install -o nobody -g nogroup -d /var/log/elasticsearch/
install -o nobody -g nogroup -d /var/lib/elasticsearch/data
install -o nobody -g nogroup -d /var/lib/elasticsearch/work
install -o nobody -g nogroup -d /var/run/elasticsearch/
{% endcodeblock %}

之所以給 nobody:nogroup 是希望之後我們的 elasticsearch 就用 nobody 的身份執行，其實沒有強制，如果要建立 elasticsearch 的專用帳號也是可以的。

接著改個設定

{% codeblock lang:shell %}
sed -i -e 's|# cluster.name: elasticsearch|cluster.name: graylog2|' /opt/elasticsearch/config/elasticsearch.yml
{% endcodeblock %}

這個是把 elasticsearch 的名字設定成 graylog2，這樣之後 server 才吃得到。

然後我們來建立啟動 elasticsearch 的 script 吧，貼上下列的 code 到 /etc/init.d/elasticsearch 然後 `chmod +x /etc/init.d/elasticsearch`。

{% gist a1d4fdbdca18d31cf437 %}

接著 `/etc/init.d/elasticsearch start` ，理論上應該 elasticsearch 就啟動了。可以用 `tail -f /var/log/elasticsearch/graylog2.log` 來看情況。

接下來是安裝 mongodb，`curl http://fastdl.mongodb.org/linux/mongodb-linux-x86_64-2.4.9.tgz -o /tmp/mongodb.tgz && tar zxvf /tmp/mongodb.tgz -C /opt && ln -s /opt/mongodb-linux-x86_64-2.4.9 /opt/mongodb` 這樣也裝好了，mongodb 基本上完全不需要設定(要設定帳密增加安全性也可以)。我們來增加啟動 mongob 的 script，新增下面的內容到 /etc/init.d/mongodb 然後 `chmod +x /etc/init.d/mongodb`。

{% gist c931db641e7f4008e4e3 %}

一樣需要增加一些資料夾才能正常使用

{% codeblock build basic directory lang:shell %}
install -o nobody -g nogroup -d /var/log/mongodb/
install -o nobody -g nogroup -d /var/lib/mongodb/
install -o nobody -g nogroup -d /var/run/mongodb/
{% endcodeblock %}

接著也啟動看看 `/etc/init.d/mongodb start`，我們透過 `tail -f /var/log/mongodb/mongodb.log` 可以知道啟動的狀態，如果都沒錯理論上可以繼續下一步了。

目前為止我們可以透過 `netstat -ntlp` 看 9300 (elasticsearch 的 port) 跟 27017 (mongodb 的 port) 有沒有在監聽著，就知道有沒有啟動成功了。

接下來就是要裝 graylog2 啦，首先是 server，`curl https://github.com/Graylog2/graylog2-server/releases/download/0.20.0-rc.1-1/graylog2-server-0.20.0-rc.1-1.tgz -o /tmp/graylog2-server.tgz && tar zxvf /tmp/graylog2-server.tgz -C /opt && ln -s /opt/graylog2-server-0.20.0-rc.1-1 /opt/graylog2-server` 然後我們需要設定一下

{% codeblock lang:shell %}
cp /opt/graylog2-server/graylog2.conf.example /etc/graylog2.conf
pass_secret=$(pwgen -s 96)
sed -i -e 's|password_secret =|password_secret = '$pass_secret'|' /etc/graylog2.conf
#密碼自己設定 web 登入用的 root_pass_sha2=$(echo -n password123 | shasum -a 256)
sed -i -e "s|root_password_sha2 =|root_password_sha2 = ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f|" /etc/graylog2.conf
sed -i -e 's|elasticsearch_shards = 4|elasticsearch_shards = 1|' /etc/graylog2.conf
sed -i -e 's|mongodb_useauth = true|mongodb_useauth = false|' /etc/graylog2.conf
sed -i -e 's|#elasticsearch_discovery_zen_ping_multicast_enabled = false|elasticsearch_discovery_zen_ping_multicast_enabled = false|' /etc/graylog2.conf
sed -i -e 's|#elasticsearch_discovery_zen_ping_unicast_hosts = 192.168.1.203:9300|elasticsearch_discovery_zen_ping_unicast_hosts = 127.0.0.1:9300|' /etc/graylog2.conf
sed -i 's|retention_strategy = delete|retention_strategy = close|' /etc/graylog2.conf
{% endcodeblock %}

然後一樣來增加 init script 吧，在 /etc/init.d/graylog2-server 填入下列，並 `chmod +x /etc/init.d/graylog2-server`

{% gist 62ad68382f8a33244a6e %}

然後直接啟動了！ `/etc/init.d/graylog2-server start`，看看 `tail -f /var/log/graylog2-server.log` 是不是有出現錯誤訊息，沒有錯的話 `netstat -ntlp` 應該可以看到 port:12900 有被監聽了，這是 server 的 REST 傳輸 port。

最後我們就可以來裝 web interface 了，`curl hhttps://github.com/Graylog2/graylog2-web-interface/releases/download/0.20.0-rc.1-1/graylog2-web-interface-0.20.0-rc.1-1.tgz -o /tmp/graylog2-web-interface.tgz && tar zxvf /tmp/graylog2-web-interface.tgz -C /opt && ln -s /opt/graylog2-web-interface-0.20.0-rc.1-1 /opt/graylog2-web-interface`
這裡我們只有兩個地方要設定

{% codeblock lang:shell %}
sed -i -e 's|graylog2-server.uris=""|graylog2-server.uris="http://127.0.0.1:12900/"|' /opt/graylog2-web-interface/conf/graylog2-web-interface.conf
# 這裡填入剛剛 server 的 app_secret
sed -i -e 's|application.secret=""|application.secret="'$app_secret'"|' /opt/graylog2-web-interface/conf/graylog2-web-interface.conf
{% endcodeblock %}

然後我們也來寫一下 init script 吧，檔名存 /etc/init.d/graylog2-web-interface，記得一樣 `chmod +x /etc/init.d/graylog2-web-interface`

{% gist 97ac6a26cf7d5f2da36f %}

最後啟動 `/etc/init.d/graylog2-web-interface start`，因為我們沒有寫 log，直接用 `netstat -ntlp` 觀察看看 port:9000 有沒有被聽著，這是他的 web interface 預設的 http port。

如果 port:9000 有起來的話，請用你的瀏覽器打開 http://ip:9000 看，沒有意外的話應該會出現一個登入的畫面了，帳號一開始都是 admin，密碼則是剛剛自己設定在 /etc/graylog2.conf 的 root_pass_sha2=$(echo -n password123 | shasum -a 256)，如果剛剛是直接複製貼上然後按下 enter 的話，密碼就是 password123，如果沒有意外應該就可以進去啦！恭喜，現在可以開始使用 graylog2 了。

---

參考資料

+ [Ubuntu 12.04 Graylog2 Installation](http://everythingshouldbevirtual.com/ubuntu-12-04-graylog2-installation)
