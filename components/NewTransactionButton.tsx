'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Plus, ArrowUpRight, ArrowDownRight, ArrowLeftRight, ChevronDown } from 'lucide-react';

interface NewTransactionButtonProps {
  onSelect: (type: 'income' | 'expense' | 'transfer') => void;
  className?: string;
}

export function NewTransactionButton({ onSelect, className = "" }: NewTransactionButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const options = [
    { id: 'transfer', label: 'Transferencia', icon: ArrowLeftRight, color: 'text-amber-500', bgColor: 'bg-amber-50' },
    { id: 'income', label: 'Ingreso', icon: ArrowUpRight, color: 'text-emerald-500', bgColor: 'bg-emerald-50' },
    { id: 'expense', label: 'Gasto', icon: ArrowDownRight, color: 'text-rose-500', bgColor: 'bg-rose-50' },
  ] as const;

  return (
    <>
      {/* Overlay when menu is open */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-[2px] z-[140] animate-in fade-in duration-300"
          onClick={() => setIsOpen(false)}
        />
      )}

      <div className="fixed bottom-8 right-8 z-[150]" ref={dropdownRef}>
        {/* Speed Dial Options */}
        <div className="absolute bottom-full right-0 mb-4 space-y-3 flex flex-col items-end">
          {options.map((option, index) => (
            <div 
              key={option.id}
              className={`flex items-center gap-3 transition-all duration-300 ${
                isOpen 
                  ? 'opacity-100 translate-y-0 scale-100' 
                  : 'opacity-0 translate-y-4 scale-50 pointer-events-none'
              }`}
              style={{ transitionDelay: `${index * 50}ms` }}
            >
              <span className="bg-white px-3 py-1.5 rounded-lg shadow-lg text-sm font-bold text-gray-700 border border-gray-100">
                {option.label}
              </span>
              <button
                onClick={() => {
                  onSelect(option.id);
                  setIsOpen(false);
                }}
                className={`w-12 h-12 ${option.bgColor} ${option.color} rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition-transform active:scale-95 border border-white`}
              >
                <option.icon className="w-6 h-6" />
              </button>
            </div>
          ))}
        </div>

        {/* Main FAB */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`w-16 h-16 bg-blue-600 text-white rounded-full shadow-2xl flex items-center justify-center hover:bg-blue-700 transition-all active:scale-90 group relative ${isOpen ? 'rotate-0' : ''}`}
        >
          <Plus className={`w-8 h-8 transition-transform duration-300 ${isOpen ? 'rotate-45' : ''}`} />
          
          {/* Tooltip on hover (only when closed) */}
          {!isOpen && (
            <span className="absolute right-full mr-4 px-3 py-1.5 bg-gray-900 text-white text-xs font-bold rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
              Nueva Transacción
            </span>
          )}
        </button>
      </div>
    </>
  );
}
