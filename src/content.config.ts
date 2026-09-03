import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

/* ==========================================================================
   日记集合
   ——「src/content/diary/」里每放一个 .md 文件，就是一篇日记
   文件名会变成网址，例如 2026-09-03-第一天.md → /diary/2026-09-03-第一天
   ========================================================================== */

const diary = defineCollection({
  loader: glob({ base: "./src/content/diary", pattern: "**/*.md" }),
  schema: ({ image }) =>
    z.object({
      /** 标题（必填） */
      title: z.string(),
      /** 日期，写成 2026-09-03（必填） */
      date: z.coerce.date(),
      /** 一两句摘要，出现在列表里。不写就自动截取正文开头 */
      summary: z.string().optional(),
      /** 那天的天气，随便写：晴 / 小雨 / ☁️ */
      weather: z.string().optional(),
      /** 那天的心情，随便写：还行 / 累 / 想吃火锅 */
      mood: z.string().optional(),
      /** 标签，写成 ["日常", "折腾"] */
      tags: z.array(z.string()).default([]),
      /** 封面图，放在同目录下然后写文件名，如 ./cover.jpg */
      cover: image().optional(),
      /**
       * 版式：
       *   paper（默认）—— 一张纸上的正常排版，适合日常随笔
       *   scene        —— 整屏插画场景，适合"灵光一现"那种想做成绘本的篇目
       */
      layout: z.enum(["paper", "scene"]).default("paper"),
      /** 设成 true 就只在本地 dev 里可见，不会被构建进线上 */
      draft: z.boolean().default(false),
    }),
});

export const collections = { diary };
