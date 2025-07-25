
'use client'

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Camera } from "lucide-react";
import { findUserByCredentials, setCurrentUser } from "@/lib/data";
import { useToast } from "@/hooks/use-toast";

export default function LoginPage() {
    const router = useRouter();
    const { toast } = useToast();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = () => {
        const user = findUserByCredentials(email, password);
        if (user) {
            setCurrentUser(user);
            toast({
                title: "Login Successful",
                description: `Welcome back, ${user.name}!`,
            });
            router.push('/landing');
        } else {
            toast({
                variant: "destructive",
                title: "Login Failed",
                description: "Invalid email or password.",
            });
        }
    };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter') {
            handleLogin();
        }
    }

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
                    <Label htmlFor="email">User ID</Label>
                    <Input 
                        id="email" 
                        type="text" 
                        placeholder="admin" 
                        required 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        onKeyDown={handleKeyDown}
                    />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="password">Password</Label>
                    <Input 
                        id="password" 
                        type="password" 
                        required 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        onKeyDown={handleKeyDown}
                    />
                </div>
                </CardContent>
                <CardFooter>
                <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90" onClick={handleLogin}>
                    Sign in
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
