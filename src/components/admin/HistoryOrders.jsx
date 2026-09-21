import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../supabaseClient';
import { Eye, Trash2, Paperclip, X, Download } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api';

export default function HistoryOrders({ filteredOrders, setOrders, orders, setSelectedOrderDetails, showConfirm }) {
  const [selectedIds, setSelectedIds] = useState([]);
  const [proofModalOrder, setProofModalOrder] = useState(null);

  const handleTogglePayment = async (order, newStatus) => {
    const toastId = toast.loading('Mengubah status...');
    try {
      const { error } = await supabase
        .from('orders')
        .update({ payment_status: newStatus })
        .eq('id', order.id);
        
      if (error) throw error;
      
      setOrders(orders.map(o => o.id === order.id ? { ...o, paymentStatus: newStatus } : o));
      setProofModalOrder(null);
      toast.success(`Status pembayaran diubah menjadi ${newStatus}`, { id: toastId });
    } catch (error) {
      console.error(error);
      toast.error('Gagal mengubah status.', { id: toastId });
    }
  };

  const promptTogglePayment = (order) => {
    setProofModalOrder(order);
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredOrders.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredOrders.map(o => o.id));
    }
  };

  const toggleSelect = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(selectedId => selectedId !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleBulkDelete = () => {
    showConfirm(
      'Hapus Pesanan Terpilih',
      `Hapus ${selectedIds.length} pesanan terpilih dari pandangan Anda?`,
      async () => {
        const toastId = toast.loading('Menghapus...');
        try {
          await Promise.all(selectedIds.map(id => supabase.from('orders').update({ is_deleted_by_admin: true }).eq('id', id)));
          setOrders(orders.filter(o => !selectedIds.includes(o.id)));
          setSelectedIds([]);
          toast.success(`${selectedIds.length} pesanan dihapus.`, { id: toastId });
        } catch (error) {
          toast.error('Gagal menghapus pesanan.', { id: toastId });
        }
      }
    );
  };

  const handleDownloadReport = async () => {
    if (filteredOrders.length === 0) {
      toast.error('Tidak ada data untuk dicetak!');
      return;
    }
    
    const toastId = toast.loading('Menyiapkan laporan PDF...');
    try {
      // Send the filtered order IDs to backend
      const orderIds = filteredOrders.map(o => o.id);
      
      const response = await api.post('/reports/history', { order_ids: orderIds }, { responseType: 'blob' });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'Laporan_Riwayat_Pesanan.pdf');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success('Laporan berhasil diunduh', { id: toastId });
    } catch (error) {
      toast.error('Gagal mengunduh laporan PDF', { id: toastId });
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Actions */}
      <div className="flex justify-end">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleDownloadReport}
          className="flex items-center gap-2 px-6 py-2.5 bg-mbg-blue-600 hover:bg-mbg-blue-700 text-white rounded-xl font-medium shadow-md transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
          Cetak Laporan PDF
        </motion.button>
      </div>

      <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-md rounded-3xl overflow-hidden shadow-xl border border-gray-200 dark:border-slate-700/80 transition-colors">
      
      {/* Bulk Action Header */}
      <AnimatePresence>
        {selectedIds.length >= 2 && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-red-50 dark:bg-red-900/20 px-6 py-3 border-b border-red-100 dark:border-red-900/30 flex justify-between items-center"
          >
            <span className="text-sm font-semibold text-red-700 dark:text-red-400">
              {selectedIds.length} pesanan terpilih
            </span>
            <button 
              onClick={handleBulkDelete}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-xl shadow-sm transition-colors"
            >
              <Trash2 className="w-4 h-4" /> Hapus Terpilih
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse whitespace-nowrap">
          <thead>
            <tr className="bg-gray-50/50 dark:bg-slate-800/50 border-b border-gray-200 dark:border-slate-700">
              <th className="py-4 px-6 text-sm font-semibold text-gray-600 dark:text-gray-300 w-12">
                <input 
                  type="checkbox" 
                  checked={selectedIds.length === filteredOrders.length && filteredOrders.length > 0}
                  onChange={toggleSelectAll}
                  className="w-4 h-4 text-pink-600 rounded border-gray-300 focus:ring-pink-500"
                />
              </th>
              <th className="py-4 px-6 text-sm font-semibold text-gray-600 dark:text-gray-300 w-16">No</th>
              <th className="py-4 px-6 text-sm font-semibold text-gray-600 dark:text-gray-300">Order ID</th>
              <th className="py-4 px-6 text-sm font-semibold text-gray-600 dark:text-gray-300">Nama SPPG / SPPG</th>
              <th className="py-4 px-6 text-sm font-semibold text-gray-600 dark:text-gray-300">Tanggal</th>
              <th className="py-4 px-6 text-sm font-semibold text-gray-600 dark:text-gray-300">Pembayaran</th>
              <th className="py-4 px-6 text-sm font-semibold text-gray-600 dark:text-gray-300 text-center w-32">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-slate-700/50">
            {filteredOrders.length === 0 ? (
              <tr>
                <td colSpan="7" className="py-12 text-center text-gray-500 dark:text-gray-400">Tidak ada riwayat pesanan yang cocok.</td>
              </tr>
            ) : (
              filteredOrders.map((order, index) => (
                <tr key={order.id} className={`hover:bg-gray-50/50 dark:hover:bg-slate-800/30 transition-colors ${selectedIds.includes(order.id) ? 'bg-pink-50/50 dark:bg-pink-900/10' : ''}`}>
                  <td className="py-4 px-6">
                    <input 
                      type="checkbox" 
                      checked={selectedIds.includes(order.id)}
                      onChange={() => toggleSelect(order.id)}
                      className="w-4 h-4 text-pink-600 rounded border-gray-300 focus:ring-pink-500"
                    />
                  </td>
                  <td className="py-4 px-6 text-sm text-gray-500 dark:text-gray-400 font-medium">{index + 1}</td>
                  <td className="py-4 px-6 text-sm font-medium text-mbg-blue-600 dark:text-mbg-blue-400">{order.orderNumber}</td>
                  <td className="py-4 px-6 text-sm font-bold text-gray-900 dark:text-white">{order.clientName}</td>
                  <td className="py-4 px-6 text-sm text-gray-600 dark:text-gray-400">{order.date}</td>
                  <td className="py-4 px-6">
                    <button 
                      onClick={() => promptTogglePayment(order)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full transition-transform hover:scale-105 active:scale-95 ${
                        order.paymentStatus === 'Lunas' 
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 hover:bg-green-200' 
                          : order.paymentStatus === 'Menunggu Konfirmasi'
                          ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 hover:bg-yellow-200'
                          : 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400 hover:bg-pink-200'
                      }`}
                      title="Klik untuk ubah status pembayaran"
                    >
                      {order.paymentStatus}
                      {order.paymentProofUrl && <Paperclip className="w-3 h-3" />}
                    </button>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center justify-center gap-2">
                      <motion.button
                        whileHover={{ scale: 1.15 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setSelectedOrderDetails(order)}
                        className="p-2 text-mbg-blue-600 hover:bg-mbg-blue-50 dark:text-mbg-blue-400 dark:hover:bg-slate-800 rounded-lg transition-colors"
                        title="Lihat Detail Pesanan"
                      >
                        <Eye className="w-5 h-5" />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.15 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => {
                          showConfirm(
                            'Hapus Riwayat',
                            'Hapus riwayat pesanan ini secara permanen?',
                            () => {
                              setOrders(orders.filter(o => o.id !== order.id));
                              toast.success('Pesanan dihapus dari riwayat.');
                            }
                          );
                        }}
                        className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        title="Hapus Pesanan"
                      >
                        <Trash2 className="w-5 h-5" />
                      </motion.button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>

      {/* Proof Modal */}
      <AnimatePresence>
        {proofModalOrder && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
              onClick={() => setProofModalOrder(null)}
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden flex flex-col"
            >
              <div className="px-6 py-4 border-b border-gray-100 dark:border-slate-800 bg-gray-50 dark:bg-slate-900/50 flex justify-between items-center">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Verifikasi Pembayaran</h3>
                <button 
                  onClick={() => setProofModalOrder(null)}
                  className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Pesanan <strong className="text-mbg-blue-600">{proofModalOrder.orderNumber}</strong> dari <strong>{proofModalOrder.clientName}</strong>.
                </p>

                {proofModalOrder.paymentProofUrl ? (
                  <div className="mb-6 relative rounded-xl border border-gray-200 dark:border-slate-700 overflow-hidden bg-gray-50 dark:bg-slate-800/50 flex justify-center items-center group">
                    <img src={proofModalOrder.paymentProofUrl} alt="Bukti Pembayaran" className="max-h-64 object-contain" />
                    <a
                      href={proofModalOrder.paymentProofUrl}
                      download={`Bukti Pembayaran ${proofModalOrder.orderNumber}.jpg`}
                      target="_blank"
                      rel="noreferrer"
                      className="absolute top-2 right-2 p-2 bg-white/90 rounded-lg shadow-sm text-gray-700 hover:text-mbg-blue-600 transition-colors"
                      title="Buka Gambar Asli"
                    >
                      <Download className="w-5 h-5" />
                    </a>
                  </div>
                ) : (
                  <div className="mb-6 py-8 px-4 text-center rounded-xl bg-gray-50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700 border-dashed">
                    <p className="text-sm text-gray-500">SPPG belum mengunggah bukti pembayaran.</p>
                  </div>
                )}

                <div className="flex flex-col gap-3">
                  <button
                    onClick={() => handleTogglePayment(proofModalOrder, 'Lunas')}
                    className={`w-full py-3 rounded-xl font-medium transition-colors ${
                      proofModalOrder.paymentStatus === 'Lunas' 
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-slate-800 dark:text-gray-600' 
                        : 'bg-green-600 hover:bg-green-700 text-white shadow-md'
                    }`}
                    disabled={proofModalOrder.paymentStatus === 'Lunas'}
                  >
                    Tandai Lunas
                  </button>
                  <button
                    onClick={() => handleTogglePayment(proofModalOrder, 'Belum Lunas')}
                    className={`w-full py-3 rounded-xl font-medium transition-colors ${
                      proofModalOrder.paymentStatus === 'Belum Lunas' 
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-slate-800 dark:text-gray-600' 
                        : 'bg-pink-100 text-pink-700 hover:bg-pink-200 dark:bg-pink-900/30 dark:text-pink-400 dark:hover:bg-pink-900/50'
                    }`}
                    disabled={proofModalOrder.paymentStatus === 'Belum Lunas'}
                  >
                    Batalkan Status Lunas (Tandai Belum Lunas)
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
  </div>
  );
}
