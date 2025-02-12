import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import "./style/global.css";

import { Providers } from "@/providers";
import AppRouter from "./router";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Providers>
      <AppRouter />
    </Providers>
  </StrictMode>
);
