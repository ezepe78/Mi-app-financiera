'use client';

import React, { useState } from 'react';
import { useFinanceData } from '@/hooks/useFinanceData';
import { Sidebar } from '@/components/Sidebar';
import { RightPanel } from '@/components/RightPanel';
import { BottomNav } from '@/components/BottomNav';
import { DashboardView } from '@/components/DashboardView';
import { TransactionsView } from '@/components/TransactionsView';
import { AccountsView } from '@/components/AccountsView';
import { CategoriesView } from '@/components/CategoriesView';
import { SettingsView } from '@/components/SettingsView';
import { Login } from '@/components/Login';
import { useAuth } from '@/components/FirebaseProvider';
import { Bell, X, AlertCircle, Clock } from 'lucide-react';
import { format, isBefore, addDays, parseISO, startOfDay } from 'date-fns';
import { motion, AnimatePresence } from 'motion/react';

type ViewType = 'dashboard' | 'transactions' | 'accounts' | 'categories' | 'settings';

export default function Home() {
  const [mounted, setMounted] = React.useState(false);
  const { user, loading: authLoading } = useAuth();
  const [currentView, setCurrentView] = useState<ViewType>('dashboard');
  const [mobileAlertsOpen, setMobileAlertsOpen] = useState(false);
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
    addTransfer,
    settings,
    updateSettings
  } = useFinanceData();

  const today = startOfDay(new Date());
  const upcomingExpenses = settings.upcomingAlerts ? transactions.filter(t => 
    t.type === 'expense' && 
    !t.completed && 
    isBefore(parseISO(t.dueDate), addDays(today, settings.upcomingDays + 1)) && 
    !isBefore(parseISO(t.dueDate), today)
  ) : [];

  const overdueTransactions = settings.overdueAlerts ? transactions.filter(t => 
    !t.completed && 
    isBefore(parseISO(t.dueDate), today)
  ) : [];

  const hasAlerts = upcomingExpenses.length > 0 || overdueTransactions.length > 0;

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
            transactions={transactions}
            onAdd={addCategory}
            onUpdate={updateCategory}
            onDelete={deleteCategory}
          />
        );
      case 'settings':
        return (
          <SettingsView 
            accounts={accounts}
            categories={categories}
            transactions={transactions}
            settings={settings}
            onUpdateSettings={updateSettings}
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
        <div className="flex items-center gap-1">
          <button 
            onClick={() => setMobileAlertsOpen(true)}
            className="p-2 text-gray-500 relative"
          >
            <Bell className="w-6 h-6" />
            {hasAlerts && (
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Alerts Drawer */}
      <AnimatePresence>
        {mobileAlertsOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileAlertsOpen(false)}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[60] md:hidden"
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 w-[85%] max-w-sm bg-white z-[70] shadow-2xl md:hidden flex flex-col"
            >
              <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Alertas</h2>
                <button onClick={() => setMobileAlertsOpen(false)} className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {!hasAlerts ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Bell className="w-8 h-8 text-gray-300" />
                    </div>
                    <p className="text-gray-500 font-medium">No tienes alertas pendientes</p>
                    <p className="text-sm text-gray-400 mt-1">Todo está al día por ahora.</p>
                  </div>
                ) : (
                  <>
                    {overdueTransactions.length > 0 && (
                      <div className="space-y-3">
                        <h3 className="text-xs font-bold text-red-600 uppercase tracking-widest">Vencidos</h3>
                        {overdueTransactions.map(t => (
                          <div key={t.id} className="p-4 bg-red-50 border border-red-100 rounded-2xl flex gap-3">
                            <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                            <div>
                              <p className="text-sm font-bold text-gray-900 leading-tight">{t.description}</p>
                              <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                Vto: {format(parseISO(t.dueDate), 'dd MMM yyyy')}
                              </p>
                              <p className="text-sm font-bold text-red-700 mt-2">
                                ${t.amount.toLocaleString('es-AR')}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    {upcomingExpenses.length > 0 && (
                      <div className="space-y-3">
                        <h3 className="text-xs font-bold text-orange-600 uppercase tracking-widest">Próximos</h3>
                        {upcomingExpenses.map(t => (
                          <div key={t.id} className="p-4 bg-orange-50 border border-orange-100 rounded-2xl flex gap-3">
                            <Clock className="w-5 h-5 text-orange-600 shrink-0 mt-0.5" />
                            <div>
                              <p className="text-sm font-bold text-gray-900 leading-tight">{t.description}</p>
                              <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                Vto: {format(parseISO(t.dueDate), 'dd MMM yyyy')}
                              </p>
                              <p className="text-sm font-bold text-orange-700 mt-2">
                                ${t.amount.toLocaleString('es-AR')}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
              <div className="p-6 border-t border-gray-100 bg-gray-50">
                <button 
                  onClick={() => {
                    setCurrentView('settings');
                    setMobileAlertsOpen(false);
                  }}
                  className="w-full py-3 bg-white border border-gray-200 text-gray-600 rounded-xl text-sm font-bold hover:bg-gray-100 transition-colors"
                >
                  Configurar Alertas
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <Sidebar currentView={currentView} setCurrentView={setCurrentView} />
      
      <main className="flex-1 overflow-y-auto pt-16 md:pt-0 pb-20 md:pb-0">
        {renderView()}
      </main>

      <RightPanel 
        accounts={accounts} 
        transactions={transactions} 
        settings={settings}
      />

      <BottomNav currentView={currentView} setCurrentView={setCurrentView} />
    </div>
  );
}
