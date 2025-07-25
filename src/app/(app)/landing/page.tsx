

'use client'

import { BarChart2, BookOpen, Car, Contact, Globe, Home, LayoutDashboard, Package, Settings, Users, Calendar, LogOut } from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { logoutUser, mockUser } from "@/lib/data";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

const allServiceOptions = [
  {
    title: "Restaurant",
    icon: LayoutDashboard,
    href: "/dashboard",
    roles: ['Admin', 'Advanced', 'Basic']
  },
  {
    title: "Take Away",
    icon: Home,
    href: "/collection",
    roles: ['Admin', 'Advanced', 'Basic']
  },
  {
    title: "Delivery",
    icon: Car,
    href: "/delivery",
    roles: ['Admin', 'Advanced', 'Basic']
  },
  {
    title: "Online Order",
    icon: Globe,
    href: "/online-orders",
    roles: ['Admin', 'Advanced']
  },
  {
    title: "Reservation",
    icon: Calendar,
    href: "/reservations",
    roles: ['Admin', 'Advanced', 'Basic']
  },
   {
    title: "CRM",
    icon: Contact,
    href: "/customers",
    roles: ['Admin'] // Now only Admin
  },
  {
    title: "HR",
    icon: Users,
    href: "/team",
    roles: ['Admin']
  },
  {
    title: "Inventory",
    icon: Package,
    href: "/inventory",
    roles: ['Admin'] // Now only Admin
  },
  {
    title: "Reports",
    icon: BarChart2,
    href: "/admin/reports",
    roles: ['Admin']
  },
  {
    title: "Settings",
    icon: Settings,
    href: "/admin/settings",
    roles: ['Admin']
  },
  { // New consolidated settings for Advanced users
    title: "Settings",
    icon: Settings,
    href: "/settings",
    roles: ['Advanced']
  }
];

export default function LandingPage() {
  const serviceOptions = allServiceOptions.filter(option => option.roles.includes(mockUser.role));
  const isBasicUser = mockUser.role === 'Basic';
  const isAdvancedUser = mockUser.role === 'Advanced';

  return (
    <div className="flex flex-col h-full w-full bg-background">
      <main className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className={cn("w-full", isBasicUser || isAdvancedUser ? "max-w-4xl" : "max-w-6xl")}>
            <div className={cn(
                "grid gap-6",
                 isBasicUser || isAdvancedUser
                    ? "grid-cols-1 md:grid-cols-4" 
                    : "grid-cols-1 md:grid-cols-3 lg:grid-cols-5"
            )}>
                {serviceOptions.map((option) => (
                   <Link key={option.title + option.href} href={option.href} passHref>
                        <Card
                            className="transform transition-transform duration-300 hover:-translate-y-2 hover:shadow-2xl bg-card cursor-pointer h-40 flex flex-col items-center justify-center text-center p-4"
                        >
                            <CardContent className="flex flex-col items-center justify-center p-0">
                                <option.icon className={`h-12 w-12 mb-2 text-primary`} strokeWidth={1.5} />
                                <CardTitle className="text-lg font-semibold">{option.title}</CardTitle>
                            </CardContent>
                        </Card>
                    </Link>
                ))}
            </div>
        </div>
      </main>
    </div>
  );
}
