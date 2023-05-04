---
layout: post
title: "使用 vGhetto 管理 VMware vCenter"
date: 2012-04-21 21:57
comments: true
tags: ["VMware", "Gentoo"]
categories: ["資訊"]
---

[vGhetto](http://communities.vmware.com/docs/DOC-9852) 是一個由社群主導的專案，主要的目的當然是簡化管理 VMware 的工作，不用使用最原始的 `` vmrun `` 這個指令或者 Perl SDK 做管理，整個專案放在 SourceForge，到 [專案頁面](http://vghetto.sourceforge.net) 下載，抓下來的目錄長這樣 (或者直接用 `` svn co https://vghetto.svn.sourceforge.net/svnroot/vghetto vghetto `` 也可以)

	.
	./INSTALL
	./TODO
	./bitmaps/
	./build/
	./demo/
	./installers/
	./other/
	./scripts/
	./vGhetto.pl*
	./wbin/

其中的 scripts 資料夾就是放置管理用 script 的地方，裡面是一堆 .pl 的 perl 檔案<!--more-->，不過也有用 php 寫的，在使用這些 perl 檔案之前要先安裝 VMware vSphere SDK for Perl，使用 Gentoo 的可以在 *layman* 增加 `` vmware `` 這個 repository

	layman -a vmware


設定之後就可以裝 SDK 了，接著再下

	emerge app-emulation/vmware-vsphere-cli

裝完 scripts 裡面的指令就都可以使用了。我們先用一個簡單的來試看看。


	./listVMByFolder.pl --server VI_SERVER --user VI_USERNAME --password VI_PASSWORD

(VI_SERVER, VI_USERNAME, VI_PASSWORD 請自行代換或者填成 shell variable)

成功的話應該會列出這台 Server 底下的所有 VM (註：Server 可以是 ESX 或者 vCenter)

不過我一開始執行結果會出現下列訊息

	Error: Server version unavailable at 'https://VI_SERVER/sdk/vimService.wsdl'

由於 `` vmrun `` 的指令都是基於 https，因此原因可能有兩個：

+ openssl 的 libs 沒有裝
+ https 的 certificate 是 self-signed (所以預設不被接受)

前者裝上 openssl 即可(Gentoo 預設應該都有裝了)，後者要在 shell variable 加上不要驗證 https 的 certificate，請使用下列指令：

	export PERL_LWP_SSL_VERIFY_HOSTNAME=0

不過主要是利用這個可以簡單的對 VM 下指令(`` vmrun `` 當然也可以啦)，下面是範例：

	./guestOpsManagement.pl --server VI_SERVER --username VI_USERNAME --vm Name_of_VirtualMachine --operation Operation_to_perform --guestusername Username_for_guestOS --working_dir /tmp --program_path program_to_start --program_args Arguments_to_program

可惜 operaion 的種類真的不多，只有下列

	validate | ps | startprog | kill | ls | mkdir | rmdir | rm | mv | mvdir | copyfromguest | copytoguest | env

### 小秘訣

因為每次都要打帳號密碼實在太麻煩，因此 VMware 貼心的準備了 session 的連接方法(因為本來就是對 Https 操作)，有個程式叫做 _save_session.pl_ 可以幫我們存起來，以後就用這個 Session 就可以直接下指令了，Gentoo 這個指令放在 _/opt/vmware/vsphere/cli/apps/session/save_session.pl_，因此我們用下列指令就可以存了，`` /opt/vmware/vsphere/cli/apps/session/save_session.pl --savessionfile PATH_of_SESSION --server VI_SERVER ``，會提示打帳號密碼，存起來的 Session 以後就可以用 shell variable 的 VI_SESSIONFILE 代表，以後就不用在打帳密了。
