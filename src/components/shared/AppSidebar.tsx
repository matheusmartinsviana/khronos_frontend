import { useAuth } from "@/context/AuthContext"; // ajuste o caminho se necessário
import { LogOut, LayoutDashboard, CircleDollarSign, Users, PackageSearch, Wrench } from "lucide-react"
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
import { useUser } from "@/context/UserContext";

// Menu items.
const items = [
  {
    title: "Dashboard",
    url: "/",
    icon: LayoutDashboard,
  },
  {
    title: "Vendas",
    url: "/vendas",
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
    icon: Wrench,
  },
]

export function AppSidebar() {
  const { logout } = useAuth();
  const { user } = useUser();

  return (
    <Sidebar collapsible="icon">
      <SidebarContent className="mt-5">
        <SidebarGroup>
          <SidebarGroupLabel className="font-extrabold text-2xl text-primary mb-10">Khronos</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
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
              {user?.role === "admin" && (
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <Link className="gap-5" to="/usuarios">
                      <Users color="var(--primary-color)" />
                      <span>Usuários</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton className="cursor-pointer" onClick={logout}>
              <LogOut className="text-gray-500" /> Logout
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
