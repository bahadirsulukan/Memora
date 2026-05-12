import React from 'react';
import { Navigate, useLocation } from 'react-router';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, loading, user } = useAuth();
  const location = useLocation();

  console.log('🔒 ProtectedRoute check:', { 
    loading, 
    isAuthenticated, 
    user: user?.email,
    path: location.pathname 
  });

  // Show loading while checking authentication
  if (loading) {
    console.log('⏳ Auth loading...');
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    console.log('❌ Not authenticated, redirecting to login');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  console.log('✅ Authenticated, rendering protected content');
  // If authenticated, render children
  return <>{children}</>;
}