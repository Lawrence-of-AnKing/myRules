// FlClash 共用覆写：按用途选出口；不去广告；国内/明确例外直连，其余默认代理。
// 用法：把本文件内容作为订阅的“脚本覆写”。普通文件不是机场订阅，也不能作为YAML导入。
// 文件不含机场节点和授权密码；节点仍由你自己的机场订阅提供。
//
// 日常使用：
// 1. “🌎 个人规则”管理自己收录的网站；默认跟随“🚀 手动切换”，限流时在后者换节点。
// 2. “🌐 默认代理”管理其余海外流量和国际版OneDrive/SharePoint；不提供DIRECT兜底。
// 3. 不再生成美国/香港/日本等地区节点组；国家只用于后台筛选固定用途的候选节点。
// 4. AI固定组保留原名称和候选节点名，便于沿用各设备已保存的选择，不替你换出口：
//    “🟣 Anthropic”=Claude；“💲 美国规则”=OpenAI/Gemini等既有美国业务及共享登录；
//    “🇭🇰 香港规则”=Cline；“🇸🇬 WorkBuddy”=WorkBuddy；“🇭🇰 香港固定”=GitHub等既有固定线路。
//    固定组只列对应地区的实际节点（保留原有明确选用Anthropic的选项），不挂手动/自动组。
//    尚未保存选择，或已选节点从订阅消失时，默认REJECT；请确认原来使用的节点后再选。
// 5. “☁️ 云盘服务”仍是PikPak/CloudDrive，不是OneDrive；115保留直连。
// 6. “🛰️ Tailnet”：安卓选tailnet；装有官方Tailscale的电脑选DIRECT，各端选一次即可。
//
// 个人直连/全球直连不再占选择组，已确认的直连规则直接指向DIRECT；基础MRS仍自动更新。
// 保留现有DNS、TUN、听书、坚果云和下载例外，不修改设备的端口、IPv6或TUN开关。
// 本脚本不是系统级断路保护：FlClash构建失败或退出后的防直连，仍须由独立防火墙/路由器保证。

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
  "DOMAIN-SUFFIX,tailscale.com,DIRECT",
  "DOMAIN-SUFFIX,tailscale.io,DIRECT",
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

// 三、系统服务与OneDrive。用途例外先于宽泛的微软/Apple/CDN规则。
const APPLE_DIRECT_RULES = [
  "DOMAIN,apple.comscoreresearch.com,DIRECT",
  "DOMAIN-SUFFIX,aaplimg.com,DIRECT",
  "DOMAIN-SUFFIX,akadns.net,DIRECT",
  "DOMAIN-SUFFIX,apple-cloudkit.com,DIRECT",
  "DOMAIN-SUFFIX,apple-mapkit.com,DIRECT",
  "DOMAIN-SUFFIX,apple.co,DIRECT",
  "DOMAIN-SUFFIX,apple.com,DIRECT",
  "DOMAIN-SUFFIX,apple.com.cn,DIRECT",
  "DOMAIN-SUFFIX,apple.news,DIRECT",
  "DOMAIN-SUFFIX,appstore.com,DIRECT",
  "DOMAIN-SUFFIX,cdn-apple.com,DIRECT",
  "DOMAIN-SUFFIX,crashlytics.com,DIRECT",
  "DOMAIN-SUFFIX,icloud-content.com,DIRECT",
  "DOMAIN-SUFFIX,icloud.com,DIRECT",
  "DOMAIN-SUFFIX,icloud.com.cn,DIRECT",
  "DOMAIN-SUFFIX,itunes.com,DIRECT",
  "DOMAIN-SUFFIX,me.com,DIRECT",
  "DOMAIN-SUFFIX,mzstatic.com,DIRECT",
  "DOMAIN-SUFFIX,apple-dns.net,DIRECT",
  "IP-CIDR,17.0.0.0/8,DIRECT,no-resolve",
  "IP-CIDR,63.92.224.0/19,DIRECT,no-resolve",
  "IP-CIDR,65.199.22.0/23,DIRECT,no-resolve",
  "IP-CIDR,139.178.128.0/18,DIRECT,no-resolve",
  "IP-CIDR,144.178.0.0/19,DIRECT,no-resolve",
  "IP-CIDR,144.178.36.0/22,DIRECT,no-resolve",
  "IP-CIDR,144.178.48.0/20,DIRECT,no-resolve",
  "IP-CIDR,192.35.50.0/24,DIRECT,no-resolve",
  "IP-CIDR,198.183.17.0/24,DIRECT,no-resolve",
  "IP-CIDR,205.180.175.0/24,DIRECT,no-resolve"
];
// 国际个人版/全球企业版不再强制直连；世纪互联的中国域名先匹配，避免被进程规则吞掉。
// 不用无边界的DOMAIN-KEYWORD,onedrive/1drv，防止误收无关网站。
const ONEDRIVE_RULES = [
  "DOMAIN-SUFFIX,sharepoint.cn,DIRECT",
  "DOMAIN-SUFFIX,sharepointonline.cn,DIRECT",
  "PROCESS-NAME,OneDrive,🌐 默认代理",
  "PROCESS-NAME,OneDriveUpdater,🌐 默认代理",
  "PROCESS-NAME,OneDrive.exe,🌐 默认代理",
  "PROCESS-NAME,OneDriveStandaloneUpdater.exe,🌐 默认代理",
  "DOMAIN-SUFFIX,1drv.com,🌐 默认代理",
  "DOMAIN-SUFFIX,1drv.ms,🌐 默认代理",
  "DOMAIN-SUFFIX,onedrive.com,🌐 默认代理",
  "DOMAIN-SUFFIX,onedrive.live.com,🌐 默认代理",
  "DOMAIN-SUFFIX,skydrive.live.com,🌐 默认代理",
  "DOMAIN-SUFFIX,livefilestore.com,🌐 默认代理",
  "DOMAIN-SUFFIX,oneclient.sfx.ms,🌐 默认代理",
  "DOMAIN-SUFFIX,photos.live.com,🌐 默认代理",
  "DOMAIN-SUFFIX,sharepoint.com,🌐 默认代理",
  "DOMAIN-SUFFIX,sharepointonline.com,🌐 默认代理",
  "DOMAIN-SUFFIX,skydrive.wns.windows.com,🌐 默认代理",
  "DOMAIN-SUFFIX,spoprod-a.akamaihd.net,🌐 默认代理",
  "DOMAIN-SUFFIX,storage.live.com,🌐 默认代理",
  "DOMAIN-SUFFIX,storage.msn.com,🌐 默认代理",
  "DOMAIN-SUFFIX,microsoftpersonalcontent.com,🌐 默认代理"
];
// Windows更新、微软登录和Office保持原来的直连意图，不恢复整包微软云平台规则。
const MICROSOFT_DIRECT_RULES = [
  "DOMAIN-SUFFIX,microsoft.com,DIRECT",
  "DOMAIN-SUFFIX,microsoftonline.com,DIRECT",
  "DOMAIN-SUFFIX,microsoftonline-p.com,DIRECT",
  "DOMAIN-SUFFIX,windowsupdate.com,DIRECT",
  "DOMAIN-SUFFIX,windows.com,DIRECT",
  "DOMAIN-SUFFIX,office.com,DIRECT",
  "DOMAIN-SUFFIX,office.net,DIRECT",
  "DOMAIN-SUFFIX,office365.com,DIRECT",
  "DOMAIN-SUFFIX,live.com,DIRECT",
  "DOMAIN-SUFFIX,outlook.com,DIRECT",
  "DOMAIN-SUFFIX,msauth.net,DIRECT",
  "DOMAIN-SUFFIX,msauthimages.net,DIRECT",
  "DOMAIN-SUFFIX,msftauth.net,DIRECT",
  "DOMAIN-SUFFIX,msftauthimages.net,DIRECT",
  "DOMAIN-SUFFIX,msftidentity.com,DIRECT",
  "DOMAIN-SUFFIX,msidentity.com,DIRECT",
  "DOMAIN-SUFFIX,msftconnecttest.com,DIRECT",
  "DOMAIN-SUFFIX,msftncsi.com,DIRECT"
];

// 四、个人业务例外。保留既有意图，只合并明确重复。
const MY_CUSTOM_RULES = [
  // 微信、QQ和腾讯服务直连
  "DOMAIN-SUFFIX,weixin.com,DIRECT",
  "DOMAIN-SUFFIX,wechat.com,DIRECT",
  "DOMAIN-SUFFIX,wechatlegal.net,DIRECT",
  "DOMAIN-SUFFIX,wechatos.net,DIRECT",
  "DOMAIN-SUFFIX,wechatpay.com,DIRECT",
  "DOMAIN-SUFFIX,tenpay.com,DIRECT",
  "DOMAIN-SUFFIX,qpic.cn,DIRECT",
  "DOMAIN-SUFFIX,servicewechat.com,DIRECT",
  "DOMAIN-SUFFIX,qq.com,DIRECT",
  "DOMAIN-SUFFIX,qlogo.cn,DIRECT",
  "DOMAIN-SUFFIX,gtimg.cn,DIRECT",
  "DOMAIN-SUFFIX,gtimg.com,DIRECT",
  "DOMAIN-SUFFIX,tencent.com,DIRECT",
  "DOMAIN-SUFFIX,tencent-cloud.net,DIRECT",
  "DOMAIN-KEYWORD,weixin,DIRECT",
  // WorkBuddy/CodeBuddy：国际版新加坡、国内版直连
  "DOMAIN-SUFFIX,workbuddy.ai,🇸🇬 WorkBuddy",
  "DOMAIN-SUFFIX,codebuddy.ai,🇸🇬 WorkBuddy",
  "DOMAIN-SUFFIX,turingfraud.net,🇸🇬 WorkBuddy",
  "DOMAIN-SUFFIX,workbuddy.cn,DIRECT",
  "DOMAIN-SUFFIX,codebuddy.cn,DIRECT",
  "DOMAIN-SUFFIX,tencent-cloud.cn,DIRECT",
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
  "DOMAIN-SUFFIX,xa.steampowered.com,DIRECT",
  "DOMAIN-SUFFIX,steampowered.com,🌎 个人规则",
  "DOMAIN-SUFFIX,steamcommunity.com,🌎 个人规则",
  "DOMAIN-SUFFIX,parallels.com,🌎 个人规则",
  // 云盘：登录与数据分别处理，115上传直连
  "DOMAIN,user.mypikpak.com,🌎 个人规则",
  "DOMAIN,access.mypikpak.com,🌎 个人规则",
  "DOMAIN,hub.dcdn.mypikpak.com,🌎 个人规则",
  "DOMAIN-SUFFIX,115.com,DIRECT",
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
  "DOMAIN-SUFFIX,qidian.com,DIRECT",
  "DOMAIN-SUFFIX,qidian.cn,DIRECT",
  "DOMAIN-SUFFIX,qdcdn.com,DIRECT",
  "DOMAIN-SUFFIX,qidianvod.com,DIRECT",
  "DOMAIN-SUFFIX,yuewen.com,DIRECT",
  "DOMAIN-SUFFIX,ywcache.com,DIRECT",
  "DOMAIN-SUFFIX,qqgbook.com,DIRECT",
  "DOMAIN-SUFFIX,lrts.me,DIRECT",
  "DOMAIN-SUFFIX,lanrenaudio.com,DIRECT",
  "DOMAIN-SUFFIX,lanrentingshu.com,DIRECT",
  "DOMAIN-SUFFIX,tingbook.com,DIRECT",
  "DOMAIN-SUFFIX,tingchina.com,DIRECT",
  "DOMAIN-SUFFIX,tingtingfm.com,DIRECT",
  "DOMAIN-SUFFIX,hongxiu.com,DIRECT",
  "DOMAIN-SUFFIX,readnovel.com,DIRECT",
  "DOMAIN-SUFFIX,xs8.cn,DIRECT",
  "DOMAIN-SUFFIX,xxsy.net,DIRECT",
  // 番茄听书、字节音频与语音合成直连
  "DOMAIN-SUFFIX,fanqienovel.com,DIRECT",
  "DOMAIN-SUFFIX,fqnovel.com,DIRECT",
  "DOMAIN-SUFFIX,fqnovelpic.com,DIRECT",
  "DOMAIN-SUFFIX,fqnovelvod.com,DIRECT",
  "DOMAIN-SUFFIX,changdumall.com,DIRECT",
  "DOMAIN-SUFFIX,changduread.com,DIRECT",
  "DOMAIN-SUFFIX,changdunovel.com,DIRECT",
  "DOMAIN-SUFFIX,novelcontent.cn,DIRECT",
  "DOMAIN-SUFFIX,novelcontent.net,DIRECT",
  "DOMAIN-SUFFIX,fanqieopen.com,DIRECT",
  "DOMAIN-SUFFIX,fanqiesp.com,DIRECT",
  "DOMAIN-SUFFIX,volcengine.com,DIRECT",
  "DOMAIN-SUFFIX,volces.com,DIRECT",
  "DOMAIN-SUFFIX,volccdn.com,DIRECT",
  "DOMAIN-SUFFIX,volcvod.com,DIRECT",
  "DOMAIN-SUFFIX,byteeffectsvc.com,DIRECT",
  "DOMAIN-SUFFIX,ibytedtos.com,DIRECT",
  "DOMAIN-SUFFIX,bytetos.com,DIRECT",
  "DOMAIN-SUFFIX,toscdn.com,DIRECT",
  "DOMAIN-SUFFIX,bytedance.com,DIRECT",
  "DOMAIN-SUFFIX,snssdk.com,DIRECT",
  "DOMAIN-SUFFIX,zijieapi.com,DIRECT",
  "DOMAIN-SUFFIX,zjcdn.com,DIRECT",
  "DOMAIN-SUFFIX,pstatp.com,DIRECT",
  "DOMAIN-SUFFIX,byteimg.com,DIRECT",
  // 个人直连与Steam资源
  "DOMAIN-SUFFIX,notion.so,DIRECT",
  "DOMAIN-SUFFIX,baidu.com,DIRECT",
  "DOMAIN-SUFFIX,fastly.jsdelivr.net,DIRECT",
  "DOMAIN-SUFFIX,pickpackapp.com,DIRECT",
  "DOMAIN-KEYWORD,dl-a10b-,DIRECT",
  "DOMAIN-SUFFIX,steamgames.com,DIRECT",
  "DOMAIN-SUFFIX,steamusercontent.com,DIRECT",
  "DOMAIN-SUFFIX,steamcontent.com,DIRECT",
  "DOMAIN-SUFFIX,steamstatic.com,DIRECT",
  "DOMAIN-SUFFIX,akamaihd.net,DIRECT",
  "DOMAIN-SUFFIX,steam-chat.com,DIRECT",
  "DOMAIN-SUFFIX,steamserver.net,DIRECT",
  "DOMAIN-SUFFIX,steampipe.steamcontent.tnkjmec.com,DIRECT",
  "DOMAIN-SUFFIX,st.dl.eccdnx.com,DIRECT",
  "DOMAIN-SUFFIX,st.dl.bscstorage.net,DIRECT",
  "DOMAIN-SUFFIX,st.dl.pinyuncloud.com,DIRECT",
  "DOMAIN-SUFFIX,dl.steam.clngaa.com,DIRECT",
  "DOMAIN-SUFFIX,cdn.mileweb.cs.steampowered.com.8686c.com,DIRECT",
  "DOMAIN-SUFFIX,cdn-ws.content.steamchina.com,DIRECT",
  "DOMAIN-SUFFIX,cdn-qc.content.steamchina.com,DIRECT",
  "DOMAIN-SUFFIX,cdn-ali.content.steamchina.com,DIRECT",
  "DOMAIN-SUFFIX,xz.pphimalayanrt.com,DIRECT",
  "DOMAIN-SUFFIX,lv.queniujq.cn,DIRECT",
  "DOMAIN-SUFFIX,edge.steam-dns.top.comcast.net,DIRECT",
  "DOMAIN-SUFFIX,steampipe-partner.secure2.footprint.net,DIRECT",
  "DOMAIN-SUFFIX,steam.eca.qtlglb.com,DIRECT",
  "DOMAIN-SUFFIX,steam.naeu.qtlglb.com,DIRECT",
  "DOMAIN-SUFFIX,steam.ru.qtlglb.com,DIRECT",
  "DOMAIN-SUFFIX,steam.apac.qtlglb.com,DIRECT",
  "DOMAIN-SUFFIX,steampipe-kr.akamaized.net,DIRECT",
  "DOMAIN-SUFFIX,steampipe-partner.akamaized.net,DIRECT",
  "DOMAIN-SUFFIX,steampipe.akamaized.net,DIRECT",
  "DOMAIN-SUFFIX,f3b7q2p3.ssl.hwcdn.net,DIRECT",
  "DOMAIN-SUFFIX,a4e8s8k3.map2.ssl.hwcdn.net,DIRECT",
  "DOMAIN-SUFFIX,steam.cdn.on.net,DIRECT",
  "DOMAIN-SUFFIX,steam.cdn.orcon.net.nz,DIRECT",
  "DOMAIN-SUFFIX,steam.cdn.slingshot.co.nz,DIRECT",
  "DOMAIN-SUFFIX,steam.cdn.webra.ru,DIRECT",
  "DOMAIN-SUFFIX,gofile.io,DIRECT",
  "DOMAIN-SUFFIX,aqwx.bosafe.com,DIRECT",
  "DOMAIN-SUFFIX,sso.openxlab.org.cn,DIRECT",
  "DOMAIN-SUFFIX,topazlabs.com,DIRECT",
  "DOMAIN-SUFFIX,registry.npmjs.org,DIRECT",
  "DOMAIN-SUFFIX,ikhub.net,DIRECT",
  // 你已指定直连的中转站
  "DOMAIN,api.qiuqiutoken.net,DIRECT",
  "DOMAIN,api2.qiuqiutoken.net,DIRECT",
  "DOMAIN,api.qiuqiutoken.jiawuyu.com,DIRECT",
  "DOMAIN,api2.qiuqiutoken.jiawuyu.com,DIRECT",
  "DOMAIN,api.kozeai.com,DIRECT",
  "DOMAIN-SUFFIX,91topgo.com,DIRECT",
  // 坚果云客户端直连
  "PROCESS-NAME,NutstoreClient.exe,DIRECT",
  "PROCESS-NAME,Nutstore.exe,DIRECT",
  "PROCESS-NAME,Nutstore,DIRECT",
];

// 坚果云脚本下载与国内代码托管直接访问，更新不依赖代理先连通。
const UPDATE_DIRECT_RULES = [
  "DOMAIN,dav.jianguoyun.com,DIRECT",
  "DOMAIN-SUFFIX,gitee.com,DIRECT",
  "DOMAIN-SUFFIX,giteeusercontent.com,DIRECT"
];
// 安卓FCM推送独立保留（域名和IP两部分），不被google.com通用规则抢先接走。
const PUSH_RULES = [
  "RULE-SET,GoogleFCMDomain,📢 谷歌FCM",
  "RULE-SET,GoogleFCMIP,📢 谷歌FCM,no-resolve"
];
const BASE_RULES = [
  "RULE-SET,PrivateDomain,DIRECT",
  "RULE-SET,PrivateIP,DIRECT,no-resolve",
  "RULE-SET,ChinaDomain,DIRECT",
  "RULE-SET,ChinaIP,DIRECT,no-resolve",
  "MATCH,🌐 默认代理"
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
    "proxy": "🌐 默认代理"
  },
  "PrivateIP": {
    "type": "http",
    "behavior": "ipcidr",
    "format": "mrs",
    "url": "https://raw.githubusercontent.com/MetaCubeX/meta-rules-dat/meta/geo/geoip/private.mrs",
    "path": "./ruleset/basic-rule-v2/PrivateIP.mrs",
    "interval": 86400,
    "proxy": "🌐 默认代理"
  },
  "ChinaDomain": {
    "type": "http",
    "behavior": "domain",
    "format": "mrs",
    "url": "https://raw.githubusercontent.com/MetaCubeX/meta-rules-dat/meta/geo/geosite/cn.mrs",
    "path": "./ruleset/basic-rule-v2/ChinaDomain.mrs",
    "interval": 86400,
    "proxy": "🌐 默认代理"
  },
  "ChinaIP": {
    "type": "http",
    "behavior": "ipcidr",
    "format": "mrs",
    "url": "https://raw.githubusercontent.com/MetaCubeX/meta-rules-dat/meta/geo/geoip/cn.mrs",
    "path": "./ruleset/basic-rule-v2/ChinaIP.mrs",
    "interval": 86400,
    "proxy": "🌐 默认代理"
  },
  "GoogleFCMDomain": {
    "type": "http",
    "behavior": "domain",
    "format": "mrs",
    "url": "https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/mrs/GoogleFCM_domain.mrs",
    "path": "./ruleset/basic-rule-v2/GoogleFCMDomain.mrs",
    "interval": 86400,
    "proxy": "🌐 默认代理"
  },
  "GoogleFCMIP": {
    "type": "http",
    "behavior": "ipcidr",
    "format": "mrs",
    "url": "https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/mrs/GoogleFCM_ip.mrs",
    "path": "./ruleset/basic-rule-v2/GoogleFCMIP.mrs",
    "interval": 86400,
    "proxy": "🌐 默认代理"
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
// 地区只用于筛选用途候选，不再生成同名的地区选择组。
const HK_PATTERN = /香港|🇭🇰|(?:^|[^a-z])HK(?:[^a-z]|$)|Hong Kong/i;
const SG_PATTERN = /新加坡|狮城|獅城|🇸🇬|(?:^|[^a-z])SG(?:[^a-z]|$)|Singapore/i;
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
  const hk = ieplFirst(fixedCandidates(names, HK_PATTERN));
  const hkCline = [...hk].sort((a,b) => (/香港S09\s*\|\s*IEPL/i.test(b)?1:0) - (/香港S09\s*\|\s*IEPL/i.test(a)?1:0));
  const sg = ieplFirst(fixedCandidates(names, SG_PATTERN));
  const downloads = names.filter(name => /下载/.test(name) || rateOf(name) <= 0.1)
    .filter(name => !/免费|免費|到期|剩余|有效期|官网|流量[:：]/.test(name));
  downloads.sort((a,b) => (isNaN(rateOf(a))?1:rateOf(a)) - (isNaN(rateOf(b))?1:rateOf(b)));

  // 保留常用的两套控制：个人网站跟手动切换，其他流量由默认代理决定。
  // 固定用途保留旧组名作为本机选择的键，避免重命名令AI出口悄悄重置。
  const groups = [
    selected("🌎 个人规则",["🚀 手动切换","♻️ 自动选择",...names]),
    selected("🚀 手动切换",names),
    selected("🌐 默认代理",["♻️ 自动选择","🚀 手动切换",...names]),
    auto("♻️ 自动选择",names),
    selected("🟣 Anthropic",["REJECT",...us]),
    selected("💲 美国规则",us.length?["REJECT",...us,"🟣 Anthropic"]:[]),
    selected("🇭🇰 香港固定",["REJECT",...hk]),
    selected("🇭🇰 香港规则",["REJECT",...hkCline]),
    selected("🇸🇬 WorkBuddy",["REJECT",...sg]),
    selected("📥 下载分流",[...downloads,"🌎 个人规则","🚀 手动切换"]),
    selected("☁️ 云盘服务",["DIRECT","♻️ 自动选择","🚀 手动切换","🌐 默认代理",...names]),
    selected("📢 谷歌FCM",["DIRECT","🌐 默认代理","🚀 手动切换",...us]),
    selected("🛰️ Tailnet",[TS_PROXY_NAME,"DIRECT"])
  ];
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
  config.rules = [...TAILSCALE_RULES, ...LOCAL_RULES, ...AI_RULES, ...PUSH_RULES, ...ONEDRIVE_RULES, ...APPLE_DIRECT_RULES, ...MICROSOFT_DIRECT_RULES, ...UPDATE_DIRECT_RULES, ...MY_CUSTOM_RULES, ...BASE_RULES];
  if (config.tun) config.tun = Object.assign({},config.tun,TUN_TAILSCALE_SETTINGS);
  return config;
}
