
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Utensils } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-secondary p-4">
      <div className="flex flex-col items-center space-y-4 mb-8">
        <Utensils className="h-12 w-12 text-primary" />
        <h1 className="text-5xl font-headline text-center text-primary">
          Gastronomic Edge
        </h1>
        <p className="text-muted-foreground">The future of restaurant management.</p>
      </div>
      <Card className="w-full max-w-sm shadow-2xl bg-background border-secondary">
        <CardHeader>
          <CardTitle className="text-2xl font-headline">Welcome Back</CardTitle>
          <CardDescription>
            For demo purposes, you can enter any email and password. You can switch user roles in the sidebar.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="admin@example.com" required defaultValue="admin@example.com" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" required defaultValue="password" />
          </div>
        </CardContent>
        <CardFooter>
          <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90" asChild>
            <Link href="/landing">Sign in</Link>
          </Button>
        </CardFooter>
      </Card>
    </main>
  );
}
