/* 成语星空 (Idiom Universe) */
import { Suspense } from "react";
import Universe from "./components/Universe";
import DetailPanel from "./components/DetailPanel";
import HUD from "./components/HUD";

function App() {
  return (
    <div style={{ width: "100vw", height: "100vh", position: "relative" }}>
      <Suspense fallback={
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "#0a1628", color: "#c9a96e", fontFamily: "'Noto Serif SC', serif", fontSize: "1.2rem", letterSpacing: "0.3em" }}>
          太虚幻境 · 加载中
        </div>
      }>
        <Universe />
        <HUD />
        <DetailPanel />
      </Suspense>
    </div>
  );
}

export default App;
