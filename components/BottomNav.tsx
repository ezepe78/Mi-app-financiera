'use client';

import React from 'react';
import { LayoutDashboard, ArrowRightLeft, Wallet, Tags, Settings } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

type ViewType = 'dashboard' | 'transactions' | 'accounts' | 'categories' | 'settings';

interface BottomNavProps {
  currentView: ViewType;
  setCurrentView: (view: ViewType) => void;
}

export function BottomNav({ currentView, setCurrentView }: BottomNavProps) {
  const navItems = [
    { id: 'dashboard', label: 'Inicio', icon: LayoutDashboard },
    { id: 'transactions', label: 'Transacciones', icon: ArrowRightLeft },
    { id: 'accounts', label: 'Cuentas', icon: Wallet },
    { id: 'categories', label: 'Categorías', icon: Tags },
    { id: 'settings', label: 'Ajustes', icon: Settings },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-2 pb-safe z-50">
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentView(item.id as ViewType)}
              className={cn(
                "flex flex-col items-center justify-center flex-1 h-full gap-1 transition-colors",
                isActive ? "text-blue-600" : "text-gray-400"
              )}
            >
              <span className="text-[10px] font-medium leading-none">{item.label}</span>
              {isActive && (
                <span className="w-1 h-1 bg-blue-600 rounded-full mt-0.5"></span>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
