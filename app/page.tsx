'use client';

import React, { useState } from 'react';
import { useFinanceData } from '@/hooks/useFinanceData';
import { Sidebar } from '@/components/Sidebar';
import { RightPanel } from '@/components/RightPanel';
import { DashboardView } from '@/components/DashboardView';
import { TransactionsView } from '@/components/TransactionsView';
import { AccountsView } from '@/components/AccountsView';
import { CategoriesView } from '@/components/CategoriesView';
import { Login } from '@/components/Login';
import { useAuth } from '@/components/FirebaseProvider';
import { Menu } from 'lucide-react';

type ViewType = 'dashboard' | 'transactions' | 'accounts' | 'categories';

export default function Home() {
  const [mounted, setMounted] = React.useState(false);
  const { user, loading: authLoading } = useAuth();
  const [currentView, setCurrentView] = useState<ViewType>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showForceButton, setShowForceButton] = useState(false);

  React.useEffect(() => {
    console.log("Home: Component mounted");
    setMounted(true);
    const tid = setTimeout(() => setShowForceButton(true), 5000);
    return () => clearTimeout(tid);
  }, []);
  
  const {
    accounts,
    categories,
    transactions,
    loading,
    addAccount,
    updateAccount,
    deleteAccount,
    addCategory,
    updateCategory,
    deleteCategory,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    addTransfer
  } = useFinanceData();

  console.log("Home: Render state", { mounted, authLoading, user: !!user, loading });

  if (!mounted || authLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white gap-8 p-6">
        <div className="relative">
          <div className="w-20 h-20 border-4 border-blue-100 rounded-full"></div>
          <div className="w-20 h-20 border-4 border-blue-600 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
        </div>
        <div className="text-center">
          <h2 className="text-xl font-bold text-gray-900 mb-2">Iniciando Aplicación</h2>
          <p className="text-gray-500 text-sm">Verificando tu sesión de forma segura...</p>
        </div>
        <div className="flex flex-col gap-3 w-full max-w-xs">
          <button 
            onClick={() => window.location.reload()}
            className="w-full py-3 bg-gray-900 text-white rounded-2xl font-bold text-sm hover:bg-black transition-colors"
          >
            Recargar Aplicación
          </button>
          <button 
            onClick={() => {
              localStorage.clear();
              if ('serviceWorker' in navigator) {
                navigator.serviceWorker.getRegistrations().then(regs => regs.forEach(r => r.unregister()));
              }
              window.location.reload();
            }}
            className="w-full py-3 bg-white border border-gray-200 text-gray-600 rounded-2xl font-bold text-sm hover:bg-gray-50 transition-colors"
          >
            Limpiar Caché y Forzar Reinicio
          </button>
        </div>
        <p className="text-[10px] text-gray-300 font-mono">v1.0.5</p>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white gap-8 p-6">
        <div className="relative">
          <div className="w-20 h-20 border-4 border-blue-100 rounded-full"></div>
          <div className="w-20 h-20 border-4 border-blue-600 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
        </div>
        <div className="text-center">
          <h2 className="text-xl font-bold text-gray-900 mb-2">Sincronizando Datos</h2>
          <p className="text-gray-500 text-sm">Estamos preparando tu panel financiero...</p>
        </div>
        <div className="flex flex-col gap-3 w-full max-w-xs">
          <button 
            onClick={() => {
              const bypassEvent = new CustomEvent('bypass-loading');
              window.dispatchEvent(bypassEvent);
            }}
            className="w-full py-3 bg-blue-600 text-white rounded-2xl font-bold text-sm hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20"
          >
            Omitir espera y entrar
          </button>
          <button 
            onClick={() => window.location.reload()}
            className="w-full py-3 bg-white border border-gray-200 text-gray-600 rounded-2xl font-bold text-sm hover:bg-gray-50 transition-colors"
          >
            Recargar
          </button>
        </div>
        <p className="text-[10px] text-gray-300 font-mono">v1.0.5</p>
      </div>
    );
  }

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return (
          <DashboardView 
            accounts={accounts} 
            transactions={transactions} 
            categories={categories} 
            onAdd={addTransaction}
            onAddTransfer={addTransfer}
          />
        );
      case 'transactions':
        return (
          <TransactionsView 
            transactions={transactions} 
            accounts={accounts} 
            categories={categories}
            onAdd={addTransaction}
            onUpdate={updateTransaction}
            onDelete={deleteTransaction}
            onAddTransfer={addTransfer}
          />
        );
      case 'accounts':
        return (
          <AccountsView 
            accounts={accounts} 
            transactions={transactions}
            onAdd={addAccount}
            onUpdate={updateAccount}
            onDelete={deleteAccount}
          />
        );
      case 'categories':
        return (
          <CategoriesView 
            categories={categories}
            onAdd={addCategory}
            onUpdate={updateCategory}
            onDelete={deleteCategory}
          />
        );
      default:
        return (
          <DashboardView 
            accounts={accounts} 
            transactions={transactions} 
            categories={categories} 
            onAdd={addTransaction}
            onAddTransfer={addTransfer}
          />
        );
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50 font-sans text-gray-900">
      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-100 flex items-center justify-between px-4 z-50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
            F
          </div>
          <span className="text-xl font-bold">Finanzas</span>
        </div>
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 text-gray-500">
          <Menu className="w-6 h-6" />
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 bg-white z-40 pt-16">
          <div className="p-4 space-y-2">
            {[
              { id: 'dashboard', label: 'Inicio' },
              { id: 'transactions', label: 'Transacciones' },
              { id: 'accounts', label: 'Cuentas' },
              { id: 'categories', label: 'Categorías' }
            ].map(view => (
              <button
                key={view.id}
                onClick={() => {
                  setCurrentView(view.id as ViewType);
                  setMobileMenuOpen(false);
                }}
                className={`w-full text-left px-4 py-3 rounded-xl font-medium ${
                  currentView === view.id ? 'bg-blue-50 text-blue-600' : 'text-gray-600'
                }`}
              >
                {view.label}
              </button>
            ))}
          </div>
        </div>
      )}

      <Sidebar currentView={currentView} setCurrentView={setCurrentView} />
      
      <main className="flex-1 overflow-y-auto pt-16 md:pt-0">
        {renderView()}
      </main>
    </div>
  );
}
