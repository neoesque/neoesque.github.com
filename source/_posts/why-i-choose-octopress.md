---
layout: post
title: "為什麼我跳槽到 octopress"
date: 2012-04-09 15:59
comments: true
tags: ["Octopress"]
categories: ["資訊"]
---

### When I met Octopress
[Octopress](http://octopress.org) 是一個之前(應該是兩年前吧 XD)很流行的 Static Blog Generators 的產物，Based的語言是 Ruby，底層依賴 [Jekyll](https://github.com/mojombo/jekyll)，由於 Jekyll 支援很多其他有的沒的，像是 Markdown Engine 支援很多種(包含了 [Maruku](http://maruku.rubyforge.org) 或者 [Kramdown](http://kramdown.rubyforge.org) )，另外也有 Syntax Highlight (可以使用 [Pygment](http://pygments.org) 或者 [Coderay](http://coderay.rubychan.de))，加上 Octopress 作者自己的延伸讓 Octopress 常見的功能(甚至是不會用到的功能XD)都有提供了。

之前公司的學弟就使用 Markdown 在寫工作日誌，其實滿不明所以然<!--more-->不過真正跳進來之後才發現原來使用 Markdown 寫東西這麼愉快，大量簡化的語法，全部都是基於符號，像是 `` # `` 表示 `` <h1> 系列 ``、`` *** `` 表示 `` 橫列 ``、`` + - * `` 表示 `` <ul><li></li></ul> ``，另外 img 或者 link 也都相當簡單，這個真的大幅度的降低寫 Blog 的干擾，可以更專心的寫作(當然還是要學習一下啦，不過算是簡單就可以上手)。

不過坊間這麼多 Static Blog Generators，要怎麼挑個好的，當然先從自己熟悉的語言開始，原本是想用基於 [node.js](http://nodejs.org) 大概有以下選擇：

+ [Pretrify](https://github.com/caolan/petrify)
+ [DocPad](https://github.com/bevry/docpad)
+ [Wintersmith](https://github.com/jnordberg/wintersmith)

其中大概以 DocPad 知名度最高，當然功能也最豐富，Markdown、CoffeeScript、SASS，不過看來看去好像都沒有支援 Syntax Highlight(當然要自己加也可以，BTW 前一陣子有個不錯的 Javascript Syntax Highlighter [Rainbow](http://craig.is/making/rainbows))，所以接下來第二程式選大概就是 Ruby 啦。

我覺得 Ruby 在網頁開發上一直有著類似 Python 的特色：沒得選擇 XD，這個當然我覺得是一種不錯的形態，大家都走一樣的路資源也會集中，尤其在 OpenSource 我想 Feedback 的力量會很大(啊，離題了)，回到 Ruby，大概就下面兩樣選擇(其實也可以說是同一樣)：

+ [Jekyll](http://jekyllrb.com/)
+ [Octopress](http://octopress.org)

前面提到 Octopress 其實底層就是從 Jekyll 改的，之前有小用過 Jekyll 一下，官網提到Octopress 比 Jekyll 的優異處在於：

+ A semantic HTML5 template
+ A Mobile first responsive layout (rotate, or resize your browser and see)
+ Built in 3rd party support for Twitter, Google Plus One, Disqus Comments, Pinboard, Delicious, and Google Analytics
+ An easy deployment strategy using Github pages or Rsync
+ Built in support for POW and Rack servers
+ Easy theming with Compass and Sass
+ A Beautiful [Solarized](http://ethanschoonover.com/solarized) syntax highlighting

不過我覺得上面列的都還是小事(當然第三點支援很多 social media 也很吸引人啦)，使用上最大的差異是在產生 static html 時，Jekyll 只有 `` jekyll --auto --safe --no-server `` 然後他就會 listen 在那邊聽檔案的異動要回到 shell 還要在按 `` ctrl + c `` ，不過有時候我只想要產生一次就要 deploy site 了啊，Octopress 則是使用 `` rake generate `` 然後就會回到 Shell，簡單的指令是我對 Octopress 的印象。

另外 Octopress 支援的 Syntax Highlight 也是五花八門，從基本的 [Pygment](http://octopress.org/docs/plugins/codeblock/) 到 [Gist](http://octopress.org/docs/plugins/gist-tag/) (使用 <code> &#123;&#37; gist 996818 &#37;&#125; </code>
即可)、甚至是 [static files](http://octopress.org/docs/plugins/include-code/) 或者 jsFiddler 也都有支援，這根本是替程式設計師設計的 Blogger！

不然之前我用 BlogSpot 時每次都還要複製他們的 javascript 檔案，現在只要有 Gist ID 就可以啦~

***

但是 Github 原生支援 Jekyll，只要 push source 他就會自動 build site。這點是 Octopress 不及的(要分成 master & source 兩個 branch 不過 Octopress 作者有寫好的 Script 就是)。

### 一些基本的 Octopress 的指令

+ `` rake generate `` - 用來產生 static site 在 *public* 資料夾底下
+ `` rake new_post["title"] `` - 產生新的 POST
+ `` rake watch `` - 寫新的文章時很好用，他會監聽檔案異動，及時產生 static files
+ `` rake deploy `` - 參考 [Deploying to Github](http://octopress.org/docs/deploying/github/)
