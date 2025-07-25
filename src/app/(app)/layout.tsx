
'use client'

import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/AppSidebar"
import { useIdle } from "@/hooks/use-idle";
import { useRouter } from "next/navigation";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter();
  
  // Redirect to landing page after 60 seconds of inactivity
  useIdle({
    onIdle: () => router.push('/landing'),
    idleTime: 60,
  });

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
