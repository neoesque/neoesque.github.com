---
layout: post
title: "刪除 memcachedb log 檔"
date: 2012-11-20 10:56
comments: true
tags: ["memcachedb"]
categories: ["資訊"]
---

`memcachedb` 用的是 BerkeleyDB 每 10M 會輸出一次 log file，所以久而久之你的資料夾會充滿一堆 `log.xxxxxxxxxx` x 是數字，依序編列，在正常的 Production 環境大概不出三天就會比原本的 DB 還多了一倍的大小，如果沒有要還原的需求的話是不需要這些 log 的，清除的方法有兩個，一個是手動刪，一個是透過 memcachedb 清。

手動刪的話基本上就是用 find 就可以了，`find /home/memcachedb_data/ -iname 'log*' | awk '{if (NR > 50) print}' | xargs -i -t rm -f {}`，如果是要透過 memecachedb 清則可以透過 telnet 或 netcat，指令是 `db_archive`。不過如果每次都要手動下未免也太累了，所以我們可以放在 crontab 裡自動化，要放在 crontab 裡面一定要搭配 netcat ，因爲 telnet 不支援檔案重導符號 < ，只要隨便開一個檔案填入下列內容

	db_archive
	quit

然後在 crontab 裏面增加 `0 * * * * /usr/bin/netcat localhost 5566 < /root/cmd/memcachedb_rotate_logs` 即可每小時自動清一次，其中 5566 就是 memcachedb 開的 port。
