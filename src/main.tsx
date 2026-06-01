import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// 不使用 StrictMode — R3F 在 StrictMode 下 double-invoke effects
// 会导致 WebGL 资源被创建又销毁，出现"闪现后消失"的问题
createRoot(document.getElementById('root')!).render(<App />)
