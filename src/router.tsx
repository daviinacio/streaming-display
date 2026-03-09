import { lazy } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import AppLayout from "./components/AppLayout";

const GridView = lazy(() => import("@/pages/GridView"));

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AppLayout />}>
          <Route index element={<Navigate to="/grid" />} />
          <Route path="/grid" element={<GridView />} />
        </Route>

        <Route path="*" element={<Navigate to="/grid" />} />
      </Routes>
    </BrowserRouter>
  );
}
