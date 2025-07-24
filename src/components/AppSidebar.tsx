'use client'

import Link from "next/link"
import { usePathname } from "next/navigation"
import { BarChart2, BookOpen, Calendar, LayoutDashboard, LogOut, Settings, Utensils } from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { mockUser } from "@/lib/data"
import { cn } from "@/lib/utils"

const menuItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/menu", label: "Menu", icon: BookOpen },
  { href: "/reservations", label: "Reservations", icon: Calendar },
  { href: "/admin/reports", label: "Reports", icon: BarChart2 },
  { href: "/admin/settings", label: "Settings", icon: Settings },
]

export function AppSidebar() {
  const pathname = usePathname()

  const isActive = (path: string) => {
    if (path === '/dashboard') return pathname === path;
    return pathname.startsWith(path)
  }

  return (
    <Sidebar side="left" variant="sidebar" collapsible="icon">
      <SidebarHeader>
        <div className="flex items-center gap-2 p-2">
            <Utensils className="h-8 w-8 text-primary" />
            <span className="font-headline text-xl group-data-[collapsible=icon]:hidden">
              Gastronomic Edge
            </span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {menuItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton
                asChild
                isActive={isActive(item.href)}
                tooltip={{ children: item.label }}
                className={cn(isActive(item.href) && "bg-accent text-accent-foreground")}
              >
                <Link href={item.href}>
                  <item.icon />
                  <span>{item.label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        <div className="flex items-center gap-3 p-2">
            <Avatar>
                <AvatarImage src={mockUser.avatarUrl} alt={mockUser.name} data-ai-hint="manager profile" />
                <AvatarFallback>{mockUser.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col group-data-[collapsible=icon]:hidden">
                <span className="font-semibold text-sm">{mockUser.name}</span>
                <span className="text-xs text-muted-foreground">{mockUser.role}</span>
            </div>
             <SidebarMenuButton
                asChild
                tooltip={{ children: "Logout" }}
                className="ml-auto group-data-[collapsible=icon]:ml-0"
              >
                <Link href="/login">
                  <LogOut />
                  <span className="sr-only">Logout</span>
                </Link>
              </SidebarMenuButton>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
