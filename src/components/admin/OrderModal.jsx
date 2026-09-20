import { motion, AnimatePresence } from 'framer-motion';
import { Printer } from 'lucide-react';

export default function OrderModal({ selectedOrderDetails, setSelectedOrderDetails, handlePrint }) {
  return (
    <AnimatePresence>
      {selectedOrderDetails && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm"
          onClick={() => setSelectedOrderDetails(null)}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-gray-200 dark:border-slate-700 w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden"
          >
            <div className="px-6 py-4 border-b border-gray-100 dark:border-slate-800 flex justify-between items-center bg-gray-50/50 dark:bg-slate-800/50">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Detail Pesanan</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">{selectedOrderDetails.orderNumber} • {selectedOrderDetails.clientName}</p>
              </div>
              <button onClick={() => setSelectedOrderDetails(null)} className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-pink-50 dark:hover:bg-slate-700 rounded-full transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1">
              <div className="mb-4 grid grid-cols-12 gap-4 px-4 text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                <div className="col-span-1 text-center">No</div>
                <div className="col-span-5">Nama Barang</div>
                <div className="col-span-2 text-center">Qty</div>
                <div className="col-span-4 text-right">Total Harga</div>
              </div>
              <div className="space-y-2">
                {selectedOrderDetails.items.map((item, index) => (
                  <div key={item.id} className="grid grid-cols-12 gap-4 items-center p-4 bg-gray-50 dark:bg-slate-800/50 rounded-xl border border-gray-100 dark:border-slate-700/50 hover:border-pink-200 dark:hover:border-pink-900/30 transition-colors">
                    <div className="col-span-1 text-center font-bold text-gray-400">{index + 1}</div>
                    <div className="col-span-5 font-bold text-gray-900 dark:text-white truncate" title={item.itemName}>{item.itemName}</div>
                    <div className="col-span-2 text-center font-medium text-gray-600 dark:text-gray-300">{item.quantity} {item.unit}</div>
                    <div className="col-span-4 text-right font-bold text-gray-900 dark:text-white truncate">
                      Rp {((parseFloat(item.sellingPrice) || 0) * parseFloat(item.quantity)).toLocaleString('id-ID')}
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 pt-6 border-t border-gray-100 dark:border-slate-800 flex justify-between items-center">
                <div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Total Tagihan</div>
                  <div className="text-2xl font-black text-pink-600 dark:text-pink-400">
                    Rp {selectedOrderDetails.items.reduce((acc, item) => acc + (parseFloat(item.sellingPrice) || 0) * parseFloat(item.quantity), 0).toLocaleString('id-ID')}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="px-6 py-4 border-t border-gray-100 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-800/50 flex flex-col md:flex-row justify-end gap-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handlePrint('Surat Jalan', selectedOrderDetails.id, selectedOrderDetails.orderNumber)}
                className="flex items-center justify-center gap-2 px-6 py-2.5 border border-pink-200 dark:border-pink-900/50 bg-pink-50 dark:bg-pink-900/20 text-pink-600 dark:text-pink-400 hover:bg-pink-100 dark:hover:bg-pink-900/40 rounded-xl font-medium transition-colors"
              >
                <Printer className="w-5 h-5" />
                Cetak Surat Jalan
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handlePrint('Invoice', selectedOrderDetails.id, selectedOrderDetails.orderNumber)}
                className="flex items-center justify-center gap-2 px-6 py-2.5 bg-mbg-blue-600 hover:bg-mbg-blue-700 text-white rounded-xl font-medium shadow-md transition-colors"
              >
                <Printer className="w-5 h-5" />
                Cetak Invoice
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
