/** 2026-09-03 → 2026.09.03 */
export function fmtDate(d: Date): string {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}.${p(d.getMonth() + 1)}.${p(d.getDate())}`;
}
/** 2026-09-03 → 九月三日（列表里的小标注） */
export function fmtDay(d: Date): string {
  return `${d.getMonth() + 1} 月 ${d.getDate()} 日`;
}

/**
 * 把文件名变成合法的 view-transition-name
 * （CSS 标识符不能以数字开头，也不能带斜杠、点号）
 */
export function tname(id: string): string {
  return "t-" + id.replace(/[^\p{L}\p{N}-]/gu, "-");
}

/** 正文没写 summary 时，截一段开头当摘要 */
export function excerpt(body: string | undefined, max = 88): string {
  if (!body) return "";
  const plain = body
    .replace(/```[\s\S]*?```/g, "")
    .replace(/!?\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/[#>*_`~\-]/g, "")
    .replace(/\s+/g, " ")
    .trim();
  return plain.length > max ? plain.slice(0, max) + "…" : plain;
}

/**
 * 列表和详情页共用的筛选：草稿只在本地 npm run dev 时出现，
 * 构建到线上时会被过滤掉（列表和详情必须用同一条规则，
 * 否则列表里会出现点开是 404 的链接）
 */
export function published(entry: { data: { draft: boolean } }): boolean {
  return !entry.data.draft || import.meta.env.DEV;
}

/** 新的排前面 */
export function byNewest(
  a: { data: { date: Date } },
  b: { data: { date: Date } },
): number {
  return b.data.date.valueOf() - a.data.date.valueOf();
}
