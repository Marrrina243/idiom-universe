/* ============================================
   DetailPanel — 暗色磨砂玻璃 · 现代高定 UI
   ============================================ */

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useUniverseStore } from "../store/useUniverseStore";
import { IDIOM_NODES } from "../data/idioms";
import { GALAXY_COLOR_MAP } from "../types/idiom";
import type { IdiomNode } from "../types/idiom";

function GalaxyBadge({ galaxy }: { galaxy: IdiomNode["galaxy"] }) {
  const c = GALAXY_COLOR_MAP[galaxy];
  return (
    <span
      className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium tracking-wide"
      style={{ backgroundColor: `${c.secondary}18`, border: `1px solid ${c.secondary}30`, color: c.secondary }}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: c.secondary, boxShadow: `0 0 6px ${c.secondary}` }} />
      {c.name}
    </span>
  );
}

export default function DetailPanel() {
  const focusedNodeId = useUniverseStore((s) => s.focusedNodeId);
  const panelOpen = useUniverseStore((s) => s.panelOpen);
  const blurNode = useUniverseStore((s) => s.blurNode);
  const awakenNode = useUniverseStore((s) => s.awakenNode);
  const awakenedIds = useUniverseStore((s) => s.awakenedIds);

  const node = focusedNodeId ? IDIOM_NODES.find((n) => n.id === focusedNodeId) ?? null : null;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape" && panelOpen) blurNode(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [panelOpen, blurNode]);

  return (
    <AnimatePresence>
      {node && (
        <>
          {/* 透明遮罩 — 点击空白关闭面板 */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[99]"
            onClick={blurNode}
          />
          <motion.div
            key="panel"
            initial={{ x: 420, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 420, opacity: 0 }}
            transition={{ type: "spring", stiffness: 120, damping: 22, mass: 0.8 }}
            className="fixed right-0 top-0 h-full z-[100] w-[400px] max-w-[92vw] flex flex-col p-4"
        >
          <div
            className="flex-1 rounded-2xl flex flex-col overflow-hidden"
            style={{
              background: "rgba(8, 8, 20, 0.75)",
              backdropFilter: "blur(40px) saturate(1.2)",
              WebkitBackdropFilter: "blur(40px) saturate(1.2)",
              border: "1px solid rgba(255,255,255,0.08)",
              boxShadow: `
                0 25px 60px rgba(0,0,0,0.5),
                inset 0 1px 0 rgba(255,255,255,0.04),
                inset 0 0 80px rgba(100,140,255,0.03)
              `,
            }}
          >
            {/* 顶部色条 */}
            <div
              className="h-0.5 w-full shrink-0"
              style={{
                background: `linear-gradient(90deg, transparent, ${GALAXY_COLOR_MAP[node.galaxy].secondary}60, ${GALAXY_COLOR_MAP[node.galaxy].secondary}30, transparent)`,
              }}
            />

            {/* 内容区 */}
            <div className="flex-1 overflow-y-auto px-8 py-7">
              {/* 标题行 */}
              <div className="flex items-start gap-5 mb-6">
                <h2
                  className="text-3xl font-bold tracking-[0.25em] leading-tight select-none"
                  style={{
                    fontFamily: "'Noto Serif SC', 'Source Han Serif SC', serif",
                    writingMode: "vertical-rl",
                    textOrientation: "mixed",
                    maxHeight: "200px",
                    background: `linear-gradient(180deg, #ffffff 0%, ${GALAXY_COLOR_MAP[node.galaxy].secondary} 100%)`,
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  {node.text}
                </h2>
                <div className="flex flex-col gap-2.5 pt-1">
                  <span className="text-sm tracking-[0.2em] text-white/50 font-light italic">
                    {node.pinyin}
                  </span>
                  <GalaxyBadge galaxy={node.galaxy} />
                </div>
              </div>

              {/* 分隔线 */}
              <div className="h-px w-full mb-5" style={{
                background: `linear-gradient(90deg, ${GALAXY_COLOR_MAP[node.galaxy].secondary}20, transparent)`,
              }} />

              {/* 释义 */}
              <div className="mb-5">
                <span className="text-[10px] tracking-[0.3em] text-white/25 uppercase mb-2 block">释义</span>
                <p className="text-sm leading-[1.8] text-white/70 font-light tracking-[0.03em]">
                  {node.definition}
                </p>
              </div>

              {/* 典故 */}
              <div className="mb-5">
                <span className="text-[10px] tracking-[0.3em] text-white/25 uppercase mb-2 block">典故</span>
                <p className="text-sm leading-[1.8] text-white/60 font-light tracking-[0.03em] text-justify">
                  {node.story || "暂无典故记载，待后人补充。"}
                </p>
              </div>

              {/* 觉醒按钮 */}
              <div className="flex justify-center mt-7">
                <motion.button
                  whileTap={{ scale: 0.96 }}
                  onClick={() => awakenNode(node.id)}
                  disabled={awakenedIds.has(node.id)}
                  className={`px-7 py-2.5 rounded-full text-xs tracking-[0.25em] font-medium transition-all duration-500 ${
                    awakenedIds.has(node.id)
                      ? "bg-white/5 text-white/30 border border-white/10 cursor-default"
                      : "bg-white/5 text-white/80 border border-white/15 hover:bg-white/10 hover:border-white/25 cursor-pointer"
                  }`}
                  style={awakenedIds.has(node.id) ? {} : {
                    boxShadow: `0 0 20px ${GALAXY_COLOR_MAP[node.galaxy].secondary}15`,
                  }}
                >
                  {awakenedIds.has(node.id) ? "✦ 已领悟" : "已领悟 · 点染"}
                </motion.button>
              </div>
            </div>

            {/* 底部栏 */}
            <div className="border-t border-white/5 px-8 py-3.5 flex justify-between items-center shrink-0">
              <span className="text-[10px] tracking-[0.25em] text-white/20">
                太虚幻境 · {GALAXY_COLOR_MAP[node.galaxy].name}
              </span>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={blurNode}
                className="px-5 py-1.5 rounded-full text-xs tracking-[0.2em] text-white/40 border border-white/10 hover:text-white/70 hover:border-white/25 transition-all duration-300"
              >
                返回太虚
              </motion.button>
            </div>
          </div>
        </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
