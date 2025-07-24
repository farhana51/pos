'use client'

import Link from "next/link"
import { usePathname } from "next/navigation"
import { BarChart2, BookOpen, Calendar, LayoutDashboard, LogOut, Settings, Utensils, ShieldBan, UserCheck } from "lucide-react"
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
import { mockUser, setUserRole, hasPermission } from "@/lib/data"
import { cn } from "@/lib/utils"
import { UserRole } from "@/lib/types"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { useState } from "react"

const allMenuItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, requiredRoles: ['Admin', 'Advanced', 'Basic'] as UserRole[] },
  { href: "/menu", label: "Menu", icon: BookOpen, requiredRoles: ['Admin', 'Advanced'] as UserRole[] },
  { href: "/reservations", label: "Reservations", icon: Calendar, requiredRoles: ['Admin', 'Advanced'] as UserRole[] },
  { href: "/admin/reports", label: "Reports", icon: BarChart2, requiredRoles: ['Admin'] as UserRole[] },
  { href: "/admin/settings", label: "Settings", icon: Settings, requiredRoles: ['Admin'] as UserRole[] },
]

export function AppSidebar() {
  const pathname = usePathname()
  // This is a local state to re-render the component when the role changes.
  const [currentUser, setCurrentUser] = useState(mockUser);

  const isActive = (path: string) => {
    if (path === '/dashboard') return pathname === path;
    return pathname.startsWith(path)
  }

  const handleRoleChange = (role: UserRole) => {
    setUserRole(role);
    // Create a new object to force re-render
    setCurrentUser({ ...mockUser, role });
  }

  const menuItems = allMenuItems.filter(item => hasPermission(currentUser.role, item.requiredRoles));

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
        <div className="flex flex-col gap-2 p-2">
            <div className="group-data-[collapsible=icon]:hidden">
                <label className="text-xs text-muted-foreground">Role Switcher (for demo)</label>
                 <Select onValueChange={handleRoleChange} defaultValue={currentUser.role}>
                    <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select Role" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="Admin">Admin</SelectItem>
                        <SelectItem value="Advanced">Advanced</SelectItem>
                        <SelectItem value="Basic">Basic</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <div className="flex items-center gap-3">
                <Avatar>
                    <AvatarImage src={currentUser.avatarUrl} alt={currentUser.name} data-ai-hint="manager profile" />
                    <AvatarFallback>{currentUser.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col group-data-[collapsible=icon]:hidden">
                    <span className="font-semibold text-sm">{currentUser.name}</span>
                    <span className="text-xs text-muted-foreground">{currentUser.role}</span>
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
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
