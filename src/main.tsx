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
  // <React.StrictMode>
  // <Providers>
  //   <div
  //     className={cn(
  //       "min-h-screen h-screen max-h-[calc(100vh-60px)] fs:max-h-screen ",
  //       "bg-background bg-slate-900",
  //       "grid grid-cols-1 relative"
  //     )}
  //   >
  //     <Header className="row-span-1" />
  //     <main className="row-span-12 max-h-[inherit]">
  //       <Home />
  //     </main>
  //   </div>
  // </Providers>
  // </React.StrictMode>
);
