---
layout: post
title: "moinmoin wiki 跟 trac 改吃 NIS"
date: 2011-05-14
comments: false
tags: ["moinmoin", "trac", "NIS"]
categories: ["資訊"]
---

最近敝單位正在將原本用 OpenLDAP 的認證方式轉成 Windows AD<br /><br />因為接下來還會進一步導入 <a href='http://www.vmware.com/tw/products/view/'>VMware View</a><br /><br />View 限制要吃 Windows AD 的帳號 所以學長說就都改用 Windows AD 吧 反正 Windows AD 可以把 帳號密碼跟群組用 NIS 的方式吐給 Unix 吃<br /><br />ssh 登入吃 NIS 非常方便 敝單位現在都用 SLES11 所以用 yast 新增一下就好了!<br /><br />這樣 svn 就不會有問題了<br /><br />然後原本敝單位還有採用 trac 來做 ticket 追蹤與 moinmoin wiki 當做大家的筆記<br /><br />以下是如何設定這兩個讓他們可以吃到 NIS 的帳號<br /><!--more--><br />首先是先改 moinmoin<br /><br />看到 <em>python lib 的路徑/site-packages/moin-1.9.2-py2.6.egg/share/moin/wikiconfig.py</em><br /><br />把原本 LDAPAuth 的部份改成如下<br /><br />{% gist 971678 %}<br />接下來是 trac<br /><br />trac 的 LDAP 似乎有很多 plugin 不過都大同小異<br /><br />我們只要把 [ldap] 的部份改成如下即可<br /><br />{% gist 971679 %}<br />這樣就可以用 Windows AD 的帳號密碼登入了！<br /><br />同場加映 把 cacti 也改吃 NIS<br /><br />看之前我上司的文章就好 XD<br /><br /><a href="http://blog.xuite.net/misgarlic/weblogic/45065527">cacti authentication with LDAP</a><br /><br />後記<br /><br />如果 Windows 的帳號有 "使用者必須在下次登入時變更密碼" 的帳戶選項  那個使用者將會登入不了!(Both trac and moinmoin) (不過在 ssh 登入卻可以 = = 也太怪了)
