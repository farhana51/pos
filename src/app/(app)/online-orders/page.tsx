
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import withAuth from "@/components/withAuth";
import { UserRole } from "@/lib/types";
import { Globe } from "lucide-react";

function OnlineOrdersPage() {
  return (
    <>
      <PageHeader title="Online Orders" />
      <main className="p-4 sm:p-6 lg:p-8">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Incoming Online Orders</CardTitle>
            <CardDescription>Manage orders coming from your website or app.</CardDescription>
          </CardHeader>
           <CardContent className="flex flex-col items-center justify-center text-center text-muted-foreground h-64">
              <Globe className="w-16 h-16 mb-4" />
              <p>No new online orders.</p>
              <p className="text-sm">Incoming online orders will appear here in real-time.</p>
          </CardContent>
        </Card>
      </main>
    </>
  );
}

export default withAuth(OnlineOrdersPage, ['Admin' as UserRole, 'Advanced' as UserRole, 'Basic' as UserRole]);
