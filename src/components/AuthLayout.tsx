
import React, { useEffect } from 'react';
import { Outlet, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth, SignedIn, SignedOut, useUser } from '@clerk/clerk-react';

const AuthLayout: React.FC = () => {
  const { isLoaded, userId } = useAuth();
  const { user, isSignedIn } = useUser();
  const location = useLocation();
  const navigate = useNavigate();

  // Verifica e redireciona automaticamente qualquer rota de autenticação para o dashboard
  useEffect(() => {
    if (isSignedIn && location.pathname.includes('/entrar')) {
      navigate('/', { replace: true });
    }
  }, [isSignedIn, location.pathname, navigate]);

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
