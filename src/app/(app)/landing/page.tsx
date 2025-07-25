
'use client'

import { BarChart2, BookOpen, Car, Contact, Globe, Home, LayoutDashboard, Package, Settings, Users, Calendar } from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { mockUser } from "@/lib/data";
import { cn } from "@/lib/utils";

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
    roles: ['Admin', 'Advanced']
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
    roles: ['Admin', 'Advanced']
  },
  {
    title: "Settings",
    icon: Settings,
    href: "/admin/settings",
    roles: ['Admin']
  },
];

export default function LandingPage() {
  const { toast } = useToast();
  const serviceOptions = allServiceOptions.filter(option => option.roles.includes(mockUser.role));
  const isBasicUser = mockUser.role === 'Basic';

  return (
    <div className="flex flex-col h-screen w-full bg-background">
      <header className="p-4 flex justify-between items-center border-b">
        <h1 className="text-2xl font-bold font-headline">Gastronomic Edge</h1>
         <div>
            <span>Hi, {mockUser.name} ({mockUser.role})</span>
        </div>
      </header>
      <main className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className={cn("w-full", isBasicUser ? "max-w-4xl" : "max-w-6xl")}>
            <div className={cn(
                "grid gap-6",
                 isBasicUser 
                    ? "grid-cols-1 md:grid-cols-4" 
                    : "md:grid-cols-3 lg:grid-cols-5"
            )}>
                {serviceOptions.map((option) => (
                   <Link key={option.title} href={option.href} passHref>
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
