title: Saltstack 使用心得&簡介
date: 2013-06-30 11:17:28
tags:
- Linux
- SaltStack
categories: ["資訊"]
---

身為一個系統管理者，當你管理的機器數量只有十來台時，你可以很輕鬆的一台一台進去管理、設定機器，但是隨著服務開始搞大了，機器數量變成數十台時，也許會需要一些工具來輔助管理，之前我都是用 [Fabric](http://docs.fabfile.org/en/1.6/) 來幫忙管理，不過 Fabric 有個缺點是他只是一個下指令的管理工具，當然我之前都硬幹，用 [put](http://docs.fabfile.org/en/1.6/api/core/operations.html?highlight=put#fabric.operations.put) 硬把他當成管理 configuration 的工具，上傳完了再下一個 reload 的指令，當然這樣也不是不行，不過似乎真的是一個很土炮的方法，但是隨著機器的數量越來越大，已經到達幾百臺的時候，就算是用 Fabric + [parallel](http://docs.fabfile.org/en/1.6/usage/env.html#env-parallel) 其實還是覺得很怪，一來是雖然他已經平行處理了，但是他的 output 卻變成無序的，也就是當受管理的機器有 output 他就直接顯示在管理端上，有點惱人就是，另外一個是 Fabric 需要自己寫 Group 管理，要自己定義東西，而不能透過簡單的 query 來對想要的機器下指令就好，所以最近開始想要轉型使用 configuration management tool，常見的選擇是 [puppet](https://puppetlabs.com/)、[chef](http://www.opscode.com/chef/)、[CFEngine](http://cfengine.com/) 之類的，不過最近有個當紅的 OpenSource 軟體出現了，那就是 [SaltStack](http://docs.saltstack.com/)。

<!--more-->

SaltStack 在網路的形容看起來是輕量的，而且設定極其簡單，加上是 Python 寫的，基於本人跟 Python 實在很有緣，我最愛的 [Gentoo Linux](http://www.gentoo.org/) 剛好他的套件管理系統 portage 就是 Python-based，然後 Fabric 也是 Python，於是就決定使用看看(這個理由是不是很薄弱 XD)

SaltStack 的架構分成 Server (叫 Master) 跟 Client (叫 Minion)，每台電腦都要安裝 salt 的程式，安裝的方法也很簡單，官網有提供一行安裝法 `wget -O - http://bootstrap.saltstack.org | sudo sh` 這樣就裝好 Salt Master 了，不過當然如果是比較大的 Distro 像是 Ubuntu、SuSE、Gentoo 還是建議用內建的套件管理程式安裝，不過如果套件管理程式還是沒有就只好搬出 Python 的 `easy_install salt` 或 `pip install salt` 這兩種方法也可以把 Master 跟 Minion 都裝到好。

Master 跟 Minion 裝好之後就可以開始測試啦，現在馬上啟動 Master，指令是 `salt-master -l debug` 這樣 console 會噴大量的 debug msg 而且會先在前景執行，至於 Minion 這端我們要先設定一下 __/etc/hosts__ 加入 Master 的 ip 然後名字叫 salt，例如 `echo -n '\n192.168.1.1 salt\n' >> /etc/hosts` 因為 Minion 預設是去找 salt 這個 name 的 Server，設定好之後就可以啟動 Minion 了 `salt-minion -l debug`，由於 Salt 是採用類似 SSH 那樣的 key 交換機制，所以理論上兩邊有連上的話在 Master 那端的電腦打 `salt-key` 應該會出現 Minion 的 ID ( 也就是機器的 hostname)，如下:

	Accepted Keys:
	Unaccepted Keys:
	Minion-01
	Minion-02
	Rejected Keys:

一開始加進來的 Minion 都會被擺在 Unaccepted 這裏，這時候要下 `salt-keys -a 'Minion-*'` 就可以把 Minion- 開頭的機器變成 accepted 的了，設定成信賴後，我們就可以開始下一些簡單的 query 了，比方說在 Master 那端打 `salt 'Minion-*' test.ping` 應該就會出現:

	Minion-01:
  	  True
	Minion-02:
  	  True

這樣就表示 Minion 有回應了，如果要對 Minion 下指令則是用 cmd.run，比方說 `salt 'Minion-*' cmd.run date` 應該會得到這樣的回應

	Minion-01:
  	  Sun Jun 30 18:55:30 CST 2013
	Minion-02:
  	  Sun Jun 30 18:55:30 CST 2013

詳細可以下的指令 ( Salt 叫做 modules ) 請看[這裏](http://docs.saltstack.com/ref/modules/all/index.html) 本文不多做介紹。

直接進入正題，如何利用 Salt 來做 Configuration 的管理呢，首先剛剛再啟動 Server 跟 Client 時，連設定都沒設定，zero-configuration 就可以直接用了，但是要比較進階一點當然還是需要小小設定一下，首先 Master 的設定檔位置在 __/etc/salt/master__，先做如下設定

	file_roots:
		base:
			- /srv/salt
	file_ignore_regex:
		- '/\.svn($|/)'
		- '/\.git($|/)'

上面的設定是說我們的檔案 ( 也就是 salt 內建的 fileserver 要以哪裏為 Base ) 都放在 __/srv/salt/__ 裡面，然後要同步檔案時，把 `/.svn/` 跟 `/.git/` 都忽略掉。
因此我們建立一下目錄跟建立相關檔案 `install -d /srv/salt/ && touch /srv/salt/top.sls`，最主要的檔案就是這個 `top.sls`， SLS (可能是 SaLt State) 檔案就是描述所謂的 Configuration 要如何設定，在 Salt 一個 Configuration 就是一個 State，所有指定到的機器都會遵守這個狀態，這個 `top.sls` 大概會長下面這樣

	base:
  	'*':
    	- users
  	'www-*':
    	- nginx.www

首先第一行是 base 這是固定的，然後下面就是進行 ID 的配對，這裡可以看到我設定了兩組，一個是 '*' 表示每一台受控管的機器都要遵守的設定，要參照 `users` 的 state ，而這個定義在哪裡呢，就是 __/srv/salt/users.sls__，基本上 Salt 的檔案組合就是依照 `file_roots` 所指定的位置開始找的，然後 `top.sls` 裡面參照的 state 則可以省略 `.sls` 這個檔名，接著是所有 `www-` 開頭的機器都還要額外看 `nginx.www` 這個狀態，在 `top.sls` 裡面出現的 `.` 表示真正的位置是一個資料夾，也就是這個 `nginx.www` 狀態檔實際是描述在 __/srv/salt/nginx/www.sls__，先來看 users.sls 怎麼定義的好了

	foo:
	  user.present:
	    - fullname: foo
	    - shell: /bin/bash
	    - home: /home/foo
	    - uid: 1000
	    - gid: 100
	    - groups:
	      - www
	bar:
	  user.present:
	    - fullname: bar
	    - shell: /bin/bash
	    - home: /home/bar
	    - uid: 1001
	    - gid: 100
	    - groups:
	      - wheel

這裏表示每一台機器至少要有 foo & bar 這兩個帳號，然後其他設定都要參照這個檔案的說明，應該不難懂我就不一一說明了，要看詳細的可以參考 [salt.states.user](http://docs.saltstack.com/ref/states/all/salt.states.user.html)，然後再來是 __/srv/salt/nginx/www.sls__ 會長的如下設定

	/home/nginx/conf/:
	  file.recurse:
	    - source: salt://nginx/www/
	    - user: root
	    - group: root
	    - dir_mode: 755
	    - file_mode: 644
	    - include_empty: True
	
	nginx:
	  service.running:
	    - enable: True
	    - reload: True
	    - watch:
	      - file: /home/nginx/conf/*

這裏表示指定到的 minion 的 __/home/nginx/conf/__，要參考 Master 的 `salt://nginx/www/` 而這個的實際路徑是哪裏呢？依照之前說的一切都從 Base 開始，所以就是在 Master 的 __/srv/salt/nginx/www/__，也就是 Minion 的 __/home/nginx/conf/__ 狀態改變的依據要跟隨 Master 的 __/srv/salt/nginx/www/__ 資料夾，然後後面有個 `service.running` 那段則是表示當 __/home/nginx/conf/*__ 有任何檔案被異動時(參照 [salt.states.service](http://docs.saltstack.com/ref/states/all/salt.states.service.html#module-salt.states.service))， nginx 這個 Service 要被 reload (參照 `reload: True` 若無此設定則為 restart)，而 `enable: True` 則是表示開機要自動啟動，到目前為止就算是設定完 state 了，然後當然假設你的 nginx 設定檔都已經放在 __/srv/salt/nginx/www/__ 裡面了，接下來要同步狀態要用的指令就是 `salt '*' state.highstate` 然後應該會出現下列的資訊

	www-01:
	----------
	    State: - file
	    Name:      /home/nginx/conf/
	    Function:  recurse
	        Result:    True
	        Comment:   The directory /home/nginx/conf/ is in the correct 	state
	        Changes:   
	----------
	    State: - service
	    Name:      nginx
	    Function:  running
	        Result:    True
	        Comment:   Service nginx is already enabled, and is in the 	desired state
	        Changes:   
	----------
	    State: - user
	    Name:      foo
	    Function:  present
	        Result:    True
	        Comment:   User foo is present and up to date
	        Changes:   
	----------
	    State: - user
	    Name:      bar
	    Function:  present
	        Result:    True
	        Comment:   User bar is present and up to date
	        Changes:   	

如何，很簡單吧！因為我的狀態已經同步了，所以都沒有異動，如果有任何異動(包含新增、刪除使用者)，他都會一一列出來，更貼心的是檔案的異動甚至是列出 diff，真的是很仔細，目前為止大概就是如何利用 salt 來管理機器，用了這個之後真的就很簡單的就可以一次大量的管理一堆機器了，管理者可以花更多時間喝咖啡？

下一篇會介紹一下如何客製化 grains，也就是取得機器的資訊的部份。