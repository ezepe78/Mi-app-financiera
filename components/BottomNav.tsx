'use client';

import React from 'react';
import { LayoutDashboard, ArrowRightLeft, Wallet, Tags, Settings, Plus } from 'lucide-react';
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
  onAddClick?: () => void;
}

export function BottomNav({ currentView, setCurrentView, onAddClick }: BottomNavProps) {
  const navItems = [
    { id: 'dashboard', label: 'Inicio', icon: LayoutDashboard },
    { id: 'transactions', label: 'Movimientos', icon: ArrowRightLeft },
    { id: 'add', label: 'Añadir', icon: Plus, isAction: true },
    { id: 'accounts', label: 'Cuentas', icon: Wallet },
    { id: 'settings', label: 'Ajustes', icon: Settings },
  ];

  return (
    <nav className="md:hidden fixed bottom-8 left-6 right-6 bg-card/80 backdrop-blur-2xl border border-border px-2 pb-safe z-50 rounded-[40px] shadow-[0_20px_50px_rgba(0,0,0,0.2)]">
      <div className="flex items-center justify-around h-20">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          
          if (item.isAction) {
            return (
              <button
                key={item.id}
                onClick={onAddClick}
                className="relative -top-8 flex flex-col items-center justify-center"
              >
                <div className="w-16 h-16 bg-primary text-primary-foreground rounded-full shadow-2xl shadow-primary/40 flex items-center justify-center hover:scale-110 active:scale-90 transition-all duration-300 border-4 border-background">
                  <Plus className="w-8 h-8 stroke-[3px]" />
                </div>
                <span className="text-[10px] font-bold text-primary uppercase tracking-widest mt-2">
                  {item.label}
                </span>
              </button>
            );
          }

          return (
            <button
              key={item.id}
              onClick={() => setCurrentView(item.id as ViewType)}
              className={cn(
                "relative flex flex-col items-center justify-center flex-1 h-full gap-1 transition-all duration-300",
                isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <div className="relative p-2 z-10 flex items-center justify-center">
                {isActive && (
                  <motion.div
                    layoutId="bottomNavIndicator"
                    className="absolute inset-0 bg-primary/10 rounded-2xl -z-10"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                <Icon className={cn("w-5 h-5 relative z-10 transition-all duration-300", isActive ? "stroke-[2.5px] scale-110" : "stroke-2")} />
              </div>
              <span className={cn(
                "text-[10px] leading-none transition-all duration-300 uppercase tracking-tighter",
                isActive ? "font-bold text-primary" : "font-medium text-muted-foreground"
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
