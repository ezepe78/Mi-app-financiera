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
  const { groups, stats } = React.useMemo(() => {
    // 1. Filter and sort ascending to calculate running balance
    const accountTxs = transactions.filter(t => t.accountId === account.id);
    const sortedAsc = [...accountTxs].sort((a, b) => 
      new Date(a.issueDate).getTime() - new Date(b.issueDate).getTime()
    );

    const balances: Record<string, number> = {};
    const grouped: Record<string, Transaction[]> = {};
    let runningBalance = account.initialBalance;
    let totalIncome = 0;
    let totalExpense = 0;

    sortedAsc.forEach(tx => {
      if (tx.completed) {
        runningBalance += tx.amount;
        if (tx.type === 'income' || (tx.type === 'transfer' && tx.amount > 0)) {
          totalIncome += tx.amount;
        } else if (tx.type === 'expense' || (tx.type === 'transfer' && tx.amount < 0)) {
          totalExpense += Math.abs(tx.amount);
        }
      }
      const dateKey = format(parseISO(tx.issueDate), 'yyyy-MM-dd');
      balances[dateKey] = runningBalance;
      
      if (!grouped[dateKey]) grouped[dateKey] = [];
      grouped[dateKey].push(tx);
    });

    // 2. Convert to array and sort descending by date
    const sortedGroups = Object.entries(grouped)
      .map(([date, txs]) => ({
        date,
        txs: txs.sort((a, b) => new Date(b.issueDate).getTime() - new Date(a.issueDate).getTime()),
        dailyBalance: balances[date]
      }))
      .sort((a, b) => b.date.localeCompare(a.date));

    return { 
      groups: sortedGroups, 
      stats: { income: totalIncome, expense: totalExpense, currentBalance: runningBalance } 
    };
  }, [transactions, account.id, account.initialBalance]);

  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* Header */}
      <div className="sticky top-0 bg-white/80 backdrop-blur-xl z-30 border-b border-gray-100">
        <div className="max-w-2xl mx-auto px-4 h-16 flex items-center gap-4">
          <button 
            onClick={onBack}
            className="p-2 hover:bg-gray-100 rounded-full transition-all active:scale-90"
          >
            <ArrowLeft className="w-6 h-6 text-gray-600" />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-bold text-gray-900 truncate tracking-tight">{account.name}</h1>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Detalle de Cuenta</p>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Account Summary Card */}
        <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm mb-10 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50/50 rounded-full -mr-20 -mt-20 blur-3xl group-hover:bg-blue-100/50 transition-colors duration-700" />
          
          <div className="relative">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-2">Saldo Disponible</p>
            <h2 className="text-4xl font-black text-gray-900 font-mono tracking-tighter">
              ${stats.currentBalance.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              <span className="text-lg font-bold text-gray-300 ml-2 font-sans">ARS</span>
            </h2>
            
            <div className="grid grid-cols-2 gap-4 mt-8 pt-8 border-t border-gray-50">
              <div className="bg-emerald-50/50 p-4 rounded-2xl border border-emerald-100/50">
                <p className="text-[9px] text-emerald-600 font-black uppercase tracking-widest mb-1">Ingresos</p>
                <p className="text-lg font-bold text-emerald-700 font-mono">+${stats.income.toLocaleString('es-AR', { maximumFractionDigits: 0 })}</p>
              </div>
              <div className="bg-orange-50/50 p-4 rounded-2xl border border-orange-100/50">
                <p className="text-[9px] text-orange-600 font-black uppercase tracking-widest mb-1">Gastos</p>
                <p className="text-lg font-bold text-orange-700 font-mono">-${stats.expense.toLocaleString('es-AR', { maximumFractionDigits: 0 })}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className="space-y-10">
          {groups.length === 0 ? (
            <div className="text-center py-24 bg-white rounded-[2.5rem] border border-gray-100 border-dashed">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-gray-300" />
              </div>
              <p className="text-gray-400 font-medium">No se encontraron movimientos</p>
            </div>
          ) : (
            groups.map((group) => {
              const date = parseISO(group.date);
              const isToday = isSameDay(date, new Date());
              const dateLabel = format(date, "d 'de' MMMM", { locale: es });
              const dayName = format(date, "EEEE", { locale: es });

              return (
                <div key={group.date} className="relative">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-sm font-black text-gray-900 capitalize">{isToday ? 'Hoy' : dayName}</h3>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{dateLabel}</p>
                    </div>
                    <div className="px-3 py-1.5 bg-blue-50 rounded-full border border-blue-100">
                      <p className="text-[10px] font-bold text-blue-600 font-mono">
                        Saldo: ${group.dailyBalance.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                  </div>
                  
                  <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden divide-y divide-gray-50">
                    {group.txs.map((tx) => {
                      const category = categories.find(c => c.id === tx.categoryId);
                      const isIncome = tx.type === 'income' || (tx.type === 'transfer' && tx.amount > 0);
                      
                      return (
                        <div key={tx.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors group/item">
                          <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover/item:scale-110 ${
                              isIncome ? 'bg-emerald-50 text-emerald-600' : 'bg-orange-50 text-orange-600'
                            }`}>
                              {isIncome ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownRight className="w-5 h-5" />}
                            </div>
                            <div className="min-w-0">
                              <p className="font-bold text-gray-900 text-sm truncate">{tx.description}</p>
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">
                                  {tx.type === 'transfer' ? 'Transferencia' : (category?.name || 'General')}
                                </span>
                                <span className="text-[10px] text-gray-300">•</span>
                                <span className="text-[10px] font-medium text-gray-400">{format(parseISO(tx.issueDate), 'HH:mm')}</span>
                              </div>
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <p className={`font-bold text-sm font-mono ${isIncome ? 'text-emerald-600' : 'text-gray-900'}`}>
                              {isIncome ? '+' : '-'}${Math.abs(tx.amount).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </p>
                            <div className="flex items-center justify-end gap-1 mt-0.5">
                              {tx.completed ? (
                                <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                              ) : (
                                <Clock className="w-3 h-3 text-orange-500" />
                              )}
                              <span className={`text-[9px] font-bold uppercase tracking-tighter ${tx.completed ? 'text-emerald-600' : 'text-orange-600'}`}>
                                {tx.completed ? 'Confirmado' : 'Pendiente'}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
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
