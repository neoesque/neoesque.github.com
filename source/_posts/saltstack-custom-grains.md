title: saltstack 自定 grains
date: 2013-07-10 21:00:29
tags:
- Linux
- SaltStack
categories: ["資訊"]
---

[上一集](/post/nice-to-meet-saltstack/) 中，簡單的介紹了 Salt 的使用方法，這集要稍微深入的介紹 Salt 的其中一個部份 - [Grains](http://docs.saltstack.com/topics/targeting/grains.html)，Grains 基本上就是機器的資訊，通常指的是不會變動的部份，比方說 CPU 有幾顆、記憶體有多少、作業系統是用什麼的(CentOS, Ubuntu, SUSE...etc)、網卡資訊，至於會變動的資訊通常會用 Salt 的 [Pilar](http://docs.saltstack.com/topics/pillar/index.html) 功能，雖然 SaltStack 支援很多種 Linux Distribution，而且他的 API 也儘可能的豐富每一個 Distro，像是套件管理系統就有支援 CentOS 的 yum、 Ubuntu 的 APT、 SUSE 的 zypper，但是終究不是每一個系統的特色都能夠完整的支援(可能需要自己貢獻上去?)，像是 SUSE Linux Enterprise Server (簡稱 SLES) 除了大版本號，還有小版本的 Service Pack，撰文的今天剛好出了 SLES 11 SP3，但是 Salt 內建的 Grains 只有偵測到 OS 是 SLES 就沒了，有時候我會依照不同的 Service Pack 需要不一樣的設定(因為 SP2 的套件有時候會支援某些功能，但是 SP1 時候還沒有，像是 sudoer 的設定)，但是不能判斷版本怎麼辦? 沒關係 Salt 具有高度擴充性，我們可以自定想要的 Grains。

<!--more-->

我們先介紹一下內建的 Grains 有什麼好了，我們先隨便挑一台機器，`salt 'www-01' grains.items`，如果執行有成功應該會出現如下的資訊：

	www-01:
	  biosreleasedate: 06/22/2012
	  biosversion: 6.00
	  cpu_flags: fpu vme de pse tsc msr pae mce cx8 apic sep mtrr pge mca cmov pat pse36 clflush dts mmx fxsr sse sse2 ss ht syscall nx lm constant_tsc arch_perfmon pebs bts nopl tsc_reliable nonstop_tsc aperfmperf pni ssse3 cx16 sse4_1 x2apic hypervisor lahf_lm dtherm
	  cpu_model: Intel(R) Xeon(R) CPU           L5420  @ 2.50GHz
	  cpuarch: x86_64
	  defaultencoding: UTF8
	  defaultlanguage: zh_TW
	  domain: 
	  fqdn: www-01
	  gpus:
	      {'model': 'SVGA II Adapter', 'vendor': 'unknown'}
	  host: www-01
	  id: www-01
	  ip_interfaces: {'sit0': [], 'lo': ['127.0.0.1'], 'eth0': ['192.168.1.1']}
	  ipv4:
	      127.0.0.1
	      192.168.1.1
	  kernel: Linux
	  kernelrelease: 3.9.7-neoesque
	  localhost: www-01
	  manufacturer: VMware, Inc.
	  master: salt
	  mem_total: 8016
	  nodename: www-01
	  num_cpus: 4
	  num_gpus: 1
	  os: SUSE  Enterprise Server
	  os_family: Suse
	  oscodename: x86_64
	  osfullname: SUSE Linux Enterprise Server
	  osrelease: 11
	  path: /sbin:/bin:/usr/sbin:/usr/local/bin:/usr/bin/
	  productname: VMware Virtual Platform
	  ps: ps -efH
	  pythonpath:
	      /usr/local/bin
	      /usr/local/lib64/python2.6/site-packages/pip-1.3.1-py2.6.egg
	      /usr/lib/python26.zip
	      /usr/lib64/python2.6
	      /usr/lib64/python2.6/plat-linux2
	      /usr/lib64/python2.6/lib-tk
	      /usr/lib64/python2.6/lib-old
	      /usr/lib64/python2.6/lib-dynload
	      /usr/lib64/python2.6/site-packages
	      /usr/local/lib64/python2.6/site-packages
	  pythonversion: 2.6.0.final.0
	  saltpath: /usr/local/lib64/python2.6/site-packages/salt
	  saltversion: 0.15.90
	  serialnumber: VMware-42 30 04 4b 79 d2 c1 59-92 2b eb 2e 71 d4 7c 63
	  server_id: 1323040866
	  shell: /bin/zsh
	  virtual: VMware
	
如果想要單獨知道某一個，可以這樣下 `salt 'www-01' grains.item os`這樣就只會出現

	www-01:
	  os: SUSE  Enterprise Server
	
但是從上面的資訊我們可以發現 Salt 與預設只能抓到剛剛說的 os: SLES 跟 osrelease: 11，並沒有我們想要的 service pack 的版本號，所以我們需要自己新增。

首先在 Master 的電腦的 Base 底下新增一個叫做 __\_grains__的資料夾，如果是預設值也就是 __/srv/salt/\_grains__，指令如下 `install -d /srv/salt/_grains`，然後隨便產生一個副檔名是 __.py__ 的檔案就好，比方說我產生一個 __os.py__，然後內容如下:

`vi /srv/salt/_grains/os.py`

	def patch():
	    ''' 
	        return Service Pack Version
	    '''
	    grains = {}
	    for line in open("/etc/SuSE-release"):
	        if "PATCHLEVEL" in line:
	            patch = int(line.split("=")[-1])
	    grains['ospatch'] = patch
	    return grains
	
因為 SUSE 的 SP 版本號存在 __/etc/SuSE-release__，所以這裏只是一個小小的 python code 去把我們要的資訊取出來，注意到的幾個關鍵是

* 開頭不用 #!/usr/bin/python ，因為這個檔案原本 salt 就會直接餵給 python 吃而已
* grains 這個變數可以直接覆寫，因為最後是 merge 結果的，所以 grains['ospatch'] = patch 最後你的 `grains.items` 裡面就會多一個 ospatch 的變數

存檔後就可以準備下指令啦！首先是請各個 minion 來領檔案回去，所以就是 `salt '*' state.highstate`，下完之後這時候直接打 `salt 'www-01' grains.item ospatch`，應該會沒顯示東西，因為這時候我們還沒更新資料，前面說過 grains 是 static 的，所以要更新資料我們要下 `salt '*' sys.reload_modules` 這樣 minion 就會重新 scan modules 了，接著我們就可以下看看 `salt '*' grains.item ospatch` 如果沒錯誤應該可以看到如下的結果

	www-stage:
	  ospatch: 1
	www-02:
	  ospatch: 2
	www-01:
	  ospatch: 2
	www-03:
	  ospatch: 2
	www-04:
	  ospatch: 2

自定 Grains 大概就是這麼一回事嘍~