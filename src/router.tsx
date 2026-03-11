import { lazy } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import AppLayout from "./components/AppLayout";

const GridView = lazy(() => import("@/pages/GridView"));

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AppLayout />}>
          <Route index element={<GridView />} />
          <Route path="/*" element={<GridView />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
