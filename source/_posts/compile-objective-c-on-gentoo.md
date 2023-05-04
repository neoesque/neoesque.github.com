---
layout: post
title: "Compile Objective-C on Gentoo"
date: 2011-05-28
comments: false
tags: ["Linux", "Gentoo", "obj-c"]
categories: ["資訊"]
---

要寫 Objective-C 的程式理所當然的要在 Mac OS X 上 XD<br /><br />不過有時候想學而手邊沒有 Mac 的話也可以在 Linux / Windows 開發<br /><br />這一切都要感謝 <a href='http://en.wikipedia.org/wiki/GNUstep'>GNUStep</a> 的計畫<br /><br />在 Gentoo 上如果只是要開發 non-GUI 的程式只要安裝 gnustep-base/gnustep-base 即可<br /><br />會連帶安裝 gnustep-base/gnustep-make<br /><br />都裝好後我們就可以開始寫啦!<br /><!--more-->一個最簡單的 Objective-C 如下<br /><br />{% gist 996849 %}<br />至於要編譯他的方法指令如下<br /><br />{% gist 996853 %}<br />很簡單吧！<br /><br />如果想要看完整的參數請參考 gnustep-config --help<br /><br />但是這樣每次要 build 好像都很麻煩要多打好多東西<br /><br />所以建立一個簡單的 script<br /><br />{% gist 996855 %}<br />這樣下次要 build 只要打 <em>build_objc.sh file</em><br /><br /><div class="separator" style="clear: both; text-align: center;"><a href="http://4.bp.blogspot.com/-YIoHmeZkG8E/TeD2-2tevHI/AAAAAAAAA4Q/EoIgXEyeBR4/s6400/%25E8%259E%25A2%25E5%25B9%2595%25E5%25BF%25AB%25E7%2585%25A7%2B2011-05-28%2B%25E4%25B8%258B%25E5%258D%25889.21.25.png" imageanchor="1" style="margin-left:1em; margin-right:1em"><img border="0" height="289" width="640" src="http://4.bp.blogspot.com/-YIoHmeZkG8E/TeD2-2tevHI/AAAAAAAAA4Q/EoIgXEyeBR4/s640/%25E8%259E%25A2%25E5%25B9%2595%25E5%25BF%25AB%25E7%2585%25A7%2B2011-05-28%2B%25E4%25B8%258B%25E5%258D%25889.21.25.png" /></a></div><br />如果想要開發圖形介面 需要多安裝 gnustep-base/gnustep-gui<br /><br />然後編譯變成要打 <em>gcc \`gnustep-config --debug-flags\` -o main main.m \`gnustep-config --gui-libs\`</em>
