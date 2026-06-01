/* ============================================
   HUD — 极简现代抬头显示
   ============================================ */

import { useUniverseStore } from "../store/useUniverseStore";
import { IDIOM_NODES } from "../data/idioms";
import { GALAXY_COLOR_MAP, GalaxyCategory } from "../types/idiom";

const GALAXY_INFO = [
  { key: GalaxyCategory.HISTORY, label: "历史典故" },
  { key: GalaxyCategory.MYTHOLOGY, label: "神话传说" },
  { key: GalaxyCategory.NATURE, label: "自然风物" },
  { key: GalaxyCategory.PHILOSOPHY, label: "为人处世" },
  { key: GalaxyCategory.EMOTION, label: "情感心理" },
];

export default function HUD() {
  const awakenedIds = useUniverseStore((s) => s.awakenedIds);
  const count = awakenedIds.size;
  const pct = Math.round((count / IDIOM_NODES.length) * 100);

  return (
    <div className="fixed inset-0 pointer-events-none z-40 select-none">
      {/* 标题 */}
      <div className="absolute top-6 left-6 flex flex-col gap-1">
        <h1
          className="text-[1.5rem] font-bold tracking-[0.4em] m-0"
          style={{
            fontFamily: "'Noto Serif SC', 'Source Han Serif SC', serif",
            background: "linear-gradient(180deg, #ffffff 0%, #c9a96e 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            filter: "drop-shadow(0 0 12px rgba(201,169,110,0.25))",
          }}
        >
          成语星空
        </h1>
        <span className="text-[0.55rem] tracking-[0.3em] text-white/25 font-light">
          IDIOM UNIVERSE
        </span>
      </div>

      {/* 进度 */}
      <div className="absolute top-8 right-[420px] flex items-center gap-3">
        <span className="text-[0.65rem] tracking-[0.2em] text-white/50 font-light">
          点染 <span className="text-white/80">{count}</span><span className="text-white/25">/{IDIOM_NODES.length}</span>
        </span>
        <div className="w-24 h-[2px] rounded-full overflow-hidden bg-white/5">
          <div
            className="h-full rounded-full transition-all duration-700 ease-out"
            style={{
              width: `${pct}%`,
              background: "linear-gradient(90deg, rgba(201,169,110,0.6), rgba(240,214,138,0.9))",
            }}
          />
        </div>
      </div>

      {/* 图例 */}
      <div className="absolute bottom-6 left-6 flex gap-6">
        {GALAXY_INFO.map(({ key, label }) => {
          const c = GALAXY_COLOR_MAP[key];
          return (
            <div key={key} className="flex items-center gap-2">
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{ backgroundColor: c.secondary, boxShadow: `0 0 6px ${c.secondary}` }}
              />
              <span className="text-[0.5rem] tracking-[0.15em] text-white/30 font-light">{label}</span>
            </div>
          );
        })}
      </div>

      {/* 操作提示 */}
      <div className="absolute bottom-6 right-6">
        <span className="text-[0.5rem] tracking-[0.15em] text-white/15 font-light">
          拖拽旋转 · 滚轮缩放 · 点击星球 · ESC 返回
        </span>
      </div>
    </div>
  );
}
