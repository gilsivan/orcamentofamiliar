
import React, { useEffect } from 'react';
import { Outlet, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth, SignedIn, SignedOut, useUser } from '@clerk/clerk-react';
import { Loader2 } from 'lucide-react';

const AuthLayout: React.FC = () => {
  const { isLoaded, userId } = useAuth();
  const { user, isSignedIn } = useUser();
  const location = useLocation();
  const navigate = useNavigate();

  // Verifica e redireciona automaticamente qualquer rota de autenticação para o dashboard
  useEffect(() => {
    if (isSignedIn && (location.pathname.includes('/entrar') || location.pathname.includes('/cadastro'))) {
      navigate('/', { replace: true });
    }
  }, [isSignedIn, location.pathname, navigate]);

  // Tela de carregamento melhorada enquanto o Clerk verifica a autenticação
  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-violet-500/5">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Carregando sua experiência...</p>
        </div>
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
