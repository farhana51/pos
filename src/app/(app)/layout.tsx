
'use client'

import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/AppSidebar"
import { useIdle } from "@/hooks/use-idle";
import { useRouter } from "next/navigation";
import { mockUser } from "@/lib/data";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter();
  const user = mockUser;
  
  // Redirect to landing page after 60 seconds of inactivity
  useIdle({
    onIdle: () => router.push('/landing'),
    idleTime: 60,
  });

  // Basic and Advanced users get a full-screen view without the sidebar
  if (user.role === 'Basic' || user.role === 'Advanced') {
    return (
        <div className="flex-1 overflow-y-auto">
            {children}
        </div>
    );
  }

  // Admin users get the full sidebar layout
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
