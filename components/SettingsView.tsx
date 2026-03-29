import React, { useState } from 'react';
import { Download, FileSpreadsheet, Shield, User, Bell, Clock, ChevronDown, ChevronUp, Mail } from 'lucide-react';
import { Account, Category, Transaction, NotificationSettings } from '@/hooks/useFinanceData';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'motion/react';

interface SettingsViewProps {
  accounts: Account[];
  categories: Category[];
  transactions: Transaction[];
  settings: NotificationSettings;
  onUpdateSettings: (settings: NotificationSettings) => void;
}

export function SettingsView({ accounts, categories, transactions, settings, onUpdateSettings }: SettingsViewProps) {
  const [expandedSection, setExpandedSection] = useState<string | null>('notifications');
  const userEmail = "ezepedrosa@gmail.com"; // From context

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };
  const exportToCSV = () => {
    // 1. Prepare Transactions CSV
    const txHeaders = ['Fecha', 'Descripción', 'Monto', 'Tipo', 'Cuenta', 'Categoría', 'Estado'];
    const txRows = transactions.map(tx => {
      const account = accounts.find(a => a.id === tx.accountId)?.name || 'N/A';
      const category = categories.find(c => c.id === tx.categoryId)?.name || 'N/A';
      return [
        tx.issueDate,
        `"${tx.description.replace(/"/g, '""')}"`,
        tx.amount,
        tx.type === 'income' ? 'Ingreso' : tx.type === 'expense' ? 'Gasto' : 'Transferencia',
        `"${account.replace(/"/g, '""')}"`,
        `"${category.replace(/"/g, '""')}"`,
        tx.completed ? 'Completado' : 'Pendiente'
      ];
    });

    // 2. Prepare Accounts CSV
    const accHeaders = ['', 'CUENTAS', '', '', '', '', ''];
    const accSubHeaders = ['Nombre', 'Tipo', 'Saldo Inicial', '', '', '', ''];
    const accRows = accounts.map(acc => [
      `"${acc.name.replace(/"/g, '""')}"`,
      acc.type,
      acc.initialBalance,
      '', '', '', ''
    ]);

    // 3. Prepare Categories CSV
    const catHeaders = ['', 'CATEGORÍAS', '', '', '', '', ''];
    const catSubHeaders = ['Nombre', 'Tipo', '', '', '', '', ''];
    const catRows = categories.map(cat => [
      `"${cat.name.replace(/"/g, '""')}"`,
      cat.type === 'income' ? 'Ingreso' : 'Gasto',
      '', '', '', '', ''
    ]);

    // Combine all
    const csvContent = [
      ['EXPORTACIÓN DE DATOS - FINANZAS PERSONALES'],
      [`Fecha de exportación: ${format(new Date(), 'dd/MM/yyyy HH:mm')}`],
      [],
      txHeaders,
      ...txRows,
      [],
      accHeaders,
      accSubHeaders,
      ...accRows,
      [],
      catHeaders,
      catSubHeaders,
      ...catRows
    ].map(e => e.join(',')).join('\n');

    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `finanzas_export_${format(new Date(), 'yyyyMMdd')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleToggleSetting = (key: keyof NotificationSettings) => {
    onUpdateSettings({
      ...settings,
      [key]: !settings[key]
    });
  };

  const handleChangeFrequency = (freq: NotificationSettings['frequency']) => {
    onUpdateSettings({
      ...settings,
      frequency: freq
    });
  };

  const handleChangeDays = (days: number) => {
    onUpdateSettings({
      ...settings,
      upcomingDays: days
    });
  };

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto">
      {/* Compact Profile Header */}
      <div className="bg-white rounded-3xl border border-gray-100 p-4 mb-6 flex items-center gap-4 shadow-sm">
        <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-600/20">
          <User className="w-6 h-6" />
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="text-base font-bold text-gray-900 truncate">Mi Perfil</h2>
          <div className="flex items-center gap-1.5 text-gray-400">
            <Mail className="w-3 h-3" />
            <span className="text-xs truncate">{userEmail}</span>
          </div>
        </div>
        <div className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-bold uppercase tracking-wider">
          Premium
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-4">
          {/* Notifications Section */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
            <button 
              onClick={() => toggleSection('notifications')}
              className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                  <Bell className="w-4 h-4" />
                </div>
                <h2 className="text-sm font-bold text-gray-900">Notificaciones</h2>
              </div>
              {expandedSection === 'notifications' ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
            </button>
            
            <AnimatePresence>
              {expandedSection === 'notifications' && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="p-4 pt-0 space-y-4 border-t border-gray-50 mt-2">
                    <div className="flex items-center justify-between py-2">
                      <div>
                        <h3 className="text-sm font-bold text-gray-900">Próximos Vencimientos</h3>
                        <p className="text-[10px] text-gray-500">Avisos antes de la fecha.</p>
                      </div>
                      <button 
                        onClick={() => handleToggleSetting('upcomingAlerts')}
                        className={`w-10 h-5 rounded-full transition-colors relative ${settings.upcomingAlerts ? 'bg-blue-600' : 'bg-gray-200'}`}
                      >
                        <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all ${settings.upcomingAlerts ? 'left-5.5' : 'left-0.5'}`}></div>
                      </button>
                    </div>

                    {settings.upcomingAlerts && (
                      <div className="pl-4 border-l-2 border-blue-50 space-y-3 py-1">
                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Anticipación</label>
                        <div className="flex gap-2">
                          {[1, 3, 5, 7].map(days => (
                            <button
                              key={days}
                              onClick={() => handleChangeDays(days)}
                              className={`flex-1 py-2 rounded-xl text-[10px] font-bold transition-all ${
                                settings.upcomingDays === days 
                                  ? 'bg-blue-600 text-white' 
                                  : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
                              }`}
                            >
                              {days}d
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between py-2">
                      <div>
                        <h3 className="text-sm font-bold text-gray-900">Transacciones Vencidas</h3>
                        <p className="text-[10px] text-gray-500">Avisos después de la fecha.</p>
                      </div>
                      <button 
                        onClick={() => handleToggleSetting('overdueAlerts')}
                        className={`w-10 h-5 rounded-full transition-colors relative ${settings.overdueAlerts ? 'bg-blue-600' : 'bg-gray-200'}`}
                      >
                        <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all ${settings.overdueAlerts ? 'left-5.5' : 'left-0.5'}`}></div>
                      </button>
                    </div>

                    <div className="pt-3 border-t border-gray-50">
                      <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3">Frecuencia</h3>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { id: 'realtime', label: 'Real' },
                          { id: 'daily', label: 'Día' },
                          { id: 'weekly', label: 'Sem' }
                        ].map(freq => (
                          <button
                            key={freq.id}
                            onClick={() => handleChangeFrequency(freq.id as any)}
                            className={`py-2 rounded-xl text-[10px] font-bold transition-all border ${
                              settings.frequency === freq.id 
                                ? 'bg-blue-50 border-blue-200 text-blue-600' 
                                : 'bg-white border-gray-100 text-gray-500 hover:bg-gray-50'
                            }`}
                          >
                            {freq.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Data Management Section */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
            <button 
              onClick={() => toggleSection('data')}
              className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
                  <FileSpreadsheet className="w-4 h-4" />
                </div>
                <h2 className="text-sm font-bold text-gray-900">Gestión de Datos</h2>
              </div>
              {expandedSection === 'data' ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
            </button>

            <AnimatePresence>
              {expandedSection === 'data' && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="p-4 pt-0 border-t border-gray-50 mt-2">
                    <div className="flex items-center justify-between gap-4 py-3">
                      <div className="min-w-0 flex-1">
                        <h3 className="text-sm font-bold text-gray-900">Exportar a CSV</h3>
                        <p className="text-[10px] text-gray-500 mt-0.5">Copia local de tus datos.</p>
                      </div>
                      <button 
                        onClick={exportToCSV}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl font-bold text-xs hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20"
                      >
                        <Download className="w-3 h-3" />
                        Exportar
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-blue-600 rounded-3xl p-5 text-white shadow-xl shadow-blue-600/20">
            <h3 className="font-bold text-sm mb-3">Resumen</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="opacity-80">Transacciones</span>
                <span className="font-bold">{transactions.length}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="opacity-80">Cuentas</span>
                <span className="font-bold">{accounts.length}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="opacity-80">Categorías</span>
                <span className="font-bold">{categories.length}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-gray-100 p-4 shadow-sm">
            <h3 className="font-bold text-gray-900 text-xs mb-2">Información</h3>
            <p className="text-[10px] text-gray-400 leading-relaxed">
              Tus datos están sincronizados de forma segura con Firebase.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
