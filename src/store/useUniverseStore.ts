/* ============================================
   useUniverseStore.ts — 全局状态
   聚焦 · 面板 · 枯墨 · 觉醒 · 点染特效
   ============================================ */

import { create } from "zustand";
import type { IdiomNode } from "../types/idiom";
import { IDIOM_NODES } from "../data/idioms";

export interface AwakeningEvent {
  nodeId: string;
  position: [number, number, number];
  timestamp: number;
}

interface UniverseStore {
  // 聚焦
  focusedNodeId: string | null;
  panelOpen: boolean;
  panelAnim: "enter" | "exit" | null;

  // 枯墨 & 觉醒
  isKumoMode: boolean;
  awakenedIds: Set<string>;

  // 点染特效队列 (每个正在播放特效的节点)
  awakeningEvents: AwakeningEvent[];

  // Actions
  focusNode: (nodeId: string) => void;
  blurNode: () => void;
  awakenNode: (nodeId: string) => void;
  clearAwakeningEvent: (nodeId: string) => void;
  setPanelAnim: (anim: "enter" | "exit" | null) => void;
  getFocusedNode: () => IdiomNode | null;
}

export const useUniverseStore = create<UniverseStore>((set, get) => ({
  focusedNodeId: null,
  panelOpen: false,
  panelAnim: null,
  isKumoMode: true,
  awakenedIds: new Set<string>(),
  awakeningEvents: [],

  focusNode: (nodeId) => {
    set({
      focusedNodeId: nodeId,
      panelOpen: true,
      panelAnim: "enter",
    });
  },

  blurNode: () => {
    set({ panelAnim: "exit" });
    setTimeout(() => {
      set({
        focusedNodeId: null,
        panelOpen: false,
        panelAnim: null,
      });
    }, 650);
  },

  awakenNode: (nodeId) => {
    const state = get();

    // 已经觉醒过了，不重复触发
    if (state.awakenedIds.has(nodeId)) return;

    const node = IDIOM_NODES.find((n) => n.id === nodeId);
    if (!node) return;

    const newAwakened = new Set(state.awakenedIds);
    newAwakened.add(nodeId);

    // 创建点染事件
    const event: AwakeningEvent = {
      nodeId,
      position: [...node.position] as [number, number, number],
      timestamp: performance.now(),
    };

    set({
      awakenedIds: newAwakened,
      // 首次觉醒 → 解除枯墨
      isKumoMode: false,
      awakeningEvents: [...state.awakeningEvents, event],
    });

    // 3 秒后自动清除特效事件
    setTimeout(() => {
      get().clearAwakeningEvent(nodeId);
    }, 3500);
  },

  clearAwakeningEvent: (nodeId) => {
    set((state) => ({
      awakeningEvents: state.awakeningEvents.filter(
        (e) => e.nodeId !== nodeId,
      ),
    }));
  },

  setPanelAnim: (anim) => set({ panelAnim: anim }),

  getFocusedNode: () => {
    const id = get().focusedNodeId;
    if (!id) return null;
    return IDIOM_NODES.find((n) => n.id === id) ?? null;
  },
}));
