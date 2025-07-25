
'use client'

import { BarChart2, BookOpen, Car, Contact, Globe, Home, LayoutDashboard, Package, Settings, Users } from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { mockUser } from "@/lib/data";

const serviceOptions = [
  {
    title: "Restaurant",
    icon: LayoutDashboard,
    href: "/dashboard",
  },
  {
    title: "Take Away",
    icon: Home,
    href: "/collection",
  },
  {
    title: "Delivery",
    icon: Car,
    href: "/delivery",
  },
  {
    title: "Online Order",
    icon: Globe,
    href: "/online-orders",
  },
  {
    title: "Reservation",
    icon: BarChart2,
    href: "/reservations",
  },
   {
    title: "CRM",
    icon: Contact,
    href: "/customers",
  },
  {
    title: "HR",
    icon: Users,
    href: "/team",
  },
  {
    title: "Inventory",
    icon: Package,
    href: "/inventory",
  },
  {
    title: "Settings",
    icon: Settings,
    href: "/admin/settings",
  },
];

export default function LandingPage() {
  const { toast } = useToast();

  return (
    <div className="flex flex-col h-screen w-full bg-background">
      <header className="p-4 flex justify-between items-center border-b">
        <h1 className="text-2xl font-bold font-headline">Gastronomic Edge</h1>
         <div>
            <span>Hi, {mockUser.name} ({mockUser.role})</span>
        </div>
      </header>
      <main className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-6xl">
            <div className="grid gap-6 md:grid-cols-3 lg:grid-cols-5">
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
