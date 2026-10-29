# 自动发布加密订阅

规则仍只维护仓库根目录的 `reWrite.js`，无需维护第二套覆写。

## 自动执行

- 修改规则或生成流程并推送到 `main` 后执行。
- 每六小时定时执行，用于跟进机场订阅变化；GitHub 定时任务可能延迟。
- Actions 页面可手动运行“发布加密订阅”。
- 公开仓库的定时工作流可能因长期无仓库活动而被 GitHub 停用；发现停更时在 Actions 页面检查并重新启用。

流程：下载机场 YAML → 执行 `main(config)` → 引用及敏感策略检查 → Mihomo 解析校验 → age 公钥加密 → 原子更新 `subscription` 分支。

任一步失败都不会覆盖上一次已发布配置。相同配置不重复提交。不会上传明文配置作为 Actions artifact。

## 固定订阅链接

https://raw.githubusercontent.com/Lawrence-of-AnKing/myRules/refs/heads/subscription/config.yaml.age

公开状态（不含节点凭据）：

https://raw.githubusercontent.com/Lawrence-of-AnKing/myRules/refs/heads/subscription/version.json

链接内容是 age 加密的完整 Mihomo 配置。客户端必须支持 age 配置解密，并单独填写私钥。不要把加密文件当作普通 YAML，也不要把解密私钥放到公开仓库、链接参数或截图中。

## 凭据边界

- `AIRPORT_SUBSCRIPTION_URL` 只存放在 GitHub Actions Secret。
- `IPROYAL_PROXY_JSON` 是构建必需的 Secret，包含 `server`、`port`、`username`、`password`；IPRoyal ISP 的 SOCKS5 默认端口为 12324，不能照搬 HTTP 的 12323。凭据只进入 age 加密配置。
- ChatGPT/Claude 使用唯一的 IPRoyal 新加坡出口，前置固定香港 S01；Gemini 等原美国业务继续使用美国组。17903 本机入口强制 IPRoyal，17904 强制原美国 S01；专用入口在全局/直连模式下也不回退普通默认代理。Gemini 客户端如需显式代理，应使用 17904 而非 17903。
- `distribution/recipient.txt` 是可公开的 age 公钥。
- 解密私钥保留在自己的设备上，不上传到工作流。
- 发布只使用 Actions 自动发放的短期 `GITHUB_TOKEN`，不使用个人高权限 token。
- 接收者如果同时拿到配置文件和解密私钥，就能读取节点凭据。
- 密钥本地丢失时不能从 GitHub 恢复，需妥善备份；更换公钥后需要重新向各端分发新私钥。
- Actions 会处理明文订阅，需信任 GitHub 平台和本仓库有写权限的人员；不要运行来历不明的修改。
- `node:vm` 用于兼容执行自己的 JS，不是执行不可信代码的安全沙箱。

## 首次导入与自动更新

1. 新设备如果无法直接访问 GitHub，先用原版订阅或本地配置建立连接。
2. 导入固定链接并填写 age 私钥。
3. 关闭原有针对同一配置的 JS 覆写，避免重复执行。
4. 各端单独设置订阅自动更新；手机省电、设备休眠和网络故障可能推迟更新。
5. ChatGPT/Claude 固定组默认使用用户已确认的唯一 IPRoyal 出口，另提供 REJECT；其余固定用途组仍默认 REJECT。已有美国组选择保持不变，迁移后应验证 OpenAI/Anthropic 为新加坡、Gemini 为美国。

更新后的配置会保留 `store-selected: true`，但最终选择是否保留仍取决于客户端，应先新建测试订阅，保留旧订阅作为恢复入口。

Tailscale 私钥和登录状态不会复制。生成配置不改变终端 TUN 开关、路由器透明代理或独立断网保护；这些由各端单独管理。

## 本地验证

```sh
npm ci --ignore-scripts
SUBSCRIPTION_INPUT=/安全路径/机场.yaml IPROYAL_PROXY_JSON="$(读取私有配置的命令)" npm run build:subscription
```

生成的明文只写入忽略目录 `.build/`，不要提交或分享。`reWrite.js` 按受信任代码执行。流程默认不打开 Mihomo HTTP 控制器，各客户端可使用自己的管理设置。
