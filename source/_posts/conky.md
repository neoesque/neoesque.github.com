title: Conky
date: 2014-02-27 17:52:09
tags: ["Linux"]
categories: ["資訊"]
thumbnail: https://lh5.googleusercontent.com/-xr-ly4Xre5s/Uw8NTDx7SNI/AAAAAAAAISA/UkVyIMyWF_E/w1516-h852-no/2014-02-27%2B18%3A01%3A13%2B%E7%9A%84%E8%9E%A2%E5%B9%95%E6%93%B7%E5%9C%96.png
---

[Conky](http://conky.sourceforge.net/) 是一款類似 Mac OS X [GeekTool](http://projects.tynsoe.org/en/geektool/) 的桌面小工具 (其實 Conky 比較早出生，不過我比較晚發現 XD)。

他們都可以透過一些內建的 Function 或者寫 shell script 來顯示電腦的狀態(或者想印在桌面的狀態)，例如我現在的桌面是這樣的

{% img https://lh5.googleusercontent.com/-xr-ly4Xre5s/Uw8NTDx7SNI/AAAAAAAAISA/UkVyIMyWF_E/w1516-h852-no/2014-02-27%2B18%3A01%3A13%2B%E7%9A%84%E8%9E%A2%E5%B9%95%E6%93%B7%E5%9C%96.png 800 600  %}

大致上就是顯示天氣，網路速度、流量，CPU、記憶體、硬碟等使用率，然後還有 CPU 溫度跟風扇的資訊，最下面有 parse RSS (Gentoo Security) 的部分

參考網路設計師 [Conky Google Now](http://satya164.deviantart.com/art/Conky-Google-Now-366545753) 這個主題

小弟合併了官網其他人貢獻的設定，稍微修改了一下

<!--more-->

從剛剛那個 Google Now 的 theme 下載 conky_google_now_by_satya164-d628cih.zip 解壓縮之後會有個 .conky-google-now 複製到家目錄 (也就是 ~/.conky-google-now) 底下即可

以下是我的設定 直接存檔成 ~/.conkyrc 然後用 `conkyrc -d` 啟動就可以看到程式了

{% gist 9247424 .conkyrc %}

最後面的 RSS 是取自 [conky-rss.sh](http://conky.sourceforge.net/conky-rss.sh)

另外天氣的部分如果要改地區，可以先到 [Yahoo Weather](http://weather.yahoo.com/) 查詢地區碼，我的設定裡面是用 9807 也就是溫哥華的代碼
