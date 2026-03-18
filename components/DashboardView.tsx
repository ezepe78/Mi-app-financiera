import React, { useState } from 'react';
import { Account, Transaction, Category } from '@/hooks/useFinanceData';
import { format, parseISO, startOfMonth, endOfMonth, isWithinInterval, isBefore, addMonths, subMonths } from 'date-fns';
import { es } from 'date-fns/locale';
import { ArrowUpRight, ArrowDownRight, TrendingUp, CheckCircle2, Clock, Wallet, Building2, CreditCard, ChevronLeft, ChevronRight } from 'lucide-react';
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
  const monthlyTransactions = transactions.filter(t => 
    isWithinInterval(parseISO(t.issueDate), { start: monthStart, end: monthEnd })
  );

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
      t.completed && 
      (isBefore(parseISO(t.issueDate), monthEnd) || format(parseISO(t.issueDate), 'yyyy-MM-dd') === format(monthEnd, 'yyyy-MM-dd'))
    );
    
    const income = accountTxs
      .filter(t => t.type === 'income' || (t.type === 'transfer' && t.amount > 0))
      .reduce((sum, t) => sum + t.amount, 0);
      
    const expense = accountTxs
      .filter(t => t.type === 'expense' || (t.type === 'transfer' && t.amount < 0))
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);
      
    return {
      ...account,
      historicalBalance: account.initialBalance + income - expense
    };
  });

  const totalHistoricalBalance = historicalAccounts.reduce((sum, a) => sum + a.historicalBalance, 0);

  const recentTransactions = [...monthlyTransactions]
    .sort((a, b) => new Date(b.issueDate).getTime() - new Date(a.issueDate).getTime())
    .slice(0, 5);

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
    <div className="p-4 md:p-8 max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Resumen</h1>
        </div>
        
        <div className="flex items-center justify-between bg-white px-4 py-2 rounded-2xl border border-gray-100 shadow-sm gap-4">
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

      {/* Global Control Bar / Total Balance */}
      <div className="bg-white p-6 md:p-8 rounded-3xl border border-gray-100 shadow-sm mb-8 text-center bg-gradient-to-b from-white to-gray-50/50">
        <p className="text-xs md:text-sm font-bold text-gray-500 uppercase tracking-widest mb-2">Balance Total al Cierre</p>
        <p className="text-3xl md:text-5xl font-black text-gray-900 mb-8 font-mono">
          ${totalHistoricalBalance.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          <span className="text-lg md:text-xl font-bold text-gray-400 ml-2 font-sans">ARS</span>
        </p>
        
        <div className="flex flex-col gap-3 w-full max-w-sm mx-auto mt-6">
          {historicalAccounts.map(account => {
            const balanceStr = account.historicalBalance.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
            const isLargeAmount = balanceStr.length > 12;
            
            return (
              <div key={account.id} className="bg-white px-5 py-3.5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between gap-4 w-full">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center shrink-0">
                    {getAccountIcon(account.type)}
                  </div>
                  <div className="text-left min-w-0">
                    <p className="text-[10px] font-bold text-gray-400 uppercase truncate leading-tight">{account.name}</p>
                    <p className="text-[9px] text-gray-400 uppercase tracking-tighter">Saldo al cierre</p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className={`font-bold text-gray-900 font-mono ${isLargeAmount ? 'text-sm' : 'text-base'}`}>
                    ${balanceStr}
                  </p>
                </div>
              </div>
            );
          })}
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
                const category = categories.find(c => c.id === tx.categoryId);
                const account = accounts.find(a => a.id === tx.accountId);
                const isIncome = tx.type === 'income' || (tx.type === 'transfer' && tx.amount > 0);
                const txTypeLabel = tx.type === 'transfer' ? 'Transferencia' : (tx.type === 'income' ? 'Ingreso' : 'Gasto');
                
                return (
                  <div key={tx.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center",
                        isIncome ? "bg-emerald-50 text-emerald-600" : "bg-orange-50 text-orange-600"
                      )}>
                        {isIncome ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownRight className="w-5 h-5" />}
                      </div>
                      <div>
                        <p className="font-bold text-gray-900">{tx.description}</p>
                        <p className="text-sm text-gray-500">{txTypeLabel} • {category?.name || 'Sin categoría'} • {account?.name}</p>
                      </div>
                    </div>
                    <div className="text-right flex items-center gap-4">
                      <div>
                        <p className={cn(
                          "font-bold font-mono",
                          isIncome ? "text-emerald-600" : "text-gray-900"
                        )}>
                          {isIncome ? '+' : '-'}${Math.abs(tx.amount).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </p>
                        <p className="text-sm text-gray-500">{format(parseISO(tx.issueDate), 'HH:mm')} • {format(parseISO(tx.issueDate), 'dd MMM')}</p>
                      </div>
                      {tx.completed ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                      ) : (
                        <Clock className="w-5 h-5 text-orange-500" />
                      )}
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
