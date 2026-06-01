/* ============================================
   PlanetMaterial — 虹彩琉璃星球
   iridescence · transmission · emissive glow
   ============================================ */

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { NodeVisualType } from "../types/idiom";

interface Props { type: NodeVisualType; color: string; secondaryColor: string; hovered: boolean; isAwake: boolean; }

// ═══════════════════════════════════════
// 性能分级：dormant(无transmission) / hovered(中等) / awake(全效)
// ═══════════════════════════════════════

// 和田玉：温润透射 + 珍珠虹彩
function JadeMaterial({ color, secondaryColor, hovered, isAwake }: Props) {
  const active = isAwake || hovered;
  const ei = isAwake ? 0.7 : hovered ? 0.5 : 0.35;
  const segs = active ? 48 : 20;
  return (
    <>
      <mesh>
        <sphereGeometry args={[0.12, segs, segs]} />
        <meshPhysicalMaterial
          transmission={active ? 0.9 : 0}
          metalness={0.12} roughness={active ? 0.04 : 0.25}
          ior={1.5} thickness={2.0}
          iridescence={active ? 0.9 : 0.4} iridescenceIOR={1.25} iridescenceThicknessRange={[100, 350]}
          clearcoat={active ? 0.9 : 0.2} clearcoatRoughness={0.08}
          emissive={secondaryColor} emissiveIntensity={ei}
          color={color} specularIntensity={0.25}
        />
      </mesh>
      <GlowOverlay glowColor={secondaryColor}
        radius={isAwake ? 0.19 : hovered ? 0.17 : 0.15}
        opacity={isAwake ? 0.40 : hovered ? 0.25 : 0.15} />
    </>
  );
}

// 古琉璃：高折射 + 强虹彩
function GlazeMaterial({ color, secondaryColor, hovered, isAwake }: Props) {
  const active = isAwake || hovered;
  const ei = isAwake ? 0.7 : hovered ? 0.5 : 0.35;
  const segs = active ? 48 : 20;
  return (
    <>
      <mesh>
        <sphereGeometry args={[0.12, segs, segs]} />
        <meshPhysicalMaterial
          transmission={active ? 0.85 : 0}
          metalness={0.18} roughness={active ? 0.03 : 0.22}
          ior={1.78} thickness={1.6}
          iridescence={active ? 1.0 : 0.45} iridescenceIOR={1.35} iridescenceThicknessRange={[150, 500]}
          clearcoat={active ? 1.0 : 0.2} clearcoatRoughness={0.05}
          emissive={secondaryColor} emissiveIntensity={ei}
          color={color} specularIntensity={0.45}
        />
      </mesh>
      <GlowOverlay glowColor={secondaryColor}
        radius={isAwake ? 0.19 : hovered ? 0.17 : 0.15}
        opacity={isAwake ? 0.40 : hovered ? 0.25 : 0.15} />
    </>
  );
}

// 金丝榫卯：金线框 + 虹彩核心
function GoldWireMaterial({ color, secondaryColor, hovered, isAwake }: Props) {
  const wireRef = useRef<THREE.LineSegments>(null);
  const edgeGeo = useMemo(() => new THREE.EdgesGeometry(new THREE.IcosahedronGeometry(0.12, 2), 6), []);
  const active = isAwake || hovered;
  const ei = isAwake ? 0.8 : hovered ? 0.5 : 0.38;
  const segs = active ? 36 : 16;
  useFrame((_, d) => { if (wireRef.current) { wireRef.current.rotation.y += d * 0.1; wireRef.current.rotation.x += d * 0.05; } });
  return (
    <>
      <lineSegments ref={wireRef} geometry={edgeGeo}>
        <lineBasicMaterial color={secondaryColor} transparent opacity={isAwake ? 0.9 : hovered ? 0.7 : 0.4} />
      </lineSegments>
      <mesh>
        <sphereGeometry args={[0.06, segs, segs]} />
        <meshPhysicalMaterial
          transmission={active ? 0.75 : 0}
          roughness={active ? 0.05 : 0.3} ior={1.5} thickness={1.4}
          iridescence={active ? 0.8 : 0.35} iridescenceIOR={1.2} iridescenceThicknessRange={[80, 280]}
          clearcoat={active ? 0.8 : 0.15}
          emissive={secondaryColor} emissiveIntensity={ei}
          color={color}
        />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.14, 0.004, 6, 24]} />
        <meshBasicMaterial color={secondaryColor} transparent opacity={0.35} depthWrite={false} blending={THREE.AdditiveBlending} />
      </mesh>
      <GlowOverlay glowColor={secondaryColor}
        radius={isAwake ? 0.17 : hovered ? 0.15 : 0.13}
        opacity={isAwake ? 0.35 : hovered ? 0.22 : 0.12} />
    </>
  );
}

// 水墨粒子：粒子云 + 虹彩微核
function InkMaterial({ color, secondaryColor, hovered, isAwake }: Props) {
  const ref = useRef<THREE.Points>(null);
  // 粒子数砍半以节约性能
  const data = useMemo(() => {
    const c = 80; const p = new Float32Array(c * 3);
    for (let i = 0; i < c; i++) {
      const th = Math.random() * Math.PI * 2, ph = Math.acos(2 * Math.random() - 1), r = 0.04 + Math.random() * 0.11;
      p[i*3]=r*Math.sin(ph)*Math.cos(th); p[i*3+1]=r*Math.sin(ph)*Math.sin(th); p[i*3+2]=r*Math.cos(ph);
    }
    return p;
  }, []);
  useFrame((_, d) => { if (ref.current) { ref.current.rotation.y += d * 0.05; ref.current.rotation.x += d * 0.03; } });
  const active = isAwake || hovered;
  const ei = isAwake ? 0.6 : hovered ? 0.4 : 0.32;
  const segs = active ? 36 : 14;
  return (
    <>
      <points ref={ref}>
        <bufferGeometry><bufferAttribute attach="attributes-position" count={80} array={data} itemSize={3} /></bufferGeometry>
        <pointsMaterial size={0.014} color={secondaryColor} transparent opacity={isAwake ? 0.8 : 0.45} depthWrite={false} blending={THREE.AdditiveBlending} />
      </points>
      <mesh>
        <sphereGeometry args={[0.04, segs, segs]} />
        <meshPhysicalMaterial
          transmission={active ? 0.65 : 0}
          roughness={active ? 0.08 : 0.3} ior={1.45} thickness={1.1}
          iridescence={active ? 0.65 : 0.3} iridescenceIOR={1.15}
          clearcoat={active ? 0.6 : 0.15}
          emissive={secondaryColor} emissiveIntensity={ei}
          color={color}
        />
      </mesh>
      <GlowOverlay glowColor={secondaryColor}
        radius={isAwake ? 0.15 : hovered ? 0.13 : 0.11}
        opacity={isAwake ? 0.30 : hovered ? 0.18 : 0.10} />
    </>
  );
}

export default function PlanetMaterial(props: Props) {
  switch (props.type) {
    case NodeVisualType.JADE:       return <JadeMaterial {...props} />;
    case NodeVisualType.GLAZE:      return <GlazeMaterial {...props} />;
    case NodeVisualType.GOLD_WIRE:  return <GoldWireMaterial {...props} />;
    case NodeVisualType.INK_NEBULA: return <InkMaterial {...props} />;
    default:                        return <JadeMaterial {...props} />;
  }
}

// ═══════════════════════════════════════
// GlowOverlay — 逐节点辉光着色器
// 替代全局 Bloom，中心实心 · 边缘消散
// 使用 Three.js 内置 cameraPosition（无需 useFrame 传参）
// ═══════════════════════════════════════

const glowVertexShader = /* glsl */ `
  varying vec3 vNormal;
  varying vec3 vViewPosition;   // 视图空间中的位置

  void main() {
    // 法线从物体空间变换到视图空间 (normalMatrix = mat3(modelViewMatrix)的逆转置)
    vNormal = normalize(normalMatrix * normal);
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    vViewPosition = -mvPosition.xyz;  // 从顶点指向摄像机的向量(视图空间)
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const glowFragmentShader = /* glsl */ `
  varying vec3 vNormal;
  varying vec3 vViewPosition;

  uniform vec3 glowColor;

  void main() {
    // 视线方向归一化（视图空间中摄像机在原点）
    vec3 viewDir = normalize(vViewPosition);

    // 视线与法线的点乘 → 中心 ≈1，边缘 ≈0
    float NdotV = max(dot(viewDir, vNormal), 0.0);

    // 6次幂实现中心实心、边缘消散的辉光光晕
    float glow = pow(NdotV, 6.0);

    // 光晕过渡：从实心核心柔和衰减
    float alpha = glow * 0.55;

    gl_FragColor = vec4(glowColor, alpha);
  }
`;

export function GlowOverlay({ glowColor, radius = 0.16, opacity = 0.55 }: { glowColor: string; radius?: number; opacity?: number }) {
  // 预创建 geometry，跨渲染复用
  const geo = useMemo(() => new THREE.SphereGeometry(radius, 16, 16), [radius]);

  // 预创建 ShaderMaterial，引用稳定 → R3F 不会每帧重建
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: {
          glowColor: { value: new THREE.Color(glowColor) },
        },
        vertexShader: glowVertexShader,
        fragmentShader: glowFragmentShader,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    // 仅在首次挂载时创建；glowColor 变化通过下面 ref 同步
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  // 同步 glowColor（直接 mutate uniform，R3F 的 invalidate 会自动触发重绘）
  material.uniforms.glowColor.value.set(glowColor);
  // 同步 opacity（直接 mutate material 属性）
  material.opacity = opacity;

  return (
    <mesh geometry={geo} material={material} renderOrder={1} />
  );
}
