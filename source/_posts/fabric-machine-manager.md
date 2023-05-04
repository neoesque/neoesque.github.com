---
layout: post
title: "fabric - Machine Manager"
date: 2012-04-30 10:13
comments: true
tags: ["Linux"]
categories: ["資訊"]
---

Python [Fabirc](http://docs.fabfile.org) 是一個類似 Ruby capistrano 的自動化部署跟系統管理工具，安裝指令是 `` pip install -U fabric `` 或者 `` easy_install fabric `` 都可以。fabric 的使用也非常的簡單，只要寫好一個檔名是 _fabfile.py_ 的檔案，在同一個資料夾底下打 `` fab --list `` 就可以看到有哪些參數可以下(就是 fabfile.py 裡面的 function)。

以下是一個簡單的範例 template

<!--more-->

    import fabric
    from fabric.api import run, env
    from fabric.operations import put
    env.warn_only = True
    # Broken machine
    env.skip_bad_hosts = True
    env.parallel = True
    env.pool_size = 5
    env.timeout = 5
    
    message = """
    fabric.state.output["status"] = False
    """
    fabric.state.output["running"] = False
    fabric.state.output["user"] = False
    fabric.state.output["warnings"] = False
    fabric.state.output["stderr"] = False
    
    
    def web():
        for x in xrange(1,9):
            env.hosts.append('192.168.0.' + str(x))
        for x in xrange(11,19):
            env.hosts.append('192.168.0..' + str(x))
        for x in xrange(31, 39):
            env.hosts.append('192.168.0.' + str(x))
    
    
    def cache():
        for x in xrange(1, 9):
            env.hosts.append('192.168.1.' + str(x))
    
    
    def all():
        web()
        cache()
    
    
    # define needed functions here.
    def host_info():
        print 'Checking lsb_release of host: ',  env.host
        run('lsb_release -a')
    
    
    def uptime():
        run('uptime')
    
    def date():
        run('date')

然後我們打 fab --list 應該會顯示

    Available commands:
    
        all
        cache
        date
        host_info
        uptime
        web

如果我們要知道 web 的 uptime 是多少就可以這樣使用 `` fab web uptime ``，那如果要知道 cache 的 host_info 就可以下 `` fab cache host_info ``，相同的如果要知道全部的機器的時間準不準就打 `` fab all date ``，使用了 fabric 之後管理就變簡單了吧！

進階的還有用 `` put `` 指令來做類似 `` rsync `` 的工作，請參閱 fabric 的文件即可。
