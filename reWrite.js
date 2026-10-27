// FlClash 共用覆写：不去广告；国内/明确例外直连；其余默认代理。
// 用法：把本文件内容作为订阅的“脚本覆写”。普通文件不是机场订阅，也不能作为YAML导入。
// 文件不含机场节点和授权密码；节点仍由你自己的机场订阅提供。
//
// 首次试用：
// 1. “🟣 Anthropic”保留现用美国节点；没有美国节点就拒绝连接。
// 2. “💲 美国规则”首次默认REJECT，避免自动组改成固定组时悄悄换IP。
//    请手动选你此前使用的美国节点；选“🟣 Anthropic”可明确沿用Claude的出口。
//    这个组也承接共享的登录/验证码，请确认后再使用AI网页。
// 3. “🛰️ Tailnet”：安卓选tailnet；有官方Tailscale的电脑选DIRECT（保留本机选择）。
// 4. “🚀 节点选择”控制普通海外流量；默认兜底不再提供DIRECT。
//
// 规则区只维护你的例外；基础MRS自动更新。广告、媒体解锁、游戏专组已删除。
// 所有固定地区组：缺候选节点就REJECT，不回退其他地区或直连。
// 进程、DNS、Tailscale、云盘和听书例外保留；不会替你升级或重启FlClash。

// 一、Tailscale和内网。Tailnet必须先于一般private规则。
const TS_PROXY_NAME = "tailnet";
const TS_AUTH_KEY = ""; // 不在同步脚本里放密钥。
// 新设备：日志级别info → 对tailnet点测速 → 日志搜索To start → 打开授权链接批准。
const TAILSCALE_RULES = [
  "PROCESS-NAME,tailscaled.exe,DIRECT",
  "PROCESS-NAME,tailscale.exe,DIRECT",
  "PROCESS-NAME,tailscale-ipn.exe,DIRECT",
  "PROCESS-NAME,io.tailscale.ipn.macsys.network-extension,DIRECT",
  "PROCESS-NAME,io.tailscale.ipn.macos.network-extension,DIRECT",
  "PROCESS-NAME,tailscaled,DIRECT",
  "DOMAIN-SUFFIX,tailscale.com,🎯 全球直连",
  "DOMAIN-SUFFIX,tailscale.io,🎯 全球直连",
  "DOMAIN-SUFFIX,ts.net,🛰️ Tailnet",
  "IP-CIDR,100.64.0.0/10,🛰️ Tailnet,no-resolve",
  "IP-CIDR6,fd7a:115c:a1e0::/48,🛰️ Tailnet,no-resolve"
];
const LOCAL_RULES = [
  "IP-CIDR,192.168.0.0/16,DIRECT,no-resolve",
  "IP-CIDR,224.0.0.0/4,DIRECT,no-resolve",
  "IP-CIDR,255.255.255.255/32,DIRECT,no-resolve"
];
const TUN_TAILSCALE_SETTINGS = {"route-exclude-address":["192.168.0.0/16"],"exclude-interface":["Tailscale"]};

// 二、AI指定出口。后缀会覆盖子域名，不重复抄每个API和下载子域。
const ANTHROPIC_RULES = [
  "DOMAIN-SUFFIX,anthropic.com,🟣 Anthropic",
  "DOMAIN-SUFFIX,claude.ai,🟣 Anthropic",
  "DOMAIN-SUFFIX,claude.com,🟣 Anthropic",
  "DOMAIN-SUFFIX,clau.de,🟣 Anthropic",
  "DOMAIN-SUFFIX,claude.app,🟣 Anthropic",
  "DOMAIN-SUFFIX,claudeusercontent.com,🟣 Anthropic",
  "DOMAIN-SUFFIX,claudemcpclient.com,🟣 Anthropic",
  "DOMAIN-SUFFIX,claudemcpcontent.com,🟣 Anthropic",
  "DOMAIN,servd-anthropic-website.b-cdn.net,🟣 Anthropic",
  "DOMAIN,anthropic.com.cdn.cloudflare.net,🟣 Anthropic",
  "DOMAIN,cdn.usefathom.com,🟣 Anthropic",
  "DOMAIN,anthropic-com.ghost.io,🟣 Anthropic",
  "DOMAIN-SUFFIX,statsigapi.net,🟣 Anthropic",
  "DOMAIN,browser-intake-us5-datadoghq.com,🟣 Anthropic",
  "DOMAIN,http-intake.logs.us5.datadoghq.com,🟣 Anthropic",
  "IP-CIDR,160.79.104.0/21,🟣 Anthropic,no-resolve",
  "IP-CIDR6,2607:6bc0::/32,🟣 Anthropic,no-resolve",
  "DOMAIN-KEYWORD,anthropic,🟣 Anthropic",
  "DOMAIN-KEYWORD,claude,🟣 Anthropic"
];
const US_RULES = [
  "DOMAIN-SUFFIX,auth0.com,💲 美国规则",
  "DOMAIN,challenges.cloudflare.com,💲 美国规则",
  "DOMAIN-SUFFIX,workos.com,💲 美国规则",
  "DOMAIN-SUFFIX,workoscdn.com,💲 美国规则",
  "DOMAIN-SUFFIX,intercom.io,💲 美国规则",
  "DOMAIN-SUFFIX,intercomcdn.com,💲 美国规则",
  "DOMAIN-SUFFIX,sentry.io,💲 美国规则",
  "DOMAIN,rum.browser-intake-datadoghq.com,💲 美国规则",
  "DOMAIN-SUFFIX,ct.sendgrid.net,💲 美国规则",
  "DOMAIN-SUFFIX,chatgpt.com,💲 美国规则",
  "DOMAIN-SUFFIX,chatgpt.site,💲 美国规则",
  "DOMAIN-SUFFIX,openai.com,💲 美国规则",
  "DOMAIN-SUFFIX,openai.org,💲 美国规则",
  "DOMAIN-SUFFIX,chat.com,💲 美国规则",
  "DOMAIN-SUFFIX,sora.com,💲 美国规则",
  "DOMAIN-SUFFIX,oaistatic.com,💲 美国规则",
  "DOMAIN-SUFFIX,oaiusercontent.com,💲 美国规则",
  "DOMAIN-SUFFIX,oaistatsig.com,💲 美国规则",
  "DOMAIN-SUFFIX,openaimerge.com,💲 美国规则",
  "DOMAIN-SUFFIX,crixet.com,💲 美国规则",
  "DOMAIN-SUFFIX,featuregates.org,💲 美国规则",
  "DOMAIN-SUFFIX,statsig.com,💲 美国规则",
  "DOMAIN-SUFFIX,openaiassets.blob.core.windows.net,💲 美国规则",
  "DOMAIN-SUFFIX,openai.com.cdn.cloudflare.net,💲 美国规则",
  "DOMAIN-SUFFIX,openaicom.imgix.net,💲 美国规则",
  "DOMAIN-SUFFIX,openaiapi-site.azureedge.net,💲 美国规则",
  "DOMAIN-SUFFIX,production-openaicom-storage.azureedge.net,💲 美国规则",
  "DOMAIN-SUFFIX,openaicomproductionae4b.blob.core.windows.net,💲 美国规则",
  "DOMAIN-SUFFIX,openaicom-api-bdcpf8c6d2e9atf6.z01.azurefd.net,💲 美国规则",
  "DOMAIN-SUFFIX,webpubsub.azure.com,💲 美国规则",
  "DOMAIN-SUFFIX,client-api.arkoselabs.com,💲 美国规则",
  "DOMAIN-SUFFIX,openai-api.arkoselabs.com,💲 美国规则",
  "DOMAIN-SUFFIX,chatgpt.livekit.cloud,💲 美国规则",
  "DOMAIN-SUFFIX,host.livekit.cloud,💲 美国规则",
  "DOMAIN-SUFFIX,turn.livekit.cloud,💲 美国规则",
  "DOMAIN-SUFFIX,browser-intake-datadoghq.com,💲 美国规则",
  "DOMAIN-KEYWORD,openai,💲 美国规则",
  "DOMAIN-KEYWORD,chatgpt,💲 美国规则",
  "DOMAIN-SUFFIX,reddit.com,💲 美国规则",
  "DOMAIN-SUFFIX,redd.it,💲 美国规则",
  "DOMAIN-SUFFIX,redditstatic.com,💲 美国规则",
  "DOMAIN-SUFFIX,redditmedia.com,💲 美国规则",
  "DOMAIN-SUFFIX,redditspace.com,💲 美国规则",
  "DOMAIN,reddit.map.fastly.net,💲 美国规则",
  "DOMAIN,daily-cloudcode-pa.sandbox.googleapis.com,💲 美国规则",
  "DOMAIN,daily-cloudcode-pa.googleapis.com,💲 美国规则",
  "DOMAIN,cloudcode-pa.googleapis.com,💲 美国规则",
  "DOMAIN,cloudcode-pa.sandbox.googleapis.com,💲 美国规则",
  "DOMAIN,oauth2.googleapis.com,💲 美国规则",
  "DOMAIN,proactivebackend-pa.googleapis.com,💲 美国规则",
  "DOMAIN-SUFFIX,antigravity.google,💲 美国规则",
  "DOMAIN-SUFFIX,aistudio.google.com,💲 美国规则",
  "DOMAIN,alkalimakersuite-pa.clients6.google.com,💲 美国规则",
  "DOMAIN-SUFFIX,makersuite.google.com,💲 美国规则",
  "DOMAIN-SUFFIX,generativelanguage.googleapis.com,💲 美国规则",
  "DOMAIN-SUFFIX,generativeai.google,💲 美国规则",
  "DOMAIN-SUFFIX,ai.google.dev,💲 美国规则",
  "DOMAIN-SUFFIX,gemini.google.com,💲 美国规则",
  "DOMAIN-SUFFIX,x.com,💲 美国规则",
  "DOMAIN-SUFFIX,twitter.com,💲 美国规则",
  "DOMAIN-SUFFIX,t.co,💲 美国规则",
  "DOMAIN-SUFFIX,twttr.com,💲 美国规则",
  "DOMAIN-SUFFIX,twttr.net,💲 美国规则",
  "DOMAIN-SUFFIX,twitter.jp,💲 美国规则",
  "DOMAIN-SUFFIX,twimg.com,💲 美国规则",
  "DOMAIN-SUFFIX,twimg.edgesuite.net,💲 美国规则",
  "DOMAIN-SUFFIX,twtrcdn.com,💲 美国规则",
  "DOMAIN-SUFFIX,periscope.tv,💲 美国规则",
  "DOMAIN-SUFFIX,pscp.tv,💲 美国规则",
  "DOMAIN-SUFFIX,ads-twitter.com,💲 美国规则",
  "DOMAIN-SUFFIX,twitterflightschool.com,💲 美国规则",
  "DOMAIN-SUFFIX,twittercommunity.com,💲 美国规则",
  "DOMAIN-SUFFIX,x.ai,💲 美国规则",
  "DOMAIN-SUFFIX,grok.com,💲 美国规则",
  "DOMAIN-SUFFIX,ippure.com,💲 美国规则",
  "DOMAIN,js.stripe.com,💲 美国规则",
  "DOMAIN,workos.imgix.net,💲 美国规则",
  "DOMAIN,accounts.google.com,💲 美国规则",
  "DOMAIN,accounts.googleusercontent.com,💲 美国规则"
];
const AI_RULES = [...ANTHROPIC_RULES, ...US_RULES];

// 三、苹果/OneDrive直连只在此处管理，不再由前置外部集抢先决定。
const APPLE_DIRECT_RULES = [
  "DOMAIN,apple.comscoreresearch.com,🔗 个人直连",
  "DOMAIN-SUFFIX,aaplimg.com,🔗 个人直连",
  "DOMAIN-SUFFIX,akadns.net,🔗 个人直连",
  "DOMAIN-SUFFIX,apple-cloudkit.com,🔗 个人直连",
  "DOMAIN-SUFFIX,apple-mapkit.com,🔗 个人直连",
  "DOMAIN-SUFFIX,apple.co,🔗 个人直连",
  "DOMAIN-SUFFIX,apple.com,🔗 个人直连",
  "DOMAIN-SUFFIX,apple.com.cn,🔗 个人直连",
  "DOMAIN-SUFFIX,apple.news,🔗 个人直连",
  "DOMAIN-SUFFIX,appstore.com,🔗 个人直连",
  "DOMAIN-SUFFIX,cdn-apple.com,🔗 个人直连",
  "DOMAIN-SUFFIX,crashlytics.com,🔗 个人直连",
  "DOMAIN-SUFFIX,icloud-content.com,🔗 个人直连",
  "DOMAIN-SUFFIX,icloud.com,🔗 个人直连",
  "DOMAIN-SUFFIX,icloud.com.cn,🔗 个人直连",
  "DOMAIN-SUFFIX,itunes.com,🔗 个人直连",
  "DOMAIN-SUFFIX,me.com,🔗 个人直连",
  "DOMAIN-SUFFIX,mzstatic.com,🔗 个人直连",
  "DOMAIN-SUFFIX,apple-dns.net,🔗 个人直连",
  "IP-CIDR,17.0.0.0/8,🔗 个人直连,no-resolve",
  "IP-CIDR,63.92.224.0/19,🔗 个人直连,no-resolve",
  "IP-CIDR,65.199.22.0/23,🔗 个人直连,no-resolve",
  "IP-CIDR,139.178.128.0/18,🔗 个人直连,no-resolve",
  "IP-CIDR,144.178.0.0/19,🔗 个人直连,no-resolve",
  "IP-CIDR,144.178.36.0/22,🔗 个人直连,no-resolve",
  "IP-CIDR,144.178.48.0/20,🔗 个人直连,no-resolve",
  "IP-CIDR,192.35.50.0/24,🔗 个人直连,no-resolve",
  "IP-CIDR,198.183.17.0/24,🔗 个人直连,no-resolve",
  "IP-CIDR,205.180.175.0/24,🔗 个人直连,no-resolve"
];
const ONEDRIVE_DIRECT_RULES = [
  "PROCESS-NAME,OneDrive,🔗 个人直连",
  "PROCESS-NAME,OneDriveUpdater,🔗 个人直连",
  "DOMAIN-KEYWORD,1drv,🔗 个人直连",
  "DOMAIN-KEYWORD,onedrive,🔗 个人直连",
  "DOMAIN-KEYWORD,skydrive,🔗 个人直连",
  "DOMAIN-SUFFIX,livefilestore.com,🔗 个人直连",
  "DOMAIN-SUFFIX,oneclient.sfx.ms,🔗 个人直连",
  "DOMAIN-SUFFIX,onedrive.com,🔗 个人直连",
  "DOMAIN-SUFFIX,onedrive.live.com,🔗 个人直连",
  "DOMAIN-SUFFIX,photos.live.com,🔗 个人直连",
  "DOMAIN-SUFFIX,sharepoint.com,🔗 个人直连",
  "DOMAIN-SUFFIX,sharepointonline.com,🔗 个人直连",
  "DOMAIN-SUFFIX,skydrive.wns.windows.com,🔗 个人直连",
  "DOMAIN-SUFFIX,spoprod-a.akamaihd.net,🔗 个人直连",
  "DOMAIN-SUFFIX,storage.live.com,🔗 个人直连",
  "DOMAIN-SUFFIX,storage.msn.com,🔗 个人直连",
  "DOMAIN-SUFFIX,microsoftpersonalcontent.com,🔗 个人直连",
  "PROCESS-NAME,OneDrive.exe,🔗 个人直连",
  "PROCESS-NAME,OneDriveStandaloneUpdater.exe,🔗 个人直连"
];
// Windows更新、微软登录和Office保持原来的直连意图，不恢复整包微软云平台规则。
const MICROSOFT_DIRECT_RULES = [
  "DOMAIN-SUFFIX,microsoft.com,🔗 个人直连",
  "DOMAIN-SUFFIX,microsoftonline.com,🔗 个人直连",
  "DOMAIN-SUFFIX,microsoftonline-p.com,🔗 个人直连",
  "DOMAIN-SUFFIX,windowsupdate.com,🔗 个人直连",
  "DOMAIN-SUFFIX,windows.com,🔗 个人直连",
  "DOMAIN-SUFFIX,office.com,🔗 个人直连",
  "DOMAIN-SUFFIX,office.net,🔗 个人直连",
  "DOMAIN-SUFFIX,office365.com,🔗 个人直连",
  "DOMAIN-SUFFIX,live.com,🔗 个人直连",
  "DOMAIN-SUFFIX,outlook.com,🔗 个人直连",
  "DOMAIN-SUFFIX,msauth.net,🔗 个人直连",
  "DOMAIN-SUFFIX,msauthimages.net,🔗 个人直连",
  "DOMAIN-SUFFIX,msftauth.net,🔗 个人直连",
  "DOMAIN-SUFFIX,msftauthimages.net,🔗 个人直连",
  "DOMAIN-SUFFIX,msftidentity.com,🔗 个人直连",
  "DOMAIN-SUFFIX,msidentity.com,🔗 个人直连",
  "DOMAIN-SUFFIX,msftconnecttest.com,🔗 个人直连",
  "DOMAIN-SUFFIX,msftncsi.com,🔗 个人直连"
];

// 四、个人业务例外。保留既有意图，只合并明确重复。
const MY_CUSTOM_RULES = [
  // 微信、QQ和腾讯服务直连
  "DOMAIN-SUFFIX,weixin.com,🎯 全球直连",
  "DOMAIN-SUFFIX,wechat.com,🎯 全球直连",
  "DOMAIN-SUFFIX,wechatlegal.net,🎯 全球直连",
  "DOMAIN-SUFFIX,wechatos.net,🎯 全球直连",
  "DOMAIN-SUFFIX,wechatpay.com,🎯 全球直连",
  "DOMAIN-SUFFIX,tenpay.com,🎯 全球直连",
  "DOMAIN-SUFFIX,qpic.cn,🎯 全球直连",
  "DOMAIN-SUFFIX,servicewechat.com,🎯 全球直连",
  "DOMAIN-SUFFIX,qq.com,🎯 全球直连",
  "DOMAIN-SUFFIX,qlogo.cn,🎯 全球直连",
  "DOMAIN-SUFFIX,gtimg.cn,🎯 全球直连",
  "DOMAIN-SUFFIX,gtimg.com,🎯 全球直连",
  "DOMAIN-SUFFIX,tencent.com,🎯 全球直连",
  "DOMAIN-SUFFIX,tencent-cloud.net,🎯 全球直连",
  "DOMAIN-KEYWORD,weixin,🎯 全球直连",
  // WorkBuddy/CodeBuddy：国际版新加坡、国内版直连
  "DOMAIN-SUFFIX,workbuddy.ai,🇸🇬 WorkBuddy",
  "DOMAIN-SUFFIX,codebuddy.ai,🇸🇬 WorkBuddy",
  "DOMAIN-SUFFIX,turingfraud.net,🇸🇬 WorkBuddy",
  "DOMAIN-SUFFIX,workbuddy.cn,🎯 全球直连",
  "DOMAIN-SUFFIX,codebuddy.cn,🎯 全球直连",
  "DOMAIN-SUFFIX,tencent-cloud.cn,🎯 全球直连",
  // Cline固定香港
  "DOMAIN-SUFFIX,cline.bot,🇭🇰 香港规则",
  // 大文件走下载分流，HuggingFace网页和登录仍走个人代理
  "DOMAIN-SUFFIX,hf.co,📥 下载分流",
  "DOMAIN-SUFFIX,cdn-lfs.huggingface.co,📥 下载分流",
  "DOMAIN-SUFFIX,cdn-lfs-us-1.huggingface.co,📥 下载分流",
  "DOMAIN-SUFFIX,cdn-lfs-eu-1.huggingface.co,📥 下载分流",
  "DOMAIN-SUFFIX,prompthero.com,📥 下载分流",
  // 个人代理例外和Steam下载例外
  "DOMAIN,apps.cmacked.com,🌎 个人规则",
  "DOMAIN-SUFFIX,gvt1.com,🌎 个人规则",
  "DOMAIN-SUFFIX,gvt2.com,🌎 个人规则",
  "DOMAIN-SUFFIX,xa.steampowered.com,🔗 个人直连",
  "DOMAIN-SUFFIX,steampowered.com,🌎 个人规则",
  "DOMAIN-SUFFIX,steamcommunity.com,🌎 个人规则",
  "DOMAIN-SUFFIX,parallels.com,🌎 个人规则",
  // 云盘：登录与数据分别处理，115上传直连
  "DOMAIN,user.mypikpak.com,🌎 个人规则",
  "DOMAIN,access.mypikpak.com,🌎 个人规则",
  "DOMAIN,hub.dcdn.mypikpak.com,🌎 个人规则",
  "DOMAIN-SUFFIX,115.com,🎯 全球直连",
  "PROCESS-NAME,CloudDrive,☁️ 云盘服务",
  "PROCESS-PATH,/Applications/CloudDrive.app/Contents/MacOS/CloudDrive,☁️ 云盘服务",
  "DOMAIN-SUFFIX,pikpak.ai,☁️ 云盘服务",
  "DOMAIN-SUFFIX,mypikpak.com,☁️ 云盘服务",
  "DOMAIN-SUFFIX,mypikpak.net,☁️ 云盘服务",
  "DOMAIN-SUFFIX,pikpak.com,☁️ 云盘服务",
  "DOMAIN-SUFFIX,pikpak.me,☁️ 云盘服务",
  "DOMAIN-SUFFIX,pikpakcdn.com,☁️ 云盘服务",
  // 个人代理网站
  "DOMAIN-SUFFIX,setapp.com,🌎 个人规则",
  "DOMAIN-SUFFIX,brew.sh,🌎 个人规则",
  "DOMAIN-SUFFIX,cip.cc,🌎 个人规则",
  "DOMAIN-SUFFIX,eastmanreference.com,🌎 个人规则",
  "DOMAIN-SUFFIX,docs.rs,🌎 个人规则",
  "DOMAIN-SUFFIX,quicklookplugins.com,🌎 个人规则",
  "DOMAIN-SUFFIX,download.kde.org,🌎 个人规则",
  "DOMAIN-SUFFIX,downloadmaster.com,🌎 个人规则",
  "DOMAIN-SUFFIX,gamefaqs.gamespot.com,🌎 个人规则",
  "DOMAIN-SUFFIX,blog.spoongraphics.co.uk,🌎 个人规则",
  "DOMAIN-SUFFIX,affinity.help,🌎 个人规则",
  "DOMAIN-SUFFIX,kmalexander.com,🌎 个人规则",
  "DOMAIN-SUFFIX,huggingface.co,🌎 个人规则",
  "DOMAIN-SUFFIX,continue.dev,🌎 个人规则",
  "DOMAIN-SUFFIX,witchernetflix.com,🌎 个人规则",
  "DOMAIN-SUFFIX,loc.gov,🌎 个人规则",
  "DOMAIN-SUFFIX,imagesonline.bl.uk,🌎 个人规则",
  "DOMAIN-SUFFIX,digitalatlas.asdc.sinica.edu.tw,🌎 个人规则",
  "DOMAIN-SUFFIX,davidrumsey.com,🌎 个人规则",
  "DOMAIN-SUFFIX,z-library.sk,🌎 个人规则",
  "DOMAIN-SUFFIX,play.hbomax.com,🌎 个人规则",
  "DOMAIN-SUFFIX,linux.do,🌎 个人规则",
  "DOMAIN-SUFFIX,raindrop.io,🌎 个人规则",
  "DOMAIN-SUFFIX,nodeseek.com,🌎 个人规则",
  "DOMAIN-SUFFIX,nyaa.si,🌎 个人规则",
  "DOMAIN-SUFFIX,seedhub.cc,🌎 个人规则",
  "DOMAIN-SUFFIX,chaospace.xyz,🌎 个人规则",
  // 既有固定香港网站
  "DOMAIN-SUFFIX,e-hentai.org,🇭🇰 香港固定",
  "DOMAIN-SUFFIX,exhentai.org,🇭🇰 香港固定",
  "DOMAIN-SUFFIX,ehgt.org,🇭🇰 香港固定",
  "DOMAIN-SUFFIX,ehwiki.org,🇭🇰 香港固定",
  "DOMAIN-SUFFIX,hentaiverse.org,🇭🇰 香港固定",
  "DOMAIN-SUFFIX,hath.network,🇭🇰 香港固定",
  "DOMAIN-SUFFIX,ehtracker.org,🇭🇰 香港固定",
  "IP-CIDR,178.175.128.0/21,🇭🇰 香港固定,no-resolve",
  "DOMAIN-SUFFIX,hanime1.me,🇭🇰 香港固定",
  "DOMAIN-SUFFIX,hanimeone.me,🇭🇰 香港固定",
  "DOMAIN-SUFFIX,hembed.com,🇭🇰 香港固定",
  // Google通用服务，AI和登录在前面单列
  "DOMAIN-SUFFIX,google.com,🌎 个人规则",
  "DOMAIN-SUFFIX,google.com.hk,🌎 个人规则",
  "DOMAIN-SUFFIX,google.co.jp,🌎 个人规则",
  "DOMAIN-SUFFIX,gstatic.com,🌎 个人规则",
  "DOMAIN-SUFFIX,googleapis.com,🌎 个人规则",
  "DOMAIN-SUFFIX,googleusercontent.com,🌎 个人规则",
  "DOMAIN-SUFFIX,deepmind.com,🌎 个人规则",
  "DOMAIN-SUFFIX,deepmind.google,🌎 个人规则",
  // Telegram，保留裸IP访问规则
  "DOMAIN-SUFFIX,t.me,🌎 个人规则",
  "DOMAIN-SUFFIX,tdesktop.com,🌎 个人规则",
  "DOMAIN-SUFFIX,telegra.ph,🌎 个人规则",
  "DOMAIN-SUFFIX,telegram.me,🌎 个人规则",
  "DOMAIN-SUFFIX,telegram.org,🌎 个人规则",
  "DOMAIN-SUFFIX,telesco.pe,🌎 个人规则",
  "IP-CIDR,91.108.4.0/22,🌎 个人规则,no-resolve",
  "IP-CIDR,91.108.8.0/22,🌎 个人规则,no-resolve",
  "IP-CIDR,91.108.12.0/22,🌎 个人规则,no-resolve",
  "IP-CIDR,91.108.16.0/22,🌎 个人规则,no-resolve",
  "IP-CIDR,91.108.20.0/22,🌎 个人规则,no-resolve",
  "IP-CIDR,91.108.56.0/22,🌎 个人规则,no-resolve",
  "IP-CIDR,149.154.160.0/20,🌎 个人规则,no-resolve",
  "IP-CIDR,185.76.151.0/24,🌎 个人规则,no-resolve",
  // 常用网站与开发服务
  "DOMAIN-SUFFIX,dopus.com,🌎 个人规则",
  "DOMAIN-SUFFIX,gpsoft.com.au,🌎 个人规则",
  "DOMAIN-SUFFIX,runninghub.ai,🌎 个人规则",
  "DOMAIN-SUFFIX,github.com,🇭🇰 香港固定",
  "DOMAIN-SUFFIX,github.io,🇭🇰 香港固定",
  "DOMAIN-SUFFIX,githubusercontent.com,🇭🇰 香港固定",
  "DOMAIN-SUFFIX,githubassets.com,🇭🇰 香港固定",
  "DOMAIN-SUFFIX,ghcr.io,🇭🇰 香港固定",
  "DOMAIN-SUFFIX,githubstatus.com,🇭🇰 香港固定",
  "DOMAIN-SUFFIX,githubapp.com,🇭🇰 香港固定",
  "DOMAIN-SUFFIX,v2ex.com,🌎 个人规则",
  "DOMAIN,qiuqiutoken.com,🌎 个人规则",
  "DOMAIN,go.apimart.ai,🌎 个人规则",
  "DOMAIN-SUFFIX,shopee.tw,🌎 个人规则",
  "DOMAIN-SUFFIX,imgur.com,🌎 个人规则",
  "DOMAIN-SUFFIX,wikimedia.org,🌎 个人规则",
  "DOMAIN-SUFFIX,zh.wikipedia.org,🌎 个人规则",
  "DOMAIN-SUFFIX,zh.minecraft.wiki,🌎 个人规则",
  "DOMAIN-SUFFIX,fandom.com,🌎 个人规则",
  "DOMAIN-SUFFIX,pixiv.net,🌎 个人规则",
  // 起点听书直连
  "DOMAIN-SUFFIX,qidian.com,🎯 全球直连",
  "DOMAIN-SUFFIX,qidian.cn,🎯 全球直连",
  "DOMAIN-SUFFIX,qdcdn.com,🎯 全球直连",
  "DOMAIN-SUFFIX,qidianvod.com,🎯 全球直连",
  "DOMAIN-SUFFIX,yuewen.com,🎯 全球直连",
  "DOMAIN-SUFFIX,ywcache.com,🎯 全球直连",
  "DOMAIN-SUFFIX,qqgbook.com,🎯 全球直连",
  "DOMAIN-SUFFIX,lrts.me,🎯 全球直连",
  "DOMAIN-SUFFIX,lanrenaudio.com,🎯 全球直连",
  "DOMAIN-SUFFIX,lanrentingshu.com,🎯 全球直连",
  "DOMAIN-SUFFIX,tingbook.com,🎯 全球直连",
  "DOMAIN-SUFFIX,tingchina.com,🎯 全球直连",
  "DOMAIN-SUFFIX,tingtingfm.com,🎯 全球直连",
  "DOMAIN-SUFFIX,hongxiu.com,🎯 全球直连",
  "DOMAIN-SUFFIX,readnovel.com,🎯 全球直连",
  "DOMAIN-SUFFIX,xs8.cn,🎯 全球直连",
  "DOMAIN-SUFFIX,xxsy.net,🎯 全球直连",
  // 番茄听书、字节音频与语音合成直连
  "DOMAIN-SUFFIX,fanqienovel.com,🎯 全球直连",
  "DOMAIN-SUFFIX,fqnovel.com,🎯 全球直连",
  "DOMAIN-SUFFIX,fqnovelpic.com,🎯 全球直连",
  "DOMAIN-SUFFIX,fqnovelvod.com,🎯 全球直连",
  "DOMAIN-SUFFIX,changdumall.com,🎯 全球直连",
  "DOMAIN-SUFFIX,changduread.com,🎯 全球直连",
  "DOMAIN-SUFFIX,changdunovel.com,🎯 全球直连",
  "DOMAIN-SUFFIX,novelcontent.cn,🎯 全球直连",
  "DOMAIN-SUFFIX,novelcontent.net,🎯 全球直连",
  "DOMAIN-SUFFIX,fanqieopen.com,🎯 全球直连",
  "DOMAIN-SUFFIX,fanqiesp.com,🎯 全球直连",
  "DOMAIN-SUFFIX,volcengine.com,🎯 全球直连",
  "DOMAIN-SUFFIX,volces.com,🎯 全球直连",
  "DOMAIN-SUFFIX,volccdn.com,🎯 全球直连",
  "DOMAIN-SUFFIX,volcvod.com,🎯 全球直连",
  "DOMAIN-SUFFIX,byteeffectsvc.com,🎯 全球直连",
  "DOMAIN-SUFFIX,ibytedtos.com,🎯 全球直连",
  "DOMAIN-SUFFIX,bytetos.com,🎯 全球直连",
  "DOMAIN-SUFFIX,toscdn.com,🎯 全球直连",
  "DOMAIN-SUFFIX,bytedance.com,🎯 全球直连",
  "DOMAIN-SUFFIX,snssdk.com,🎯 全球直连",
  "DOMAIN-SUFFIX,zijieapi.com,🎯 全球直连",
  "DOMAIN-SUFFIX,zjcdn.com,🎯 全球直连",
  "DOMAIN-SUFFIX,pstatp.com,🎯 全球直连",
  "DOMAIN-SUFFIX,byteimg.com,🎯 全球直连",
  // 个人直连与Steam资源
  "DOMAIN-SUFFIX,notion.so,🔗 个人直连",
  "DOMAIN-SUFFIX,baidu.com,🔗 个人直连",
  "DOMAIN-SUFFIX,fastly.jsdelivr.net,🔗 个人直连",
  "DOMAIN-SUFFIX,pickpackapp.com,🔗 个人直连",
  "DOMAIN-KEYWORD,dl-a10b-,🔗 个人直连",
  "DOMAIN-SUFFIX,steamgames.com,🔗 个人直连",
  "DOMAIN-SUFFIX,steamusercontent.com,🔗 个人直连",
  "DOMAIN-SUFFIX,steamcontent.com,🔗 个人直连",
  "DOMAIN-SUFFIX,steamstatic.com,🔗 个人直连",
  "DOMAIN-SUFFIX,akamaihd.net,🔗 个人直连",
  "DOMAIN-SUFFIX,steam-chat.com,🔗 个人直连",
  "DOMAIN-SUFFIX,steamserver.net,🔗 个人直连",
  "DOMAIN-SUFFIX,steampipe.steamcontent.tnkjmec.com,🔗 个人直连",
  "DOMAIN-SUFFIX,st.dl.eccdnx.com,🔗 个人直连",
  "DOMAIN-SUFFIX,st.dl.bscstorage.net,🔗 个人直连",
  "DOMAIN-SUFFIX,st.dl.pinyuncloud.com,🔗 个人直连",
  "DOMAIN-SUFFIX,dl.steam.clngaa.com,🔗 个人直连",
  "DOMAIN-SUFFIX,cdn.mileweb.cs.steampowered.com.8686c.com,🔗 个人直连",
  "DOMAIN-SUFFIX,cdn-ws.content.steamchina.com,🔗 个人直连",
  "DOMAIN-SUFFIX,cdn-qc.content.steamchina.com,🔗 个人直连",
  "DOMAIN-SUFFIX,cdn-ali.content.steamchina.com,🔗 个人直连",
  "DOMAIN-SUFFIX,xz.pphimalayanrt.com,🔗 个人直连",
  "DOMAIN-SUFFIX,lv.queniujq.cn,🔗 个人直连",
  "DOMAIN-SUFFIX,edge.steam-dns.top.comcast.net,🔗 个人直连",
  "DOMAIN-SUFFIX,steampipe-partner.secure2.footprint.net,🔗 个人直连",
  "DOMAIN-SUFFIX,steam.eca.qtlglb.com,🔗 个人直连",
  "DOMAIN-SUFFIX,steam.naeu.qtlglb.com,🔗 个人直连",
  "DOMAIN-SUFFIX,steam.ru.qtlglb.com,🔗 个人直连",
  "DOMAIN-SUFFIX,steam.apac.qtlglb.com,🔗 个人直连",
  "DOMAIN-SUFFIX,steampipe-kr.akamaized.net,🔗 个人直连",
  "DOMAIN-SUFFIX,steampipe-partner.akamaized.net,🔗 个人直连",
  "DOMAIN-SUFFIX,steampipe.akamaized.net,🔗 个人直连",
  "DOMAIN-SUFFIX,f3b7q2p3.ssl.hwcdn.net,🔗 个人直连",
  "DOMAIN-SUFFIX,a4e8s8k3.map2.ssl.hwcdn.net,🔗 个人直连",
  "DOMAIN-SUFFIX,steam.cdn.on.net,🔗 个人直连",
  "DOMAIN-SUFFIX,steam.cdn.orcon.net.nz,🔗 个人直连",
  "DOMAIN-SUFFIX,steam.cdn.slingshot.co.nz,🔗 个人直连",
  "DOMAIN-SUFFIX,steam.cdn.webra.ru,🔗 个人直连",
  "DOMAIN-SUFFIX,gofile.io,🔗 个人直连",
  "DOMAIN-SUFFIX,aqwx.bosafe.com,🔗 个人直连",
  "DOMAIN-SUFFIX,sso.openxlab.org.cn,🔗 个人直连",
  "DOMAIN-SUFFIX,topazlabs.com,🔗 个人直连",
  "DOMAIN-SUFFIX,registry.npmjs.org,🔗 个人直连",
  "DOMAIN-SUFFIX,my.microsoftpersonalcontent.com,🔗 个人直连",
  "DOMAIN-SUFFIX,ikhub.net,🔗 个人直连",
  // 你已指定直连的中转站
  "DOMAIN,api.qiuqiutoken.net,🔗 个人直连",
  "DOMAIN,api2.qiuqiutoken.net,🔗 个人直连",
  "DOMAIN,api.qiuqiutoken.jiawuyu.com,🔗 个人直连",
  "DOMAIN,api2.qiuqiutoken.jiawuyu.com,🔗 个人直连",
  "DOMAIN,api.kozeai.com,🔗 个人直连",
  "DOMAIN-SUFFIX,91topgo.com,🔗 个人直连",
  // 坚果云客户端直连
  "PROCESS-NAME,NutstoreClient.exe,🔗 个人直连",
  "PROCESS-NAME,Nutstore.exe,🔗 个人直连",
  "PROCESS-NAME,Nutstore,🔗 个人直连",
];

// 坚果云脚本下载与国内代码托管直接访问，更新不依赖代理先连通。
const UPDATE_DIRECT_RULES = [
  "DOMAIN,dav.jianguoyun.com,🔗 个人直连",
  "DOMAIN-SUFFIX,gitee.com,🔗 个人直连",
  "DOMAIN-SUFFIX,giteeusercontent.com,🔗 个人直连"
];
// 安卓FCM推送独立保留（域名和IP两部分），不被google.com通用规则抢先接走。
const PUSH_RULES = [
  "RULE-SET,GoogleFCMDomain,📢 谷歌FCM",
  "RULE-SET,GoogleFCMIP,📢 谷歌FCM,no-resolve"
];
const BASE_RULES = [
  "RULE-SET,PrivateDomain,🎯 全球直连",
  "RULE-SET,PrivateIP,🎯 全球直连,no-resolve",
  "RULE-SET,ChinaDomain,🎯 全球直连",
  "RULE-SET,ChinaIP,🎯 全球直连,no-resolve",
  "MATCH,🚀 节点选择"
];

// 五、外部规则仅保留国内/内网和FCM；需要更新时走普通代理，不绑AI或固定香港组。
const RULE_PROVIDERS = {
  "PrivateDomain": {
    "type": "http",
    "behavior": "domain",
    "format": "mrs",
    "url": "https://raw.githubusercontent.com/MetaCubeX/meta-rules-dat/meta/geo/geosite/private.mrs",
    "path": "./ruleset/basic-rule-v2/PrivateDomain.mrs",
    "interval": 86400,
    "proxy": "🚀 节点选择"
  },
  "PrivateIP": {
    "type": "http",
    "behavior": "ipcidr",
    "format": "mrs",
    "url": "https://raw.githubusercontent.com/MetaCubeX/meta-rules-dat/meta/geo/geoip/private.mrs",
    "path": "./ruleset/basic-rule-v2/PrivateIP.mrs",
    "interval": 86400,
    "proxy": "🚀 节点选择"
  },
  "ChinaDomain": {
    "type": "http",
    "behavior": "domain",
    "format": "mrs",
    "url": "https://raw.githubusercontent.com/MetaCubeX/meta-rules-dat/meta/geo/geosite/cn.mrs",
    "path": "./ruleset/basic-rule-v2/ChinaDomain.mrs",
    "interval": 86400,
    "proxy": "🚀 节点选择"
  },
  "ChinaIP": {
    "type": "http",
    "behavior": "ipcidr",
    "format": "mrs",
    "url": "https://raw.githubusercontent.com/MetaCubeX/meta-rules-dat/meta/geo/geoip/cn.mrs",
    "path": "./ruleset/basic-rule-v2/ChinaIP.mrs",
    "interval": 86400,
    "proxy": "🚀 节点选择"
  },
  "GoogleFCMDomain": {
    "type": "http",
    "behavior": "domain",
    "format": "mrs",
    "url": "https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/mrs/GoogleFCM_domain.mrs",
    "path": "./ruleset/basic-rule-v2/GoogleFCMDomain.mrs",
    "interval": 86400,
    "proxy": "🚀 节点选择"
  },
  "GoogleFCMIP": {
    "type": "http",
    "behavior": "ipcidr",
    "format": "mrs",
    "url": "https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/mrs/GoogleFCM_ip.mrs",
    "path": "./ruleset/basic-rule-v2/GoogleFCMIP.mrs",
    "interval": 86400,
    "proxy": "🚀 节点选择"
  }
};

// 六、DNS保留原来工作的参数，仅去重。不在这里开启系统IPv6或修改系统网络。
const DNS_SETTINGS = {
  "enable": true,
  "listen": "127.0.0.1:1053",
  "ipv6": false,
  "use-hosts": true,
  "use-system-hosts": true,
  "enhanced-mode": "fake-ip",
  "fake-ip-filter-mode": "blacklist",
  "respect-rules": false,
  "fake-ip-range": "198.18.0.1/16",
  "fake-ip-filter": [
    "*.lan",
    "*.local",
    "*.internal",
    "+.qq.com",
    "multimedia.nt.qq.com.cn",
    "+.qlogo.cn",
    "+.gtimg.cn",
    "+.gtimg.com",
    "+.weixin.com",
    "+.wechat.com",
    "+.qpic.cn",
    "+.servicewechat.com",
    "+.tenpay.com",
    "+.wechatpay.com",
    "+.myqcloud.com",
    "*.msftconnecttest.com",
    "*.msftncsi.com",
    "msftconnecttest.com",
    "msftncsi.com",
    "*.stun.*.*",
    "*.stun.*.*.*",
    "time.*.com",
    "ntp.*.com"
  ],
  "default-nameserver": [
    "223.5.5.5",
    "119.29.29.29"
  ],
  "nameserver": [
    "https://doh.pub/dns-query",
    "https://dns.alidns.com/dns-query"
  ],
  "fallback": [
    "tls://8.8.4.4",
    "tls://1.1.1.1",
    "https://1.1.1.1/dns-query"
  ],
  "fallback-filter": {
    "geoip": true,
    "geoip-code": "CN",
    "ipcidr": [
      "240.0.0.0/4"
    ],
    "domain": [
      "+.google.com",
      "+.facebook.com",
      "+.youtube.com"
    ]
  },
  "nameserver-policy": {
    "geosite:cn,private": [
      "https://doh.pub/dns-query",
      "223.5.5.5"
    ],
    "+.qq.com": [
      "https://doh.pub/dns-query",
      "119.29.29.29"
    ],
    "+.weixin.com": [
      "https://doh.pub/dns-query",
      "119.29.29.29"
    ],
    "+.wechat.com": [
      "https://doh.pub/dns-query",
      "119.29.29.29"
    ],
    "+.qpic.cn": [
      "https://doh.pub/dns-query",
      "119.29.29.29"
    ],
    "+.servicewechat.com": [
      "https://doh.pub/dns-query",
      "119.29.29.29"
    ],
    "+.tenpay.com": [
      "https://doh.pub/dns-query",
      "119.29.29.29"
    ],
    "+.wechatpay.com": [
      "https://doh.pub/dns-query",
      "119.29.29.29"
    ]
  }
};

// 七、节点与分组。每次main都创建全新数组，多次调用不叠加旧节点。
const US_PATTERN = /美国|美國|🇺🇸|🇺🇲|波特兰|达拉斯|俄勒冈|凤凰城|费利蒙|硅谷|拉斯维加斯|洛杉矶|圣何塞|圣克拉拉|西雅图|芝加哥|纽约|紐約|洛杉磯|矽谷|United States|(?:^|[^a-z])USA?(?:[^a-z]|$)|Los Angeles|San Jose|Santa Clara|Seattle|Chicago|New York|Dallas|Portland|Oregon|Phoenix|Fremont|Silicon Valley|Las Vegas/i;
const REGION_PATTERNS = {
  "🇭🇰 香港节点": /香港|🇭🇰|(?:^|[^a-z])HK(?:[^a-z]|$)|Hong Kong/i,
  "🇯🇵 日本节点": /日本|东京|大阪|埼玉|🇯🇵|(?:^|[^a-z])JP(?:[^a-z]|$)|Japan/i,
  "🇺🇲 美国节点": US_PATTERN,
  "🇨🇳 台湾节点": /台湾|台灣|新北|彰化|🇹🇼|(?:^|[^a-z])TW(?:[^a-z]|$)|Taiwan/i,
  "🇸🇬 狮城节点": /新加坡|狮城|獅城|🇸🇬|(?:^|[^a-z])SG(?:[^a-z]|$)|Singapore/i,
  "🇰🇷 韩国节点": /韩国|韓國|首尔|首爾|🇰🇷|(?:^|[^a-z])KR(?:[^a-z]|$)|Korea/i
};
function clone(value) { return JSON.parse(JSON.stringify(value)); }
function unique(values) { return [...new Set(values)]; }
function nonempty(values) { return values.length ? unique(values) : ["REJECT"]; }
function rateOf(name) {
  const m = name.match(/倍率\s*[:：]?\s*(\d+(?:\.\d+)?)/) || name.match(/(?:^|[^a-z])[x×]\s*(\d+(?:\.\d+)?)/i) || name.match(/(\d+(?:\.\d+)?)\s*[x×倍]/i);
  return m ? parseFloat(m[1]) : NaN;
}
function fixedCandidates(names, pattern) {
  return names.filter(name => pattern.test(name))
    .filter(name => !/下载|下载專用|免费|免費/.test(name) && !(rateOf(name) <= 0.1));
}
function ieplFirst(values) {
  return [...values].sort((a,b) => (/IEPL/i.test(b)?1:0) - (/IEPL/i.test(a)?1:0));
}
function selected(name, proxies) { return {name, type:"select", proxies:nonempty(proxies)}; }
function auto(name, proxies) {
  return {name, type:"url-test", url:"http://www.gstatic.com/generate_204", interval:300, tolerance:50, proxies:nonempty(proxies)};
}

function main(config) {
  config = config || {};
  config.mode = "rule";
  config["log-level"] = "info";
  // 不抢FlClash自己的端口、IPv6、TUN开关设置。
  config.dns = clone(DNS_SETTINGS);
  config.dns["nameserver-policy"]["+.ts.net"] = ["100.100.100.100"];

  const sourceProxies = (config.proxies || []).filter(p => p && p.name && p.name !== TS_PROXY_NAME);
  const nodes = sourceProxies.filter(p => !["direct","reject","reject-drop","compatible"].includes(String(p.type || "").toLowerCase()))
    .filter(p => !/剩余|到期|有效期|官网|重置|套餐|流量[:：]/.test(p.name));
  const names = unique(nodes.map(p => p.name));
  const us = fixedCandidates(names, US_PATTERN);
  const hk = ieplFirst(fixedCandidates(names, REGION_PATTERNS["🇭🇰 香港节点"]));
  const hkCline = [...hk].sort((a,b) => (/香港S09\s*\|\s*IEPL/i.test(b)?1:0) - (/香港S09\s*\|\s*IEPL/i.test(a)?1:0));
  const sg = ieplFirst(fixedCandidates(names, REGION_PATTERNS["🇸🇬 狮城节点"]));
  const downloads = names.filter(name => /下载/.test(name) || rateOf(name) <= 0.1)
    .filter(name => !/免费|免費|到期|剩余|有效期|官网|流量[:：]/.test(name));
  downloads.sort((a,b) => (isNaN(rateOf(a))?1:rateOf(a)) - (isNaN(rateOf(b))?1:rateOf(b)));

  const groups = [selected("🚀 手动切换",names), auto("♻️ 自动选择",names)];
  Object.keys(REGION_PATTERNS).forEach(name => {
    const members = names.filter(value => REGION_PATTERNS[name].test(value));
    // 美国组固定选择，不参加自动测速；其他普通地区组保留原来的测速用途。
    groups.push(name === "🇺🇲 美国节点" ? selected(name,us.length?["REJECT",...us]:[]) : auto(name,members));
  });
  groups.push(
    selected("🟣 Anthropic",us),
    selected("💲 美国规则",us.length?["REJECT",...us,"🟣 Anthropic"]:[]),
    selected("🇭🇰 香港固定",hk),
    selected("🇭🇰 香港规则",hkCline),
    selected("🇸🇬 WorkBuddy",sg),
    selected("📥 下载分流",[...downloads,"🌎 个人规则","🚀 手动切换"]),
    selected("🌎 个人规则",["🚀 手动切换","♻️ 自动选择","🇺🇲 美国节点","🇭🇰 香港节点","🇯🇵 日本节点","🇨🇳 台湾节点","🇸🇬 狮城节点","🇰🇷 韩国节点"]),
    selected("🚀 节点选择",["♻️ 自动选择","🇭🇰 香港节点","🇨🇳 台湾节点","🇸🇬 狮城节点","🇯🇵 日本节点","🇺🇲 美国节点","🇰🇷 韩国节点","🚀 手动切换"]),
    selected("🔗 个人直连",["DIRECT"]),
    selected("🎯 全球直连",["DIRECT"]),
    selected("☁️ 云盘服务",["DIRECT","♻️ 自动选择","🚀 手动切换","🇭🇰 香港节点","🇯🇵 日本节点","🇸🇬 狮城节点"]),
    selected("📢 谷歌FCM",["DIRECT","🚀 节点选择","🇺🇲 美国节点"]),
    selected("🛰️ Tailnet",[TS_PROXY_NAME,"DIRECT"])
  );
  config["proxy-groups"] = groups;
  const ts = {name:TS_PROXY_NAME, type:"tailscale", udp:true};
  if (TS_AUTH_KEY) ts["auth-key"] = TS_AUTH_KEY;
  config.proxies = sourceProxies.concat([ts]);
  config["rule-providers"] = clone(RULE_PROVIDERS);

  // 节点不足时第二端口拒绝连接，不假装两个账号有独立出口。
  config.listeners = [
    {name:"wb-slot-1", type:"mixed", port:17901, listen:"127.0.0.1", proxy:sg[0] || "REJECT"},
    {name:"wb-slot-2", type:"mixed", port:17902, listen:"127.0.0.1", proxy:sg[1] || "REJECT"}
  ];
  config.rules = [...TAILSCALE_RULES, ...LOCAL_RULES, ...AI_RULES, ...PUSH_RULES, ...APPLE_DIRECT_RULES, ...ONEDRIVE_DIRECT_RULES, ...MICROSOFT_DIRECT_RULES, ...UPDATE_DIRECT_RULES, ...MY_CUSTOM_RULES, ...BASE_RULES];
  if (config.tun) config.tun = Object.assign({},config.tun,TUN_TAILSCALE_SETTINGS);
  return config;
}
