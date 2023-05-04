title: "安裝 Redmine - postgresql, nginx, rbenv"
date: 2016-01-31 20:48:05
tags: ["Linux"]
categories: ["資訊"]
---

[Redmine](http://www.redmine.org/) 是一套專案管理軟體，我們單位之前都用 [Trac](http://trac.edgewall.org/) 不過 Trac 更新速度慢功能也沒什麼在增加，所以最近換單位要重建基礎服務後，學長決定把 Trac 改到 Redmine。Redmine 是用 RoR 的技術寫的，所以主要就是需要 Ruby，DB 的部分則是 mysql, postgresql 都可以。前端的部分可以用 Apache 也可以用 nginx。本片主要介紹我比較習慣的 postgresql + nginx 的組合。至於 Ruby 因為 Ubuntu 14.04 比較舊，所以使用 rbenv 搭建 Ruby 2.2 的環境。

<!--more-->

在網路找到兩篇參考文章，此文基本上就是各取所需組合起來的，請參考最下面的參考資料。

### 安裝套件
首先更新 Ubuntu 全部的 pkg 確保都是最新的。
    ```bash
    sudo apt-get update
    sudo apt-get -y upgrade
    ```

然後安裝 Ruby 跟 Passenger 安裝的相依工具
    ```bash
    sudo apt-get install -y build-essential zlib1g-dev libssl-dev libreadline-dev libyaml-dev libcurl4-openssl-dev
    ```

PostgreSQL 的套件
    ```bash
    sudo apt-get install -y postgresql postgresql-server-dev-9.3
    ```

nginx 的
    ```bash
    sudo apt-get install -y nginx-extras
    ```

ImageMagick 的
    ```bash
    sudo apt-get install -y imagemagick libmagick++-dev
    ```

版控工具
    ```bash
    sudo apt-get install subversion git
    ```

### 建立 redmine 使用者帳號
建立一個 user 供 Redmine 服務使用
    ```bash
    sudo adduser --disabled-login --gecos 'Redmine' redmine
    sudo su - redmine
    ```

以下開始用 redmine 這個帳號操作

### 安裝 Ruby
這裡使用 rbenv 來建立跑 redmine 的環境
    ```bash
    git clone git://github.com/sstephenson/rbenv.git .rbenv
    git clone git://github.com/sstephenson/ruby-build.git ~/.rbenv/plugins/ruby-build
    ```

把 rbenv 加入 shell 變數
    ```bash
    echo 'export PATH="$HOME/.rbenv/bin:$PATH"' >> ~/.bash_profile
    echo 'eval "$(rbenv init -)"' >> ~/.bash_profile
    exec $SHELL -l
    ```

接着可以準備安裝 Ruby 了
    ```bash
    rbenv install 2.2.4
    ```

安裝完畢後可以確認一下
    ```bash
    rbenv global 2.2.4
    ruby -v
    ```

以下的操作先回到可以用 sudo 的帳號

接着先建立給 Redmine 用的 postgresql 資料庫
    ```bash
    sudo -u postgres createuser -P redmine
    # 輸入想要的密碼兩次
    sudo -u postgres createdb -E UTF-8 -O redmine -T template0 redmine
    ```


### 安裝 Redmine
Ruby 環境準備好之後就可以裝 Redmine 了
    ```bash
    sudo mkdir /home/redmine/redmine
    sudo chown redmine:www-data /home/redmine/redmine
    sudo -u redmine svn co http://svn.redmine.org/redmine/branches/3.2-stable /home/redmine/redmine
    ```

先設定 puma
    ```bash
    curl -Lo /home/redmine/redmine/config/puma.rb https://gist.githubusercontent.com/jbradach/6ee5842e5e2543d59adb/raw/
    ```

首先需要改一下 Redmine 的設定
    ```bash
    sudo -u redmine vi /home/redmine/redmine/config/database.yml
    ```

改成如下
    ```
    production:
      adapter: postgresql
      database: redmine
      host: localhost
      username: redmine
      password: "********"
      encoding: utf8
    ```

關於 EMail 的部分也可以改一下
    ```bash
    sudo -u redmine vi /home/redmine/redmine/config/configuration.yml
    ```

如下
    ```
    production:
      email_delivery:
        delivery_method: :smtp
        smtp_settings:
          address: "localhost"
          port: 25
          domain: "example.com"
    ```

接着是安裝 Redmine 需要的相關 Ruby package (請變成 redmine )
    ```bash
    echo "gem: --no-ri --no-rdoc" >> ~/.gemrc
    echo -e "# Gemfile.local\ngem 'puma'" >> Gemfile.local
    gem install bundler
    rbenv rehash
    bundle install --without development test
    ```

產生 Token (編碼 cookie 用)，建立 db 與初始資料
    ```bash
    rake generate_secret_token
    RAILS_ENV=production rake db:migrate
    RAILS_ENV=production rake redmine:load_default_data
    ```

至此我們已經可以先測試了
    ```bash
    ruby script/rails server webrick -e production
    ```

打開瀏覽器，填入 http://localhost:3000 看看有沒有畫面出現，有的話我們可以 ctrl + c 先回來。

首先我們需要啓動 redmine 的 script
    ```bash
    sudo curl -Lo /etc/init.d/redmine https://gist.githubusercontent.com/jbradach/17e73fa6ddc365bb0242/raw/
    sudo chmod +x /etc/init.d/redmine
    sudo update-rc.d redmine defaults
    service redmine start
    ```

然後 nginx 的部分也很簡單，抓一下設定即可 (可以把 default 移除)
    ```bash
    sudo curl -Lo /etc/nginx/sites-available/redmine https://gist.githubusercontent.com/jbradach/31ad6d9c84c3be3b5730/raw/
    sudo ln -s /etc/nginx/sites-available/redmine /etc/nginx/sites-enabled/redmine
    sudo service nginx restart
    ```

這時候看瀏覽器 http://localhost 應該就有 redmine 了。

---

參考資料

+ [Redmine 3.2 を Ubuntu Server 14.04.3 LTS にインストールする手順](http://blog.redmine.jp/articles/3_2/install/ubuntu/)

+ [Install Redmine with Nginx, Puma, and MariaDB/MySQL on Ubuntu 14.04](https://blog.rudeotter.com/install-redmine-with-nginx-puma-and-mariadbmysql-on-ubuntu-14-04/)
