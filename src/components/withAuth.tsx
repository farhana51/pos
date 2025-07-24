// HOC/withAuth.tsx
'use client'
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { mockUser, hasPermission } from '@/lib/data';
import type { UserRole } from '@/lib/types';
import { ShieldBan } from 'lucide-react';

const withAuth = <P extends object>(
  WrappedComponent: React.ComponentType<P>,
  requiredRoles: UserRole[]
) => {
  const AuthComponent = (props: P) => {
    const router = useRouter();
    const [isAuthorized, setIsAuthorized] = useState(false);
    
    // In a real app, you'd get the user from a context or a hook
    const user = mockUser;

    useEffect(() => {
        if (!hasPermission(user.role, requiredRoles)) {
            // We could redirect to a dedicated "unauthorized" page
            // For now, we show a message and then redirect to dashboard
            setIsAuthorized(false);
            console.warn(`User with role ${user.role} does not have permission to access this page. Required roles: ${requiredRoles.join(', ')}`);
        } else {
            setIsAuthorized(true);
        }
    }, [user.role]);

    if (!isAuthorized) {
        // You can replace this with a loading spinner or a dedicated "Unauthorized" page component
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-background text-foreground">
                <ShieldBan className="w-16 h-16 text-destructive mb-4" />
                <h1 className="text-2xl font-headline text-destructive">Access Denied</h1>
                <p className="text-muted-foreground">You do not have permission to view this page.</p>
                <p className="text-sm text-muted-foreground mt-2">Redirecting you to the dashboard...</p>
            </div>
        );
    }

    return <WrappedComponent {...props} />;
  };

  AuthComponent.displayName = `withAuth(${WrappedComponent.displayName || WrappedComponent.name || 'Component'})`;

  return AuthComponent;
};

export default withAuth;
