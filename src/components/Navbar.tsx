
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, ListChecks, BarChart4, Menu, X, Users, Bell, Search } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { UserButton } from '@clerk/clerk-react';
import { Input } from '@/components/ui/input';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';

const Navbar: React.FC = () => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { toast } = useToast();
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };

  // Efeito para detectar scroll
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { path: '/', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/transactions', label: 'Transações', icon: ListChecks },
    { path: '/reports', label: 'Relatórios', icon: BarChart4 },
    { path: '/familia', label: 'Família', icon: Users },
  ];

  // Mostrar notificação
  const showNotification = () => {
    toast({
      title: "Notificações",
      description: "Você não tem novas notificações no momento.",
    });
  };
  
  return (
    <header className={`w-full py-3 px-4 md:px-6 sticky top-0 z-50 transition-all duration-300 ${
      isScrolled ? 'bg-background/80 backdrop-blur-lg shadow-sm' : 'glass'
    }`}>
      <div className="container mx-auto">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <Link to="/" className="focus:outline-none">
              <h1 className="text-xl md:text-2xl font-semibold bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">
                Orçamento Familiar
              </h1>
            </Link>
          </div>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex">
            <ul className="flex space-x-1">
              {navItems.map((item) => (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={`flex items-center px-4 py-2 rounded-lg transition-all ${
                      isActive(item.path) 
                        ? 'bg-primary text-primary-foreground' 
                        : 'hover:bg-secondary'
                    }`}
                  >
                    <item.icon className="w-4 h-4 mr-2" />
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex relative max-w-[180px] lg:max-w-[280px]">
              <Input
                type="text"
                placeholder="Buscar..."
                className="pr-8 h-9 bg-secondary/50"
              />
              <Search className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="h-5 w-5" />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full"></span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={showNotification}>
                  Sem novas notificações
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <UserButton 
              afterSignOutUrl="/entrar" 
              appearance={{
                elements: {
                  userButtonAvatarBox: "w-9 h-9"
                }
              }}
            />
            
            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <Sheet open={isOpen} onOpenChange={setIsOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="focus:outline-none">
                    <Menu className="h-6 w-6" />
                    <span className="sr-only">Abrir menu</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[250px] sm:w-[300px] p-0">
                  <nav className="flex flex-col h-full">
                    <div className="flex items-center justify-between p-4 border-b">
                      <span className="text-lg font-medium bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">Menu</span>
                      <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="focus:outline-none">
                        <X className="h-5 w-5" />
                      </Button>
                    </div>
                    <div className="p-4 overflow-y-auto flex-1">
                      <div className="mb-4">
                        <Input
                          type="text"
                          placeholder="Buscar..."
                          className="w-full"
                        />
                      </div>
                      <ul className="flex flex-col space-y-2">
                        {navItems.map((item) => (
                          <li key={item.path}>
                            <Link
                              to={item.path}
                              className={`flex items-center px-4 py-3 rounded-lg transition-all ${
                                isActive(item.path) 
                                  ? 'bg-primary text-primary-foreground' 
                                  : 'hover:bg-secondary'
                              }`}
                              onClick={() => setIsOpen(false)}
                            >
                              <item.icon className="w-5 h-5 mr-3" />
                              {item.label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </nav>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
