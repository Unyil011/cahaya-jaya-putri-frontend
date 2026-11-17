import fs from 'fs';

let code = fs.readFileSync('src/components/admin/StockHistory.jsx', 'utf8');

// Add PackagePlus import
if (!code.includes('PackagePlus')) {
    code = code.replace("import { ArrowLeft, Plus, History, Eye, Edit2, Trash2, Check, X, AlertCircle } from 'lucide-react';", 
                        "import { ArrowLeft, Plus, History, Eye, Edit2, Trash2, Check, X, AlertCircle, PackagePlus } from 'lucide-react';");
}

// Update title
code = code.replace("Update Stok & Histori", "Update Stok & Histori"); // User actually just said change sidebar name. The title is fine, or I can change it to Update Stok
code = code.replace('<History className="w-6 h-6 text-mbg-blue-500" />', '<PackagePlus className="w-6 h-6 text-mbg-blue-500" />');

// Add states for Eye Modal
if (!code.includes('isDetailsModalOpen')) {
    code = code.replace("const [deleteConfirm, setDeleteConfirm] = useState({ show: false, id: null });",
`const [deleteConfirm, setDeleteConfirm] = useState({ show: false, id: null });
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedDetails, setSelectedDetails] = useState(null);`);
}

// Add the Eye action button
code = code.replace(
`<button onClick={() => setDeleteConfirm({ show: true, id: update.id })} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>`,
`<button onClick={() => { setSelectedDetails(update); setIsDetailsModalOpen(true); }} className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors" title="Lihat Detail">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button onClick={() => setDeleteConfirm({ show: true, id: update.id })} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors" title="Hapus Riwayat">
                          <Trash2 className="w-4 h-4" />
                        </button>`
);

// Add the Details Modal component rendering
if (!code.includes('Detail Barang Masuk')) {
    const detailsModal = `
      <AnimatePresence>
      {isDetailsModalOpen && selectedDetails && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-xl flex flex-col max-h-[90vh]"
          >
            <div className="p-6 border-b border-gray-100 dark:border-slate-700 flex justify-between items-center shrink-0">
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Detail Barang Masuk</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Waktu: {new Date(selectedDetails.created_at).toLocaleString('id-ID')}
                </p>
              </div>
              <button
                onClick={() => setIsDetailsModalOpen(false)}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-0 overflow-y-auto flex-1">
              <table className="w-full text-left border-collapse">
                <thead className="bg-gray-50 dark:bg-slate-800/80 sticky top-0">
                  <tr>
                    <th className="py-3 px-6 text-xs font-semibold text-gray-500 uppercase">Nama Barang</th>
                    <th className="py-3 px-6 text-xs font-semibold text-gray-500 uppercase text-center">Qty Masuk</th>
                    <th className="py-3 px-6 text-xs font-semibold text-gray-500 uppercase text-right">HPP / Unit</th>
                    <th className="py-3 px-6 text-xs font-semibold text-gray-500 uppercase text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-slate-700/50">
                  {selectedDetails.stock_update_items.map((item, idx) => (
                    <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-slate-800/50">
                      <td className="py-3 px-6 text-sm font-medium text-gray-900 dark:text-white">{item.inventory?.item_name || 'Item Dihapus'}</td>
                      <td className="py-3 px-6 text-sm text-gray-600 dark:text-gray-300 text-center">{item.qty_added} {item.inventory?.unit || 'Pcs'}</td>
                      <td className="py-3 px-6 text-sm text-gray-600 dark:text-gray-300 text-right">{formatCurrency(item.hpp)}</td>
                      <td className="py-3 px-6 text-sm font-bold text-gray-900 dark:text-white text-right">{formatCurrency(item.qty_added * item.hpp)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="p-6 border-t border-gray-100 dark:border-slate-700 shrink-0 flex justify-end bg-gray-50 dark:bg-slate-800/80">
              <button
                onClick={() => setIsDetailsModalOpen(false)}
                className="px-5 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium rounded-xl transition-colors"
              >
                Tutup
              </button>
            </div>
          </motion.div>
        </div>
      )}
      </AnimatePresence>
`;
    code = code.replace(
      `<ConfirmModal \n        isOpen={deleteConfirm.show}`,
      `${detailsModal}\n      <ConfirmModal \n        isOpen={deleteConfirm.show}`
    );
}

fs.writeFileSync('src/components/admin/StockHistory.jsx', code);
console.log("Updated StockHistory Eye Icon & Modal");
