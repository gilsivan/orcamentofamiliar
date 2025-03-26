
import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';

// Check if Clerk is available
const isClerkAvailable = () => {
  try {
    return !!import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
  } catch (e) {
    return false;
  }
};

const AuthLayout: React.FC = () => {
  // If Clerk is not available, just render the content
  if (!isClerkAvailable()) {
    return <Outlet />;
  }

  // Only import Clerk components if available
  const { useAuth, SignedIn, SignedOut } = require('@clerk/clerk-react');
  const { isLoaded } = useAuth();

  // Mostra uma tela de carregamento enquanto o Clerk está verificando a autenticação
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
