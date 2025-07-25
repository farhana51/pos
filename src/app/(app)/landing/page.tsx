
'use client'

import { ArrowRight, BarChart2, BookOpen, Clock, HardHat, Home, Key, LayoutDashboard, LogOut, Package, Settings, Store, Users } from "lucide-react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { PageHeader } from "@/components/PageHeader";
import { mockUser } from "@/lib/data";
import Image from "next/image";

const serviceOptions = [
  {
    title: "Restaurant",
    description: "Manage tables, orders, and floor plan for dine-in customers.",
    icon: LayoutDashboard,
    href: "/dashboard",
    isReady: true,
    color: "text-orange-500",
  },
  {
    title: "Menu",
    description: "Handle takeaway orders for customer pickup.",
    icon: BookOpen,
    href: "/menu",
    isReady: true,
     color: "text-red-500",
  },
  {
    title: "Team",
    description: "Coordinate and track delivery orders.",
    icon: Users,
    href: "/team",
    isReady: true,
    color: "text-purple-500",
  },
  {
    title: "Inventory",
    description: "Manage orders coming from your website or app.",
    icon: Package,
    href: "/inventory",
    isReady: true,
     color: "text-green-500",
  },
   {
    title: "Reports",
    description: "View sales and performance analytics.",
    icon: BarChart2,
    href: "/admin/reports",
    isReady: true,
    color: "text-blue-500",
  },
  {
    title: "Settings",
    description: "Configure application settings.",
    icon: Settings,
    href: "/admin/settings",
    isReady: true,
     color: "text-gray-500",
  },
];

export default function LandingPage() {
  const { toast } = useToast();

  const handleComingSoon = (title: string) => {
    toast({
      title: "Coming Soon!",
      description: `${title} functionality is not yet implemented.`,
    });
  };

  return (
    <div className="relative flex flex-col h-screen w-full">
        <Image 
            src="https://placehold.co/1920x1080.png"
            alt="Blurred background"
            fill
            className="object-cover"
            data-ai-hint="restaurant background"
        />
        <div className="absolute inset-0 bg-background/60 backdrop-blur-sm" />
        <div className="relative z-10 flex flex-col h-full">
            <header className="p-4 flex justify-between items-center">
                 <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" asChild>
                        <Link href="/login">
                            <LogOut />
                        </Link>
                    </Button>
                    <span>Hi, {mockUser.name}</span>
                </div>
            </header>
            <main className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8">
                <div className="text-center mb-12">
                    <h1 className="text-5xl font-bold text-foreground">Welcome!</h1>
                </div>
                <div className="w-full max-w-4xl">
                    <div className="grid gap-6 md:grid-cols-3">
                        {serviceOptions.map((option) => (
                           <Link key={option.title} href={option.href} passHref>
                                <Card
                                    className="transform transition-transform duration-300 hover:-translate-y-2 hover:shadow-2xl bg-card/80 cursor-pointer h-40 flex flex-col items-center justify-center"
                                >
                                    <CardContent className="flex flex-col items-center justify-center p-6">
                                        <option.icon className={`h-12 w-12 mb-2 ${option.color}`} strokeWidth={1.5} />
                                        <span className="font-semibold">{option.title}</span>
                                    </CardContent>
                                </Card>
                            </Link>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    </div>
  );
}
