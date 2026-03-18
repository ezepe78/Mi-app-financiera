import React from 'react';
import { Download, FileSpreadsheet, Shield, User, Bell, Clock } from 'lucide-react';
import { Account, Category, Transaction, NotificationSettings } from '@/hooks/useFinanceData';
import { format } from 'date-fns';

interface SettingsViewProps {
  accounts: Account[];
  categories: Category[];
  transactions: Transaction[];
  settings: NotificationSettings;
  onUpdateSettings: (settings: NotificationSettings) => void;
}

export function SettingsView({ accounts, categories, transactions, settings, onUpdateSettings }: SettingsViewProps) {
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
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Configuración</h1>
        <p className="text-gray-500 mt-1">Gestiona tus preferencias y datos de la aplicación.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
          {/* Notifications Section */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-50">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Bell className="w-5 h-5 text-blue-600" />
                Notificaciones y Alertas
              </h2>
            </div>
            <div className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-gray-900">Alertas de Próximos Vencimientos</h3>
                  <p className="text-sm text-gray-500">Recibe avisos sobre transacciones que vencerán pronto.</p>
                </div>
                <button 
                  onClick={() => handleToggleSetting('upcomingAlerts')}
                  className={`w-12 h-6 rounded-full transition-colors relative ${settings.upcomingAlerts ? 'bg-blue-600' : 'bg-gray-200'}`}
                >
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${settings.upcomingAlerts ? 'left-7' : 'left-1'}`}></div>
                </button>
              </div>

              {settings.upcomingAlerts && (
                <div className="pl-6 border-l-2 border-blue-50 space-y-4 animate-in slide-in-from-left-2 duration-200">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Avisar con anticipación de:</label>
                    <div className="flex gap-2">
                      {[1, 3, 5, 7].map(days => (
                        <button
                          key={days}
                          onClick={() => handleChangeDays(days)}
                          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                            settings.upcomingDays === days 
                              ? 'bg-blue-600 text-white' 
                              : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
                          }`}
                        >
                          {days} {days === 1 ? 'día' : 'días'}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-gray-900">Alertas de Transacciones Vencidas</h3>
                  <p className="text-sm text-gray-500">Recibe avisos sobre pagos o cobros que ya pasaron su fecha.</p>
                </div>
                <button 
                  onClick={() => handleToggleSetting('overdueAlerts')}
                  className={`w-12 h-6 rounded-full transition-colors relative ${settings.overdueAlerts ? 'bg-blue-600' : 'bg-gray-200'}`}
                >
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${settings.overdueAlerts ? 'left-7' : 'left-1'}`}></div>
                </button>
              </div>

              <div className="pt-4 border-t border-gray-50">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-400" />
                  Frecuencia de Alertas
                </h3>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: 'realtime', label: 'Tiempo Real' },
                    { id: 'daily', label: 'Diario' },
                    { id: 'weekly', label: 'Semanal' }
                  ].map(freq => (
                    <button
                      key={freq.id}
                      onClick={() => handleChangeFrequency(freq.id as any)}
                      className={`px-4 py-3 rounded-2xl text-xs font-bold transition-all border ${
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
          </div>

          {/* Data Management Section */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-50">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-blue-600" />
                Gestión de Datos
              </h2>
            </div>
            <div className="p-6 space-y-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-bold text-gray-900">Exportar a CSV</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Descarga una copia completa de tus transacciones, cuentas y categorías en formato CSV compatible con Excel.
                  </p>
                </div>
                <button 
                  onClick={exportToCSV}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20"
                >
                  <Download className="w-4 h-4" />
                  Exportar
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-blue-600 rounded-3xl p-6 text-white shadow-xl shadow-blue-600/20">
            <h3 className="font-bold text-lg mb-2">Resumen de Datos</h3>
            <div className="space-y-3 mt-4">
              <div className="flex justify-between text-sm">
                <span className="opacity-80">Transacciones</span>
                <span className="font-bold">{transactions.length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="opacity-80">Cuentas</span>
                <span className="font-bold">{accounts.length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="opacity-80">Categorías</span>
                <span className="font-bold">{categories.length}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm">
            <h3 className="font-bold text-gray-900 mb-4">Información</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Tus datos están sincronizados de forma segura con Firebase. La exportación a CSV es local y no afecta tus datos en la nube.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
