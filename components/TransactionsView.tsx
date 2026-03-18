import React, { useState, useMemo } from 'react';
import { Account, Category, Transaction } from '@/hooks/useFinanceData';
import { format, parseISO, isWithinInterval, startOfDay, endOfDay } from 'date-fns';
import { Search, Filter, Trash2, Edit2, X, Check } from 'lucide-react';
import { NewTransactionButton } from './NewTransactionButton';
import { TransactionModal } from './TransactionModal';
import { motion, AnimatePresence } from 'motion/react';

interface TransactionsViewProps {
  transactions: Transaction[];
  accounts: Account[];
  categories: Category[];
  onAdd: (tx: Omit<Transaction, 'id' | 'uid'>) => void;
  onUpdate: (tx: Transaction) => void;
  onDelete: (id: string) => void;
  onAddTransfer: (from: string, to: string, amount: number, date: string, desc: string) => void;
}

export function TransactionsView({ transactions, accounts, categories, onAdd, onUpdate, onDelete, onAddTransfer }: TransactionsViewProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [txType, setTxType] = useState<'income' | 'expense' | 'transfer'>('expense');
  const [editingTransaction, setEditingTransaction] = useState<Transaction | undefined>(undefined);
  const [transactionToDelete, setTransactionToDelete] = useState<string | null>(null);
  
  // Filter states
  const [showFilters, setShowFilters] = useState(false);
  const [search, setSearch] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedAccount, setSelectedAccount] = useState('');

  const handleNewTransaction = (type: 'income' | 'expense' | 'transfer') => {
    setTxType(type);
    setEditingTransaction(undefined);
    setIsAdding(true);
  };

  const handleEditTransaction = (tx: Transaction) => {
    setTxType(tx.type);
    setEditingTransaction(tx);
    setIsAdding(true);
  };

  const filteredTransactions = useMemo(() => {
    return transactions
      .filter(tx => {
        // Search filter
        if (search && !tx.description.toLowerCase().includes(search.toLowerCase())) {
          return false;
        }

        // Date range filter
        if (startDate || endDate) {
          try {
            const txDate = parseISO(tx.issueDate);
            const start = startDate ? startOfDay(parseISO(startDate)) : new Date(0);
            const end = endDate ? endOfDay(parseISO(endDate)) : new Date(8640000000000000);
            
            if (!isWithinInterval(txDate, { start, end })) {
              return false;
            }
          } catch (e) {
            console.error("Error filtering date", e);
          }
        }

        // Category filter
        if (selectedCategory && tx.categoryId !== selectedCategory) {
          return false;
        }

        // Account filter
        if (selectedAccount && tx.accountId !== selectedAccount) {
          return false;
        }

        // Unify transfers: if no account filter, only show the "out" part (amount < 0)
        if (!selectedAccount && tx.type === 'transfer' && tx.amount > 0 && tx.linkedTransactionId) {
          return false;
        }

        return true;
      })
      .sort((a, b) => new Date(b.issueDate).getTime() - new Date(a.issueDate).getTime());
  }, [transactions, search, startDate, endDate, selectedCategory, selectedAccount]);

  const resetFilters = () => {
    setSearch('');
    setStartDate('');
    setEndDate('');
    setSelectedCategory('');
    setSelectedAccount('');
  };

  const activeFiltersCount = [startDate, endDate, selectedCategory, selectedAccount].filter(Boolean).length;

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Transacciones</h1>
      </div>

      <TransactionModal 
        key={isAdding ? (editingTransaction ? `edit-${editingTransaction.id}` : `add-${txType}`) : 'closed'}
        isOpen={isAdding}
        onClose={() => {
          setIsAdding(false);
          setEditingTransaction(undefined);
        }}
        type={txType}
        accounts={accounts}
        categories={categories}
        onAdd={onAdd}
        onUpdate={onUpdate}
        onAddTransfer={onAddTransfer}
        initialData={editingTransaction}
      />

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-20">
        <div className="p-4 border-b border-gray-100 bg-gray-50/50">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="relative flex-1 w-full">
              <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input 
                type="text" 
                placeholder="Buscar por descripción..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white"
              />
            </div>
            <div className="flex items-center justify-between md:justify-end gap-2 w-full md:w-auto">
              {activeFiltersCount > 0 && (
                <button 
                  onClick={resetFilters}
                  className="text-xs font-bold text-gray-400 hover:text-gray-600 px-2 py-1"
                >
                  Limpiar filtros
                </button>
              )}
              <button 
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-xl transition-all ${
                  showFilters || activeFiltersCount > 0 
                    ? 'bg-blue-50 text-blue-600 border border-blue-100' 
                    : 'text-gray-600 hover:bg-gray-100 border border-transparent'
                }`}
              >
                <Filter className="w-4 h-4" />
                Filtrar
                {activeFiltersCount > 0 && (
                  <span className="ml-1 px-1.5 py-0.5 bg-blue-600 text-white text-[10px] rounded-full">
                    {activeFiltersCount}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Expanded Filters Panel - Desktop only or hidden if modal is used */}
          <AnimatePresence>
            {showFilters && (
              <div className="fixed inset-0 z-[400] flex items-end sm:items-center justify-center p-0 sm:p-4">
                {/* Backdrop */}
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setShowFilters(false)}
                  className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                />
                
                {/* Modal Content */}
                <motion.div 
                  initial={{ y: "100%" }}
                  animate={{ y: 0 }}
                  exit={{ y: "100%" }}
                  transition={{ type: "spring", damping: 25, stiffness: 300 }}
                  className="relative bg-white w-full sm:max-w-lg rounded-t-[2.5rem] sm:rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
                >
                  <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">Filtros</h2>
                      <p className="text-xs text-gray-500">Refina tu búsqueda de transacciones</p>
                    </div>
                    <button 
                      onClick={() => setShowFilters(false)}
                      className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                      <X className="w-6 h-6 text-gray-400" />
                    </button>
                  </div>

                  <div className="p-6 space-y-6 overflow-y-auto">
                    {/* Date Range */}
                    <div className="space-y-3">
                      <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Rango de fechas</h3>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] text-gray-500 mb-1 ml-1">Desde</label>
                          <input 
                            type="date" 
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-200 rounded-2xl text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50/50"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] text-gray-500 mb-1 ml-1">Hasta</label>
                          <input 
                            type="date" 
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-200 rounded-2xl text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50/50"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Category Selection */}
                    <div className="space-y-3">
                      <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Categoría</h3>
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => setSelectedCategory('')}
                          className={`px-4 py-2 rounded-full text-xs font-bold transition-all border ${
                            selectedCategory === '' 
                              ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-600/20' 
                              : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          Todas
                        </button>
                        {categories.map(c => (
                          <button
                            key={c.id}
                            onClick={() => setSelectedCategory(c.id)}
                            className={`px-4 py-2 rounded-full text-xs font-bold transition-all border ${
                              selectedCategory === c.id 
                                ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-600/20' 
                                : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            {c.name}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Account Selection */}
                    <div className="space-y-3">
                      <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Cuenta</h3>
                      <div className="grid grid-cols-1 gap-2">
                        <button
                          onClick={() => setSelectedAccount('')}
                          className={`flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-bold transition-all border ${
                            selectedAccount === '' 
                              ? 'bg-blue-50 text-blue-700 border-blue-200' 
                              : 'bg-white text-gray-600 border-gray-200'
                          }`}
                        >
                          Todas las cuentas
                          {selectedAccount === '' && <Check className="w-4 h-4" />}
                        </button>
                        {accounts.map(a => (
                          <button
                            key={a.id}
                            onClick={() => setSelectedAccount(a.id)}
                            className={`flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-bold transition-all border ${
                              selectedAccount === a.id 
                                ? 'bg-blue-50 text-blue-700 border-blue-200' 
                                : 'bg-white text-gray-600 border-gray-200'
                            }`}
                          >
                            {a.name}
                            {selectedAccount === a.id && <Check className="w-4 h-4" />}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="p-6 bg-gray-50 border-t border-gray-100 flex gap-3">
                    <button 
                      onClick={resetFilters}
                      className="flex-1 py-4 text-sm font-bold text-gray-500 hover:text-gray-700 transition-colors"
                    >
                      Limpiar todo
                    </button>
                    <button 
                      onClick={() => setShowFilters(false)}
                      className="flex-[2] py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20"
                    >
                      Aplicar filtros
                    </button>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>
        </div>

        <div className="divide-y divide-gray-100">
          {filteredTransactions.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 bg-gray-50 text-gray-300 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8" />
              </div>
              <p className="text-gray-500 font-medium">No se encontraron transacciones</p>
              <p className="text-sm text-gray-400 mt-1">Prueba ajustando los filtros de búsqueda</p>
              {(search || activeFiltersCount > 0) && (
                <button 
                  onClick={resetFilters}
                  className="mt-4 text-blue-600 text-sm font-bold hover:underline"
                >
                  Limpiar todos los filtros
                </button>
              )}
            </div>
          ) : (
            filteredTransactions.map(tx => {
              const category = categories.find(c => c.id === tx.categoryId);
              const account = accounts.find(a => a.id === tx.accountId);
              const isIncome = tx.type === 'income' || (tx.type === 'transfer' && tx.amount > 0);
              const isTransfer = tx.type === 'transfer';
              const txTypeLabel = isTransfer ? 'Transferencia' : (tx.type === 'income' ? 'Ingreso' : 'Gasto');
              
              // Find linked account for transfers
              let transferDetail = null;
              if (isTransfer && tx.linkedTransactionId) {
                const linkedTx = transactions.find(t => t.id === tx.linkedTransactionId);
                if (linkedTx) {
                  const linkedAccount = accounts.find(a => a.id === linkedTx.accountId);
                  if (linkedAccount) {
                    const fromAccount = tx.amount < 0 ? account?.name : linkedAccount.name;
                    const toAccount = tx.amount < 0 ? linkedAccount.name : account?.name;
                    transferDetail = `Desde ${fromAccount} hacia ${toAccount}`;
                  }
                }
              }

              return (
                <div key={tx.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between hover:bg-gray-50 transition-colors group gap-4">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                      isTransfer 
                        ? "bg-blue-50 text-blue-600" 
                        : isIncome 
                          ? "bg-emerald-50 text-emerald-600" 
                          : "bg-orange-50 text-orange-600"
                    }`}>
                      <span className="font-bold text-lg">{isTransfer ? '⇄' : (isIncome ? '+' : '-')}</span>
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-gray-900 truncate">{tx.description}</p>
                      {transferDetail && (
                        <p className="text-[10px] font-bold text-blue-600 uppercase tracking-tight mb-0.5">
                          {transferDetail}
                        </p>
                      )}
                      <p className="text-xs text-gray-500 truncate">
                        {txTypeLabel} • {category?.name || 'Sin categoría'} • {account?.name}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between sm:justify-end gap-6">
                    <div className="text-left sm:text-right">
                      <p className={`font-mono font-bold ${
                        isTransfer 
                          ? "text-blue-600" 
                          : isIncome 
                            ? "text-emerald-600" 
                            : "text-gray-900"
                      }`}>
                        {isTransfer ? '' : (isIncome ? '+' : '-')}${Math.abs(tx.amount).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </p>
                      <p className="text-xs text-gray-500">{format(parseISO(tx.issueDate), 'dd MMM, yyyy')}</p>
                    </div>
                    <div className="flex items-center gap-1 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => handleEditTransaction(tx)}
                        className="p-2 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50"
                      >
                        <span className="sr-only">Editar</span>
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => setTransactionToDelete(tx.id)}
                        className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50"
                      >
                        <span className="sr-only">Eliminar</span>
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
      <NewTransactionButton onSelect={handleNewTransaction} />

      {/* Confirmation Modal */}
      {transactionToDelete && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[300] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl p-6 animate-in zoom-in-95 duration-200">
            <h3 className="text-xl font-bold text-gray-900 mb-2">¿Eliminar transacción?</h3>
            <p className="text-gray-500 mb-6">Esta acción no se puede deshacer. El saldo de la cuenta se ajustará automáticamente.</p>
            <div className="flex gap-3">
              <button 
                onClick={() => setTransactionToDelete(null)}
                className="flex-1 py-3 bg-gray-100 text-gray-600 rounded-2xl font-bold hover:bg-gray-200 transition-colors"
              >
                Cancelar
              </button>
              <button 
                onClick={() => {
                  onDelete(transactionToDelete);
                  setTransactionToDelete(null);
                }}
                className="flex-1 py-3 bg-red-600 text-white rounded-2xl font-bold hover:bg-red-700 transition-colors shadow-lg shadow-red-600/20"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
