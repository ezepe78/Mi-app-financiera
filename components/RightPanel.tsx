import React from 'react';
import { Bell, User as UserIcon, AlertCircle, Clock } from 'lucide-react';
import { Account, Transaction, NotificationSettings } from '@/hooks/useFinanceData';
import { format, isBefore, addDays, parseISO, startOfDay } from 'date-fns';
import { useAuth } from '@/components/FirebaseProvider';

interface RightPanelProps {
  accounts: Account[];
  transactions: Transaction[];
  settings: NotificationSettings;
}

import Image from 'next/image';

export function RightPanel({ accounts, transactions, settings }: RightPanelProps) {
  const { user } = useAuth();
  const today = startOfDay(new Date());
  
  // Calculate total balance
  const totalBalance = accounts.reduce((acc, account) => {
    const accountTxs = transactions.filter(t => t.accountId === account.id && t.completed);
    const income = accountTxs.filter(t => t.type === 'income' || (t.type === 'transfer' && t.amount > 0)).reduce((sum, t) => sum + t.amount, 0);
    const expense = accountTxs.filter(t => t.type === 'expense' || (t.type === 'transfer' && t.amount < 0)).reduce((sum, t) => sum + Math.abs(t.amount), 0);
    return acc + account.initialBalance + income - expense;
  }, 0);

  // Alerts based on settings
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

  return (
    <aside className="w-80 bg-background border-l border-border h-screen overflow-y-auto p-8 hidden lg:block sticky top-0 scrollbar-hide">
      <div className="flex justify-between items-center mb-10">
        <div className="flex items-center gap-4">
          <div className="relative group cursor-pointer">
            <div className="absolute -inset-1 bg-gradient-to-r from-primary to-secondary rounded-full blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
            {user?.photoURL ? (
              <div className="relative w-12 h-12 border-2 border-background rounded-full overflow-hidden">
                <Image 
                  src={user.photoURL} 
                  alt={user.displayName || 'User'} 
                  fill 
                  className="object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
            ) : (
              <div className="relative w-12 h-12 bg-muted border-2 border-background rounded-full flex items-center justify-center">
                <UserIcon className="w-6 h-6 text-muted-foreground" />
              </div>
            )}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-foreground truncate leading-tight">
              {user?.displayName || 'Usuario'}
            </p>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-0.5">Premium Plan</p>
          </div>
        </div>
        <button className="relative p-3 text-muted-foreground hover:text-foreground bg-card rounded-2xl border border-border transition-all hover:scale-105 active:scale-95">
          <Bell className="w-5 h-5" />
          {hasAlerts && (
            <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-card animate-pulse"></span>
          )}
        </button>
      </div>

      <div className="bg-primary rounded-[32px] p-8 text-primary-foreground mb-10 shadow-2xl shadow-primary/20 relative overflow-hidden group">
        <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000"></div>
        <p className="text-primary-foreground/70 text-xs font-bold uppercase tracking-widest mb-2 relative z-10">Balance Total</p>
        <h2 className="text-3xl font-bold mb-8 relative z-10 tracking-tighter">
          <span className="text-lg mr-1 opacity-70">$</span>
          {totalBalance.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </h2>
        <div className="flex gap-3 relative z-10">
          <button className="flex-1 bg-white/20 hover:bg-white/30 backdrop-blur-md transition-all py-3 rounded-2xl text-xs font-bold active:scale-95">
            Retirar
          </button>
          <button className="flex-1 bg-white text-primary hover:bg-white/90 transition-all py-3 rounded-2xl text-xs font-bold shadow-lg shadow-black/10 active:scale-95">
            Depositar
          </button>
        </div>
      </div>

      <div className="mb-10">
        <div className="flex items-center justify-between mb-6 px-1">
          <h3 className="text-lg font-bold text-foreground tracking-tight">Mi Portafolio</h3>
          <button className="text-[10px] font-bold text-primary uppercase tracking-widest hover:underline">Ver Todo</button>
        </div>
        <div className="space-y-3">
          {accounts.length === 0 ? (
            <div className="bg-card rounded-[32px] border border-border border-dashed p-8 text-center">
              <p className="text-xs font-medium text-muted-foreground">Aún no hay cuentas agregadas.</p>
            </div>
          ) : (
            accounts.map(account => {
              const accountTxs = transactions.filter(t => t.accountId === account.id && t.completed);
              const income = accountTxs.filter(t => t.type === 'income' || (t.type === 'transfer' && t.amount > 0)).reduce((sum, t) => sum + t.amount, 0);
              const expense = accountTxs.filter(t => t.type === 'expense' || (t.type === 'transfer' && t.amount < 0)).reduce((sum, t) => sum + Math.abs(t.amount), 0);
              const balance = account.initialBalance + income - expense;

              return (
                <div key={account.id} className="flex items-center justify-between p-4 bg-card rounded-[24px] border border-border hover:border-primary/30 transition-all group cursor-pointer">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-muted text-muted-foreground flex items-center justify-center group-hover:bg-primary/10 group-hover:text-primary transition-colors border border-border group-hover:border-primary/20">
                      <span className="font-bold text-lg">{account.name.charAt(0).toUpperCase()}</span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-foreground truncate leading-tight">{account.name}</p>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-0.5 truncate">
                        {account.type === 'bank' ? 'Banco' : 
                         account.type === 'cash' ? 'Efectivo' : 
                         'Billetera'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold text-foreground tracking-tight">${balance.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {hasAlerts && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex items-center justify-between mb-6 px-1">
            <h3 className="text-lg font-bold text-foreground tracking-tight">Alertas</h3>
            <span className="px-3 py-1 bg-rose-500/10 text-rose-500 text-[10px] font-bold rounded-full uppercase tracking-widest border border-rose-500/20">
              {settings.frequency === 'realtime' ? 'En vivo' : settings.frequency === 'daily' ? 'Diario' : 'Semanal'}
            </span>
          </div>
          <div className="space-y-3">
            {overdueTransactions.map(t => (
              <div key={t.id} className="p-4 bg-rose-500/5 border border-rose-500/20 rounded-[24px] flex gap-4 group hover:bg-rose-500/10 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center shrink-0 border border-rose-500/20">
                  <AlertCircle className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-bold text-rose-500 mb-1 uppercase tracking-widest">VENCIDO</p>
                  <p className="text-sm font-bold text-foreground leading-tight truncate">{t.description}</p>
                  <p className="text-[10px] font-bold text-muted-foreground mt-2 flex items-center gap-1.5">
                    <Clock className="w-3 h-3" />
                    Vto: {format(parseISO(t.dueDate), 'dd MMM yyyy')}
                  </p>
                </div>
              </div>
            ))}
            {upcomingExpenses.map(t => (
              <div key={t.id} className="p-4 bg-amber-500/5 border border-amber-500/20 rounded-[24px] flex gap-4 group hover:bg-amber-500/10 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0 border border-amber-500/20">
                  <Clock className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-bold text-amber-500 mb-1 uppercase tracking-widest">PRÓXIMO</p>
                  <p className="text-sm font-bold text-foreground leading-tight truncate">{t.description}</p>
                  <p className="text-[10px] font-bold text-muted-foreground mt-2 flex items-center gap-1.5">
                    <Clock className="w-3 h-3" />
                    Vto: {format(parseISO(t.dueDate), 'dd MMM yyyy')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </aside>
  );
}
