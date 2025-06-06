import { Outlet } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "../components/ui/sidebar";
import { AppSidebar } from "../components/shared/AppSidebar";

export default function Layout() {
    return (
        <div className="flex flex-row h-[100vh] w-[100vw]">
            <SidebarProvider>
                <div className="flex justify-center items-center">
                    <AppSidebar />
                    <SidebarTrigger />
                </div>
                <main className="flex justify-center items-center w-full">
                    <Outlet />
                </main>
            </SidebarProvider>
        </div>
    );
}