/* ============================================
   Universe.tsx — 成语星空 · 稳定版
   粒子光环 + 星轨 + 基础交互
   ============================================ */

import { useRef, useState, useMemo, useEffect } from "react";
import { Canvas, useThree, useFrame } from "@react-three/fiber";
import { OrbitControls, Text, Line } from "@react-three/drei";
import * as THREE from "three";
import { IDIOM_NODES, STAR_CONNECTIONS } from "../data/idioms";
import { GALAXY_COLOR_MAP } from "../types/idiom";
import type { IdiomNode } from "../types/idiom";
import { useUniverseStore } from "../store/useUniverseStore";
import PlanetMaterial from "./PlanetMaterial";
import UniverseBackground from "./UniverseBackground";
import AwakeningEffect from "./AwakeningEffect";

// ═══════════════════════════════════════
// 交叉环子组件 (独立旋转)
// ═══════════════════════════════════════
function CrossRing({ ringData, rx, ry, opacity, size, color, speed }: {
  ringData: Float32Array; rx: number; ry: number; opacity: number; size: number; color: string; speed: number;
}) {
  const ref = useRef<THREE.Group>(null);
  useFrame((_, d) => { if (ref.current) ref.current.rotation.z += d * speed; });
  return (
    <group ref={ref} rotation={[rx, ry, 0]}>
      <points>
        <bufferGeometry><bufferAttribute attach="attributes-position" count={150} array={ringData} itemSize={3} /></bufferGeometry>
        <pointsMaterial size={size} color={color} transparent opacity={opacity} depthWrite={false} blending={THREE.AdditiveBlending} />
      </points>
    </group>
  );
}

// ═══════════════════════════════════════
// 宇宙核心柔光 — 呼吸脉冲
// ═══════════════════════════════════════
function CoreGlow() {
  const ref = useRef<THREE.Mesh>(null);
  const timeRef = useRef(0);
  useFrame((_, d) => {
    if (!ref.current) return;
    timeRef.current += d;
    const mat = ref.current.material as THREE.MeshBasicMaterial;
    mat.opacity = 0.025 + Math.sin(timeRef.current * 0.35) * 0.008;
  });
  return (
    <mesh ref={ref}>
      <sphereGeometry args={[2.5, 32, 32]} />
      <meshBasicMaterial color="#4466aa" transparent opacity={0.025} depthWrite={false} />
    </mesh>
  );
}

// ═══════════════════════════════════════
// 星系光环 — 全粒子 · 多维度 (增强版)
// ═══════════════════════════════════════
function GalaxyRing({ position, color, radius, label }: { position: [number, number, number]; color: string; radius: number; label?: string }) {
  const ringRef = useRef<THREE.Group>(null);
  const ringRef2 = useRef<THREE.Group>(null); // 外层慢转
  const ringRef3 = useRef<THREE.Group>(null); // 极环
  const discRef = useRef<THREE.Mesh>(null);
  const c = new THREE.Color(color);

  function genRing(count: number, rMin: number, rMax: number, yS: number): Float32Array {
    const p = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const a = Math.random() * Math.PI * 2;
      const r = rMin + Math.random() * (rMax - rMin);
      p[i * 3] = Math.cos(a) * r;
      p[i * 3 + 1] = (Math.random() - 0.5) * yS;
      p[i * 3 + 2] = Math.sin(a) * r;
    }
    return p;
  }

  // 原有环
  const innerCore  = useMemo(() => genRing(600, radius - 0.25, radius + 0.05, 0.04), [radius]);
  const midBand    = useMemo(() => genRing(400, radius - 0.10, radius + 0.35, 0.10), [radius]);
  const outerDust  = useMemo(() => genRing(500, radius + 0.15, radius + 0.65, 0.20), [radius]);
  const halo       = useMemo(() => genRing(200, radius - 0.40, radius + 0.80, 0.30), [radius]);
  const ringData   = useMemo(() => genRing(150, radius - 0.10, radius + 0.20, 0.05), [radius]);
  // 新增环
  const ultraOuter = useMemo(() => genRing(300, radius + 0.50, radius + 1.00, 0.35), [radius]);
  const tightBright= useMemo(() => genRing(350, radius + 0.02, radius + 0.15, 0.03), [radius]);
  const sparseHalo = useMemo(() => genRing(100, radius - 0.60, radius + 1.10, 0.50), [radius]);
  const polarRing  = useMemo(() => genRing(200, radius - 0.20, radius + 0.30, 0.04), [radius]);

  const bright = `#${c.clone().multiplyScalar(1.5).getHexString()}`;
  const base = color;
  const dim = `#${c.clone().multiplyScalar(0.55).getHexString()}`;
  const warm = `#${c.clone().lerp(new THREE.Color('#ffd700'), 0.3).getHexString()}`;
  const cool = `#${c.clone().lerp(new THREE.Color('#88ccff'), 0.25).getHexString()}`;

  // 原有交叉环
  const crossDefs = useMemo(() => [
    { rx: Math.PI * 0.15, ry: 0,            o: 0.28, s: 0.014, sp: 0.15 },
    { rx: Math.PI * 0.30, ry: Math.PI * 0.1, o: 0.22, s: 0.012, sp: -0.12 },
    { rx: Math.PI * 0.45, ry: 0,            o: 0.18, s: 0.011, sp: 0.18 },
    { rx: Math.PI * 0.55, ry: Math.PI * 0.2, o: 0.14, s: 0.010, sp: -0.14 },
    { rx: Math.PI * 0.70, ry: 0,            o: 0.10, s: 0.009, sp: 0.20 },
    { rx: Math.PI * 0.85, ry: Math.PI * 0.15, o: 0.08, s: 0.008, sp: -0.16 },
  ], []);
  // 新增交叉环 (用 brighter 粒子)
  const crossDefs2 = useMemo(() => [
    { rx: Math.PI * 0.10, ry: Math.PI * 0.4, o: 0.20, s: 0.016, sp: 0.22 },
    { rx: Math.PI * 0.40, ry: Math.PI * 0.5, o: 0.16, s: 0.013, sp: -0.18 },
    { rx: Math.PI * 0.60, ry: Math.PI * 0.3, o: 0.12, s: 0.011, sp: 0.25 },
    { rx: Math.PI * 0.80, ry: Math.PI * 0.35,o: 0.09, s: 0.010, sp: -0.20 },
  ], []);

  const breatheRef = useRef(0);
  useFrame((_, d) => {
    if (!ringRef.current) return;
    ringRef.current.rotation.y += d * 0.04;
    if (ringRef2.current) ringRef2.current.rotation.y -= d * 0.025;
    if (ringRef3.current) { ringRef3.current.rotation.x += d * 0.06; ringRef3.current.rotation.z += d * 0.04; }
    breatheRef.current += d;
    const breathe = Math.sin(breatheRef.current * 0.5);
    ringRef.current.scale.setScalar(1 + breathe * 0.015);
    if (discRef.current) {
      (discRef.current.material as THREE.MeshBasicMaterial).opacity = 0.025 + breathe * 0.008;
    }
  });

  return (
    <>
      {/* 星云底光 — 极淡色盘，衬托星系 */}
      <mesh ref={discRef} position={position} rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[radius - 0.6, radius + 1.5, 64]} />
        <meshBasicMaterial color={color} transparent opacity={0.025} depthWrite={false} side={THREE.DoubleSide} />
      </mesh>

      {/* 主环组 (慢转) */}
      <group ref={ringRef} position={position} rotation={[Math.PI / 2.3, 0.12, 0.08]}>
        {/* 密集内环 */}
        <points>
          <bufferGeometry><bufferAttribute attach="attributes-position" count={600} array={innerCore} itemSize={3} /></bufferGeometry>
          <pointsMaterial size={0.018} color={bright} transparent opacity={0.7} depthWrite={false} blending={THREE.AdditiveBlending} />
        </points>
        {/* 紧致亮环 */}
        <points>
          <bufferGeometry><bufferAttribute attach="attributes-position" count={350} array={tightBright} itemSize={3} /></bufferGeometry>
          <pointsMaterial size={0.012} color={warm} transparent opacity={0.55} depthWrite={false} blending={THREE.AdditiveBlending} />
        </points>
        {/* 中层 */}
        <points>
          <bufferGeometry><bufferAttribute attach="attributes-position" count={400} array={midBand} itemSize={3} /></bufferGeometry>
          <pointsMaterial size={0.028} color={base} transparent opacity={0.5} depthWrite={false} blending={THREE.AdditiveBlending} />
        </points>
        {/* 外层尘埃 */}
        <points>
          <bufferGeometry><bufferAttribute attach="attributes-position" count={500} array={outerDust} itemSize={3} /></bufferGeometry>
          <pointsMaterial size={0.040} color={dim} transparent opacity={0.3} depthWrite={false} blending={THREE.AdditiveBlending} />
        </points>
        {/* 超外环 */}
        <points>
          <bufferGeometry><bufferAttribute attach="attributes-position" count={300} array={ultraOuter} itemSize={3} /></bufferGeometry>
          <pointsMaterial size={0.055} color={cool} transparent opacity={0.18} depthWrite={false} blending={THREE.AdditiveBlending} />
        </points>
        {/* 光晕 */}
        <points>
          <bufferGeometry><bufferAttribute attach="attributes-position" count={200} array={halo} itemSize={3} /></bufferGeometry>
          <pointsMaterial size={0.060} color={dim} transparent opacity={0.12} depthWrite={false} blending={THREE.AdditiveBlending} />
        </points>
        {/* 稀疏光晕 */}
        <points>
          <bufferGeometry><bufferAttribute attach="attributes-position" count={100} array={sparseHalo} itemSize={3} /></bufferGeometry>
          <pointsMaterial size={0.080} color={warm} transparent opacity={0.08} depthWrite={false} blending={THREE.AdditiveBlending} />
        </points>
        {/* 交叉环 6 个 */}
        {crossDefs.map(({ rx, ry, o, s, sp }, i) => (
          <CrossRing key={i} ringData={ringData} rx={rx} ry={ry} opacity={o} size={s} color={bright} speed={sp} />
        ))}
      </group>

      {/* 第二环组 (反向旋转，不同角度) */}
      <group ref={ringRef2} position={position} rotation={[Math.PI / 3.5, -0.3, 0.15]}>
        {crossDefs2.map(({ rx, ry, o, s, sp }, i) => (
          <CrossRing key={`c2-${i}`} ringData={ultraOuter} rx={rx} ry={ry} opacity={o} size={s} color={cool} speed={sp} />
        ))}
      </group>

      {/* 极环 (垂直方向) */}
      <group ref={ringRef3} position={position} rotation={[0, 0, Math.PI / 2]}>
        <points>
          <bufferGeometry><bufferAttribute attach="attributes-position" count={200} array={polarRing} itemSize={3} /></bufferGeometry>
          <pointsMaterial size={0.022} color={bright} transparent opacity={0.3} depthWrite={false} blending={THREE.AdditiveBlending} />
        </points>
      </group>

      {/* 星系名牌 */}
      {label && (
        <Text position={[position[0], position[1] + 1.0, position[2]]}
          fontSize={0.25} color={base} anchorX="center" anchorY="middle"
          outlineWidth={0.015} outlineColor="#000008">
          {label}
        </Text>
      )}
    </>
  );
}

// ═══════════════════════════════════════
// 环境浮尘 — 散布于星系之间
// ═══════════════════════════════════════
function AmbientDust() {
  const ref = useRef<THREE.Points>(null);
  const data = useMemo(() => {
    const count = 300;
    const pos = new Float32Array(count * 3);
    const siz = new Float32Array(count);
    // 散布在半径 3~16 的球形区域
    for (let i = 0; i < count; i++) {
      const th = Math.random() * Math.PI * 2;
      const ph = Math.acos(2 * Math.random() - 1);
      const r = 3 + Math.random() * 14;
      pos[i * 3] = r * Math.sin(ph) * Math.cos(th);
      pos[i * 3 + 1] = r * Math.sin(ph) * Math.sin(th);
      pos[i * 3 + 2] = r * Math.cos(ph);
      siz[i] = 0.02 + Math.random() * 0.06;
    }
    return { pos, siz };
  }, []);

  useFrame((_, d) => {
    if (ref.current) ref.current.rotation.y += d * 0.03;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={300} array={data.pos} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial
        size={0.05} color="#8899cc" transparent opacity={0.15}
        depthWrite={false} blending={THREE.AdditiveBlending} />
    </points>
  );
}

// ═══════════════════════════════════════
// 星轨连线 (飞花令) — 悬停高亮
// ═══════════════════════════════════════
function StarTrails({ hoveredId }: { hoveredId: string | null }) {
  const lines = useMemo(() => {
    return STAR_CONNECTIONS.sort(() => Math.random() - 0.5).slice(0, 50).map((conn) => {
      const src = IDIOM_NODES.find((n) => n.id === conn.sourceId);
      const tgt = IDIOM_NODES.find((n) => n.id === conn.targetId);
      if (!src || !tgt) return null;
      const s = new THREE.Vector3(...src.position);
      const e = new THREE.Vector3(...tgt.position);
      const mid = new THREE.Vector3().addVectors(s, e).multiplyScalar(0.5);
      mid.y += s.distanceTo(e) * 0.18;
      const pts: THREE.Vector3[] = [];
      for (let i = 0; i <= 12; i++) {
        const t = i / 12;
        pts.push(
          new THREE.Vector3()
            .addScaledVector(s, (1 - t) ** 2)
            .addScaledVector(mid, 2 * (1 - t) * t)
            .addScaledVector(e, t * t),
        );
      }
      return { id: conn.id, sourceId: conn.sourceId, targetId: conn.targetId, pts };
    }).filter(Boolean) as { id: string; sourceId: string; targetId: string; pts: THREE.Vector3[] }[];
  }, []);

  return (
    <group>
      {lines.map(({ id, sourceId, targetId, pts }) => {
        const active = hoveredId === sourceId || hoveredId === targetId;
        return (
          <Line key={id} points={pts}
            color={active ? "#d4c8a8" : "#2a2540"}
            lineWidth={active ? 0.5 : 0.2}
            transparent opacity={active ? 0.45 : 0.12} depthWrite={false} />
        );
      })}
    </group>
  );
}

// ═══════════════════════════════════════
// 悬停粒子爆发 (轻量版，~30 粒子)
// ═══════════════════════════════════════
function HoverBurst({ active, position, color }: { active: boolean; position: [number, number, number]; color: string }) {
  const pointsRef = useRef<THREE.Points>(null);
  const burstTimeRef = useRef(0);
  const [visible, setVisible] = useState(false);

  const { positions, colors } = useMemo(() => {
    const count = 30;
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    const base = new THREE.Color(color);
    const bright = new THREE.Color("#ffe8d0");

    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = 0.08 + Math.random() * 0.06;
      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = r * Math.cos(phi);
      const mix = base.clone().lerp(bright, Math.random() * 0.5);
      col[i * 3] = mix.r;
      col[i * 3 + 1] = mix.g;
      col[i * 3 + 2] = mix.b;
    }
    return { positions: pos, colors: col };
  }, [color]);

  useEffect(() => {
    if (active) {
      burstTimeRef.current = performance.now() / 1000;
      setVisible(true);
    } else {
      // 延迟隐藏，让粒子有时间消散
      const t = setTimeout(() => setVisible(false), 1500);
      return () => clearTimeout(t);
    }
  }, [active]);

  useFrame(() => {
    if (!pointsRef.current || !visible) return;
    const elapsed = performance.now() / 1000 - burstTimeRef.current;
    const progress = Math.min(elapsed / 1.2, 1.0);
    const s = 0.2 + progress * 1.5;
    pointsRef.current.scale.setScalar(s);
    const mat = pointsRef.current.material as THREE.PointsMaterial;
    mat.opacity = progress < 0.2 ? 1.0 : 1.0 - (progress - 0.2) / 0.8;
    // 动画结束自动隐藏
    if (progress >= 1.0) setVisible(false);
  });

  if (!visible) return null;
  return (
    <points ref={pointsRef} position={position}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={30} array={positions} itemSize={3} />
        <bufferAttribute attach="attributes-color" count={30} array={colors} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial
        size={0.04}
        vertexColors
        transparent
        opacity={0}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

// ═══════════════════════════════════════
// 成语星球 (hover 放大 + 粒子爆发)
// ═══════════════════════════════════════
function IdiomSphere({ node, onHover }: { node: IdiomNode; onHover: (id: string | null) => void }) {
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  const [awake, setAwake] = useState(false);
  const focusNode = useUniverseStore((s) => s.focusNode);
  const awakenNode = useUniverseStore((s) => s.awakenNode);
  useEffect(() => {
    if (!awake) return;
    const t = setTimeout(() => setAwake(false), 3500);
    return () => clearTimeout(t);
  }, [awake]);

  const rotSpeed = useMemo(() => {
    let h = 0;
    for (let i = 0; i < node.id.length; i++) h = (h * 31 + node.id.charCodeAt(i)) & 0xffff;
    return 0.03 + (h % 80) * 0.001;
  }, [node.id]);

  const floatPhase = useMemo(() => {
    let h = 0;
    for (let i = 0; i < node.text.length; i++) h = (h * 31 + node.text.charCodeAt(i)) & 0xffff;
    return (h % 1000) / 1000 * Math.PI * 2;
  }, [node.text]);

  const colors = GALAXY_COLOR_MAP[node.galaxy];
  const baseY = node.position[1];

  const handleClick = () => {
    awakenNode(node.id);
    setAwake(true);
    focusNode(node.id);
  };

  useFrame((_, d) => {
    if (!groupRef.current) return;
    groupRef.current.rotation.y += d * rotSpeed;
    const floatY = Math.sin(Date.now() * 0.0008 + floatPhase) * 0.06;
    groupRef.current.position.y = baseY + floatY;
    const target = (hovered || awake) ? 1.4 : 1.0;
    groupRef.current.scale.lerp(
      new THREE.Vector3(target, target, target), 0.12
    );
  });

  const showText = hovered || awake;

  return (
    <group ref={groupRef} position={[node.position[0], baseY, node.position[2]]}
      onPointerOver={(e) => { e.stopPropagation(); setHovered(true); onHover(node.id); }}
      onPointerOut={() => { setHovered(false); onHover(null); }}
      onClick={handleClick}
    >
      <PlanetMaterial type={node.visualType} color={colors.primary}
        secondaryColor={colors.secondary} hovered={hovered} isAwake={hovered || awake} />
      <PlanetHalo hovered={hovered} color={colors.secondary} />
      <HoverBurst active={hovered} position={[0, 0, 0]} color={colors.secondary} />
      {showText && (
        <Text position={[0, 0.20, 0]} fontSize={0.10} color={colors.secondary}
          anchorX="center" anchorY="middle" depthTest={true}
          font="/fonts/SimHei.ttf"
          outlineWidth={0.008} outlineColor="#000008">
          {node.text}
        </Text>
      )}
    </group>
  );
}

// 电子粒子环 (PlanetHalo 子组件)
function ElectronRing({ radius, speed, count, tilt, color }: {
  radius: number; speed: number; count: number; tilt: [number, number, number]; color: string;
}) {
  const ref = useRef<THREE.Group>(null);
  const dots = useMemo(() => Array.from({ length: count }, (_, i) => ({
    angle: (i / count) * Math.PI * 2,
  })), [count]);
  useFrame((_, d) => { if (ref.current) ref.current.rotation.z += d * speed; });
  return (
    <group ref={ref} rotation={tilt}>
      {dots.map((d, i) => (
        <mesh key={i} position={[Math.cos(d.angle) * radius, 0, Math.sin(d.angle) * radius]}>
          <sphereGeometry args={[0.01, 4, 4]} />
          <meshBasicMaterial color={color} transparent opacity={0.55} depthWrite={false} blending={THREE.AdditiveBlending} />
        </mesh>
      ))}
    </group>
  );
}

// PlanetHalo — 悬停轨道环（hooks 必须在条件返回之前）
function PlanetHalo({ hovered, color }: { hovered: boolean; color: string }) {
  const ref = useRef<THREE.Group>(null);
  useFrame((_, d) => {
    if (ref.current && hovered) { ref.current.rotation.z += d * 0.3; ref.current.rotation.y += d * 0.08; }
  });
  if (!hovered) return null;
  return (
    <>
      <group ref={ref}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.17, 0.006, 8, 40]} />
          <meshBasicMaterial color={color} transparent opacity={0.45} depthWrite={false} blending={THREE.AdditiveBlending} />
        </mesh>
        <mesh rotation={[Math.PI / 2.5, 0.3, 0]}>
          <torusGeometry args={[0.20, 0.004, 8, 32]} />
          <meshBasicMaterial color="#ffd700" transparent opacity={0.25} depthWrite={false} blending={THREE.AdditiveBlending} />
        </mesh>
      </group>
      <ElectronRing radius={0.17} speed={1.2} count={5} tilt={[0, 0, 0]} color={color} />
      <ElectronRing radius={0.19} speed={-0.9} count={5} tilt={[Math.PI / 3, 0, Math.PI / 4]} color={color} />
      <ElectronRing radius={0.18} speed={1.5} count={4} tilt={[Math.PI / 4, Math.PI / 3, 0]} color={color} />
    </>
  );
}

// CameraAnimation — Prompt 8: 幽灵坐标 lerp + camera.lookAt
function CameraAnimator() {
  const { camera } = useThree();
  const ctrlRef = useRef<any>(null);
  const focusedNodeId = useUniverseStore((s) => s.focusedNodeId);
  const panelAnim = useUniverseStore((s) => s.panelAnim);

  // 幽灵坐标：平滑 lerp 追踪目标位置
  const ghostPos = useRef(new THREE.Vector3(0, 0, 0));
  // 目标坐标：focusNode 更新时写入
  const targetPos = useRef(new THREE.Vector3(0, 0, 0));
  // 是否正在运镜中
  const isTransitioning = useRef(false);

  // focusNode 变化 → 更新目标坐标
  useEffect(() => {
    const ctrl = ctrlRef.current; if (!ctrl) return;
    if (focusedNodeId && panelAnim === "enter") {
      const node = IDIOM_NODES.find((n) => n.id === focusedNodeId);
      if (!node) return;
      targetPos.current.set(...node.position);
      isTransitioning.current = true;
      ctrl.autoRotate = false;
    } else if (!focusedNodeId && panelAnim === "exit") {
      targetPos.current.set(0, 0, 0);
      isTransitioning.current = true;
    }
  }, [focusedNodeId, panelAnim]);

  useFrame((_, delta) => {
    const ctrl = ctrlRef.current;
    // 限制 delta 防止跳帧
    const dt = Math.min(delta, 0.1);
    // 幽灵坐标 lerp 追向目标
    ghostPos.current.lerp(targetPos.current, dt * 2.5);

    if (focusedNodeId && isTransitioning.current) {
      // 聚焦模式：相机跟随幽灵 + Z轴偏置防穿模
      const offset = new THREE.Vector3(1.0, 0.6, 3.5);
      camera.position.copy(ghostPos.current).add(offset);
      camera.lookAt(ghostPos.current);
      // 同步 OrbitControls 的 target，防止退出时跳变
      if (ctrl) ctrl.target.copy(ghostPos.current);

      // 接近目标 → 运镜结束
      if (ghostPos.current.distanceTo(targetPos.current) < 0.05) {
        isTransitioning.current = false;
      }
    } else if (!focusedNodeId && isTransitioning.current) {
      // 退出聚焦：相机 lerp 回默认全景位
      const home = new THREE.Vector3(0, 0, 18);
      camera.position.lerp(home, dt * 1.8);
      camera.lookAt(ghostPos.current);
      if (ctrl) ctrl.target.copy(ghostPos.current);

      // 接近原点 → 运镜结束，恢复自动旋转
      if (camera.position.distanceTo(home) < 0.15) {
        isTransitioning.current = false;
        if (ctrl) ctrl.autoRotate = true;
      }
    }
  });

  return <OrbitControls ref={(c: any) => { ctrlRef.current = c; }}
    autoRotate autoRotateSpeed={0.2} enableZoom minDistance={5} maxDistance={35}
    dampingFactor={0.08} target={[0, 0, 0]} />;
}

// ═══════════════════════════════════════
// 场景
// ═══════════════════════════════════════
function Scene() {
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const blurNode = useUniverseStore((s) => s.blurNode);

  return (
    <group onPointerMissed={() => blurNode()}>
      <UniverseBackground />
      <ambientLight intensity={0.35} color="#1a2a4a" />
      <directionalLight position={[10, 8, 5]} intensity={0.8} color="#d4c8a8" />
      <directionalLight position={[-5, -3, -8]} intensity={0.25} color="#3a4a6a" />
      <hemisphereLight args={["#2a3a5a", "#0a0a14", 0.25]} />

      <CoreGlow />

      <GalaxyRing position={[0, 0.3, 0]} color="#3b5f8a" radius={9} label="史海钩沉" />
      <GalaxyRing position={[0.4, -0.2, 0.4]} color="#c0603b" radius={13} label="神话传说" />
      <GalaxyRing position={[-0.3, -0.8, -0.3]} color="#5b8c7a" radius={11} label="自然风物" />
      <GalaxyRing position={[0.6, 0.1, -0.4]} color="#c9a44a" radius={10} label="为人处世" />
      <GalaxyRing position={[-0.4, -0.4, 0.3]} color="#8b6da0" radius={7} label="情感心理" />

      {/* 额外星环 — 丰富层次 */}
      <GalaxyRing position={[0.2, -0.9, 0.8]} color="#4a6a8a" radius={6.2} />
      <GalaxyRing position={[-0.7, 0.6, -0.6]} color="#7a5a6a" radius={8.5} />
      <GalaxyRing position={[0.9, 0.4, 0.7]} color="#6a7a5a" radius={5.5} />

      <AmbientDust />

      {/* 星系色点光源 */}
      <pointLight position={[0, 1.5, 0]} color="#3b5f8a" intensity={2.5} distance={10} decay={2} />
      <pointLight position={[0.4, 1.0, 0.4]} color="#c0603b" intensity={2.5} distance={14} decay={2} />
      <pointLight position={[-0.3, 0.5, -0.3]} color="#5b8c7a" intensity={2.5} distance={12} decay={2} />
      <pointLight position={[0.6, 1.2, -0.4]} color="#c9a44a" intensity={2.5} distance={11} decay={2} />
      <pointLight position={[-0.4, 0.8, 0.3]} color="#8b6da0" intensity={2.5} distance={8} decay={2} />

      <StarTrails hoveredId={hoveredNodeId} />

      {IDIOM_NODES.map((node) => (
        <IdiomSphere key={node.id} node={node} onHover={setHoveredNodeId} />
      ))}

      <AwakeningEffect />

      <CameraAnimator />
    </group>
  );
}

export default function Universe() {
  return (
    <Canvas camera={{ position: [0, 0, 18], fov: 60, near: 0.1, far: 120 }}
      dpr={[1, 1.5]}
      style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh" }}>
      <Scene />
    </Canvas>
  );
}
