// @ts-check
import { defineConfig } from 'astro/config';

/**
 * 站点域名，带 https://，末尾不要斜杠。以后换域名就改这一行。
 *
 * 它只影响需要「完整网址」的地方：分享到微信/Twitter 时的卡片、以后可能加的
 * RSS 和 sitemap。站内链接都是相对路径，所以这里填错也不影响站内跳转。
 *
 * 同一个域名在 .github/workflows/deploy.yml 的 DEPLOY_PATH 里也出现一次。
 */
const SITE_URL = 'https://blog.luminestella.top';

export default defineConfig({
  site: SITE_URL,

  // 纯静态输出，构建产物是 dist/ 里的一堆 HTML，直接丢给 OpenResty 就能跑
  output: 'static',

  build: {
    // 生成 /diary/xxx/index.html 而不是 /diary/xxx.html
    // 配合 OpenResty 的 try_files，访问 /diary/xxx 和 /diary/xxx/ 都能命中
    format: 'directory',
  },

  image: {
    // 照片墙用到的响应式尺寸
    responsiveStyles: true,
  },

  markdown: {
    shikiConfig: {
      theme: 'github-light',
      wrap: true,
    },
  },
});
