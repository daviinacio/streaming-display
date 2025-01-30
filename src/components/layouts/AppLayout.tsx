import { Outlet } from "react-router-dom";
import { AppHeader } from "../layout-fragment/AppHeader";
import { ForcedSize } from "../ui";

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
