/* ============================================
   AwakeningEffect.tsx — 点染粒子爆炸
   使用 PointsMaterial（内置，非自定义Shader），稳定可靠
   ============================================ */

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useUniverseStore } from "../store/useUniverseStore";

function Burst({ event }: { event: { nodeId: string; position: [number, number, number]; timestamp: number } }) {
  const pointsRef = useRef<THREE.Points>(null);
  const birthTime = useRef(event.timestamp / 1000);

  const { positions, colors, sizes } = useMemo(() => {
    const count = 100;
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    const siz = new Float32Array(count);

    const vermilion = new THREE.Color("#c0403b");
    const gold = new THREE.Color("#c9a96e");
    const white = new THREE.Color("#ffe8d0");

    for (let i = 0; i < count; i++) {
      // 球形均匀分布方向
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = 0.15 + Math.random() * 0.1;
      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = r * Math.cos(phi);

      // 颜色渐变
      const mixColor = vermilion.clone().lerp(gold, Math.random()).lerp(white, Math.random() * 0.4);
      col[i * 3] = mixColor.r;
      col[i * 3 + 1] = mixColor.g;
      col[i * 3 + 2] = mixColor.b;

      siz[i] = 0.02 + Math.random() * 0.05;
    }
    return { positions: pos, colors: col, sizes: siz };
  }, []);

  useFrame((_, delta) => {
    if (!pointsRef.current) return;
    const elapsed = performance.now() / 1000 - birthTime.current;
    const progress = Math.min(elapsed / 2.5, 1.0);

    // 扩散
    const s = 0.3 + progress * 3.0;
    pointsRef.current.scale.setScalar(s);

    // 透明度衰减
    const mat = pointsRef.current.material as THREE.PointsMaterial;
    mat.opacity = progress < 0.3 ? 1.0 : 1.0 - (progress - 0.3) / 0.7;
  });

  return (
    <points ref={pointsRef} position={event.position}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={100} array={positions} itemSize={3} />
        <bufferAttribute attach="attributes-color" count={100} array={colors} itemSize={3} />
        <bufferAttribute attach="attributes-size" count={100} array={sizes} itemSize={1} />
      </bufferGeometry>
      <pointsMaterial
        size={0.04}
        vertexColors
        transparent
        opacity={1}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

function ShockRing({ event }: { event: { nodeId: string; position: [number, number, number]; timestamp: number } }) {
  const ringRef = useRef<THREE.Mesh>(null);
  const birthTime = useRef(event.timestamp / 1000);

  useFrame(() => {
    if (!ringRef.current) return;
    const elapsed = performance.now() / 1000 - birthTime.current;
    const progress = Math.min(elapsed / 2.0, 1.0);
    const scale = 0.2 + progress * 4.0;
    ringRef.current.scale.setScalar(scale);
    const mat = ringRef.current.material as THREE.MeshBasicMaterial;
    mat.opacity = 0.5 * (1 - progress);
  });

  return (
    <mesh ref={ringRef} position={event.position}>
      <ringGeometry args={[0.13, 0.16, 48]} />
      <meshBasicMaterial color="#c9a96e" transparent opacity={0.5} depthWrite={false} side={THREE.DoubleSide} />
    </mesh>
  );
}

export default function AwakeningEffect() {
  const events = useUniverseStore((s) => s.awakeningEvents);
  if (events.length === 0) return null;

  return (
    <group>
      {events.map((ev) => (
        <group key={ev.nodeId}>
          <Burst event={ev} />
          <ShockRing event={ev} />
        </group>
      ))}
    </group>
  );
}
