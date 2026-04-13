  import { createRoot } from "react-dom/client";
  import App from "./app/App.tsx";
  import "./styles/index.css";

  // Register PWA service worker (vite-plugin-pwa provides the virtual helper)
  // import('virtual:pwa-register')
  //   .then((mod) => {
  //     try { mod.registerSW(); } catch {}
  //   })
  //   .catch(() => {
  //     // ignore if virtual module isn't available in this environment
  //   });

  createRoot(document.getElementById("root")!).render(<App />);