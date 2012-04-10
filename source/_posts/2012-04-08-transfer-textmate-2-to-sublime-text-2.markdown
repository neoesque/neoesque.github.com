---
layout: post
title: "從 TextMate 2 跳到 Sublime Text 2"
date: 2012-04-08 12:44
comments: true
categories: 
tags: ["TextMate","Sublime"]
---

原本都是使用 TextMate 後來實在受不了不能好好支援 cjk 的輸入。

加上 TextMate 已經過了好久都沒有更新，原本說好在 Mac OS X 10.5 出來的時候就要改用 CoreText 改寫，結果也跳票了。不然實在是離不開 TextMate 的 snippet 。

不過雖然 TextMate 在前一陣子推出 TextMate 2 beta 但是很多功能還是沒有完整，而且不時還會當機，所以前陣子原本就想說找個替代品，一路搜尋下來就發現了 Sublime Text 2 (beta)。

可以說 TextMate 該有的他都有，而且支援了更多的功能，加上跨 Windows, Linux, OS X 所以可以預料到未來應該會有更多人力加入寫 Sublime Text 2 packages 的行列。

<!--more-->

之前試用了 Sublime Text 2 (Build 2165) 不過發現有個重大問題，就是沒辦法在 html 情境中的 script tag 使用 jQuery 的 snippet 真的很怪，所以後來評估之後之好先繼續使用 TextMate 2。

不過這幾天又使用了最新版的 (Build 2181) 又修好了，應該真的是 2165 的 bug。所以看起來是真的可以完全換到 Sublime Text 2 了。

不過沒有什麼 IDE 是原生就符合每個人的習慣的，一定要 tune 一下，裝一堆的 Plug-in，Sublime Text 2 也是一樣，不過幸好裝 Plug-in (Sublime Text 2 叫 Packages)是很簡單的事。

***

###基本準備

首先按 `` ctrl + ` `` 然後會出現一個對話框，直接貼入下列的程式碼

{% codeblock %}
	import urllib2,os; pf='Package Control.sublime-package'; ipp=sublime.installed_packages_path(); os.makedirs(ipp) if not os.path.exists(ipp) else None; urllib2.install_opener(urllib2.build_opener(urllib2.ProxyHandler())); open(os.path.join(ipp,pf),'wb').write(urllib2.urlopen('http://sublime.wbond.net/'+pf.replace(' ','%20')).read()); print 'Please restart Sublime Text to finish installation'
{% endcodeblock %}

![](https://lh5.googleusercontent.com/-OBhLI8lugD4/T4FAwZ6KVfI/AAAAAAAAD2Y/VKP9-1VWSEk/s640/%25E8%259E%25A2%25E5%25B9%2595%25E5%25BF%25AB%25E7%2585%25A7%25202012-04-08%2520%25E4%25B8%258B%25E5%258D%25883.39.25.png)

然後按下 Enter 就會安裝完成了，重開 Sublime Text 2 後，按下 `` cmd + shift + p `` 會叫出 Command Palette ，輸入 `` package control `` 就會顯示相關指令：

![](https://lh5.googleusercontent.com/-m8zEAF4lQ9s/T4FCM254SoI/AAAAAAAAD2o/eu8w-2dpU8Q/s640/%25E8%259E%25A2%25E5%25B9%2595%25E5%25BF%25AB%25E7%2585%25A7%25202012-04-08%2520%25E4%25B8%258B%25E5%258D%25883.45.39.png)

我們下面需要用到的是 Install 所以把游標移到 _Install Package_ 按下 Enter (以後可以搜尋 install 就好)，他會上網截取所有的 Package 列表然後再次出現輸入提示：

![](https://lh6.googleusercontent.com/-hQn6BsiHXsQ/T4FCxb23XeI/AAAAAAAAD28/yYt4loeulA4/s640/%25E8%259E%25A2%25E5%25B9%2595%25E5%25BF%25AB%25E7%2585%25A7%25202012-04-08%2520%25E4%25B8%258B%25E5%258D%25883.47.40.png)

***

###推薦套件

接下來介紹幾個我有用到的套件 (直接在 Install 裡搜尋即可)

+ [Zen Coding](https://bitbucket.org/sublimator/sublime-2-zencoding)

![](https://lh6.googleusercontent.com/-D60HJjS0rcg/T4J4alehcxI/AAAAAAAAD4I/Y1mnCgK5HzY/s640/%25E8%259E%25A2%25E5%25B9%2595%25E5%25BF%25AB%25E7%2585%25A7%25202012-04-09%2520%25E4%25B8%258B%25E5%258D%25881.49.06.png)

可以用 zen coding 的方式展開 html tags

+ [jQuery](https://github.com/mrmartineau/Jquery)

![](https://lh3.googleusercontent.com/-X8ysde3lY5o/T4J49H6sYLI/AAAAAAAAD4c/2pU_zuwF1RI/s576/%25E8%259E%25A2%25E5%25B9%2595%25E5%25BF%25AB%25E7%2585%25A7%25202012-04-09%2520%25E4%25B8%258B%25E5%258D%25881.51.41.png)

是網頁設計師就要寫 jQuery 吧!

+ [JsFormat](https://github.com/jdc0589/JsFormat)
+ [SublimeLinter](https://github.com/kronuz/SublimeLinter/)
+ [Sublime Alignment](https://github.com/wbond/sublime_alignment)

![](https://lh4.googleusercontent.com/-t4R1xKfapOg/T4J6i6rCAOI/AAAAAAAAD4w/bMK4aR70jjU/s576/%25E8%259E%25A2%25E5%25B9%2595%25E5%25BF%25AB%25E7%2585%25A7%25202012-04-09%2520%25E4%25B8%258B%25E5%258D%25881.58.27.png)

對齊等號... 不過對於 javascript 好像有 Bug XD

+ [Case Conversion](https://github.com/jdc0589/CaseConversion)

誰不合作了嗎? 這個讓你在 pascal, camel, snake 這三種變數表示法中輕鬆切換。

+ [BracketHighter](https://github.com/facelessuser/BracketHighlighter)

![](https://github.com/facelessuser/BracketHighlighter/raw/master/example.png)

花俏的提示成對符號

+ [ChangeQuotes](https://github.com/colinta/SublimeChangeQuotes)

在單引號、雙引號中輕鬆切換。

+ [Twitter Bootstrap](https://github.com/devtellect/sublime-twitter-bootstrap-snippets/)

支援 Bootstap 的 snippet

***

###推薦 Theme

而在 Theme 方面我用的是 [Prospettiva](https://github.com/mattsanders/Prospettiva-Theme) + [Soda](https://github.com/buymeasoda/soda-theme)

Prospettiva 的安裝只要把他的 prospettiva.tmTheme 下載後放到 *~/Library/Application Support/Sublime Text 2/Packages/User* 即可

而 Soda 則可以利用 Package Manager 安裝

Soda 有一點類似掌管整個程式的 Decorator 而 Prospettiva 則是掌管 TextArea 的區塊，最後完成的結果像這樣：

![](https://lh6.googleusercontent.com/-9Dm_c1SPq0g/T4FJxWBn-QI/AAAAAAAAD3Q/pR3Rm9Ov0Bg/s640/%25E8%259E%25A2%25E5%25B9%2595%25E5%25BF%25AB%25E7%2585%25A7%25202012-04-08%2520%25E4%25B8%258B%25E5%258D%25884.17.56.png)
