import { navigate } from "astro:transitions/client";

/* 桌面平面的固定尺寸，和 desk.css 里保持一致 */
const PLANE_W = 2040;
const PLANE_H = 1320;

/* 手指/鼠标移动超过这个距离就算"拖"，否则算"点" */
const DRAG_THRESHOLD = 6;

const STORE_KEY = "desk:objects";
const NARROW = "(max-width: 52rem)";

type Pos = { x: number; y: number };

const clamp = (v: number, min: number, max: number) =>
  Math.min(Math.max(v, min), max);

const reduceMotion = () =>
  matchMedia("(prefers-reduced-motion: reduce)").matches;

function readStore(): Record<string, Pos> {
  try {
    return JSON.parse(localStorage.getItem(STORE_KEY) || "{}");
  } catch {
    return {};
  }
}

function writeStore(data: Record<string, Pos>) {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(data));
  } catch {
    /* 隐私模式下写不了，无所谓 */
  }
}

function clearStore() {
  try {
    localStorage.removeItem(STORE_KEY);
  } catch {
    /* 同上 */
  }
}

export function initDesk() {
  const desk = document.querySelector<HTMLElement>("[data-desk]");
  if (!desk || desk.dataset.deskReady === "1") return;
  desk.dataset.deskReady = "1";

  const plane = desk.querySelector<HTMLElement>(".desk__plane");
  const hint = desk.querySelector<HTMLElement>(".desk__hint");
  const tidy = desk.querySelector<HTMLElement>(".desk__tidy");
  if (!plane) return;

  const objects = Array.from(desk.querySelectorAll<HTMLElement>("[data-obj]"));

  /* 记下每样东西原本摆在哪，"整理桌面"要用 */
  const home = new Map<string, Pos>();
  for (const el of objects) {
    home.set(el.dataset.obj!, {
      x: parseFloat(el.style.getPropertyValue("--x")) || 0,
      y: parseFloat(el.style.getPropertyValue("--y")) || 0,
    });
  }

  /* 窄屏是一列卡片，不需要任何拖拽逻辑 */
  if (matchMedia(NARROW).matches) {
    bindEggs(objects);
    return;
  }

  const setObjPos = (el: HTMLElement, p: Pos) => {
    el.style.setProperty("--x", `${Math.round(p.x)}px`);
    el.style.setProperty("--y", `${Math.round(p.y)}px`);
  };

  /* 恢复上次摆放的位置 */
  const saved = readStore();
  let touched = false;
  for (const el of objects) {
    const p = saved[el.dataset.obj!];
    if (p && Number.isFinite(p.x) && Number.isFinite(p.y)) {
      setObjPos(el, p);
      touched = true;
    }
  }
  if (touched) desk.classList.add("is-messy");

  /* ---------- 桌面平移 ---------- */

  let px = 0;
  let py = 0;

  const limits = () => ({
    x: Math.max(0, (PLANE_W - innerWidth) / 2),
    y: Math.max(0, (PLANE_H - innerHeight) / 2),
  });

  const applyPan = () => {
    const l = limits();
    px = clamp(px, -l.x, l.x);
    py = clamp(py, -l.y, l.y);
    plane.style.setProperty("--px", `${px}px`);
    plane.style.setProperty("--py", `${py}px`);
  };

  const panTo = (nx: number, ny: number) => {
    px = nx;
    py = ny;
    plane.classList.add("is-settling");
    applyPan();
    setTimeout(() => plane.classList.remove("is-settling"), 600);
  };

  /* 挂在 window 上的监听要能随页面切换一起注销，否则会越积越多 */
  const ac = new AbortController();
  document.addEventListener("astro:before-swap", () => ac.abort(), {
    once: true,
  });
  addEventListener("resize", applyPan, { passive: true, signal: ac.signal });


  /* ---------- 拖动状态 ---------- */

  let mode: "none" | "pan" | "obj" = "none";
  let dragged: HTMLElement | null = null;
  let startX = 0;
  let startY = 0;
  let baseX = 0;
  let baseY = 0;
  let moved = 0;
  let vx = 0;
  let vy = 0;
  let lastX = 0;
  let lastY = 0;
  let suppressClick = false;

  const dismissHint = () => hint?.classList.add("is-gone");

  desk.addEventListener("pointerdown", (e: PointerEvent) => {
    if (e.button !== 0 && e.pointerType === "mouse") return;

    const obj = (e.target as HTMLElement).closest<HTMLElement>("[data-obj]");
    startX = lastX = e.clientX;
    startY = lastY = e.clientY;
    moved = 0;
    vx = vy = 0;

    if (obj) {
      mode = "obj";
      dragged = obj;
      baseX = parseFloat(obj.style.getPropertyValue("--x")) || 0;
      baseY = parseFloat(obj.style.getPropertyValue("--y")) || 0;
    } else {
      mode = "pan";
      baseX = px;
      baseY = py;
      desk.classList.add("is-panning");
    }

    plane.classList.remove("is-settling");
    desk.setPointerCapture(e.pointerId);
  });

  desk.addEventListener("pointermove", (e: PointerEvent) => {
    if (mode === "none") return;

    const dx = e.clientX - startX;
    const dy = e.clientY - startY;
    moved = Math.max(moved, Math.hypot(dx, dy));

    vx = e.clientX - lastX;
    vy = e.clientY - lastY;
    lastX = e.clientX;
    lastY = e.clientY;

    if (moved < DRAG_THRESHOLD) return;
    dismissHint();

    if (mode === "obj" && dragged) {
      dragged.classList.add("is-dragging");
      setObjPos(dragged, { x: baseX + dx, y: baseY + dy });
    } else {
      px = baseX + dx;
      py = baseY + dy;
      applyPan();
    }
  });

  const endDrag = () => {
    const wasDrag = moved >= DRAG_THRESHOLD;

    if (mode === "obj" && dragged) {
      dragged.classList.remove("is-dragging");
      if (wasDrag) {
        const store = readStore();
        store[dragged.dataset.obj!] = {
          x: parseFloat(dragged.style.getPropertyValue("--x")) || 0,
          y: parseFloat(dragged.style.getPropertyValue("--y")) || 0,
        };
        writeStore(store);
        desk.classList.add("is-messy");
      }
    }

    if (mode === "pan") {
      desk.classList.remove("is-panning");
      /* 松手后顺着惯性再滑一点 */
      if (wasDrag && !reduceMotion() && Math.hypot(vx, vy) > 2) {
        panTo(px + vx * 7, py + vy * 7);
      }
    }

    /* 刚拖过的话，别让浏览器把它当成一次点击 */
    suppressClick = wasDrag;
    mode = "none";
    dragged = null;
  };

  desk.addEventListener("pointerup", endDrag);
  desk.addEventListener("pointercancel", endDrag);

  /* 拖完那一下的 click 要拦在最前面吃掉 */
  desk.addEventListener(
    "click",
    (e) => {
      if (!suppressClick) return;
      suppressClick = false;
      e.preventDefault();
      e.stopPropagation();
    },
    true,
  );

  /* ---------- 点开一样东西：先抬起来，再跳页 ---------- */

  desk.addEventListener("click", (e) => {
    const link = (e.target as HTMLElement).closest<HTMLElement>("a[data-obj]");
    if (!link) return;

    const href = link.getAttribute("href");
    if (!href || href.startsWith("http") || href.startsWith("#")) return;
    const me = e as MouseEvent;
    if (me.metaKey || me.ctrlKey || me.shiftKey || me.altKey) return;

    e.preventDefault();
    dismissHint();

    if (reduceMotion()) {
      navigate(href);
      return;
    }

    link.classList.add("is-opening");
    setTimeout(() => navigate(href), 300);
  });

  /* ---------- 键盘：Tab 到看不见的东西时把桌面挪过去 ---------- */

  for (const el of objects) {
    el.addEventListener("focus", () => {
      const box = el.getBoundingClientRect();
      const pad = 90;
      let nx = px;
      let ny = py;

      if (box.left < pad) nx += pad - box.left;
      else if (box.right > innerWidth - pad) nx -= box.right - innerWidth + pad;

      if (box.top < pad) ny += pad - box.top;
      else if (box.bottom > innerHeight - pad)
        ny -= box.bottom - innerHeight + pad;

      if (nx !== px || ny !== py) panTo(nx, ny);
    });
  }

  /* 方向键也能平移桌面 */
  desk.addEventListener("keydown", (e: KeyboardEvent) => {
    const step = e.shiftKey ? 240 : 90;
    const move: Record<string, [number, number]> = {
      ArrowLeft: [step, 0],
      ArrowRight: [-step, 0],
      ArrowUp: [0, step],
      ArrowDown: [0, -step],
    };
    const d = move[e.key];
    if (!d) return;
    e.preventDefault();
    dismissHint();
    panTo(px + d[0], py + d[1]);
  });

  /* ---------- 整理桌面：把东西放回原位 ---------- */

  tidy?.addEventListener("click", () => {
    clearStore();
    for (const el of objects) {
      const p = home.get(el.dataset.obj!);
      if (!p) continue;
      el.style.transition = "transform 0.5s var(--ease-spring)";
      setObjPos(el, p);
      setTimeout(() => el.style.removeProperty("transition"), 560);
    }
    desk.classList.remove("is-messy");
    panTo(0, 0);
  });


  bindEggs(objects);
  applyPan();
}

/* ==========================================================================
   两个彩蛋：杯子冒热气、猫伸懒腰
   ========================================================================== */

const EGGS: Record<string, { cls: string; ms: number }> = {
  mug: { cls: "is-steaming", ms: 2300 },
  cat: { cls: "is-stretching", ms: 1200 },
};

function bindEggs(objects: HTMLElement[]) {
  for (const el of objects) {
    const egg = EGGS[el.dataset.egg ?? ""];
    if (!egg) continue;

    el.addEventListener("click", () => {
      if (el.classList.contains(egg.cls)) return;
      el.classList.add(egg.cls);
      setTimeout(() => el.classList.remove(egg.cls), egg.ms);
    });
  }
}
