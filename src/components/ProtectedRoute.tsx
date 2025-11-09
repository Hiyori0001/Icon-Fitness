"use client";

import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useSession } from '@/contexts/SessionContext';
import { useAdmin } from '@/hooks/useAdmin'; // Import useAdmin

interface ProtectedRouteProps {
  adminOnly?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ adminOnly = false }) => {
  const { session, isLoading: isSessionLoading } = useSession();
  const { isAdmin, isLoadingAdmin } = useAdmin();

  // If the session is still loading, show a general loading message
  if (isSessionLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-lg text-gray-600">Loading authentication...</p>
      </div>
    );
  }

  // If not logged in, redirect to the login page
  if (!session) {
    return <Navigate to="/login" replace />;
  }

  // If the route requires admin privileges and admin status is still loading, show a specific loading message
  if (adminOnly && isLoadingAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-lg text-gray-600">Checking admin privileges...</p>
      </div>
    );
  }

  // If the route requires admin privileges and the user is not an admin, show access denied
  if (adminOnly && !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Access Denied</h1>
          <p className="text-xl text-gray-600 mb-4">You do not have administrative privileges to view this page.</p>
          <Navigate to="/" replace />
        </div>
      </div>
    );
  }

  // If all checks pass, render the child routes
  return <Outlet />;
};

export default ProtectedRoute;