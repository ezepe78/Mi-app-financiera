'use client';

import React from 'react';
import { LayoutDashboard, ArrowRightLeft, Wallet, Tags, Settings } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { motion } from 'motion/react';

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
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-2 pb-safe z-50 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentView(item.id as ViewType)}
              className={cn(
                "relative flex flex-col items-center justify-center flex-1 h-full gap-1 transition-all duration-200",
                isActive ? "text-blue-600" : "text-gray-500 hover:text-gray-900"
              )}
            >
              <div className="relative p-1.5 z-10 flex items-center justify-center">
                {isActive && (
                  <motion.div
                    layoutId="bottomNavIndicator"
                    className="absolute inset-0 bg-blue-100 rounded-2xl -z-10"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                <Icon className={cn("w-5 h-5 relative z-10 transition-all duration-200", isActive ? "stroke-[2.5px]" : "stroke-2")} />
              </div>
              <span className={cn(
                "text-[10px] leading-none transition-all duration-200",
                isActive ? "font-semibold text-blue-600" : "font-medium text-gray-500"
              )}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
