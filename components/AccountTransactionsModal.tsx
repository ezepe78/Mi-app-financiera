import React, { useMemo } from 'react';
import { Account, Transaction, Category } from '@/hooks/useFinanceData';
import { format, parseISO, isWithinInterval, startOfDay, endOfDay } from 'date-fns';
import { es } from 'date-fns/locale';
import { X, Wallet, Building2, CreditCard } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface AccountTransactionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  account: Account | null;
  transactions: Transaction[];
  categories: Category[];
  currentMonth: Date;
}

export function AccountTransactionsModal({
  isOpen,
  onClose,
  account,
  transactions,
  categories,
  currentMonth
}: AccountTransactionsModalProps) {
  const filteredTransactions = useMemo(() => {
    if (!account) return [];
    
    const monthStart = startOfDay(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1));
    const monthEnd = endOfDay(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0));

    return transactions
      .filter(tx => tx.accountId === account.id)
      .filter(tx => {
        try {
          const txDate = parseISO(tx.issueDate);
          return isWithinInterval(txDate, { start: monthStart, end: monthEnd });
        } catch (e) {
          return false;
        }
      })
      .sort((a, b) => new Date(b.issueDate).getTime() - new Date(a.issueDate).getTime());
  }, [transactions, account, currentMonth]);

  const getAccountIcon = (type: string) => {
    switch(type) {
      case 'cash': return <Wallet className="w-5 h-5" />;
      case 'bank': return <Building2 className="w-5 h-5" />;
      case 'wallet': return <CreditCard className="w-5 h-5" />;
      default: return <Wallet className="w-5 h-5" />;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && account && (
        <div className="fixed inset-0 z-[500] flex items-end sm:items-center justify-center p-0 sm:p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          />
          
          <motion.div 
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative bg-white w-full sm:max-w-2xl rounded-t-[2.5rem] sm:rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
          >
            {/* Header */}
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shrink-0">
                  {getAccountIcon(account.type)}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{account.name}</h2>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Transacciones • {format(currentMonth, 'MMMM yyyy', { locale: es })}
                  </p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-6 h-6 text-gray-400" />
              </button>
            </div>

            {/* Body */}
            <div className="overflow-y-auto p-4 sm:p-6 bg-gray-50/50 flex-1">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden divide-y divide-gray-100">
                {filteredTransactions.length === 0 ? (
                  <div className="p-12 text-center">
                    <p className="text-gray-500 font-medium">No hay transacciones</p>
                    <p className="text-sm text-gray-400 mt-1">No se registraron movimientos en este periodo.</p>
                  </div>
                ) : (
                  filteredTransactions.map(tx => {
                    const category = categories.find(c => c.id === tx.categoryId);
                    const isIncome = tx.type === 'income' || (tx.type === 'transfer' && tx.amount > 0);
                    const isTransfer = tx.type === 'transfer';
                    const txTypeLabel = isTransfer ? 'Transferencia' : (tx.type === 'income' ? 'Ingreso' : 'Gasto');
                    
                    return (
                      <div key={tx.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between hover:bg-gray-50 transition-colors gap-4">
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
                            <p className="text-xs text-gray-500 truncate">
                              {txTypeLabel} • {category?.name || 'Sin categoría'}
                            </p>
                          </div>
                        </div>
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
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
