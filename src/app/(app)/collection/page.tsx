
'use client'

import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import withAuth from "@/components/withAuth";
import { UserRole } from "@/lib/types";
import { Package } from "lucide-react";

function CollectionPage() {
  return (
    <>
      <PageHeader title="Collection Orders" />
      <main className="p-4 sm:p-6 lg:p-8">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Ready for Collection</CardTitle>
            <CardDescription>Manage takeaway orders that are ready for customer pickup.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center text-center text-muted-foreground h-64">
              <Package className="w-16 h-16 mb-4" />
              <p>No orders are currently ready for collection.</p>
              <p className="text-sm">New collection orders will appear here.</p>
          </CardContent>
        </Card>
      </main>
    </>
  );
}

export default withAuth(CollectionPage, ['Admin' as UserRole, 'Advanced' as UserRole, 'Basic' as UserRole], 'collection');
