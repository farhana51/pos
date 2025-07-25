
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Camera, Utensils } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen w-full">
      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-sm">
            <div className="flex flex-col items-center space-y-2 mb-8 text-muted-foreground">
                <Camera className="h-10 w-10" />
                <span>Your logo</span>
            </div>
            <Card className="w-full bg-background border-none shadow-none">
                <CardHeader className="text-center">
                <CardTitle className="text-3xl font-bold">Login</CardTitle>
                <CardDescription>
                    Enter your credentials to access your account.
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
        </div>
      </div>
      <div className="flex-1 bg-secondary hidden md:flex items-center justify-center">
          <h1 className="text-6xl font-bold text-muted-foreground">Welcome.</h1>
      </div>
    </main>
  );
}
