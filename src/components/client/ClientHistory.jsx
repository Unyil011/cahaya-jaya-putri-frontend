import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { History, Eye, Trash2, X, Download, Search } from 'lucide-react';
import { supabase } from '../../supabaseClient';
import { generateInvoicePDF } from '../../utils/pdfGenerator';
import toast from 'react-hot-toast';

export default function ClientHistory({ searchQuery = '', filterPayment = 'Semua', filterTime = { type: '', value: '' } }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState([]);
  const [selectedOrderDetails, setSelectedOrderDetails] = useState(null);
  const [previewFile, setPreviewFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState({ show: false, isBulk: false, id: null });

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      const { data, error } = await supabase
        .from('orders')
        .select(`
          id,
          order_number,
          status,
          payment_status,
          total_amount,
          created_at,
          order_items (*), returns (*)
        `)
        .eq('user_id', userData.id)
        .eq('is_deleted_by_client', false)
        .eq('status', 'completed')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const formattedOrders = data.map(o => ({
        id: o.id,
        orderNumber: o.order_number,
        status: o.status,
        paymentStatus: o.payment_status,
        totalAmount: o.total_amount,
        date: (o.custom_order_date ? new Date(o.custom_order_date) : new Date(o.created_at)).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) + ' WIB',
        created_at: o.custom_order_date || o.created_at,
        items: o.order_items.map(i => ({
          id: i.id,
          itemName: i.item_name,
          quantity: i.quantity,
          unit: i.unit,
          sellingPrice: i.selling_price
        })),
        returns: o.returns
      }));
      
      setOrders(formattedOrders);
    } catch (error) {
      console.error(error);
      toast.error('Gagal memuat riwayat');
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = orders.filter(order => {
    // Search Query
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      if (!order.orderNumber.toLowerCase().includes(q) && !order.date.toLowerCase().includes(q)) {
        return false;
      }
    }

    // Payment Filter
    if (filterPayment !== 'Semua') {
      if (order.paymentStatus !== filterPayment) return false;
    }

    // Time Filter
    if (filterTime.type !== '' && filterTime.value) {
      try {
        const orderDate = new Date(order.date);
        
        if (filterTime.type === 'Mingguan') {
          const startDate = new Date(filterTime.value);
          const endDate = new Date(startDate);
          endDate.setDate(endDate.getDate() + 14);
          if (orderDate < startDate || orderDate > endDate) return false;
        } 
        else if (filterTime.type === 'Bulanan') {
          const [year, month] = filterTime.value.split('-');
          if (orderDate.getFullYear() !== parseInt(year) || (orderDate.getMonth() + 1) !== parseInt(month)) return false;
        }
        else if (filterTime.type === 'Tahunan') {
          if (orderDate.getFullYear() !== parseInt(filterTime.value)) return false;
        }
      } catch (e) {
        // skip filter on error
      }
    }
    return true;
  });

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
    setDeleteConfirm({ show: true, isBulk: true, id: null });
  };

  const handleDeleteSingle = (id) => {
    setDeleteConfirm({ show: true, isBulk: false, id });
  };

  const executeDelete = async () => {
    const { isBulk, id } = deleteConfirm;
    setDeleteConfirm({ show: false, isBulk: false, id: null });

    const toastId = toast.loading('Menghapus...');
    try {
      if (isBulk || Array.isArray(id)) {
        const { error } = await supabase.from('orders').delete().in('id', selectedIds);
        if (error) throw error;
        
        setOrders(orders.filter(o => !selectedIds.includes(o.id)));
        setSelectedIds([]);
        toast.success(`${selectedIds.length} pesanan dihapus.`, { id: toastId });
      } else {
        const { error } = await supabase.from('orders').delete().eq('id', id);
        if (error) throw error;
        
        setOrders(orders.filter(o => o.id !== id));
        setSelectedIds(selectedIds.filter(selectedId => selectedId !== id));
        toast.success('Pesanan dihapus.', { id: toastId });
      }
    } catch (error) {
      console.error(error);
      toast.error('Gagal menghapus pesanan.', { id: toastId });
    }
  };

  const handleDownloadReport = async () => {
    if (!selectedOrderDetails) return;
    
    const toastId = toast.loading('Menyiapkan laporan PDF...');
    try {
      generateInvoicePDF(selectedOrderDetails, 'Invoice');
toast.success('Laporan berhasil diunduh!', { id: toastId });
    } catch (error) {
      toast.error('Gagal mengunduh laporan.', { id: toastId });
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPreviewFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const compressImage = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 800;
          let width = img.width;
          let height = img.height;

          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          
          // Compress to JPEG with 0.7 quality
          const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
          resolve(dataUrl);
        };
        img.onerror = (error) => reject(error);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const submitPaymentProof = async () => {
    if (!previewFile) return;
    setIsUploading(true);
    const toastId = toast.loading('Mengunggah bukti pembayaran...');
    try {
      // Compress image before uploading to prevent payload too large errors
      const base64String = await compressImage(previewFile);
      
      // Update order in database directly with compressed base64
      const { error: updateError } = await supabase
        .from('orders')
        .update({ 
          payment_proof_url: base64String,
          payment_status: 'Menunggu Konfirmasi'
        })
        .eq('id', selectedOrderDetails.id);

      if (updateError) throw updateError;

      // Update local state
      const updatedOrder = { ...selectedOrderDetails, paymentProofUrl: base64String, paymentStatus: 'Menunggu Konfirmasi' };
      setSelectedOrderDetails(updatedOrder);
      setOrders(orders.map(o => o.id === updatedOrder.id ? { ...o, paymentProofUrl: base64String, paymentStatus: 'Menunggu Konfirmasi' } : o));
      
      setPreviewFile(null);
      setPreviewUrl(null);
      toast.success('Bukti pembayaran berhasil diunggah!', { id: toastId });
    } catch (error) {
      console.error(error);
      toast.error('Gagal mengunggah bukti pembayaran.', { id: toastId });
    } finally {
      setIsUploading(false);
    }
  };

  if (loading) return <div className="text-center py-12 text-gray-500">Memuat riwayat...</div>;

  return (
    <div className="space-y-6">
      {orders.length === 0 ? (
        <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-md rounded-3xl p-12 text-center shadow-xl border border-gray-200 dark:border-slate-700/80">
          <History className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-700 dark:text-gray-300">Belum Ada Riwayat</h3>
          <p className="text-gray-500 mt-2">Pesanan yang sudah selesai akan muncul di sini.</p>
        </div>
      ) : (
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl p-6 shadow-xl border border-gray-200 dark:border-slate-800">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Daftar Riwayat</h3>
              <span className="bg-mbg-blue-100 text-mbg-blue-700 text-xs font-bold px-2 py-1 rounded-full">{filteredOrders.length}</span>
            </div>
            
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <AnimatePresence>
                {selectedIds.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9, width: 0 }}
                    animate={{ opacity: 1, scale: 1, width: 'auto' }}
                    exit={{ opacity: 0, scale: 0.9, width: 0 }}
                  >
                    <button
                      onClick={handleBulkDelete}
                      className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-xl shadow-sm transition-colors whitespace-nowrap"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span className="hidden sm:inline">Hapus Terpilih</span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead>
                <tr className="bg-gray-50/50 dark:bg-slate-800/50 border-b border-gray-200 dark:border-slate-700">
                  <th className="py-4 px-6 text-sm font-semibold text-gray-600 dark:text-gray-300 w-12">
                    <input
                      type="checkbox"
                      className="w-4 h-4 rounded border-gray-300 text-mbg-blue-600 focus:ring-mbg-blue-500"
                      checked={selectedIds.length === filteredOrders.length && filteredOrders.length > 0}
                      onChange={toggleSelectAll}
                    />
                  </th>
                  <th className="py-4 px-6 text-sm font-semibold text-gray-600 dark:text-gray-300 w-16">No</th>
                  <th className="py-4 px-6 text-sm font-semibold text-gray-600 dark:text-gray-300">Order ID</th>
                  <th className="py-4 px-6 text-sm font-semibold text-gray-600 dark:text-gray-300">Tanggal</th>
                  <th className="py-4 px-6 text-sm font-semibold text-gray-600 dark:text-gray-300">Status</th>
                  <th className="py-4 px-6 text-sm font-semibold text-gray-600 dark:text-gray-300">Pembayaran</th>
                  <th className="py-4 px-6 text-sm font-semibold text-gray-600 dark:text-gray-300 text-center w-32">Aksi</th>
                </tr>
              </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-slate-700/50">
                    {filteredOrders.map((order, index) => (
                      <tr key={order.id} className="hover:bg-gray-50/50 dark:hover:bg-slate-800/30">
                        <td className="py-4 px-6">
                          <input
                            type="checkbox"
                            className="w-4 h-4 rounded border-gray-300 text-mbg-blue-600 focus:ring-mbg-blue-500"
                            checked={selectedIds.includes(order.id)}
                            onChange={() => toggleSelect(order.id)}
                          />
                        </td>
                        <td className="py-4 px-6 text-sm text-gray-500">{index + 1}</td>
                        <td className="py-4 px-6 text-sm font-bold text-mbg-blue-600">{order.orderNumber}</td>
                        <td className="py-4 px-6 text-sm text-gray-600">{order.date}</td>
                        <td className="py-4 px-6 text-sm">
                          {order.status === 'completed' ? (
                            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">Selesai</span>
                          ) : (
                            <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold">Dikomplain</span>
                          )}
                        </td>
                        <td className="py-4 px-6 text-sm">
                          <span className={`inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full ${
                            order.paymentStatus === 'Lunas' 
                              ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                              : order.paymentStatus === 'Menunggu Konfirmasi'
                              ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                              : 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400'
                          }`}>
                            {order.paymentStatus}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => setSelectedOrderDetails(order)}
                              className="p-2 text-gray-400 hover:text-mbg-blue-600 hover:bg-mbg-blue-50 dark:hover:bg-slate-700 rounded-lg transition-colors"
                              title="Lihat Detail"
                            >
                              <Eye className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => handleDeleteSingle(order.id)}
                              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-slate-700 rounded-lg transition-colors"
                              title="Hapus Pesanan"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filteredOrders.length === 0 && (
                  <div className="text-center py-8 text-gray-500 text-sm">
                    Tidak ada pesanan yang sesuai dengan pencarian Anda.
                  </div>
                )}
              </div>
        </div>
      )}

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedOrderDetails && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
              onClick={() => setSelectedOrderDetails(null)}
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="px-6 py-4 border-b border-gray-100 dark:border-slate-800 bg-gray-50 dark:bg-slate-900/50 flex justify-between items-center shrink-0">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <History className="w-5 h-5 text-mbg-blue-500" /> Detail Pesanan {selectedOrderDetails.orderNumber}
                </h3>
                <button 
                  onClick={() => setSelectedOrderDetails(null)}
                  className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 overflow-y-auto">
                <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Tanggal Pesanan</p>
                    <p className="font-semibold text-gray-900 dark:text-white">{selectedOrderDetails.date}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Status</p>
                    {selectedOrderDetails.status === 'completed' ? (
                      <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold inline-block mt-1">Selesai</span>
                    ) : (
                      <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold inline-block mt-1">Dikomplain</span>
                    )}
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-slate-700">
                        <th className="py-2 px-4 text-xs font-semibold text-gray-500">Barang</th>
                        <th className="py-2 px-4 text-xs font-semibold text-gray-500">Qty</th>
                        <th className="py-2 px-4 text-xs font-semibold text-gray-500 text-right">Harga</th>
                        <th className="py-2 px-4 text-xs font-semibold text-gray-500 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                      {selectedOrderDetails.items.map(item => (
                        <tr key={item.id}>
                          <td className="py-3 px-4 text-sm font-medium text-gray-900 dark:text-gray-200">{item.itemName}</td>
                          <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">{item.quantity} {item.unit}</td>
                          <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400 text-right">Rp {parseFloat(item.sellingPrice || 0).toLocaleString('id-ID')}</td>
                          <td className="py-3 px-4 text-sm font-bold text-gray-900 dark:text-white text-right">
                            Rp {(parseFloat(item.sellingPrice || 0) * parseFloat(item.quantity)).toLocaleString('id-ID')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="mt-6 p-4 bg-gray-50 dark:bg-slate-800/50 rounded-2xl flex justify-between items-center">
                  <span className="font-semibold text-gray-600 dark:text-gray-400">Total Pembelian</span>
                  <span className="text-xl font-bold text-mbg-blue-600 dark:text-mbg-blue-400">
                    Rp {selectedOrderDetails.items.reduce((acc, item) => acc + (parseFloat(item.sellingPrice || 0) * parseFloat(item.quantity)), 0).toLocaleString('id-ID')}
                  </span>
                </div>

                <div className="mt-6 border-t border-gray-100 dark:border-slate-800 pt-6">
                  <h4 className="text-md font-bold text-gray-900 dark:text-white mb-4">Bukti Pembayaran</h4>
                  
                  {previewUrl ? (
                    <div className="flex flex-col gap-4">
                      <div className="rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden relative group">
                        <img src={previewUrl} alt="Preview Bukti" className="w-full h-auto max-h-64 object-contain bg-gray-50 dark:bg-gray-800" />
                        <button 
                          onClick={() => { setPreviewFile(null); setPreviewUrl(null); }}
                          disabled={isUploading}
                          className={`absolute top-2 right-2 p-2 ${isUploading ? 'bg-gray-400' : 'bg-red-600 hover:opacity-100'} text-white rounded-full opacity-80 transition-opacity`}
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      <button 
                        onClick={submitPaymentProof}
                        disabled={isUploading}
                        className={`w-full py-3 ${isUploading ? 'bg-gray-400 cursor-not-allowed' : 'bg-mbg-blue-600 hover:bg-mbg-blue-700'} text-white rounded-xl font-medium shadow-md transition-colors`}
                      >
                        {isUploading ? 'Sedang Mengunggah...' : 'Kirim Bukti Pembayaran'}
                      </button>
                    </div>
                  ) : selectedOrderDetails.paymentProofUrl ? (
                    <div className="flex flex-col gap-4">
                      <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl">
                        <div>
                          <p className="font-semibold text-green-800 dark:text-green-400">Bukti Telah Diunggah</p>
                          <p className="text-sm text-green-600 dark:text-green-500">
                            {selectedOrderDetails.paymentStatus === 'Lunas' ? 'Pembayaran telah dikonfirmasi Lunas oleh Admin.' : 'Menunggu verifikasi Admin.'}
                          </p>
                        </div>
                        <a 
                          href={selectedOrderDetails.paymentProofUrl} 
                          download={`Bukti Pembayaran ${selectedOrderDetails.orderNumber}.jpg`}
                          target="_blank" 
                          rel="noreferrer"
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium text-sm transition-colors whitespace-nowrap"
                        >
                          Lihat Bukti
                        </a>
                      </div>
                      {selectedOrderDetails.paymentStatus !== 'Lunas' && (
                        <div className="text-right">
                          <label className="cursor-pointer text-sm text-mbg-blue-600 hover:text-mbg-blue-700 dark:text-mbg-blue-400 hover:underline">
                            Ganti Bukti Pembayaran?
                            <input 
                              type="file" 
                              accept="image/*"
                              onChange={handleFileSelect}
                              className="hidden"
                            />
                          </label>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex flex-col gap-3">
                      <p className="text-sm text-gray-500">Silakan unggah bukti transfer/pembayaran agar admin dapat mengonfirmasi pesanan menjadi Lunas.</p>
                      <input 
                        type="file" 
                        accept="image/*"
                        onChange={handleFileSelect}
                        className="block w-full text-sm text-gray-500
                          file:mr-4 file:py-2 file:px-4
                          file:rounded-xl file:border-0
                          file:text-sm file:font-semibold
                          file:bg-mbg-blue-50 file:text-mbg-blue-700
                          hover:file:bg-mbg-blue-100
                          dark:file:bg-mbg-blue-900/30 dark:file:text-mbg-blue-400
                          cursor-pointer"
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="px-6 py-4 border-t border-gray-100 dark:border-slate-800 bg-gray-50 dark:bg-slate-900/50 flex justify-end">
                <button
                  onClick={handleDownloadReport}
                  className="flex items-center gap-2 px-6 py-2.5 bg-mbg-blue-600 text-white rounded-xl hover:bg-mbg-blue-700 transition-colors font-medium shadow-md shadow-mbg-blue-500/30"
                >
                  <Download className="w-4 h-4" />
                  Unduh Laporan
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {deleteConfirm.show && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
              onClick={() => setDeleteConfirm({ show: false, isBulk: false, id: null })}
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="p-6 text-center">
                <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Trash2 className="w-8 h-8 text-red-600 dark:text-red-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Konfirmasi Hapus</h3>
                <p className="text-gray-500 dark:text-gray-400">
                  {deleteConfirm.isBulk 
                    ? `Hapus ${selectedIds.length} pesanan terpilih dari pandangan Anda?` 
                    : 'Hapus pesanan ini dari riwayat Anda?'}
                </p>
              </div>
              <div className="p-4 border-t border-gray-100 dark:border-slate-800 bg-gray-50 dark:bg-slate-900/50 flex gap-3">
                <button
                  onClick={() => setDeleteConfirm({ show: false, isBulk: false, id: null })}
                  className="flex-1 py-2.5 text-gray-600 font-medium hover:bg-gray-200 dark:hover:bg-slate-800 rounded-xl transition-colors"
                >
                  Batal
                </button>
                <button
                  onClick={executeDelete}
                  className="flex-1 py-2.5 bg-red-600 text-white font-medium hover:bg-red-700 rounded-xl transition-colors shadow-md shadow-red-500/30"
                >
                  Hapus
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
