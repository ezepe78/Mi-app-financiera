import React, { useState, useMemo } from 'react';
import { Account, Transaction, Category } from '@/hooks/useFinanceData';
import { format, parseISO, startOfMonth, endOfMonth, isWithinInterval, isBefore, addMonths, subMonths } from 'date-fns';
import { es } from 'date-fns/locale';
import { ArrowUpRight, ArrowDownRight, TrendingUp, CheckCircle2, Clock, Wallet, Building2, CreditCard, ChevronLeft, ChevronRight, ArrowRightLeft } from 'lucide-react';
import { MonthlyEconomyCard } from './MonthlyEconomyCard';
import { NewTransactionButton } from './NewTransactionButton';
import { TransactionModal } from './TransactionModal';

interface DashboardViewProps {
  accounts: Account[];
  transactions: Transaction[];
  categories: Category[];
  onAdd: (tx: Omit<Transaction, 'id' | 'uid'>) => void;
  onAddTransfer: (from: string, to: string, amount: number, date: string, desc: string) => void;
}

export function DashboardView({ accounts, transactions, categories, onAdd, onAddTransfer }: DashboardViewProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [isAdding, setIsAdding] = useState(false);
  const [txType, setTxType] = useState<'income' | 'expense' | 'transfer'>('expense');
  
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);

  // Calculate monthly stats
  const monthlyTransactions = useMemo(() => transactions.filter(t => 
    isWithinInterval(parseISO(t.issueDate), { start: monthStart, end: monthEnd })
  ), [transactions, monthStart, monthEnd]);

  const monthlyIncome = monthlyTransactions
    .filter(t => t.type === 'income' && t.completed)
    .reduce((sum, t) => sum + t.amount, 0);

  const monthlyExpenses = monthlyTransactions
    .filter(t => t.type === 'expense' && t.completed)
    .reduce((sum, t) => sum + t.amount, 0);

  const projectedIncome = monthlyTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const projectedExpenses = monthlyTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const monthlyEconomy = projectedIncome - projectedExpenses;

  // Calculate historical balances (at the end of selected month)
  const historicalAccounts = accounts.map(account => {
    const accountTxs = transactions.filter(t => 
      t.accountId === account.id && 
      (isBefore(parseISO(t.issueDate), monthEnd) || format(parseISO(t.issueDate), 'yyyy-MM-dd') === format(monthEnd, 'yyyy-MM-dd'))
    );
    
    const completedIncome = accountTxs
      .filter(t => t.completed && (t.type === 'income' || (t.type === 'transfer' && t.amount > 0)))
      .reduce((sum, t) => sum + t.amount, 0);
      
    const completedExpense = accountTxs
      .filter(t => t.completed && (t.type === 'expense' || (t.type === 'transfer' && t.amount < 0)))
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    const allIncome = accountTxs
      .filter(t => t.type === 'income' || (t.type === 'transfer' && t.amount > 0))
      .reduce((sum, t) => sum + t.amount, 0);
      
    const allExpense = accountTxs
      .filter(t => t.type === 'expense' || (t.type === 'transfer' && t.amount < 0))
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);
      
    return {
      ...account,
      historicalBalance: account.initialBalance + completedIncome - completedExpense,
      projectedBalance: account.initialBalance + allIncome - allExpense
    };
  });

  const totalHistoricalBalance = historicalAccounts.reduce((sum, a) => sum + a.historicalBalance, 0);
  const totalProjectedBalance = historicalAccounts.reduce((sum, a) => sum + a.projectedBalance, 0);

  const recentTransactions = useMemo(() => {
    const sorted = [...monthlyTransactions].sort((a, b) => new Date(b.issueDate).getTime() - new Date(a.issueDate).getTime());
    
    const processedIds = new Set<string>();
    const unified: any[] = [];

    sorted.forEach(tx => {
      if (processedIds.has(tx.id)) return;

      if (tx.type === 'transfer' && tx.linkedTransactionId) {
        const linkedTx = transactions.find(t => t.id === tx.linkedTransactionId);
        
        if (linkedTx) {
          const fromTx = tx.amount < 0 ? tx : linkedTx;
          const toTx = tx.amount > 0 ? tx : linkedTx;
          
          unified.push({
            ...fromTx,
            type: 'unified_transfer',
            fromAccountId: fromTx.accountId,
            toAccountId: toTx.accountId,
            amount: Math.abs(fromTx.amount),
            originalIds: [fromTx.id, toTx.id],
            completed: fromTx.completed && toTx.completed
          });
          
          processedIds.add(fromTx.id);
          processedIds.add(toTx.id);
        } else {
          unified.push(tx);
          processedIds.add(tx.id);
        }
      } else {
        unified.push(tx);
        processedIds.add(tx.id);
      }
    });

    return unified.slice(0, 5);
  }, [monthlyTransactions, transactions]);

  const getAccountIcon = (type: string) => {
    switch(type) {
      case 'cash': return <Wallet className="w-4 h-4" />;
      case 'bank': return <Building2 className="w-4 h-4" />;
      case 'wallet': return <CreditCard className="w-4 h-4" />;
      default: return <Wallet className="w-4 h-4" />;
    }
  };

  const handleNewTransaction = (type: 'income' | 'expense' | 'transfer') => {
    setTxType(type);
    setIsAdding(true);
  };

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <h1 className="text-3xl font-bold text-gray-900">Resumen</h1>
        </div>
        
        <div className="flex items-center bg-white px-4 py-2 rounded-2xl border border-gray-100 shadow-sm gap-4">
          <button 
            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ChevronLeft className="w-6 h-6 text-gray-500" />
          </button>
          <div className="text-center min-w-[140px]">
            <p className="text-xs font-bold text-blue-600 uppercase tracking-wider">Periodo</p>
            <p className="text-lg font-bold text-gray-900 capitalize">
              {format(currentMonth, 'MMMM yyyy', { locale: es })}
            </p>
          </div>
          <button 
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ChevronRight className="w-6 h-6 text-gray-500" />
          </button>
        </div>
      </div>

      <TransactionModal 
        key={isAdding ? `open-${txType}` : 'closed'}
        isOpen={isAdding}
        onClose={() => setIsAdding(false)}
        type={txType}
        accounts={accounts}
        categories={categories}
        onAdd={onAdd}
        onAddTransfer={onAddTransfer}
      />

      {/* Accounts Summary Section */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm mb-8 overflow-hidden">
        <div className="p-6 border-b border-gray-50 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Cuentas</h2>
        </div>
        
        <div className="divide-y divide-gray-50">
          {historicalAccounts.map(account => (
            <div key={account.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center shrink-0">
                  {getAccountIcon(account.type)}
                </div>
                <div>
                  <p className="font-bold text-gray-900 uppercase text-sm tracking-tight">{account.name}</p>
                  <p className="text-xs text-gray-400 font-medium">
                    {account.type === 'cash' ? 'Efectivo' : account.type === 'bank' ? 'Banco' : 'Billetera'}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-gray-900">
                  ${account.historicalBalance.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ARS
                </p>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                  Previsto: ${account.projectedBalance.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ARS
                </p>
              </div>
            </div>
          ))}
          
          {/* Total Row */}
          <div className="p-6 bg-gray-50/50 flex items-center justify-between border-t border-gray-100">
            <div>
              <p className="text-lg font-bold text-gray-900">Total</p>
              <p className="text-xs text-gray-400 font-medium">Balance consolidado</p>
            </div>
            <div className="text-right">
              <p className="text-xl font-black text-gray-900">
                ${totalHistoricalBalance.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ARS
              </p>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                Previsto: ${totalProjectedBalance.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ARS
              </p>
            </div>
          </div>
        </div>
      </div>

      <MonthlyEconomyCard 
        transactions={transactions} 
        categories={categories} 
        accounts={accounts} 
        currentMonth={currentMonth}
        onMonthChange={setCurrentMonth}
      />

      <div className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Últimas Transacciones</h2>
          <button className="text-blue-600 text-sm font-medium hover:text-blue-700">Ver todo</button>
        </div>
        
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {recentTransactions.length === 0 ? (
            <div className="p-8 text-center text-gray-500">Aún no hay transacciones.</div>
          ) : (
            <div className="divide-y divide-gray-100">
              {recentTransactions.map(tx => {
                if (tx.type === 'unified_transfer') {
                  const fromAccount = accounts.find(a => a.id === tx.fromAccountId);
                  const toAccount = accounts.find(a => a.id === tx.toAccountId);
                  
                  return (
                    <div key={tx.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                      <div className="flex items-center gap-4 min-w-0 flex-1 mr-4">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center bg-blue-50 text-blue-600 shrink-0">
                          <ArrowRightLeft className="w-5 h-5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-bold text-gray-900 truncate">{tx.description || 'Transferencia'}</p>
                          <p className="text-sm text-gray-500 truncate">
                            De <span className="font-medium text-gray-700">{fromAccount?.name || 'Cuenta desconocida'}</span> a <span className="font-medium text-gray-700">{toAccount?.name || 'Cuenta desconocida'}</span>
                          </p>
                        </div>
                      </div>
                    <div className="flex items-center gap-2 sm:gap-4 shrink-0">
                      <div className="text-right min-w-[90px] sm:min-w-[120px]">
                        <p className="font-bold text-gray-900 whitespace-nowrap">
                          ${tx.amount.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </p>
                        <p className="text-xs text-gray-500 whitespace-nowrap">{format(parseISO(tx.issueDate), 'HH:mm')} • {format(parseISO(tx.issueDate), 'dd MMM')}</p>
                      </div>
                      <div className="shrink-0">
                        {tx.completed ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                        ) : (
                          <Clock className="w-5 h-5 text-orange-500" />
                        )}
                      </div>
                    </div>
                    </div>
                  );
                }

                const category = categories.find(c => c.id === tx.categoryId);
                const account = accounts.find(a => a.id === tx.accountId);
                const isIncome = tx.type === 'income' || (tx.type === 'transfer' && tx.amount > 0);
                const txTypeLabel = tx.type === 'transfer' ? 'Transferencia' : (tx.type === 'income' ? 'Ingreso' : 'Gasto');
                
                return (
                  <div key={tx.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-4 min-w-0 flex-1 mr-4">
                      <div className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center shrink-0",
                        isIncome ? "bg-emerald-50 text-emerald-600" : "bg-orange-50 text-orange-600"
                      )}>
                        {isIncome ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownRight className="w-5 h-5" />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-gray-900 truncate">{tx.description}</p>
                        <div className="text-sm text-gray-500 truncate">
                          <p className="truncate">{txTypeLabel} • {category?.name || 'Sin categoría'} • {account?.name}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-4 shrink-0">
                      <div className="text-right min-w-[90px] sm:min-w-[120px]">
                        <p className={cn(
                          "font-bold whitespace-nowrap",
                          isIncome ? "text-emerald-600" : "text-gray-900"
                        )}>
                          {isIncome ? '+' : '-'}${Math.abs(tx.amount).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </p>
                        <p className="text-xs text-gray-500 whitespace-nowrap">{format(parseISO(tx.issueDate), 'HH:mm')} • {format(parseISO(tx.issueDate), 'dd MMM')}</p>
                      </div>
                      <div className="shrink-0">
                        {tx.completed ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                        ) : (
                          <Clock className="w-5 h-5 text-orange-500" />
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
      <NewTransactionButton onSelect={handleNewTransaction} />
    </div>
  );
}

function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(' ');
}
