import { Outlet } from "react-router-dom";
import { ForcedSize } from "./ui";
import { AppHeader } from "./AppHeader";

export default function AppLayout() {
  return (
    <div className="h-full flex flex-col">
      <AppHeader />
      <ForcedSize className="h-full">
        <main className="h-full">
          <Outlet />
        </main>
      </ForcedSize>
    </div>
  );
}
