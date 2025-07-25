
'use client'

import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/AppSidebar"
import { useIdle } from "@/hooks/use-idle";
import { usePathname, useRouter } from "next/navigation";
import { mockUser } from "@/lib/data";
import { useEffect, useState } from "react";
import type { User } from "@/lib/types";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter();
  const pathname = usePathname();
  // We use state to ensure the component re-renders when the user changes.
  const [user, setUser] = useState<User>(mockUser);

  useEffect(() => {
    const handleStorageChange = () => {
        const storedUser = localStorage.getItem('currentUser');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        } else {
            // If user is logged out, redirect to login
            router.push('/login');
        }
    };

    // Listen for changes in localStorage from other tabs
    window.addEventListener('storage', handleStorageChange);
    
    // Initial check
    handleStorageChange();

    return () => {
        window.removeEventListener('storage', handleStorageChange);
    };
  }, [router]);
  
  // Redirect to landing page after 60 seconds of inactivity, but not if we are on landing already
  useIdle({
    onIdle: () => {
        if(pathname !== '/landing') {
            router.push('/landing')
        }
    },
    idleTime: 60,
  });

  // Landing page has its own layout
  if (pathname === '/landing') {
      return <div className="h-full">{children}</div>
  }

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
