import React from 'react';
import { Bell, User as UserIcon } from 'lucide-react';
import { Account, Transaction } from '@/hooks/useFinanceData';
import { format, isBefore, addDays, parseISO, startOfDay } from 'date-fns';
import { useAuth } from '@/components/FirebaseProvider';

interface RightPanelProps {
  accounts: Account[];
  transactions: Transaction[];
}

export function RightPanel({ accounts, transactions }: RightPanelProps) {
  const { user } = useAuth();
  const today = startOfDay(new Date());
  
  // Calculate total balance
  const totalBalance = accounts.reduce((acc, account) => {
    const accountTxs = transactions.filter(t => t.accountId === account.id && t.completed);
    const income = accountTxs.filter(t => t.type === 'income' || (t.type === 'transfer' && t.amount > 0)).reduce((sum, t) => sum + t.amount, 0);
    const expense = accountTxs.filter(t => t.type === 'expense' || (t.type === 'transfer' && t.amount < 0)).reduce((sum, t) => sum + Math.abs(t.amount), 0);
    return acc + account.initialBalance + income - expense;
  }, 0);

  // Alerts
  const upcomingExpenses = transactions.filter(t => 
    t.type === 'expense' && 
    !t.completed && 
    isBefore(parseISO(t.dueDate), addDays(today, 4)) && 
    !isBefore(parseISO(t.dueDate), today)
  );

  const overdueTransactions = transactions.filter(t => 
    !t.completed && 
    isBefore(parseISO(t.dueDate), today)
  );

  return (
    <aside className="w-80 bg-gray-50 border-l border-gray-100 h-screen overflow-y-auto p-6 hidden lg:block sticky top-0">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-3">
          {user?.photoURL ? (
            <img src={user.photoURL} alt={user.displayName || 'User'} className="w-10 h-10 rounded-full" />
          ) : (
            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
              <UserIcon className="w-5 h-5 text-gray-500" />
            </div>
          )}
          <div>
            <p className="text-sm font-medium text-gray-900 truncate max-w-[120px]">
              {user?.displayName || 'Usuario'}
            </p>
            <p className="text-xs text-gray-500">Personal</p>
          </div>
        </div>
        <button className="relative p-2 text-gray-400 hover:text-gray-600 transition-colors">
          <Bell className="w-5 h-5" />
          {(upcomingExpenses.length > 0 || overdueTransactions.length > 0) && (
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
          )}
        </button>
      </div>

      <div className="bg-blue-600 rounded-2xl p-6 text-white mb-8 shadow-lg shadow-blue-600/20">
        <p className="text-blue-100 text-sm font-medium mb-1">Balance Total</p>
        <h2 className="text-3xl font-bold mb-4">${totalBalance.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h2>
        <div className="flex gap-2">
          <button className="flex-1 bg-white/20 hover:bg-white/30 transition-colors py-2 rounded-lg text-sm font-medium">
            Retirar
          </button>
          <button className="flex-1 bg-white text-blue-600 hover:bg-blue-50 transition-colors py-2 rounded-lg text-sm font-medium">
            Depositar
          </button>
        </div>
      </div>

      <div className="mb-8">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Mi Portafolio</h3>
        <div className="space-y-4">
          {accounts.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-4">Aún no hay cuentas agregadas.</p>
          ) : (
            accounts.map(account => {
              const accountTxs = transactions.filter(t => t.accountId === account.id && t.completed);
              const income = accountTxs.filter(t => t.type === 'income' || (t.type === 'transfer' && t.amount > 0)).reduce((sum, t) => sum + t.amount, 0);
              const expense = accountTxs.filter(t => t.type === 'expense' || (t.type === 'transfer' && t.amount < 0)).reduce((sum, t) => sum + Math.abs(t.amount), 0);
              const balance = account.initialBalance + income - expense;

              return (
                <div key={account.id} className="flex items-center justify-between p-3 bg-white rounded-xl border border-gray-100 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-bold">
                      {account.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{account.name}</p>
                      <p className="text-xs text-gray-500">
                        {account.type === 'bank' ? 'Banco / Tarjeta' : 
                         account.type === 'cash' ? 'Efectivo' : 
                         'Billetera Virtual'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-gray-900">${balance.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {(upcomingExpenses.length > 0 || overdueTransactions.length > 0) && (
        <div>
          <h3 className="text-lg font-bold text-gray-900 mb-4">Alertas</h3>
          <div className="space-y-3">
            {overdueTransactions.map(t => (
              <div key={t.id} className="p-3 bg-red-50 border border-red-100 rounded-xl">
                <p className="text-xs font-bold text-red-600 mb-1">VENCIDO</p>
                <p className="text-sm text-gray-900">{t.description}</p>
                <p className="text-xs text-gray-500 mt-1">Vto: {format(parseISO(t.dueDate), 'dd MMM yyyy')}</p>
              </div>
            ))}
            {upcomingExpenses.map(t => (
              <div key={t.id} className="p-3 bg-orange-50 border border-orange-100 rounded-xl">
                <p className="text-xs font-bold text-orange-600 mb-1">PRÓXIMO</p>
                <p className="text-sm text-gray-900">{t.description}</p>
                <p className="text-xs text-gray-500 mt-1">Vto: {format(parseISO(t.dueDate), 'dd MMM yyyy')}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </aside>
  );
}
