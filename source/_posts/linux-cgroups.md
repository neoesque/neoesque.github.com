---
layout: post
title: "Linux cgroups"
date: 2013-01-01 19:16
comments: true
tags: ["Linux", "cgroups", "SUSE", "Gentoo"]
categories: ["資訊"]
---

[cgroups](http://en.wikipedia.org/wiki/Cgroups) 是 Linux 的一個特色，全名是 control groups，最簡單的概念就是控制資源的分配包含了隔離、記錄的功能，最早是由 Google 的工程師開發的，並且在 2.6.24 正式進了 Kernel，後來也陸續加了不少功能，而且在 3.3 之後又加了網路優先權(priority)功能。後來的 LXC ([LinuX Containers](http://en.wikipedia.org/wiki/LXC)) 就是用了 cgroups 的功能來的。

由於是從 Kernel 控制的所以幾乎什麼都可以管理，舉凡 `blkio` (管理輸入輸出的 block device ，像是硬碟、USB)、`cpu` (設定忙碌時能使用的 CPU time)、`cpuacct` (做統計用的)、`cpuset` (設定由那顆 CPU 執行運算)、`device` (限制能使用的設備)、`memory` (限制記憶體用量)、`net_cls` (似乎跟網路有關)，管理的範圍是以 Group 為主，所謂的 Group 可以是同一個使用者、同一個群組、同樣的 Process。

最簡單使用 `cgroups` 的方式就是裝 `libcgroup` 來管理<!--more-->，他有幾個跟 cgroups 相關的指令跟服務可以使用，Gentoo 要安裝相當簡單，因為 libcgroup 已經在 portage 裡面了，直接 `emerge dev-libs/libcgroup` 就裝好了，而 SUSE 則需要先加其他的 repos 才可以使用(下列範例使用 SLES11sp2 當範例):

    zypper ar http://download.opensuse.org/repositories/Virtualization/SLE_11_SP2/Virtualization.repo && zypper -n ref && zypper --no-gpg-checks --non-interactive install --auto-agree-with-licenses libcgroup-tools && zypper rr Virtualization

裝好之後系統裡面就會多了 `cg` 開頭的指令以及 `/etc/init.d/cgconfig` 跟 `/etc/init.d/cgred`，要使用這兩個服務會參照到 `/etc/cgconfig.conf` 跟 `/etc/cgrules.conf` 這兩個檔案，下面講解我使用到的情境搭配的設定。

因為我們的伺服器會做轉檔的動作，有時候量大就會讓轉檔用的程式(以下叫 convert)咬死 CPU，讓 web server (以下叫 httpd) 跟 php-cgi 因為吃不到 CPU 所以就讓服務中斷了，因此在這裡會用到的是 cpuset 的功能，要注意到的是 cpu 跟 cpuset 的差異在設定 cpu 是限制佔用 CPU 的時間比，也就是當 process A CPU 100％ 跟 process B CPU 也 100% 時，才會看 cpu 這個參數的設定限制 CPU 使用時間，如果只有 process B CPU 100% 其他的 Process 沒有要資源，這樣 Kernel 還是會讓 B 使用全部的資源，因為轉檔時只有 convert 會 100% 其他的程序並沒有 100% 所以單純限制 cpu 還是沒什麼用，所以這時候就要用 cpuset，讓某個 Group 的程序只能使用某幾顆 CPU (現在都是 multi-core 的系統)，我的設定如下

    wwwrun:httpd * httpd
    wwwrun:php-cgi * php
    wwwrun:convert * convert

`/etc/cgrules.conf` 是給 cgred 這個服務看的，它會監視系統新 fork 出來的 process 有沒有被這個檔案 mapping 到，有的話就會參照每行的第三個參數再去參考 `/etc/cgconfig.conf` 裡面的設定，至於第一個參數的 `wwwrun:httpd` 表示是 wwwrun 這個 user 身份執行的 httpd 這個 process，第二個星號(*)表示有哪些資源要管理，可以是 `cpu` `memory` `cpuset` 如果是 * 表示任何資源都要被管理(一樣會參照 `/etc/cgconfig.conf` 這個檔案)，所以第一行讀起來就是以 wwwrun 身份執行的 httpd 這個 process 要參考 httpd 這個 group 的設定來管理任何資源，而 `/etc/cgconfig.conf` 看下面

    group httpd {
        cpuset {
            cpuset.cpus = 1;
            cpuset.mems = 0;
            cpuset.cpu_exclusive = 1;
        }
    }
    group php {
        cpuset {
            cpuset.cpus = 2,3,4;
            cpuset.mems = 0;
            cpuset.cpu_exclusive = 1;
        }
    }
    group convert {
        cpuset {
            cpuset.cpus = 5,6,7;
            cpuset.mems = 0;
            cpuset.cpu_exclusive = 1;
        }
    }
    mount {
        cpuset = /cgroup/example;
    }

這幾行說明了一共定義了三個 Group `httpd` `php` `convert`，然後都只有定義了 cpuset 這個管理項目，其中 cpuset 又可以看到分別定義了三個變數 `cpuset.cpus` (必須)、`cpuset.mems` (必須)、`cpuset.cpu_exclusive` (非必要)， `cpuset.cpus` 就是這個群組的 process 只能使用哪幾顆 CPU，注意是從 0 開始數，這裏我示範的是如何錯開 CPU 的資源，在 convert 這個群組的 process 只能使用 3 顆 CPU，而 `cpuset.mems` 似乎是對 NUMA 的系統設定的，因為我們是跑在 VMware 上記憶體只有一個，所以定為 0，而 `cpuset.cpu_exclusive` 就是要不要讓 `cpuset.cpus` 裡面的 CPU 只能執行這個群組的 process，最後面的 `mount` 是管理 cgroups 的地方，會以資料夾跟檔案的方式呈現。

一切都設定好之後就直接 `/etc/init.d/cgconfig start` 跟 `/etc/init.d/cgred start`，沒有錯誤的話 /cgroup/example 底下應該會出現資料夾跟一堆檔案，其中可以看到 tasks 這個檔案裡面就有一堆 pid 表示現在這些 pid 是套用到這個 group 的設定。
