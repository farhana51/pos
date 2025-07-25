
'use client'

import { ArrowRight, Car, Package, Utensils, Globe } from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { PageHeader } from "@/components/PageHeader";

const serviceOptions = [
  {
    title: "Restaurant",
    description: "Manage tables, orders, and floor plan for dine-in customers.",
    icon: Utensils,
    href: "/dashboard",
    isReady: true,
  },
  {
    title: "Collection",
    description: "Handle takeaway orders for customer pickup.",
    icon: Package,
    href: "/collection",
    isReady: true,
  },
  {
    title: "Delivery",
    description: "Coordinate and track delivery orders.",
    icon: Car,
    href: "/delivery",
    isReady: true,
  },
  {
    title: "Online Orders",
    description: "Manage orders coming from your website or app.",
    icon: Globe,
    href: "/online-orders",
    isReady: true,
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
    <div className="flex flex-col h-full">
        <PageHeader title="Select Service Mode" />
        <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-muted/20">
            <div className="w-full max-w-4xl">
                <div className="grid gap-8 md:grid-cols-2">
                    {serviceOptions.map((option) => {
                        const CardComponent = (
                            <Card 
                                key={option.title}
                                className="transform transition-transform duration-300 hover:-translate-y-2 hover:shadow-2xl"
                            >
                                <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                                    <div className="flex flex-col">
                                        <CardTitle className="text-2xl font-headline text-primary">{option.title}</CardTitle>
                                    </div>
                                    <div className="bg-primary/10 p-3 rounded-full">
                                        <option.icon className="h-6 w-6 text-primary" />
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-muted-foreground mb-6">{option.description}</p>
                                    {option.isReady ? (
                                        <Button className="w-full" asChild>
                                            <Link href={option.href}>
                                                Go to {option.title} <ArrowRight className="ml-2 h-4 w-4" />
                                            </Link>
                                        </Button>
                                    ) : (
                                        <Button className="w-full" variant="secondary" onClick={() => handleComingSoon(option.title)}>
                                            Coming Soon
                                        </Button>
                                    )}
                                </CardContent>
                            </Card>
                        );
                        return CardComponent;
                    })}
                </div>
            </div>
        </main>
    </div>
  );
}
