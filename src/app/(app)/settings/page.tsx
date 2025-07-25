
'use client'

import { Card, CardContent, CardTitle } from "@/components/ui/card";
import withAuth from "@/components/withAuth";
import { UserRole } from "@/lib/types";
import { Contact, Package } from "lucide-react";
import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";

const settingOptions = [
    {
        title: "CRM",
        icon: Contact,
        href: "/customers",
        description: "Manage customer relationships and loyalty."
    },
    {
        title: "Inventory",
        icon: Package,
        href: "/inventory",
        description: "Track ingredient stock levels."
    }
]

function SettingsPage() {
    return (
    <>
        <PageHeader title="Settings" />
        <main className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8">
            <div className="w-full max-w-4xl">
                 <div className="grid gap-6 grid-cols-1 md:grid-cols-3">
                    {settingOptions.map((option) => (
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
    </>
    )
}

export default withAuth(SettingsPage, ['Advanced' as UserRole]);
