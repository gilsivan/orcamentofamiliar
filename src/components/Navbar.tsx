
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, ListChecks, BarChart4 } from 'lucide-react';

const Navbar: React.FC = () => {
  const location = useLocation();
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };
  
  return (
    <header className="w-full py-4 px-6 glass border-b border-slate-200 dark:border-slate-800 sticky top-0 z-50">
      <div className="container mx-auto">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <h1 className="text-2xl font-semibold bg-gradient-to-r from-blue-500 to-violet-500 bg-clip-text text-transparent">
              Orçamento Familiar
            </h1>
          </div>
          
          <nav className="hidden md:flex">
            <ul className="flex space-x-1">
              <li>
                <Link
                  to="/"
                  className={`flex items-center px-4 py-2 rounded-lg transition-all ${
                    isActive('/') 
                      ? 'bg-primary text-primary-foreground' 
                      : 'hover:bg-secondary'
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4 mr-2" />
                  Dashboard
                </Link>
              </li>
              <li>
                <Link
                  to="/transactions"
                  className={`flex items-center px-4 py-2 rounded-lg transition-all ${
                    isActive('/transactions') 
                      ? 'bg-primary text-primary-foreground' 
                      : 'hover:bg-secondary'
                  }`}
                >
                  <ListChecks className="w-4 h-4 mr-2" />
                  Transações
                </Link>
              </li>
              <li>
                <Link
                  to="/reports"
                  className={`flex items-center px-4 py-2 rounded-lg transition-all ${
                    isActive('/reports') 
                      ? 'bg-primary text-primary-foreground' 
                      : 'hover:bg-secondary'
                  }`}
                >
                  <BarChart4 className="w-4 h-4 mr-2" />
                  Relatórios
                </Link>
              </li>
            </ul>
          </nav>
          
          <div className="md:hidden">
            {/* Mobile menu would go here */}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
