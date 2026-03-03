import React from 'react';
import { useAuthStore } from '../../stores';

export interface ProtectedRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  redirectTo?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  fallback,
  redirectTo = '/login',
}) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isLoading = useAuthStore((state) => state.isLoading);

  if (isLoading) {
    return (
      <div className="auth-protected-route__loading">
        <div className="auth-protected-route__spinner" />
      </div>
    );
  }

  if (!isAuthenticated) {
    if (fallback) {
      return <>{fallback}</>;
    }
    
    if (typeof window !== 'undefined') {
      window.location.href = redirectTo;
    }
    
    return null;
  }

  return <>{children}</>;
};
