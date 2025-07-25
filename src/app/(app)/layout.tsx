
'use client'

import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/AppSidebar"
import { useIdle } from "@/hooks/use-idle";
import { usePathname, useRouter } from "next/navigation";
import { logoutUser, mockUser } from "@/lib/data";
import { useEffect, useState } from "react";
import type { User } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { LogOut, Utensils } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";


function AppHeader() {
  const router = useRouter();
  const handleLogout = () => {
    logoutUser();
    router.push('/login');
  };

  return (
    <header className="flex h-16 items-center justify-between border-b bg-background px-4 md:px-6 sticky top-0 z-20">
      <div className="flex items-center gap-2">
        <Utensils className="h-6 w-6 text-primary" />
        <span className="font-headline text-lg font-bold">Gastronomic Edge</span>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-sm text-muted-foreground hidden sm:inline">
          Hi, {mockUser.name} ({mockUser.role})
        </span>
        <ThemeToggle />
      </div>
    </header>
  );
}


export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter();
  const pathname = usePathname();
  // We use state to ensure the component re-renders when the user changes.
  const [user, setUser] = useState<User>(mockUser);

   const handleLogout = () => {
    logoutUser();
    router.push('/login');
  };

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

  // Landing page has a special layout for basic/advanced users
  if (pathname === '/landing' && (user.role === 'Basic' || user.role === 'Advanced')) {
    return (
        <div className="flex flex-col h-screen">
            <AppHeader />
            <main className="flex-1 overflow-y-auto">{children}</main>
             <Button
                variant="outline"
                className="fixed bottom-4 right-4 rounded-full h-14 w-14 shadow-lg"
                onClick={handleLogout}
            >
                <LogOut className="h-6 w-6" />
                <span className="sr-only">Logout</span>
            </Button>
        </div>
    )
  }

  // Admin users get the full sidebar layout
  if(user.role === 'Admin') {
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

  // Fallback for Basic/Advanced on other pages
  return (
     <div className="flex-1 overflow-y-auto">
        {children}
    </div>
  )
}
