import { Outlet } from "react-router-dom";
import { AppHeader } from "../layout-fragment/AppHeader";
import { ScrollArea } from "../ui";

export default function AppLayout() {
  return (
    <div className="h-full flex flex-col">
      <AppHeader />
      <main className="h-full">
        <ScrollArea fit className="flex-1" type="hover" scrollHideDelay={1000}>
          <div className="">
            <Outlet />
          </div>
        </ScrollArea>
      </main>
    </div>
  );
}
