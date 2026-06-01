/* ============================================
   UniverseBackground — 纯黑 · 流动星海
   ============================================ */

import { useEffect, useRef, useMemo } from "react";
import { useThree, useFrame } from "@react-three/fiber";
import * as THREE from "three";

function PureBlack() {
  const { scene } = useThree();
  useEffect(() => { scene.background = new THREE.Color("#000000"); }, [scene]);
  return null;
}

function FlowingStars() {
  const deepRef = useRef<THREE.Points>(null);
  const midRef = useRef<THREE.Points>(null);
  const nearRef = useRef<THREE.Points>(null);
  const streamARef = useRef<THREE.Points>(null);
  const streamBRef = useRef<THREE.Points>(null);

  const layers = useMemo(() => {
    function gen(count: number, rMin: number, rMax: number, sMin: number, sMax: number) {
      const pos = new Float32Array(count * 3), siz = new Float32Array(count), phs = new Float32Array(count);
      for (let i = 0; i < count; i++) {
        const th = Math.random() * Math.PI * 2, ph = Math.acos(2 * Math.random() - 1), r = rMin + Math.random() * (rMax - rMin);
        pos[i*3]=r*Math.sin(ph)*Math.cos(th); pos[i*3+1]=r*Math.sin(ph)*Math.sin(th); pos[i*3+2]=r*Math.cos(ph);
        siz[i] = sMin + Math.random() * (sMax - sMin);
        phs[i] = Math.random() * Math.PI * 2;
      }
      return { pos, siz, phs, count };
    }

    // 星流带：沿 Y 轴方向拉长的椭球分布（模拟银河流动感）
    function genStream(count: number, rMin: number, rMax: number, sMin: number, sMax: number, axisY: number) {
      const pos = new Float32Array(count * 3), siz = new Float32Array(count), phs = new Float32Array(count);
      for (let i = 0; i < count; i++) {
        const th = Math.random() * Math.PI * 2;
        const ph = Math.acos(2 * Math.random() - 1);
        const r = rMin + Math.random() * (rMax - rMin);
        let x = r * Math.sin(ph) * Math.cos(th);
        let y = r * Math.sin(ph) * Math.sin(th) * 2.5; // Y 轴拉伸
        let z = r * Math.cos(ph);
        // 沿 Y 轴的流动偏移
        y += (Math.random() - 0.5) * 8;
        pos[i*3]=x; pos[i*3+1]=y + axisY; pos[i*3+2]=z;
        siz[i] = sMin + Math.random() * (sMax - sMin);
        phs[i] = Math.random() * Math.PI * 2;
      }
      return { pos, siz, phs, count };
    }

    return {
      deep:  gen(15000, 18, 30, 0.004, 0.022),
      mid:   gen(8000,  10, 20, 0.010, 0.045),
      near:  gen(2000,   4, 12, 0.025, 0.110),
      streamA: genStream(3000, 6, 16, 0.015, 0.065, 2),
      streamB: genStream(3000, 8, 18, 0.012, 0.055, -3),
    };
  }, []);

  const vert = /* glsl */ `
    attribute float size; attribute float phase;
    varying float vAlpha;
    uniform float uTime; uniform float uPR;
    void main() {
      vec4 mv = modelViewMatrix * vec4(position, 1.0);
      gl_PointSize = size * uPR * 500.0 / -mv.z;
      gl_Position = projectionMatrix * mv;
      float a = sin(uTime * 1.6 + phase) * 0.5 + 0.5;
      float b = sin(uTime * 0.4 + phase * 3.1) * 0.5 + 0.5;
      float c = sin(uTime * 0.16 + phase * 6.0) * 0.5 + 0.5;
      vAlpha = clamp(0.45 + a * 0.35 + b * 0.15 + c * 0.05, 0.35, 1.0);
    }`;
  const frag = /* glsl */ `
    varying float vAlpha;
    void main() {
      float d = length(gl_PointCoord - vec2(0.5));
      if (d > 0.5) discard;
      float core = exp(-d * 30.0) * 0.90;
      float mid  = exp(-d * 10.0) * 0.22;
      float halo = exp(-d * 4.0)  * 0.10;
      gl_FragColor = vec4(1.0, 1.0, 1.0, (core + mid + halo) * vAlpha);
    }`;

  function mkUni() { return { uTime: { value: 0 }, uPR: { value: Math.min(window.devicePixelRatio, 2) } }; }
  const uDeep = useMemo(mkUni, []); const uMid = useMemo(mkUni, []); const uNear = useMemo(mkUni, []);
  const uSA = useMemo(mkUni, []); const uSB = useMemo(mkUni, []);

  useFrame((_, d) => {
    uDeep.uTime.value += d; uMid.uTime.value += d; uNear.uTime.value += d; uSA.uTime.value += d; uSB.uTime.value += d;

    // 各层以不同速度、不同轴旋转 → 流动感
    if (deepRef.current)  { deepRef.current.rotation.y  += d * 0.06; deepRef.current.rotation.x  += d * 0.015; }
    if (midRef.current)   { midRef.current.rotation.y   += d * 0.12; midRef.current.rotation.z   += d * 0.03; }
    if (nearRef.current)  { nearRef.current.rotation.y  += d * 0.20; nearRef.current.rotation.x  += d * 0.05; }
    // 星流带更快
    if (streamARef.current) { streamARef.current.rotation.y += d * 0.18; streamARef.current.rotation.z += d * 0.06; }
    if (streamBRef.current) { streamBRef.current.rotation.y -= d * 0.14; streamBRef.current.rotation.x += d * 0.04; }
  });

  function StarLayer({ data, uniforms, ref }: any) {
    return (
      <points ref={ref}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" count={data.count} array={data.pos} itemSize={3} />
          <bufferAttribute attach="attributes-size" count={data.count} array={data.siz} itemSize={1} />
          <bufferAttribute attach="attributes-phase" count={data.count} array={data.phs} itemSize={1} />
        </bufferGeometry>
        <shaderMaterial uniforms={uniforms} vertexShader={vert} fragmentShader={frag}
          transparent depthWrite={false} blending={THREE.AdditiveBlending} />
      </points>
    );
  }

  return (
    <>
      <StarLayer data={layers.deep}  uniforms={uDeep}  ref={deepRef} />
      <StarLayer data={layers.mid}   uniforms={uMid}   ref={midRef} />
      <StarLayer data={layers.near}  uniforms={uNear}  ref={nearRef} />
      <StarLayer data={layers.streamA} uniforms={uSA} ref={streamARef} />
      <StarLayer data={layers.streamB} uniforms={uSB} ref={streamBRef} />
    </>
  );
}

// ═══════════ 流星 (Shooting Stars) ═══════════
function ShootingStars() {
  const ref = useRef<THREE.Points>(null);
  const count = 25; // 同时最多 25 颗流星

  // 每颗流星：头位置 + 速度方向 + 生命周期
  const meteors = useRef(
    Array.from({ length: count }, () => ({
      life: 0,        // 当前生命 (0=死亡)
      maxLife: 0,     // 总生命
      pos: new THREE.Vector3(),
      vel: new THREE.Vector3(),
      brightness: 0,
    })),
  );

  const posArr = useMemo(() => new Float32Array(count * 3), []);
  const lifeArr = useMemo(() => new Float32Array(count), []);
  const brightArr = useMemo(() => new Float32Array(count), []);

  const uni = useMemo(() => ({
    uTime: { value: 0 },
    uPR: { value: Math.min(window.devicePixelRatio, 2) },
  }), []);

  // 生成新流星
  function spawn(index: number) {
    const m = meteors.current[index];
    // 随机起点（球面）
    const th = Math.random() * Math.PI * 2;
    const ph = Math.acos(2 * Math.random() - 1);
    const r = 8 + Math.random() * 18;
    m.pos.set(r * Math.sin(ph) * Math.cos(th), r * Math.sin(ph) * Math.sin(th), r * Math.cos(ph));
    // 速度方向：大致沿切线（产生弧线飞行感）
    const tangent = new THREE.Vector3(-m.pos.y, m.pos.x, m.pos.z * 0.5).normalize();
    const speed = 3 + Math.random() * 8;
    m.vel.copy(tangent).multiplyScalar(speed);
    m.maxLife = 1.5 + Math.random() * 3.0;
    m.life = m.maxLife;
    m.brightness = 0.4 + Math.random() * 0.6;
  }

  useFrame((_, d) => {
    uni.uTime.value += d;

    // 随机生成新流星（平均每秒 2-4 颗）
    for (let i = 0; i < count; i++) {
      const m = meteors.current[i];
      if (m.life <= 0) {
        if (Math.random() < d * 3.5) spawn(i);
      }
    }

    // 更新流星位置
    for (let i = 0; i < count; i++) {
      const m = meteors.current[i];
      if (m.life > 0) {
        m.life -= d;
        m.pos.addScaledVector(m.vel, d);
        // 微重力弯曲
        m.vel.y -= d * 0.3;
        // 超出范围则杀死
        if (m.pos.length() > 32) m.life = 0;
      }
      const progress = m.life > 0 ? Math.max(0, m.life / m.maxLife) : 0;
      const fade = progress < 0.15 ? progress / 0.15 : progress > 0.7 ? (1 - progress) / 0.3 : 1;
      posArr[i * 3] = m.pos.x; posArr[i * 3 + 1] = m.pos.y; posArr[i * 3 + 2] = m.pos.z;
      lifeArr[i] = m.life > 0 ? 1 : 0;
      brightArr[i] = fade * m.brightness;
    }

    // 更新 buffer
    if (ref.current) {
      const geo = ref.current.geometry;
      geo.attributes.position.needsUpdate = true;
      geo.attributes.life.needsUpdate = true;
      geo.attributes.brightness.needsUpdate = true;
    }
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={posArr} itemSize={3} />
        <bufferAttribute attach="attributes-life" count={count} array={lifeArr} itemSize={1} />
        <bufferAttribute attach="attributes-brightness" count={count} array={brightArr} itemSize={1} />
      </bufferGeometry>
      <shaderMaterial
        uniforms={uni}
        vertexShader={/* glsl */ `
          attribute float life; attribute float brightness;
          varying float vLife; varying float vBright;
          uniform float uPR;
          void main() {
            vec4 mv = modelViewMatrix * vec4(position, 1.0);
            gl_PointSize = (8.0 + brightness * 12.0) * uPR / -mv.z;
            gl_Position = projectionMatrix * mv;
            vLife = life; vBright = brightness;
          }`}
        fragmentShader={/* glsl */ `
          varying float vLife; varying float vBright;
          void main() {
            if (vLife < 0.01) discard;
            float d = length(gl_PointCoord - vec2(0.5));
            if (d > 0.5) discard;
            // 明亮白色核心 + 光晕
            float head = exp(-d * 25.0) * 1.0;
            float glow = exp(-d * 5.0) * 0.45;
            float alpha = (head + glow) * vBright * vLife;
            gl_FragColor = vec4(1.0, 1.0, 1.0, alpha);
          }`}
        transparent depthWrite={false} blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

function DepthFog() {
  const { scene } = useThree();
  useEffect(() => { scene.fog = new THREE.FogExp2("#000000", 0.0003); return () => { scene.fog = null; }; }, [scene]);
  return null;
}

export default function UniverseBackground() {
  return (
    <>
      <PureBlack />
      <DepthFog />
      <FlowingStars />
      <ShootingStars />
    </>
  );
}
