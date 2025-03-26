
import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Home } from "lucide-react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="glass p-8 rounded-xl max-w-md w-full animate-scale-in text-center">
        <h1 className="text-6xl font-bold text-primary mb-4">404</h1>
        <p className="text-xl mb-6">Oops! Página não encontrada.</p>
        <p className="text-muted-foreground mb-8">
          A página que você está procurando não existe ou foi movida.
        </p>
        <Button asChild>
          <Link to="/" className="inline-flex items-center">
            <Home className="mr-2 h-4 w-4" />
            Voltar para o início
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
