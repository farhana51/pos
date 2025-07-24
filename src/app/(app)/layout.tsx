import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/AppSidebar"

export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
            <div className="flex-1 overflow-y-auto">
                {children}
            </div>
        </SidebarInset>
    </SidebarProvider>
  )
}
