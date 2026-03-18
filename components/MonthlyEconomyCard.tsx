import React, { useState } from 'react';
import { Transaction, Category, Account } from '@/hooks/useFinanceData';
import { format, startOfMonth, endOfMonth, isWithinInterval, addMonths, subMonths, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, ChevronRight as ArrowRight, X, ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface MonthlyEconomyCardProps {
  transactions: Transaction[];
  categories: Category[];
  accounts: Account[];
  currentMonth: Date;
  onMonthChange: (date: Date) => void;
}

export function MonthlyEconomyCard({ transactions, categories, accounts, currentMonth, onMonthChange }: MonthlyEconomyCardProps) {
  const [showDetails, setShowDetails] = useState<'income' | 'expense' | null>(null);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);

  const monthlyTxs = transactions.filter(t => 
    isWithinInterval(parseISO(t.issueDate), { start: monthStart, end: monthEnd })
  );

  const totalIncome = monthlyTxs
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = monthlyTxs
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const savedAmount = totalIncome - totalExpense;
  const savingsPercentage = totalIncome > 0 ? Math.max(0, Math.min(100, Math.round((savedAmount / totalIncome) * 100))) : 0;

  // SVG Donut Chart constants
  const size = 120;
  const strokeWidth = 12;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (savingsPercentage / 100) * circumference;

  const detailTransactions = monthlyTxs.filter(t => t.type === showDetails);

  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm mb-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        <div className="flex flex-col items-center">
          <div className="relative w-[100px] h-[100px] md:w-[120px] md:h-[120px] mb-4">
            <svg width="100%" height="100%" viewBox={`0 0 ${size} ${size}`} className="transform -rotate-90">
              <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                stroke="#f3f4f6"
                strokeWidth={strokeWidth}
                fill="transparent"
              />
              <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                stroke="#ff6321"
                strokeWidth={strokeWidth}
                fill="transparent"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                strokeLinecap="round"
                className="transition-all duration-500 ease-out"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-2xl font-mono font-bold text-gray-700">{savingsPercentage}%</span>
            </div>
          </div>
          <div className="text-center">
            <p className="text-2xl font-mono font-bold text-emerald-600">
              ${savedAmount.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ARS
            </p>
            <p className="text-sm text-gray-500">Importe ahorrado</p>
          </div>
        </div>

        <div className="space-y-4">
          <button 
            onClick={() => setShowDetails('income')}
            className="w-full flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl transition-colors group"
          >
            <div className="text-left">
              <p className="text-sm text-gray-500">Ingresos considerados</p>
              <p className="text-xl font-mono font-bold text-emerald-600">
                ${totalIncome.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ARS
              </p>
            </div>
            <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-emerald-500 transition-colors" />
          </button>

          <button 
            onClick={() => setShowDetails('expense')}
            className="w-full flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl transition-colors group"
          >
            <div className="text-left">
              <p className="text-sm text-gray-500">Gastos considerados</p>
              <p className="text-xl font-mono font-bold text-red-500">
                ${totalExpense.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ARS
              </p>
            </div>
            <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-red-500 transition-colors" />
          </button>
        </div>
      </div>

      {/* Details Modal */}
      {showDetails && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[80vh] flex flex-col shadow-2xl">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900">
                Movimientos de {showDetails === 'income' ? 'Ingresos' : 'Gastos'} - {format(currentMonth, 'MMMM yyyy', { locale: es })}
              </h3>
              <button 
                onClick={() => setShowDetails(null)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-6 h-6 text-gray-500" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              {detailTransactions.length === 0 ? (
                <p className="text-center text-gray-500 py-8">No hay movimientos registrados para este periodo.</p>
              ) : (
                <div className="space-y-4">
                  {detailTransactions.map(tx => {
                    const category = categories.find(c => c.id === tx.categoryId);
                    const account = accounts.find(a => a.id === tx.accountId);
                    return (
                      <div key={tx.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${showDetails === 'income' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                            {showDetails === 'income' ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownRight className="w-5 h-5" />}
                          </div>
                          <div>
                            <p className="font-bold text-gray-900">{tx.description}</p>
                            <p className="text-sm text-gray-500">{category?.name} • {account?.name}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`font-mono font-bold ${showDetails === 'income' ? 'text-emerald-600' : 'text-red-600'}`}>
                            ${tx.amount.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </p>
                          <p className="text-xs text-gray-400">{format(parseISO(tx.issueDate), 'dd/MM/yyyy')}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            <div className="p-6 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
              <div className="flex justify-between items-center">
                <span className="font-medium text-gray-700">Total {showDetails === 'income' ? 'Ingresos' : 'Gastos'}</span>
                <span className={`text-xl font-mono font-bold ${showDetails === 'income' ? 'text-emerald-600' : 'text-red-600'}`}>
                  ${(showDetails === 'income' ? totalIncome : totalExpense).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
