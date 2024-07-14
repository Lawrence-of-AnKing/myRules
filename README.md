# myRules

个人使用的代理分流规则，包括需要代理的网站和不需要代理的网站。

要使用此规则，先前往 <https://acl4ssr-sub.github.io/> ，获取转换后的订阅链接。

在订阅链接后面加上下面这串代码：

```Shell
&insert=false&config=peizhiwenjian&emoji=true&list=false&udp=false&tfo=false&scv=false&fdn=false&sort=false
```

得到“链接A”。

然后，复制 `clashRules.ini` 的RAW地址：

```Shell
https://raw.githubusercontent.com/Lawrence-of-AnKing/myRules/main/clashRules.ini
```

前往 <https://www.urlencoder.org/> ，对 `clashRules.ini` 进行转码，得到“链接B”：

```Shell
https%3A%2F%2Fraw.githubusercontent.com%2FLawrence-of-AnKing%2FmyRules%2Fmain%2FclashRules.ini
```

最后，用“链接B”替换掉“链接A”中的“peizhiwenjian”字样，得到包含分流规则的链接。

将新的链接导入Clash即可。

下面是效果：

![2022-12-16-110320](https://cdn.jsdelivr.net/gh/Lawrence-of-AnKing/ImgBank@main/MdImg/2022/12/2022-12-16-110320.png)

在GitHub上更改的配置文件，会随着订阅链接的更新而自动反映在规则上。

每次只需要在GitHub上更改配置文件即可。

你也可以制作你自己的订阅规则。
