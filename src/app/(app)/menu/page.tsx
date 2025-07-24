import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { mockMenu } from "@/lib/data";
import type { MenuItem, UserRole } from "@/lib/types";
import { MoreVertical, PlusCircle } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import withAuth from "@/components/withAuth";

function MenuTable({ items }: { items: MenuItem[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Price</TableHead>
          <TableHead>VAT</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map((item) => (
          <TableRow key={item.id}>
            <TableCell className="font-medium">
              <div>{item.name}</div>
              <div className="text-xs text-muted-foreground truncate max-w-xs">{item.description}</div>
            </TableCell>
            <TableCell>£{item.price.toFixed(2)}</TableCell>
            <TableCell><Badge variant="outline">{item.vatRate}%</Badge></TableCell>
            <TableCell className="text-right">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem>Edit</DropdownMenuItem>
                  <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

function MenuPage() {
  const categories = [...new Set(mockMenu.map(item => item.category))];
  
  return (
    <>
      <PageHeader title="Menu Management">
        <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Menu Item
        </Button>
      </PageHeader>
      <main className="p-4 sm:p-6 lg:p-8">
        <Card>
            <CardHeader>
                <CardTitle className="font-headline">Menu Items</CardTitle>
                <CardDescription>Manage your restaurant's menu items, prices, and categories.</CardDescription>
            </CardHeader>
            <CardContent>
                <Tabs defaultValue={categories[0]} className="w-full">
                <TabsList>
                    {categories.map(category => (
                        <TabsTrigger key={category} value={category}>{category}</TabsTrigger>
                    ))}
                </TabsList>
                {categories.map(category => (
                    <TabsContent key={category} value={category}>
                        <MenuTable items={mockMenu.filter(item => item.category === category)} />
                    </TabsContent>
                ))}
                </Tabs>
            </CardContent>
        </Card>
      </main>
    </>
  );
}

export default withAuth(MenuPage, ['Admin' as UserRole, 'Advanced' as UserRole]);
