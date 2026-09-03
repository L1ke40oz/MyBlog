# 小窝

一个纯静态的个人博客：日记、照片墙、一个留言板，首页是一张可以拖动的书桌。

**发一篇新日记 = 往一个文件夹里放一个 `.md` 文件，然后推到 GitHub。** 剩下的（构建、传到服务器）自动完成。没有后台，没有数据库，不用登录任何管理页面。

---

## 一、发一篇日记

在 `src/content/diary/` 里新建一个 `.md` 文件。**文件名会变成网址**，所以建议写成「日期-标题」：

```text
文件： src/content/diary/2026-09-03-把桌子搬到网上.md
网址： /diary/2026-09-03-把桌子搬到网上/
```

文件开头两行 `---` 之间是「信息卡」，下面才是正文：

```markdown
---
title: 把桌子搬到网上
date: 2026-09-03
weather: 晴
mood: 还行
tags: ["折腾", "记录"]
summary: 旧的博客太简单了，于是重写。
---

正文从这里开始，用 Markdown 写。

## 小标题

- 列表
- 也可以

> 引用长这样。
```

信息卡里能写的字段：

| 字段 | 必填 | 说明 |
| --- | --- | --- |
| `title` | 是 | 标题 |
| `date` | 是 | 写成 `2026-09-03` 这种格式 |
| `summary` | 否 | 列表页上显示的一两句话；不写就自动截正文开头 |
| `weather` | 否 | 随便写：晴 / 小雨 / ☁️ |
| `mood` | 否 | 随便写：还行 / 累 / 想吃火锅 |
| `tags` | 否 | 写成 `["日常", "折腾"]`；不写就没有标签 |
| `cover` | 否 | 封面图。把图片放在这个 md 旁边，然后写 `cover: ./图片名.jpg` |
| `layout` | 否 | `paper`（默认）或 `scene`，见下一段 |
| `draft` | 否 | 写 `draft: true`，这篇就只在本地看得见，不会发出去 |

写了一半不想发？加一行 `draft: true`，它就只出现在本地预览里。想发的时候把这行删掉。

### 那个「插画场景」版式

在信息卡里写 `layout: scene`，这篇会铺成整屏的风景画——天空、山、水面，正文落在一张半透明的纸上。适合偶尔一篇想认真做的，日常随笔用默认的 `paper` 就好。

示例：`src/content/diary/2026-08-16-湖边那半小时.md`。

---

## 二、加照片

把图片直接丢进 `src/photos/`，照片墙会自己出现。**文件名按这个格式写**，日期和说明会显示在照片下面：

```text
2026-08-21_海边最后一个傍晚.jpg
└── 日期 ──┘└──── 说明 ─────┘
```

- 日期和说明之间用下划线 `_`（空格或减号也认）
- 支持 `.jpg` `.jpeg` `.png` `.webp` `.avif`
- 不按这个格式命名也不会报错，只是那张照片没有日期
- 原图直接放，不用自己压缩——构建时会自动生成多个尺寸的 webp，手机上只下载小的那张

照片顺序按日期从新到旧。点开是灯箱，可以用左右方向键翻、Esc 关掉。

---

## 三、开留言板

留言板用的是 **Giscus**：留言其实存在这个仓库的 GitHub Discussions 里，所以不用开数据库、也不用管垃圾留言。代价是**访客要有 GitHub 账号**才能留言。

没配之前，`/guestbook/` 页面会显示一段只有你自己看得到的说明。前两步已经做好了，还剩三步：

1. ~~把这个仓库设成 **Public**~~ ✅ 已经是公开的
2. ~~**Settings → General → Features** 里勾上 **Discussions**~~ ✅ 已勾选
3. 打开 <https://github.com/apps/giscus>，点 Install，装到 `L1ke40oz/MyBlog`
4. 打开 <https://giscus.app>，「仓库」填 `L1ke40oz/MyBlog`，分类选 **Announcements**。页面往下拉会给出一段代码，从里面找到 `data-category-id`（长得像 `DIC_kwDO…`）
5. 把它抄进 `src/config.ts` 的 `categoryId`，同时把 `enabled` 改成 `true`：

```ts
export const guestbook = {
  enabled: true,                 // ← 改成 true
  repo: "L1ke40oz/MyBlog",       // 已填好
  repoId: "R_kgDOUNYQkw",        // 已填好
  category: "Announcements",
  categoryId: "DIC_kwDO...",     // ← 第 4 步抄来的，只差这一个
  ...
};
```

改完 `git add . && git commit && git push`，推上去就生效了。

---

## 四、改站名、简介、外链

全都在 `src/config.ts` 一个文件里：站名、你的名字、名片上那句话、关于页的自我介绍、GitHub / CSDN 的链接。**这是唯一一个「日常可能要改」的代码文件**，其它的不用碰。

想换配色的话在 `src/styles/tokens.css`，所有颜色、字号、间距都在那儿定义，改一处全站跟着变。

---

## 五、本地预览（推荐，但不是必须）

不预览也能发——推上去自动构建。但本地看一眼更放心，尤其是加了照片之后。

需要先装 [Node.js](https://nodejs.org/) 20 以上（推荐 22，跟自动部署用的版本一致）。然后在项目文件夹里开一个终端：

```bash
npm install
```

只需要装一次。之后每次预览：

```bash
npm run dev
```

浏览器打开它提示的地址（一般是 <http://localhost:4321>）。改了文件不用刷新，页面会自己变。看完在终端按 `Ctrl + C` 停掉。

想确认「推上去会不会构建失败」，跑这个：

```bash
npm run build
```

没有红字就没问题。

---

## 六、部署到自己的服务器

一次性配置，配好之后就只剩「改文件 → 推送」了。

### 6.1 在 GitHub 仓库里配 4 个 secret

仓库 **Settings → Secrets and variables → Actions → New repository secret**，建 4 个：

| 名字 | 值 |
| --- | --- |
| `SERVER_HOST` | VPS 的公网 IP |
| `SERVER_PORT` | SSH 端口，一般是 `22` |
| `SERVER_USER` | 登录用户名 |
| `SSH_PRIVATE_KEY` | **私钥全文**，从 `-----BEGIN` 到 `-----END` 整段都要 |

没有密钥的话，**在 VPS 上**跑这几行现生成一对（不要用你平时登录的那把私钥）：

```bash
ssh-keygen -t ed25519 -C "github-actions-blog" -f ~/.ssh/blog_deploy -N ""
cat ~/.ssh/blog_deploy.pub >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
cat ~/.ssh/blog_deploy
```

最后一行会把**私钥**打印出来，整段复制进 `SSH_PRIVATE_KEY`。存好之后可以把服务器上的这份私钥删掉：`rm ~/.ssh/blog_deploy`（公钥已经进 `authorized_keys` 了，删私钥不影响登录）。

> 为什么用密钥不用密码：密码一旦泄露，整台服务器就没了；这把密钥只干上传博客这一件事，出问题从 `authorized_keys` 里删掉那一行就断了，不用改服务器密码。

顺手确认服务器上有 `rsync`（Ubuntu 一般自带）：

```bash
command -v rsync || apt install -y rsync
```

### 6.2 确认部署路径

`.github/workflows/deploy.yml` 开头已经填好了：

```yaml
DEPLOY_PATH: /www/sites/blog.luminestella.top/index
```

这个值必须和 nginx 配置里那行 `root` 一模一样。在 1Panel「网站 → 点进这个站 → 配置文件」里能看到。（1Panel 不同版本的路径不一样，有的是 `/www/sites/...`，有的是 `/opt/1panel/www/sites/...`，别照别人的抄。）

路径必须对：上传用的是 `rsync --delete`，写错会删掉那个目录里原有的东西。留着占位值 `example.com` 或者留空的话，流程会故意失败并提示你。

> **第一次部署前先看一眼那个目录。** `rsync --delete` 会把它变成 `dist/` 的精确镜像——`dist/` 里没有的文件会被删掉。在 1Panel 的文件管理里翻一下，确认里面没有你想留着的东西（默认的占位 index.html 删了没关系）。日志在隔壁 `log/` 目录，不受影响。

以后换域名，这里和 `astro.config.mjs` 顶部的 `SITE_URL` 都要跟着改。

### 6.3 配 OpenResty

1Panel → 网站 → 点你的域名 → 配置文件，把 `openresty/blog.conf` 的内容贴进已有的 `server { ... }` 里面。

**如果里面已经有一个 `location / { ... }`，先删掉它**——nginx 有两个 `location /` 会直接起不来。文件开头的注释里写了细节，贴之前扫一眼。

改完先测再重载，别直接 reload（1Panel 点保存其实也会先测，报错会弹出来）：

```bash
openresty -t && openresty -s reload
```

### 6.3b Cloudflare（这个域名走了 CF 代理）

`blog.luminestella.top` 解析到的是 Cloudflare 的 IP，也就是这条 DNS 记录开着橙色云朵。访客看到的 HTTPS 是 Cloudflare 给的，跟服务器上有没有证书是两件事。

**现在别动 SSL/TLS 模式。** 1Panel 生成的配置里只有 `listen 80`，没有 `listen 443`，也就是服务器这边根本没开 HTTPS。这种情况下 Cloudflare 只能用 **Flexible**（HTTP 回源），站是通的；这时候手动改成 Full，Cloudflare 会去连服务器的 443 端口，连不上，整站变成 521 / 522 错误页。

想升级成全程加密（推荐，但不着急），顺序不能颠倒：

1. 先让服务器有 HTTPS。最省事的是用 **Cloudflare Origin Certificate**（CF 面板 → SSL/TLS → Origin Server → Create Certificate，有效期 15 年，不用续期），把证书和私钥贴进 1Panel 的网站 HTTPS 设置里。也可以用 1Panel 申请 Let's Encrypt，但验证请求要穿过 CF 代理，可能失败——失败就把橙云临时点成灰云、签完再点回来，或者改用 DNS-01 验证配一个 Cloudflare API Token。
2. 服务器 443 能通了，再把 CF 的 SSL/TLS 改成 **Full**（用 Origin Certificate 的话可以直接上 Full (strict)）。
3. 最后才在 1Panel 里打开 HTTP → HTTPS 跳转。**顺序反了就是无限重定向**：CF 用 HTTP 回源，服务器把它跳到 HTTPS，CF 再用 HTTP 回源……浏览器报 `ERR_TOO_MANY_REDIRECTS`。这个症状看起来像「网站坏了」，跟证书一点也不像，很容易查错方向。

发了新日记不用手动清 CF 缓存：HTML 带着 `no-cache`，Cloudflare 默认也不缓存 HTML。万一真看到旧内容，去 CF 面板 Purge Everything。

另外，`access.log` 里记的都是 Cloudflare 的中转 IP，不是访客的真实 IP。不看统计的话不用管。

### 6.4 日常推送

仓库已经建好并推上去了（`https://github.com/L1ke40oz/MyBlog`，分支 `main`）。以后改完东西只要三行：

```bash
git add .
```

```bash
git commit -m "写了篇日记"
```

```bash
git push
```

推上去之后到仓库的 **Actions** 标签页看，绿勾就是构建 + 上传都成功了，刷新网站就能看到。

---

## 目录速查

日常会碰的：

| 位置 | 放什么 |
| --- | --- |
| `src/content/diary/` | 日记，一个 `.md` 一篇 |
| `src/photos/` | 照片，直接丢图片文件 |
| `src/config.ts` | 站名、简介、外链、留言板开关 |

一般不用碰的：

| 位置 | 是什么 |
| --- | --- |
| `src/styles/tokens.css` | 配色、字号、间距的总开关，想换配色改这里 |
| `src/layouts/` | 页面骨架（日记页、插画场景页、普通页） |
| `src/components/` | 书桌、导航、灯箱、留言板这些零件 |
| `src/pages/` | 每个网址对应一个文件 |
| `openresty/blog.conf` | 服务器配置参考，贴到 1Panel 里用的 |
| `.github/workflows/` | 自动部署的流程 |
| `dist/` | 构建产物，自动生成的，不用管也不用提交 |

---

## 出问题了

**推上去了但网站没变。** 先看仓库 Actions 页面那一次是绿的还是红的。红的点进去看哪一步失败；绿的就是浏览器缓存，强制刷新一下（`Ctrl + Shift + R`）。

**Actions 卡在「检查一下部署路径改过了没」。** `DEPLOY_PATH` 被改成了占位值或者空的，见 6.2。

**Actions 在「准备 SSH」或「上传到 VPS」这一步失败。** 4 个 secret 有没配好的，见 6.1；或者 `DEPLOY_PATH` 指的目录在服务器上不存在（先在 1Panel 里把网站建出来）。

**新日记没出现。** 三个地方检查：文件在 `src/content/diary/` 里吗；后缀是 `.md` 吗；信息卡里有没有 `draft: true`。

**本地 `npm run dev` 打不开。** 确认 Node 装了（`node -v` 要 20 以上），确认 `npm install` 跑过。

**照片没日期。** 文件名不符合 `YYYY-MM-DD_说明.jpg` 的格式，照片还是会显示，只是没有日期那行。

**留言板显示「还没接上」。** `src/config.ts` 里 `enabled` 还是 `false`，或者 `repoId` / `categoryId` 是空的，见第三节。

---

## 一点说明

- **全站不外链任何字体**，用的都是系统里已有的字。国内访问 Google Fonts 会超时，页面会卡在一片白等字体——上一版博客就吃过这个亏。所以不要往 `tokens.css` 里加 `@import url(fonts.googleapis.com/...)`。
- **文章底下没有评论区**，也没有访问统计和搜索框。留言只有 `/guestbook/` 一页。
- 首页那张书桌用纯 HTML 和 CSS 画的，只有拖动和两个彩蛋（杯子、猫）用到一点脚本。窄屏上书桌会自动塌成一列卡片。
- 键盘能走完全站：Tab 切换，书桌上用方向键平移，灯箱里左右键翻页、Esc 关闭。系统开了「减少动态效果」的话，动画会自动关掉。
