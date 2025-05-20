import { CircleDollarSign, Drill, LayoutDashboard, PackageSearch, Settings, Users } from "lucide-react"

import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "../ui/sidebar"
import { Link } from "react-router-dom"

// Menu items.
const items = [
    {
        title: "Dashboard",
        url: "/dashboard",
        icon: LayoutDashboard,
    },
    {
        title: "Venda",
        url: "/venda",
        icon: CircleDollarSign,
    },
    {
        title: "Clientes",
        url: "/clientes",
        icon: Users,
    },
    {
        title: "Produtos",
        url: "/produtos",
        icon: PackageSearch,
    },
    {
        title: "Serviços",
        url: "/servicos",
        icon: Drill,
    },
    {
        title: "Configurações",
        url: "/configuracoes",
        icon: Settings,
    },
]

export function AppSidebar() {
    return (
        <Sidebar collapsible="icon">
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>Khronos</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {items.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton asChild>
                                        <Link to={item.url}>
                                            <item.icon color="var(--primary-color)" />
                                            <span>{item.title}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
        </Sidebar>
    )
}
