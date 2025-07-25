// HOC/withAuth.tsx
'use client'
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { mockUser, hasPermission } from '@/lib/data';
import type { UserRole } from '@/lib/types';
import { ShieldBan } from 'lucide-react';

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
    
    // In a real app, you'd get the user from a context or a hook
    const user = mockUser;

    useEffect(() => {
        const checkAuthorization = () => {
            const hasRolePermission = hasPermission(user.role, requiredRoles);
            let isFeatureEnabled = true;

            if (settingKey) {
                const savedSettings = localStorage.getItem('appSettings');
                const appSettings = savedSettings ? JSON.parse(savedSettings) : defaultSettings;
                isFeatureEnabled = appSettings[settingKey] ?? true; // Default to true if setting doesn't exist
            }

            if (hasRolePermission && isFeatureEnabled) {
                setIsAuthorized(true);
            } else {
                setIsAuthorized(false);
                 console.warn(`Authorization check failed. Role sufficient: ${hasRolePermission}. Feature enabled: ${isFeatureEnabled}.`);
            }
            setIsLoading(false);
        };

        checkAuthorization();

        // Optional: Listen for storage changes to react if settings change in another tab
        window.addEventListener('storage', checkAuthorization);
        return () => {
            window.removeEventListener('storage', checkAuthorization);
        };
    }, [user.role]);

    if (isLoading) {
        return (
             <div className="flex flex-col items-center justify-center h-screen bg-background text-foreground">
                {/* You can add a spinner here */}
            </div>
        )
    }

    if (!isAuthorized) {
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-background text-foreground">
                <ShieldBan className="w-16 h-16 text-destructive mb-4" />
                <h1 className="text-2xl font-headline text-destructive">Access Denied</h1>
                <p className="text-muted-foreground">You do not have permission to view this page or the feature is disabled.</p>
                <p className="text-sm text-muted-foreground mt-2">Redirecting you to the landing page...</p>
            </div>
        );
    }

    return <WrappedComponent {...props} />;
  };

  AuthComponent.displayName = `withAuth(${WrappedComponent.displayName || WrappedComponent.name || 'Component'})`;

  return AuthComponent;
};

export default withAuth;
