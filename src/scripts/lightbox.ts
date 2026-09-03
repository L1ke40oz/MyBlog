/* ==========================================================================
   照片灯箱的交互
   焦点陷阱、Esc 关闭、关闭后焦点归位，都交给原生 <dialog>.showModal()；
   这里只管：点哪张、左右切换、点空白关闭、预载相邻两张。
   ========================================================================== */

type Shot = {
  el: HTMLElement;
  full: string;
  w: number;
  h: number;
  caption: string;
  date: string;
  iso: string;
};

export function initLightbox() {
  const dlg = document.querySelector<HTMLDialogElement>("[data-lightbox]");
  if (!dlg || dlg.dataset.lbReady === "1") return;

  const tiles = Array.from(
    document.querySelectorAll<HTMLElement>("[data-photo]"),
  );
  if (tiles.length === 0) return;

  dlg.dataset.lbReady = "1";

  const shots: Shot[] = tiles.map((el) => ({
    el,
    full: el.dataset.full ?? "",
    w: Number(el.dataset.w) || 0,
    h: Number(el.dataset.h) || 0,
    caption: el.dataset.caption ?? "",
    date: el.dataset.date ?? "",
    iso: el.dataset.iso ?? "",
  }));

  const img = dlg.querySelector<HTMLImageElement>(".lb__img")!;
  const text = dlg.querySelector<HTMLElement>(".lb__text")!;
  const date = dlg.querySelector<HTMLTimeElement>(".lb__date")!;
  const count = dlg.querySelector<HTMLElement>(".lb__count")!;
  const prevBtn = dlg.querySelector<HTMLButtonElement>("[data-lb-prev]")!;
  const nextBtn = dlg.querySelector<HTMLButtonElement>("[data-lb-next]")!;
  const closeBtn = dlg.querySelector<HTMLButtonElement>("[data-lb-close]")!;

  let at = 0;

  /* 提前把相邻的两张下载好，切换时不闪 */
  const warm = (i: number) => {
    const s = shots[i];
    if (!s) return;
    const pre = new Image();
    pre.src = s.full;
  };

  const show = (i: number) => {
    const s = shots[i];
    if (!s) return;
    at = i;

    img.src = s.full;
    img.alt = s.caption;
    if (s.w && s.h) {
      img.width = s.w;
      img.height = s.h;
    }

    text.textContent = s.caption;
    date.textContent = s.date;
    date.dateTime = s.iso;
    count.textContent = `${i + 1} / ${shots.length}`;

    /* 到头了就把对应的方向键按钮禁掉 */
    const held = document.activeElement;
    prevBtn.disabled = i === 0;
    nextBtn.disabled = i === shots.length - 1;

    /* 刚按的那个按钮如果正好被禁掉，焦点会掉到 <body> 上；
       而左右键是绑在 dialog 上的，焦点一掉出去就再也收不到，
       键盘用户翻到第一张之后就动不了了。所以把焦点交给还能用的那个按钮。 */
    if (held instanceof HTMLButtonElement && held.disabled) {
      const other = held === prevBtn ? nextBtn : prevBtn;
      (other.disabled ? closeBtn : other).focus();
    }

    warm(i - 1);
    warm(i + 1);
  };

  const step = (d: number) => {
    const i = at + d;
    if (i < 0 || i >= shots.length) return;
    show(i);
  };

  for (const [i, s] of shots.entries()) {
    s.el.addEventListener("click", () => {
      show(i);
      dlg.showModal();
    });
  }

  prevBtn.addEventListener("click", () => step(-1));
  nextBtn.addEventListener("click", () => step(1));

  for (const btn of dlg.querySelectorAll<HTMLElement>("[data-lb-close]")) {
    btn.addEventListener("click", () => dlg.close());
  }

  /* 点照片以外的空白处也关掉：那块区域属于 dialog 自己 */
  dlg.addEventListener("click", (e) => {
    if (e.target === dlg) dlg.close();
  });

  dlg.addEventListener("keydown", (e: KeyboardEvent) => {
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      step(-1);
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      step(1);
    }
  });

  /* 弹层开着的时候切页（比如按了浏览器后退），把它收掉 */
  document.addEventListener(
    "astro:before-swap",
    () => {
      if (dlg.open) dlg.close();
    },
    { once: true },
  );
}
