/* ============================================
   成语星空 (Idiom Universe) — 核心类型定义
   ============================================ */

// ---- 五大东方星系 ----
export enum GalaxyCategory {
  /** 历史典故 — 玄青与黛蓝 */
  HISTORY = "history",
  /** 神话传说 — 朱砂与赤金 */
  MYTHOLOGY = "mythology",
  /** 自然风物 — 石绿与花青 */
  NATURE = "nature",
  /** 为人处世 — 缃叶与茶白 */
  PHILOSOPHY = "philosophy",
  /** 情感心理 — 胭脂与丁香 */
  EMOTION = "emotion",
  /** 动物喻理 — 墨绿与铜褐 */
  ANIMAL = "animal",
  /** 综合其他 — 霁蓝与月白 */
  COMPREHENSIVE = "comprehensive",
  /** 数字量化 — 绛紫与银灰 */
  NUMBERS = "numbers",
}

// ---- 每个星系绑定的色彩配置 ----
export interface GalaxyColors {
  primary: string;   // 主色 (用于星球主体)
  secondary: string; // 辅色 (用于光晕、连线)
  name: string;      // 中文名
  description: string;
}

export const GALAXY_COLOR_MAP: Record<GalaxyCategory, GalaxyColors> = {
  [GalaxyCategory.HISTORY]: {
    primary: "#2b3c4e",
    secondary: "#3b5f8a",
    name: "玄青与黛蓝",
    description: "如历史长河般深邃厚重",
  },
  [GalaxyCategory.MYTHOLOGY]: {
    primary: "#c0403b",
    secondary: "#c98b3a",
    name: "朱砂与赤金",
    description: "如远古神明般神秘辉煌",
  },
  [GalaxyCategory.NATURE]: {
    primary: "#4a7c59",
    secondary: "#5b8c7a",
    name: "石绿与花青",
    description: "如千里江山图般生机空灵",
  },
  [GalaxyCategory.PHILOSOPHY]: {
    primary: "#c4a44a",
    secondary: "#d9cbb0",
    name: "缃叶与茶白",
    description: "温润如秋叶，淡雅如茶沫",
  },
  [GalaxyCategory.EMOTION]: {
    primary: "#9b4e6b",
    secondary: "#8b7da0",
    name: "胭脂与丁香",
    description: "细腻如胭脂，幽远如丁香",
  },
  [GalaxyCategory.ANIMAL]: {
    primary: "#3c5e4b",
    secondary: "#8b7355",
    name: "墨绿与铜褐",
    description: "如深山密林般生机暗涌",
  },
  [GalaxyCategory.COMPREHENSIVE]: {
    primary: "#4a6076",
    secondary: "#b8c5d6",
    name: "霁蓝与月白",
    description: "如雨过天青般包罗万象",
  },
  [GalaxyCategory.NUMBERS]: {
    primary: "#6b3a7a",
    secondary: "#a8a8b0",
    name: "绛紫与银灰",
    description: "如星象算术般精密有序",
  },
};

// ---- 节点视觉类型 ----
export enum NodeVisualType {
  /** 温润和田玉 (Jade SSS) */
  JADE = "jade",
  /** 剔透古琉璃 (Ancient Glaze) */
  GLAZE = "glaze",
  /** 金丝榫卯/竹编 (Gold/Bamboo Wireframe) */
  GOLD_WIRE = "gold_wire",
  /** 水墨粒子星云 (Ink Wash Nebula) */
  INK_NEBULA = "ink_nebula",
}

// ---- 节点觉醒状态 ----
export enum AwakeningState {
  /** 枯墨 — 未领悟 */
  DORMANT = "dormant",
  /** 点染中 — 正在播放特效 */
  AWAKENING = "awakening",
  /** 已领悟 — 流光溢彩 */
  AWAKENED = "awakened",
}

// ---- 单个成语节点 ----
export interface IdiomNode {
  /** 唯一标识 */
  id: string;
  /** 成语文本，如 "画龙点睛" */
  text: string;
  /** 拼音 */
  pinyin: string;
  /** 释义 */
  definition: string;
  /** 典故/出处故事 */
  story: string;
  /** 所属星系 */
  galaxy: GalaxyCategory;
  /** 视觉表现类型 */
  visualType: NodeVisualType;
  /** 在 3D 空间中的位置 [x, y, z] */
  position: [number, number, number];
  /** 觉醒状态 */
  awakening: AwakeningState;
  /** 组成的汉字集合 (用于飞花令匹配) */
  characters: string[];
}

// ---- 星轨连线 (飞花令逻辑) ----
export interface StarConnection {
  /** 连线唯一标识 */
  id: string;
  /** 源节点 ID */
  sourceId: string;
  /** 目标节点 ID */
  targetId: string;
  /** 共同汉字（飞花令依据） */
  sharedCharacter: string;
}

// ---- 应用全局状态 ----
export interface UniverseState {
  /** 所有成语节点 */
  nodes: IdiomNode[];
  /** 所有连线 */
  connections: StarConnection[];
  /** 当前聚焦的节点 ID (null = 全景) */
  focusedNodeId: string | null;
  /** 全局枯墨模式 */
  isKumoMode: boolean;
  /** 已觉醒的节点 ID 集合 */
  awakenedNodeIds: Set<string>;
}

// ---- 相机动画配置 ----
export interface CameraTransition {
  /** 目标位置 */
  targetPosition: [number, number, number];
  /** 目标焦点 */
  targetLookAt: [number, number, number];
  /** 动画持续时间 (秒) */
  duration: number;
  /** 缓动函数名 */
  ease: string;
}
