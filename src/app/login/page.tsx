

'use client'

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Camera, Utensils } from "lucide-react";
import { findUserByCredentials, setCurrentUser, getCurrentUser } from "@/lib/data";

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [currentDateTime, setCurrentDateTime] = useState<Date | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Prevent hydration mismatch by only running client-side
        setCurrentDateTime(new Date());
        
        const timer = setInterval(() => {
            setCurrentDateTime(new Date());
        }, 1000 * 60); // Update every minute is enough since seconds are not displayed

        // Check if user is already logged in
        const user = getCurrentUser();
        if(user && user.userId) {
            router.replace('/landing');
        } else {
            setIsLoading(false);
        }

        return () => clearInterval(timer);
    }, [router]);

    const handleLogin = () => {
        const user = findUserByCredentials(email, password);
        if (user) {
            setCurrentUser(user);
            router.replace('/landing');
        } else {
            // In a real app, you might show an error message
            console.error("Login failed");
        }
    };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter') {
            handleLogin();
        }
    }

    if (isLoading) {
       return (
            <div className="flex items-center justify-center h-screen">
                <Utensils className="h-12 w-12 text-primary animate-spin" />
            </div>
        );
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
      <div className="flex-1 bg-secondary hidden md:flex flex-col items-center justify-center text-muted-foreground p-4">
          <h1 className="text-6xl font-bold">Welcome Tikka</h1>
          {currentDateTime ? (
            <>
                <p className="text-xl mt-4 font-medium">{currentDateTime.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                <p className="text-4xl font-mono mt-2">{currentDateTime.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}</p>
            </>
          ) : (
            <>
                 <div className="text-xl mt-4 font-medium h-7 bg-muted-foreground/20 w-64 rounded animate-pulse"></div>
                 <div className="text-4xl font-mono mt-2 h-10 bg-muted-foreground/20 w-40 rounded animate-pulse"></div>
            </>
          )}

      </div>
    </main>
  );
}
