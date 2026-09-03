/* ==========================================================================
   站点配置 —— 想改站名、简介、链接、留言板，都在这个文件里改
   ========================================================================== */

export const site = {
  /** 站名，出现在浏览器标签页和桌面上的名牌 */
  name: "小窝",
  /** 你的名字 / 网名 */
  author: "L1ke40oz",
  /** 一句话简介，出现在名片上 */
  tagline: "随手记点东西，顺便把桌子摆得好看一些。",
  /** 稍长一点的自我介绍，出现在「关于」页 */
  intro:
    "这里是我的一张书桌。日记、照片、偶尔冒出来的小玩意儿都摊在上面，你可以随便翻。",
  /** 浏览器标签页后缀 */
  titleSuffix: "小窝",
  lang: "zh-CN",
};

/** 桌上的外链小物件（名片背面的那几行） */
export const links = [
  { label: "GitHub", href: "https://github.com/L1ke40oz" },
  { label: "CSDN", href: "https://blog.csdn.net/m0_74799789?type=blog" },
];

/* --------------------------------------------------------------------------
   留言板配置（Giscus）

   原理：把留言存在你 GitHub 仓库的 Discussions 里，所以不需要数据库、
   不需要后端、不需要维护，代价是访客要用 GitHub 账号登录才能留言。

   启用步骤（README 里有详细版）：
     1. ✅ 仓库已经是 Public
     2. ✅ Settings → General → Features 里的 Discussions 已勾选
     3. 打开 https://github.com/apps/giscus 安装到 L1ke40oz/MyBlog 这个仓库
     4. 打开 https://giscus.app ，仓库填 L1ke40oz/MyBlog，
        选 Announcements 分类，把页面下方给出的 data-category-id
        （长得像 DIC_kwDO… 的那串）抄到下面的 categoryId
     5. 把 enabled 改成 true

   repoId 已经从 GitHub API 查好填进去了，不用动。
   -------------------------------------------------------------------------- */
export const guestbook = {
  enabled: false,
  repo: "L1ke40oz/MyBlog",
  repoId: "R_kgDOUNYQkw",
  category: "Announcements",
  categoryId: "",
  /** 留言板只用一个固定话题，所以按 pathname 映射即可 */
  mapping: "pathname" as const,
  lang: "zh-CN",
};
