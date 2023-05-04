---
layout: post
title: "讓應用程式都使用 Webkit Core"
date: 2009-12-06
comments: false
tags: ["Mac"]
categories: ["資訊"]
---

要讓比方說 Safari, MailPlane 或 CSSEdit 吃 Webkit 的核心的話其中一種方法是從終端機打開<br />如以下設定<br /><br />export DYLD_FRAMEWORK_PATH=/Applications/WebKit.app/Contents/Frameworks/10.6/<br />export WEBKIT_UNSET_DYLD_FRAMEWORK_PATH=YES<br />open /Applications/blahblah.app<br /><br />即可<br />可是要從終端機太麻煩了對吧<br />Mac OS X 提供更方便的方式讓全系統都套用<br /><!--more--><br />首先先新增 ~/.MacOSX 的資料夾<br />然後建立 environment.plist 的檔案並編輯他新增兩筆以下資料(直接新增 child 即可)<br /><br />"WEBKIT_UNSET_DYLD_FRAMEWORK_PATH" = YES;<br />"DYLD_FRAMEWORK_PATH" = "/Applications/WebKit.app/Contents/Frameworks/10.6/";<br /><br /><img src="http://grab.by/10oy" alt=""><br /><br />登出在登入後打開 Safari 的關於 Safari 看看有沒有出現 版本 4.0.4 (6531.21.10, r51708) 後面的 r 表示 webkit core 的 release<br /><br />這樣就成功了~
