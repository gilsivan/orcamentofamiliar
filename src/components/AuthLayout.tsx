
import React from 'react';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { useAuth, SignedIn, SignedOut } from '@clerk/clerk-react';

const AuthLayout: React.FC = () => {
  const { isLoaded, userId } = useAuth();
  const location = useLocation();

  // Verifica se estamos no caminho factor-one e redireciona
  if (location.pathname.includes('factor-one')) {
    return <Navigate to="/" replace />;
  }

  // Show loading screen while Clerk is verifying authentication
  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <>
      <SignedIn>
        <Outlet />
      </SignedIn>
      <SignedOut>
        <Navigate to="/entrar" replace />
      </SignedOut>
    </>
  );
};

export default AuthLayout;
