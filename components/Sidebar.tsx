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
    <aside className="w-72 bg-background border-r border-border h-screen flex flex-col sticky top-0 hidden md:flex">
      <div className="p-8 flex items-center gap-4">
        <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center text-white font-bold shadow-lg shadow-primary/20">
          P
        </div>
        <span className="text-2xl font-bold text-foreground tracking-tight">Payza</span>
      </div>

      <nav className="flex-1 px-6 py-8 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentView(item.id as ViewType)}
              className={cn(
                "w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-sm font-bold transition-all duration-200 uppercase tracking-widest",
                isActive 
                  ? "bg-primary text-white shadow-xl shadow-primary/30" 
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <Icon className={cn("w-5 h-5", isActive ? "text-white" : "text-muted-foreground")} />
              {item.label}
            </button>
          );
        })}
      </nav>

      <div className="p-6 border-t border-border space-y-2">
        <button 
          onClick={() => setCurrentView('settings')}
          className={cn(
            "w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-sm font-bold transition-all duration-200 uppercase tracking-widest",
            currentView === 'settings'
              ? "bg-primary text-white shadow-xl shadow-primary/30" 
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          )}
        >
          <Settings className={cn("w-5 h-5", currentView === 'settings' ? "text-white" : "text-muted-foreground")} />
          Ajustes
        </button>
        <button 
          onClick={logout}
          className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-sm font-bold text-rose-500 hover:bg-rose-500/10 transition-all duration-200 uppercase tracking-widest"
        >
          <LogOut className="w-5 h-5" />
          Salir
        </button>
      </div>
    </aside>
  );
}
