import { ChevronUp, CircleDollarSign, Drill, LayoutDashboard, PackageSearch, Settings, User2, Users } from "lucide-react"

import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "../ui/sidebar"
import { Link } from "react-router-dom"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu"

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
            <SidebarContent className="mt-5">
                <SidebarGroup >
                    <SidebarGroupLabel className="font-extrabold text-2xl text-primary mb-10 ">Khronos</SidebarGroupLabel>
                    <SidebarGroupContent >
                        <SidebarMenu >
                            {items.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton asChild>
                                        <Link className="gap-5" to={item.url}>
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
            <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuButton>
                    <User2 /> Sign up 
                    
                    <ChevronUp className="ml-auto" />
                  </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  side="top"
                  className="w-[--radix-popper-anchor-width]"
                >
                  <DropdownMenuItem>
                    <span>Account</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <span>Billing</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <span>Sign out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
        </Sidebar>
    )
}
