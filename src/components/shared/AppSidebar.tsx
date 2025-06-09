import { useAuth } from "@/context/AuthContext"; // ajuste o caminho se necessário
import { LogOut, LayoutDashboard, CircleDollarSign, Users, PackageSearch } from "lucide-react"
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
]

export function AppSidebar() {
  const { logout } = useAuth(); // ⬅️ Usa o hook de autenticação

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
