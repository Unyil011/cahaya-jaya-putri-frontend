import { motion, AnimatePresence } from 'framer-motion';
import { RotateCcw } from 'lucide-react';

export default function FilterDrawer({ 
  showFilterDropdown, setShowFilterDropdown, 
  filterPayment, setFilterPayment,
  filterClient, setFilterClient, clientOptions,
  filterTime, setFilterTime
}) {

  const handleReset = () => {
    setFilterPayment('Semua');
    setFilterClient('Semua');
    setFilterTime({ type: '', value: '' });
  };

  return (
    <AnimatePresence>
      {showFilterDropdown && (
        <>
          {/* Overlay - Reduced blur per user request */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowFilterDropdown(false)}
            className="fixed inset-0 bg-gray-900/20 backdrop-blur-[2px] z-[90]"
          />
          
          {/* Drawer Sidebar */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-72 md:w-80 bg-white dark:bg-slate-900 shadow-2xl z-[100] border-l border-gray-100 dark:border-slate-800 flex flex-col"
          >
            <div className="p-4 md:p-6 border-b border-gray-100 dark:border-slate-800 flex justify-between items-center bg-gray-50/50 dark:bg-slate-800/50">
              <h3 className="font-bold text-gray-900 dark:text-white text-lg">Filter Pesanan</h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleReset}
                  className="p-2 flex items-center gap-1 text-xs font-semibold text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                  title="Reset Filter"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => setShowFilterDropdown(false)} 
                  className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-full transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            <div className="p-4 md:p-6 flex-1 overflow-y-auto">
              
              <div className="mb-6">
                <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Status Pembayaran</h4>
                <div className="space-y-1">
                  {['Semua', 'Lunas', 'Belum Lunas'].map(status => (
                    <label
                      key={status}
                      className="flex items-center gap-2 py-1 cursor-pointer transition-colors hover:text-pink-600 dark:hover:text-pink-400"
                    >
                      <input 
                        type="radio" 
                        name="payment_status"
                        checked={filterPayment === status} 
                        onChange={() => setFilterPayment(status)}
                        className="w-4 h-4 text-pink-500 bg-white border-gray-300 focus:ring-pink-500 dark:focus:ring-pink-600 dark:ring-offset-gray-800 dark:bg-slate-700 dark:border-slate-600"
                      />
                      <span className={`text-sm ${filterPayment === status ? 'font-semibold text-pink-600 dark:text-pink-400' : 'text-gray-700 dark:text-gray-300'}`}>{status}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Rentang Waktu</h4>
                <div className="space-y-1">
                  {['Semua Waktu', 'Mingguan', 'Bulanan', 'Tahunan'].map(type => (
                    <label
                      key={type}
                      className="flex items-center gap-2 py-1 cursor-pointer transition-colors hover:text-pink-600 dark:hover:text-pink-400"
                    >
                      <input 
                        type="radio" 
                        name="time_filter"
                        checked={(type === 'Semua Waktu' && filterTime.type === '') || filterTime.type === type} 
                        onChange={() => {
                          if (type === 'Semua Waktu') setFilterTime({ type: '', value: '' });
                          else setFilterTime({ type, value: '' });
                        }}
                        className="w-4 h-4 text-pink-500 bg-white border-gray-300 focus:ring-pink-500 dark:focus:ring-pink-600 dark:ring-offset-gray-800 dark:bg-slate-700 dark:border-slate-600"
                      />
                      <span className={`text-sm ${((type === 'Semua Waktu' && filterTime.type === '') || filterTime.type === type) ? 'font-semibold text-pink-600 dark:text-pink-400' : 'text-gray-700 dark:text-gray-300'}`}>{type}</span>
                    </label>
                  ))}
                </div>

                {/* Dynamic Inputs */}
                {filterTime.type === 'Mingguan' && (
                  <div className="mt-3 pl-6">
                    <label className="block text-xs font-medium text-gray-500 mb-1">Mulai Tanggal (Pilih 2 Minggu)</label>
                    <input type="date" value={filterTime.value} onChange={e => setFilterTime({...filterTime, value: e.target.value})} className="w-full px-3 py-1.5 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-pink-500" />
                  </div>
                )}
                {filterTime.type === 'Bulanan' && (
                  <div className="mt-3 pl-6">
                    <label className="block text-xs font-medium text-gray-500 mb-1">Pilih Bulan & Tahun</label>
                    <input type="month" value={filterTime.value} onChange={e => setFilterTime({...filterTime, value: e.target.value})} className="w-full px-3 py-1.5 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-pink-500" />
                  </div>
                )}
                {filterTime.type === 'Tahunan' && (
                  <div className="mt-3 pl-6">
                    <label className="block text-xs font-medium text-gray-500 mb-1">Pilih Tahun</label>
                    <select value={filterTime.value} onChange={e => setFilterTime({...filterTime, value: e.target.value})} className="w-full px-3 py-1.5 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-pink-500">
                      <option value="">-- Pilih Tahun --</option>
                      <option value="2026">2026</option>
                      <option value="2025">2025</option>
                      <option value="2024">2024</option>
                    </select>
                  </div>
                )}
              </div>

              <div className="mb-6">
                <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Nama SPPG / SPPG</h4>
                <div className="space-y-1">
                  {clientOptions.map(client => (
                    <label
                      key={client}
                      className="flex items-center gap-2 py-1 cursor-pointer transition-colors hover:text-pink-600 dark:hover:text-pink-400"
                    >
                      <input 
                        type="radio" 
                        name="client_name"
                        checked={filterClient === client} 
                        onChange={() => setFilterClient(client)}
                        className="w-4 h-4 text-pink-500 bg-white border-gray-300 focus:ring-pink-500 dark:focus:ring-pink-600 dark:ring-offset-gray-800 dark:bg-slate-700 dark:border-slate-600"
                      />
                      <span className={`text-sm ${filterClient === client ? 'font-semibold text-pink-600 dark:text-pink-400' : 'text-gray-700 dark:text-gray-300'}`}>{client}</span>
                    </label>
                  ))}
                </div>
              </div>

            </div>
            
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
