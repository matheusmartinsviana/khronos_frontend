import { Outlet } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "../components/ui/sidebar";
import { AppSidebar } from "../components/shared/AppSidebar";

export default function Layout() {
    return (
        <div
        style={{
            display: "flex",
            flexDirection: "row",
            height: "100vh",
            width: "100vw",
        }}
        >
            <SidebarProvider>
                <AppSidebar />
                <SidebarTrigger />
                <main>
                    <Outlet />
                </main>
            </SidebarProvider>
        </div>
    );
}