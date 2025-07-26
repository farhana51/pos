
// HOC/withAuth.tsx
'use client'
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser, hasPermission } from '@/lib/data';
import type { UserRole } from '@/lib/types';
import { ShieldBan, Utensils } from 'lucide-react';

const defaultSettings = {
    reservations: true,
    inventory: true,
    crm: false,
    delivery: true,
    onlineOrdering: true,
    collection: true,
    restaurant: true,
};

type SettingKey = keyof typeof defaultSettings;

const withAuth = <P extends object>(
  WrappedComponent: React.ComponentType<P>,
  requiredRoles: UserRole[],
  settingKey?: SettingKey
) => {
  const AuthComponent = (props: P) => {
    const router = useRouter();
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const checkAuthorization = () => {
            const user = getCurrentUser();

            // If no user is found, redirect to login
            if (!user || !user.userId) {
                router.replace('/login');
                return; 
            }

            const hasRolePermission = hasPermission(user.role, requiredRoles);
            let isFeatureEnabled = true;

            if (settingKey) {
                const savedSettings = localStorage.getItem('appSettings');
                const appSettings = savedSettings ? JSON.parse(savedSettings) : defaultSettings;
                isFeatureEnabled = appSettings[settingKey] ?? true;
            }

            if (hasRolePermission && isFeatureEnabled) {
                setIsAuthorized(true);
            } else {
                setIsAuthorized(false);
                // Optionally redirect or just show the Access Denied message
                // For now, we just show the message and let the user navigate away
                 console.warn(`Authorization check failed. Role sufficient: ${hasRolePermission}. Feature enabled: ${isFeatureEnabled}.`);
            }
            setIsLoading(false);
        };

        checkAuthorization();

        window.addEventListener('storage', checkAuthorization);
        return () => {
            window.removeEventListener('storage', checkAuthorization);
        };
    }, [router]);

    if (isLoading) {
        return (
             <div className="flex flex-col items-center justify-center h-screen bg-background text-foreground">
                <Utensils className="w-12 h-12 text-primary animate-spin" />
            </div>
        )
    }

    if (!isAuthorized) {
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-background text-foreground text-center p-4">
                <ShieldBan className="w-16 h-16 text-destructive mb-4" />
                <h1 className="text-2xl font-headline text-destructive">Access Denied</h1>
                <p className="text-muted-foreground">You do not have permission to view this page or the feature is disabled.</p>
                 <Button onClick={() => router.push('/landing')} className="mt-4">Go to Dashboard</Button>
            </div>
        );
    }

    return <WrappedComponent {...props} />;
  };

  AuthComponent.displayName = `withAuth(${WrappedComponent.displayName || WrappedComponent.name || 'Component'})`;

  return AuthComponent;
};

export default withAuth;
