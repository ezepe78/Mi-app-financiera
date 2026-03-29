import React, { useState } from 'react';
import { Account, Transaction, Category } from '@/hooks/useFinanceData';
import { format, parseISO, startOfMonth, endOfMonth, isWithinInterval, isBefore, addMonths, subMonths } from 'date-fns';
import { es } from 'date-fns/locale';
import { Wallet, Building2, CreditCard, ChevronLeft, ChevronRight, Clock, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { MonthlyEconomyCard } from './MonthlyEconomyCard';
import { NewTransactionButton } from './NewTransactionButton';
import { TransactionModal } from './TransactionModal';
import { AccountTransactionsModal } from './AccountTransactionsModal';

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
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  
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

  const handleAccountClick = (accountId: string) => {
    setSelectedAccountId(accountId);
    setIsAccountModalOpen(true);
  };

  const selectedAccount = accounts.find(a => a.id === selectedAccountId) || null;

  const accountTypeMap: Record<string, string> = {
    cash: 'Efectivo',
    bank: 'Banco / Tarjeta',
    wallet: 'Billetera Virtual'
  };

  return (
    <div className="p-3 md:p-8 max-w-7xl mx-auto pb-24">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6 mb-6 md:mb-10">
        <div>
          <h1 className="text-2xl md:text-4xl font-black text-gray-900 tracking-tight">Resumen</h1>
          <p className="text-xs md:text-gray-500 font-medium">Gestiona tus finanzas con precisión</p>
        </div>
        
        <div className="flex items-center justify-between bg-white/80 backdrop-blur-md px-4 md:px-6 py-2 md:py-3 rounded-[2rem] border border-gray-100 shadow-sm gap-4 md:gap-6 self-start md:self-center">
          <button 
            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            className="p-1.5 md:p-2 hover:bg-gray-100 rounded-full transition-all active:scale-90"
          >
            <ChevronLeft className="w-5 h-5 md:w-6 md:h-6 text-gray-400 hover:text-blue-600" />
          </button>
          <div className="text-center min-w-[100px] md:min-w-[140px]">
            <p className="text-[8px] md:text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] mb-0.5">Periodo</p>
            <p className="text-sm md:text-lg font-bold text-gray-900 capitalize">
              {format(currentMonth, 'MMMM yyyy', { locale: es })}
            </p>
          </div>
          <button 
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            className="p-1.5 md:p-2 hover:bg-gray-100 rounded-full transition-all active:scale-90"
          >
            <ChevronRight className="w-5 h-5 md:w-6 md:h-6 text-gray-400 hover:text-blue-600" />
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
        transactions={transactions}
        onAdd={onAdd}
        onAddTransfer={onAddTransfer}
      />

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-6">
        
        {/* Main Balance Card - Spans 8 columns on MD */}
        <div className="md:col-span-8 bg-white p-5 md:p-10 rounded-[2rem] md:rounded-[2.5rem] border border-gray-100 shadow-sm flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50/30 rounded-full -mr-20 -mt-20 blur-3xl group-hover:bg-blue-100/40 transition-colors duration-700" />
          
          <div className="relative">
            <p className="text-[10px] md:text-sm font-black text-gray-400 uppercase tracking-[0.2em] mb-1 md:mb-3">Balance Total al Cierre</p>
            <h2 className="text-2xl md:text-6xl font-black text-gray-900 font-mono tracking-tighter">
              ${totalHistoricalBalance.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              <span className="text-sm md:text-2xl font-bold text-gray-300 ml-2 md:ml-3 font-sans">ARS</span>
            </h2>
          </div>

          {/* Accounts Vertical List */}
          <div className="mt-6 md:mt-12">
            <div className="flex flex-col gap-2">
              {historicalAccounts.map(account => (
                <button 
                  key={account.id} 
                  onClick={() => handleAccountClick(account.id)}
                  className="w-full bg-gray-50/50 p-3 md:p-4 rounded-2xl border border-gray-100/50 flex items-center justify-between hover:bg-white hover:shadow-md hover:border-blue-100 transition-all group/item text-left gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 bg-white shadow-sm text-blue-600 rounded-xl flex items-center justify-center group-hover/item:scale-110 transition-transform shrink-0">
                      {getAccountIcon(account.type)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] md:text-xs font-bold text-gray-900 truncate">{account.name}</p>
                      <p className="text-[8px] md:text-[10px] font-black text-gray-400 uppercase tracking-wider truncate">
                        {accountTypeMap[account.type] || account.type}
                      </p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm md:text-lg font-bold text-gray-900 font-mono">
                      ${account.historicalBalance.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                    <p className="text-[8px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest">Saldo</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Stats / Mini Bento - Spans 4 columns on MD, 2 columns on Mobile */}
        <div className="md:col-span-4 grid grid-cols-2 md:grid-cols-1 gap-3 md:gap-6">
          <div className="bg-emerald-500 p-4 md:p-8 rounded-[1.5rem] md:rounded-[2.5rem] text-white shadow-lg shadow-emerald-500/20 flex flex-col justify-between overflow-hidden relative group">
            <div className="absolute bottom-0 right-0 w-24 md:w-32 h-24 md:h-32 bg-white/10 rounded-full -mb-8 md:-mb-10 -mr-8 md:-mr-10 blur-xl md:blur-2xl group-hover:scale-150 transition-transform duration-700" />
            <p className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em] opacity-80 mb-1 md:mb-2">Ingresos</p>
            <p className="text-lg md:text-3xl font-black font-mono tracking-tight">
              +${monthlyIncome.toLocaleString('es-AR', { maximumFractionDigits: 0 })}
            </p>
          </div>

          <div className="bg-red-500 p-4 md:p-8 rounded-[1.5rem] md:rounded-[2.5rem] text-white shadow-lg shadow-red-500/20 flex flex-col justify-between overflow-hidden relative group">
            <div className="absolute bottom-0 right-0 w-24 md:w-32 h-24 md:h-32 bg-white/10 rounded-full -mb-8 md:-mb-10 -mr-8 md:-mr-10 blur-xl md:blur-2xl group-hover:scale-150 transition-transform duration-700" />
            <p className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em] opacity-80 mb-1 md:mb-2">Gastos</p>
            <p className="text-lg md:text-3xl font-black font-mono tracking-tight">
              -${monthlyExpenses.toLocaleString('es-AR', { maximumFractionDigits: 0 })}
            </p>
          </div>
        </div>

        {/* Monthly Economy Card - Spans 8 columns on MD */}
        <div className="md:col-span-8">
          <MonthlyEconomyCard 
            transactions={transactions} 
            categories={categories} 
            accounts={accounts} 
            currentMonth={currentMonth}
            onMonthChange={setCurrentMonth}
          />
        </div>

        {/* Recent Activity Bento Card - Spans 4 columns on MD */}
        <div className="md:col-span-4 bg-white p-5 md:p-8 rounded-[2rem] md:rounded-[2.5rem] border border-gray-100 shadow-sm flex flex-col h-full">
          <div className="flex items-center justify-between mb-4 md:mb-6">
            <h3 className="text-[10px] md:text-sm font-black text-gray-900 uppercase tracking-widest">Actividad Reciente</h3>
            <div className="w-6 h-6 md:w-8 md:h-8 bg-gray-50 rounded-full flex items-center justify-center">
              <Clock className="w-3 h-3 md:w-4 md:h-4 text-gray-400" />
            </div>
          </div>
          
          <div className="space-y-3 md:space-y-4 flex-1 overflow-hidden">
            {monthlyTransactions.slice(0, 5).map(tx => {
              const category = categories.find(c => c.id === tx.categoryId);
              return (
                <div key={tx.id} className="flex items-center justify-between gap-2 md:gap-3">
                  <div className="flex items-center gap-2 md:gap-3 min-w-0">
                    <div className={`w-7 h-7 md:w-8 md:h-8 rounded-lg md:rounded-xl flex items-center justify-center shrink-0 ${
                      tx.type === 'income' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
                    }`}>
                      {tx.type === 'income' ? <ArrowUpRight className="w-3 h-3 md:w-4 md:h-4" /> : <ArrowDownRight className="w-3 h-3 md:w-4 md:h-4" />}
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] md:text-xs font-bold text-gray-900 truncate">{tx.description}</p>
                      <p className="text-[8px] md:text-[10px] text-gray-400 uppercase tracking-tighter">{category?.name}</p>
                    </div>
                  </div>
                  <p className={`text-[10px] md:text-xs font-bold font-mono ${tx.type === 'income' ? 'text-emerald-600' : 'text-gray-900'}`}>
                    {tx.type === 'income' ? '+' : '-'}${tx.amount.toLocaleString('es-AR', { maximumFractionDigits: 0 })}
                  </p>
                </div>
              );
            })}
            {monthlyTransactions.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-center py-6 md:py-10">
                <p className="text-[10px] md:text-xs text-gray-400 font-medium italic">No hay movimientos este mes</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <NewTransactionButton onSelect={handleNewTransaction} />

      <AccountTransactionsModal 
        isOpen={isAccountModalOpen}
        onClose={() => setIsAccountModalOpen(false)}
        account={selectedAccount}
        transactions={transactions}
        categories={categories}
        currentMonth={currentMonth}
      />
    </div>
  );
}
