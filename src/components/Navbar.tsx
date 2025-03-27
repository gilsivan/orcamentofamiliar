
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, ListChecks, BarChart4, Menu, X, Users } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { UserButton } from '@clerk/clerk-react';

const Navbar: React.FC = () => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const navItems = [
    { path: '/', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/transactions', label: 'Transações', icon: ListChecks },
    { path: '/reports', label: 'Relatórios', icon: BarChart4 },
    { path: '/familia', label: 'Família', icon: Users },
  ];
  
  return (
    <header className="w-full py-4 px-4 md:px-6 glass border-b border-slate-200 dark:border-slate-800 sticky top-0 z-50">
      <div className="container mx-auto">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <Link to="/" className="focus:outline-none">
              <h1 className="text-xl md:text-2xl font-semibold bg-gradient-to-r from-blue-500 to-violet-500 bg-clip-text text-transparent">
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
          
          <div className="flex items-center gap-4">
            <UserButton afterSignOutUrl="/entrar" />
            
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
                      <span className="text-lg font-medium">Menu</span>
                      <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="focus:outline-none">
                        <X className="h-5 w-5" />
                      </Button>
                    </div>
                    <div className="p-4 overflow-y-auto flex-1">
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
