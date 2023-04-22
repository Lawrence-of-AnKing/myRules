# myRules

个人使用的代理分流规则，包括需要代理的网站和不需要代理的网站。

要使用此规则，先前往 <https://sub.dler.io/> ，获取转换后的订阅链接。

然后，复制 `clashRules.ini` 的RAW地址：

```Shell
https://raw.githubusercontent.com/Lawrence-of-AnKing/myRules/main/clashRules.ini
```

前往 <https://www.urlencoder.org/> ，获取转码后的链接：

```Shell
https%3A%2F%2Fraw.githubusercontent.com%2FLawrence-of-AnKing%2FmyRules%2Fmain%2FclashRules.ini
```

预留一下策略组配置文件地址位置，在订阅链接的基础上加上下面这串代码：

```Shell
&insert=false&config=peizhiwenjian&emoji=true&list=false&udp=false&tfo=false&scv=false&fdn=false&sort=false
```

最后，按照下面的方式制作新的订阅链接：

```Shell
# &insert 前为先前通过`api.dler.io`转换后的订阅地址
# peizhiwenjian 替换成你转码后配置文件地址，一定是.ini结尾的

https://sub.dler.io/sub?target=clash&url=api.dingyue1.com%2F1234567%7Capi.dingyue2.com%2F1234567%7Capi.wangiyihun.com%2Fblabla&insert=false&config=peizhiwenjian&emoji=true&list=false&udp=false&tfo=false&scv=false&fdn=false&sort=false
```

将新的链接导入Clash即可。

下面是结果：

![2022-12-16-110320](https://cdn.jsdelivr.net/gh/Lawrence-of-AnKing/ImgBank@main/MdImg/2022/12/2022-12-16-110320.png)

在GitHub上更改的配置文件，会随着订阅链接的更新而自动反映在规则上。

每次只需要在GitHub上更改配置文件即可。
