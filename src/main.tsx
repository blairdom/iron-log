import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";

const style = document.createElement("style");
style.textContent = `
  * { box-sizing: border-box; margin: 0; padding: 0; }
  html, body { background: #0D1117; min-height: 100vh; color: #F0F6FC; }
  input[type=number]::-webkit-inner-spin-button,
  input[type=number]::-webkit-outer-spin-button { -webkit-appearance: none; }
  input[type=number] { -moz-appearance: textfield; }
  select option { background: #1C2128; color: #F0F6FC; }
  ::-webkit-scrollbar { width: 6px; }
  ::-webkit-scrollbar-track { background: #0D1117; }
  ::-webkit-scrollbar-thumb { background: #30363D; border-radius: 3px; }
  ::-webkit-scrollbar-thumb:hover { background: #484F58; }
`;
document.head.appendChild(style);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
