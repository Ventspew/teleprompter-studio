import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@fontsource/outfit/400.css";
import "@fontsource/outfit/500.css";
import "@fontsource/outfit/600.css";
import "@fontsource/outfit/700.css";
import "@fontsource/source-serif-4/400.css";
import "@fontsource/source-serif-4/600.css";
import { StudioApp } from "@/components/studio/StudioApp";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <StudioApp />
  </StrictMode>,
);
