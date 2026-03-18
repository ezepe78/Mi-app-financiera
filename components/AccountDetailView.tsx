import React from 'react';
import { Account, Transaction, Category } from '@/hooks/useFinanceData';
import { format, parseISO, isSameDay, startOfDay } from 'date-fns';
import { es } from 'date-fns/locale';
import { ArrowLeft, ArrowUpRight, ArrowDownRight, CheckCircle2, Clock, Tags } from 'lucide-react';

interface AccountDetailViewProps {
  account: Account;
  transactions: Transaction[];
  categories: Category[];
  onBack: () => void;
}

export function AccountDetailView({ account, transactions, categories, onBack }: AccountDetailViewProps) {
  const accountTransactions = transactions
    .filter(t => t.accountId === account.id)
    .sort((a, b) => new Date(b.issueDate).getTime() - new Date(a.issueDate).getTime());

  const income = accountTransactions
    .filter(t => t.completed && (t.type === 'income' || (t.type === 'transfer' && t.amount > 0)))
    .reduce((sum, t) => sum + t.amount, 0);
  
  const expense = accountTransactions
    .filter(t => t.completed && (t.type === 'expense' || (t.type === 'transfer' && t.amount < 0)))
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  const currentBalance = account.initialBalance + income - expense;

  // Group transactions by date
  const groupedTransactions: { date: string; txs: Transaction[] }[] = [];
  accountTransactions.forEach(tx => {
    const dateStr = format(parseISO(tx.issueDate), 'yyyy-MM-dd');
    const existingGroup = groupedTransactions.find(g => g.date === dateStr);
    if (existingGroup) {
      existingGroup.txs.push(tx);
    } else {
      groupedTransactions.push({ date: dateStr, txs: [tx] });
    }
  });

  // Calculate daily balances
  // To calculate the balance at the end of each day, we need to iterate from initial balance forward
  const sortedAsc = [...accountTransactions].sort((a, b) => new Date(a.issueDate).getTime() - new Date(b.issueDate).getTime());
  
  const dailyBalances: Record<string, number> = {};
  let runningBalance = account.initialBalance;
  
  // We need to know the balance at the end of each day that has transactions
  const uniqueDates = Array.from(new Set(sortedAsc.map(t => format(parseISO(t.issueDate), 'yyyy-MM-dd')))).sort();
  
  uniqueDates.forEach(date => {
    const dayTxs = sortedAsc.filter(t => format(parseISO(t.issueDate), 'yyyy-MM-dd') === date && t.completed);
    dayTxs.forEach(tx => {
      runningBalance += tx.amount;
    });
    dailyBalances[date] = runningBalance;
  });

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="sticky top-0 bg-white/80 backdrop-blur-md z-10 border-b border-gray-100">
        <div className="max-w-2xl mx-auto px-4 h-16 flex items-center gap-4">
          <button 
            onClick={onBack}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-gray-600" />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-bold text-gray-900 truncate">{account.name}</h1>
            <p className="text-xs text-gray-500">Historial de movimientos</p>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Account Summary Card */}
        <div className="bg-blue-600 rounded-3xl p-8 text-white mb-12 shadow-xl shadow-blue-600/20">
          <p className="text-blue-100 text-sm font-medium mb-1">Saldo Actual</p>
          <h2 className="text-4xl font-black mb-2">
            ${currentBalance.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </h2>
          <div className="flex gap-4 mt-6 pt-6 border-t border-white/10">
            <div>
              <p className="text-[10px] text-blue-200 font-bold uppercase tracking-widest">Ingresos</p>
              <p className="text-lg font-bold">+${income.toLocaleString('es-AR')}</p>
            </div>
            <div className="w-px h-10 bg-white/10"></div>
            <div>
              <p className="text-[10px] text-blue-200 font-bold uppercase tracking-widest">Gastos</p>
              <p className="text-lg font-bold">-${expense.toLocaleString('es-AR')}</p>
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className="space-y-8">
          {groupedTransactions.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-gray-300" />
              </div>
              <p className="text-gray-500 font-medium">No hay movimientos aún</p>
            </div>
          ) : (
            groupedTransactions.map((group, groupIdx) => {
              const date = parseISO(group.date);
              const isToday = isSameDay(date, new Date());
              const dateLabel = format(date, "d '•' EEEE", { locale: es }) + (isToday ? ' (hoy)' : '');

              return (
                <div key={group.date} className="relative">
                  <h3 className="text-sm font-bold text-gray-400 mb-6 capitalize">{dateLabel}</h3>
                  
                  <div className="space-y-6 relative">
                    {/* Vertical line connector */}
                    <div className="absolute left-[19px] top-4 bottom-4 w-0.5 bg-gray-100 -z-10"></div>

                    {group.txs.map((tx, txIdx) => {
                      const category = categories.find(c => c.id === tx.categoryId);
                      const isIncome = tx.type === 'income' || (tx.type === 'transfer' && tx.amount > 0);
                      
                      return (
                        <div key={tx.id} className="flex items-center justify-between group">
                          <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 z-0 ${
                              isIncome ? 'bg-emerald-50 text-emerald-600' : 'bg-orange-50 text-orange-600'
                            }`}>
                              {isIncome ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownRight className="w-5 h-5" />}
                            </div>
                            <div className="min-w-0">
                              <p className="font-bold text-gray-900 text-sm truncate">{tx.description}</p>
                              <p className="text-xs text-gray-500 truncate">
                                {tx.type === 'transfer' ? 'Transferencia' : (category?.name || 'Sin categoría')}
                              </p>
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <p className={`font-bold text-sm ${isIncome ? 'text-emerald-600' : 'text-gray-900'}`}>
                              {isIncome ? '+' : '-'}${Math.abs(tx.amount).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </p>
                            <div className="flex items-center justify-end gap-1 mt-0.5">
                              {tx.completed ? (
                                <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                              ) : (
                                <Clock className="w-3 h-3 text-orange-500" />
                              )}
                              <span className="text-[10px] text-gray-400">{format(parseISO(tx.issueDate), 'HH:mm')}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    {/* Daily Balance Row */}
                    <div className="flex items-center justify-between pt-2">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 flex items-center justify-center">
                          <div className="w-2.5 h-2.5 bg-blue-500 rounded-full shadow-sm shadow-blue-500/40"></div>
                        </div>
                        <p className="text-sm font-bold text-gray-900">Saldo</p>
                      </div>
                      <p className="text-sm font-bold text-gray-900">
                        ${(dailyBalances[group.date] || 0).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
