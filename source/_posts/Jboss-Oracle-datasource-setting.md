title: Jboss Oracle datasource setting
date: 2022-09-06 16:34:44
comments: true
tags: ["Linux"]
categories: ["資訊"]
---

最近單位的開發區換了 Oracle 的架構，從單台改成 RAC ，不知道為什麼 Jboss 原本不需要 keep alive 現在需要才可以維持 connection，不然 server.log 會噴

	IJ030027: Destroying connection that is not valid, due to the following exception: oracle.jdbc.driver.T4CConnection@一串ID: java.sql.SQLException: pingDatabase failed status=-1

由於我們的 Production 也不需要加，所以一時有點沒頭緒，後來在網路翻閱了一下 RedHat 官方跟 Oracle 的文件，目前設定如下，安定使用中

<!--more-->

先前測試了一下 ENABLE=BROKEN 加在 connection-url 是沒有作用的，原來是要另外加參數餵給 Jboss

關鍵在加上 JDBC 的參數

{% codeblock datasource lang:xml %}
<connection-property name="oracle.net.keepAlive">true</connection-property>
{% endcodeblock %}

另外 Oracle 的 validation RedHat 官方手冊是這樣建議的

{% codeblock datasource lang:xml %}
<validation>
	<valid-connection-checker class-name="org.jboss.jca.adapters.jdbc.extensions.oracle.OracleValidConnectionChecker"/>
	<validate-on-match>true</validate-on-match>
	<background-validation>false</background-validation>
	<stale-connection-checker class-name="org.jboss.jca.adapters.jdbc.extensions.oracle.OracleStaleConnectionChecker"/>
	<exception-sorter class-name="org.jboss.jca.adapters.jdbc.extensions.oracle.OracleExceptionSorter"/>
</validation>
{% endcodeblock %}

因此整塊的設定如下

{% codeblock datasource lang:xml %}
<datasource jndi-name="java:jboss/MYPOOL" pool-name="MYPOOL" enabled="true" use-java-context="true" statistics-enabled="true">
	<connection-url>jdbc:oracle:thin:@...</connection-url>
	<connection-property name="oracle.net.keepAlive">
		true
	</connection-property>
	<connection-property name="oracle.jdbc.TcpNoDelay">
		true
	</connection-property>
	<driver>oracle</driver>
	<pool>
		<min-pool-size>1</min-pool-size>
		<initial-pool-size>1</initial-pool-size>
		<max-pool-size>50</max-pool-size>
		<prefill>true</prefill>
		<use-strict-min>true</use-strict-min>
	</pool>
	<security>
		<user-name>myUser</user-name>
		<password>myPassword</password>
	</security>
	<validation>
		<valid-connection-checker class-name="org.jboss.jca.adapters.jdbc.extensions.oracle.OracleValidConnectionChecker"/>
		<validate-on-match>true</validate-on-match>
		<background-validation>false</background-validation>
		<stale-connection-checker class-name="org.jboss.jca.adapters.jdbc.extensions.oracle.OracleStaleConnectionChecker"/>
		<exception-sorter class-name="org.jboss.jca.adapters.jdbc.extensions.oracle.OracleExceptionSorter"/>
	</validation>
</datasource>
{% endcodeblock %}

參考資料

+ [Database Connection Validation](https://access.redhat.com/documentation/en-us/red_hat_jboss_enterprise_application_platform/6.4/html/administration_and_configuration_guide/sect-database_connection_validation)
+ [Oracle Database JDBC Java API Reference](https://docs.oracle.com/en/database/oracle/oracle-database/21/jajdb/oracle/jdbc/OracleConnection.html)