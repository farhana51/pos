import type { ReactNode } from "react"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { ThemeToggle } from "./ThemeToggle"
import { mockUser } from "@/lib/data"

type PageHeaderProps = {
  title: string
  children?: ReactNode
}

export function PageHeader({ title, children }: PageHeaderProps) {
  const showSidebarTrigger = mockUser.role === 'Admin';

  return (
    <header className="flex h-14 items-center gap-4 border-b border-secondary bg-background px-4 lg:h-[60px] lg:px-6 sticky top-0 z-10">
      <div className="flex items-center gap-2">
         {showSidebarTrigger && <SidebarTrigger className="md:hidden" />}
         <h1 className="text-xl md:text-2xl font-bold">{title}</h1>
      </div>
     
      <div className="ml-auto flex items-center gap-4">
        <ThemeToggle />
        {children}
      </div>
    </header>
  )
}
