import React from 'react';
import { LayoutDashboard, ArrowRightLeft, Wallet, Tags, Settings, LogOut } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { logout } from '@/lib/firebase';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

type ViewType = 'dashboard' | 'transactions' | 'accounts' | 'categories' | 'settings';

interface SidebarProps {
  currentView: ViewType;
  setCurrentView: (view: ViewType) => void;
}

export function Sidebar({ currentView, setCurrentView }: SidebarProps) {
  const navItems = [
    { id: 'dashboard', label: 'Inicio', icon: LayoutDashboard },
    { id: 'transactions', label: 'Transacciones', icon: ArrowRightLeft },
    { id: 'accounts', label: 'Cuentas', icon: Wallet },
    { id: 'categories', label: 'Categorías', icon: Tags },
  ];

  return (
    <aside className="w-64 bg-white border-r border-gray-100 h-screen flex flex-col sticky top-0 hidden md:flex">
      <div className="p-6 flex items-center gap-3">
        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
          F
        </div>
        <span className="text-xl font-bold text-gray-900">Finanzas</span>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentView(item.id as ViewType)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors",
                isActive 
                  ? "bg-blue-50 text-blue-600" 
                  : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
              )}
            >
              <Icon className={cn("w-5 h-5", isActive ? "text-blue-600" : "text-gray-400")} />
              {item.label}
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-100 space-y-1">
        <button 
          onClick={() => setCurrentView('settings')}
          className={cn(
            "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors",
            currentView === 'settings'
              ? "bg-blue-50 text-blue-600" 
              : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
          )}
        >
          <Settings className={cn("w-5 h-5", currentView === 'settings' ? "text-blue-600" : "text-gray-400")} />
          Configuración
        </button>
        <button 
          onClick={logout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          Cerrar Sesión
        </button>
      </div>
    </aside>
  );
}
