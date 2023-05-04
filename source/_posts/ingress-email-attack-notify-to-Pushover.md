title: 用 Pushover 收 Ingress 成就點攻擊通知
date: 2015-01-07 13:53:43
tags: ["ingress", "pushover"]
feature: /commondatastorage.googleapis.com/ingress.com/img/Ingress_logo_512px.png
description: Ingress 及時的攻擊通知 over Pushover
categories: ["遊戲"]
---

[Ingress](https://www.ingress.com/) 是 Google 在 2012 推出的虛擬實境(Virtual Reality)的遊戲，基本上就是一個打打殺殺的遊戲，遊戲裡面分兩個陣營 Resistance (藍軍)跟 Enlightened (綠軍)，在台灣好死不死剛好跟兩大政治陣營顏色一樣，看起來全世界是藍大於綠，但是台灣台北剛好綠大於藍，不知道是不是大家選的顏色剛好也有政治傾向(笑)，不過遊戲歸遊戲，其實裡面的人倒是不大會聊政治，遊戲內有自己的通訊功能，但是很爛，所以大家還是會用第三方軟體溝通，通常大家都直接用 Hangout，不過也有少部份地區聽說是用 Line 之類的。

這遊戲有內建的被攻擊通知，可是他完全不能過濾你想收哪些通知，反正腳被攻擊或者 MOD 掉了就是直接無差別通知，不過有時候只想收特定 Portal 的攻擊通知，這時候該怎麼辦呢？原本我都用 IFTTT 這個 [Notify when guardian portal is under attack #ingress
](https://ifttt.com/recipes/203777-notify-when-guardian-portal-is-under-attack-ingress) 不過類似這種的有個缺點就是 IFTTT 是類似 polling 的，所以他是固定時間去問一次 Gmail，有時候我收到通知的時候都已經半個小時後，點都被打掉了 XD，搞屁，實在不夠及時，昨天在研究 Pushover 時突然發現他有 [E-mail gateway](http://updates.pushover.net/post/24408806716/e-mail-to-pushover-gateway)，配合 Gmail 建立 Filter 時就可以 Forward E-mail，根本就是及時的 Push。

實驗了一下發現效果不錯，至少比原本的 IFTTT 及時太多了，雖然還是有腳會被打掉之類的，不過如果對方真的要打其實也阻止不了，通常八炮連發根本擋不住，但是還是具有一些拖延對方效果就是了，而且也可以當成整理特殊點的攻擊 Log。

<!--more-->

這類通知的程式還蠻多的，iOS 有 [Prowl](http://www.prowlapp.com/)， Android 有 [Notify My Android](http://www.notifymyandroid.com/)，不過上述兩個就是沒有一個是跨平台的，還有另一套新秀 [PushBullet](https://www.pushbullet.com/) 也不錯，不過他沒有 E-mail GW，所以這些都不符合我的需求，因為我裝置亂七八糟的，iOS (iPhone 5s)+ Android (平板 SH-06F)，所以最後決定還是用 Pushover 實作。

[Pushover](https://pushover.net/) 的收費是只收 client 一次性費用，也就是 iOS、Android、電腦，各收 client 的錢，一個月有 7500 筆通知可用，超過可另外加購，基本上 7500則通知/月 非常夠了，一次性的終身費用各兩三美元(我是全買了大概也才 300 新台幣)非常划算，申請完賬號後回到[首頁](https://pushover.net/)應該會看到如下的 User key

{% img https://lh3.googleusercontent.com/YoX0bNlxU8WQ43p7BkpK8slGEbnDZjY6gOv1DDOfqdU=w800-no 800 600 "Pushover User key" %}

下面有顯示一個 E-mail，我們先記起來等等會用到。再來是要新增一個 Application，基本上不新增也可以，只是全部的通知會顯示為 Pushover E-mail Gateway，為了分類還是建議創一個 App，所以我們到 [Pushover-Powered Applications & Plugins
](https://pushover.net/apps) 這頁，會看到如下的頁面

{% img https://lh3.googleusercontent.com/-gyit_8RTc-Y/VKzTw7ppWjI/AAAAAAAAPx0/4aQ6fWi5RCU/w800-no/Screenshot%2B2015-01-07%2B14.27.35.png 800 600 "Pushover Apps" %}

因為我已經有三個 Apps 了，如果第一次進去應該會是空空的，我們先點 **Create a New Application** 會看到下面頁面

{% img https://lh4.googleusercontent.com/-j5wQYTyHDlg/VKzTw8EsBQI/AAAAAAAAPx4/fRRdK-yUTTQ/w1734-h916-no/Screenshot%2B2015-01-07%2B14.27.59.png 800 600 "Pushover new app" %}

填一填按下 **Create Application** 送出就好了！回到剛剛的[列表頁](https://pushover.net/apps)應該會看到剛剛創立的 App 名字，點進去會看到 App Key，如圖

{% img https://lh5.googleusercontent.com/-g8xknRBYYb4/VKzTymxGUgI/AAAAAAAAPyQ/X3F5WjNhIRU/w800-no/Screenshot%2B2015-01-07%2B14.28.19.png 800 600 "Pushover App Key" %}

一樣把這把 Key 記起來，目前已經完成一半了！我們需要的就是 User Key + App Key，基本上寄信就是把你要的信 FW 到 user_key+a=app_key@api.pushover.net 就好了！

我們回到 [Gmail 的 FW 設定頁](https://mail.google.com/mail/u/0/#settings/fwdandpop)，點 **Add a forwarding address**，新增剛剛組出來的 E-mail，比方說可能會是 *abcdefghijklmnopqrstuvwxyz1234+a=567890abcdefghijklmnopqrstuvwx@api.pushover.net* 就填進去，按下 **Next**

{% img https://lh3.googleusercontent.com/-SVbsTIHr3qw/VKzTy0zVfyI/AAAAAAAAPyM/VqTdJKj59UE/w800-no/Screenshot%2B2015-01-07%2B14.30.25.png 800 600 %}

會提示說需要寄一封確認信，請到剛剛填的 E-mail 收信，這時候請轉移到隨便一個 Pushover 的 client，比方說我用 iOS 當例子：

{% img https://lh4.googleusercontent.com/-1h40jkgP6LM/VKzTz5z1B_I/AAAAAAAAPyc/EthH_OZtnAI/w319-no/IMG_3706.png 800 600 %}

會看到裡面有個 **confirm the request**，直接點下去就好了，到這裡已經完成 80% 了，最後一步就是建立 filter & FW

到 [Gmail Settings - Filter](https://mail.google.com/mail/u/0/#settings/filters) 點 **create a new filter**，在 Has the words 填入 *Ingress Damage Report (Portal_name_1 OR Portal_name_2 OR ...)*

{% img https://lh6.googleusercontent.com/-POsLw3z9-2A/VKza5C_kE7I/AAAAAAAAPzA/2c6RN9V7_-c/w800-no/Screenshot%2B2015-01-07%2B15.04.17.png 800 600 %} 

點 **Continue**

{% img https://lh4.googleusercontent.com/-S0yo3hreTC4/VKza_i1ic7I/AAAAAAAAPzM/HBIDqrg9-L0/w800-no/Screenshot%2B2015-01-07%2B15.04.25.png 800 600 %}

這裡可以順便分 label 不然就是直接勾 **Forward it to** 選你的 pushover mail 就大功告成了。

然後等你設定的 Portal 被人打就會收到如下的戰報了：

{% img https://lh3.googleusercontent.com/-jHoYlRw1Xjw/VKzobV-ZbeI/AAAAAAAAP0o/zJVFsLFgJoo/s800/Screenshot%25202015-01-07%252015.11.54.png 800 600 %}

看吧！寫這篇部落格時，收了戰報還是來不及反應被夷平了 QQ
