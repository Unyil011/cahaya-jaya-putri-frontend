import formatIndonesianDate from '../../utils/dateFormatter';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PackageOpen, CheckCircle, AlertTriangle, FileText, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';
import ConfirmModal from '../admin/ConfirmModal';
import ClientEditOrderModal from './ClientEditOrderModal';
import { supabase } from '../../supabaseClient';

export default function ClientActiveOrders({ searchQuery = '' }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const prevOrdersRef = useRef([]);
  
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [cancelConfirmDialog, setCancelConfirmDialog] = useState({ isOpen: false, orderId: null });
  const [editModalOrder, setEditModalOrder] = useState(null);
  const [returnItems, setReturnItems] = useState({});
  const [returnNotes, setReturnNotes] = useState('');

  const [expandedOrder, setExpandedOrder] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(() => {
      fetchOrders(false);
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  const fetchOrders = async (showLoading = true) => {
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
          order_items (*)
        `)
        .eq('user_id', userData.id)
        .neq('status', 'completed')
        
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Map data to match old format
      const formattedOrders = data.map(o => ({
        id: o.id,
        orderNumber: o.order_number,
        status: o.status,
        paymentStatus: o.payment_status,
        totalAmount: o.total_amount,
        date: formatIndonesianDate(o.custom_order_date || o.created_at, true),
        created_at: o.custom_order_date || o.created_at,
        items: o.order_items.map(i => ({
          id: i.id,
          itemName: i.item_name,
          quantity: i.quantity,
          unit: i.unit,
          sellingPrice: i.selling_price
        }))
      }));

      
      setOrders(prev => {
        // Compare new data with prev data to show toasts
        if (!showLoading) {
           formattedOrders.forEach(newOrder => {
              const oldOrder = prev.find(o => o.id === newOrder.id);
              if (oldOrder && oldOrder.status === 'pending' && newOrder.status === 'priced') {
                 toast.success('Admin telah memberikan harga untuk pesanan ' + newOrder.orderNumber + '!', { duration: 6000, icon: '💰' });
              }
              if (oldOrder && oldOrder.status === 'complained' && newOrder.status === 'shipped_return') {
                 toast.success('Retur pesanan ' + newOrder.orderNumber + ' telah diproses Admin. Silakan periksa.', { duration: 6000, icon: '🔄' });
              }
           });
        }
        return formattedOrders;
      });

    } catch (error) {
      console.error(error);
      if (showLoading) toast.error('Gagal memuat pesanan berjalan');
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending': return <span className="px-3 py-1 rounded-full text-xs font-bold bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-800/50">Menunggu Harga</span>;
      case 'priced': return <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border border-blue-200 dark:border-blue-800/50">Harga Ditetapkan</span>;
      case 'processing': return <span className="px-3 py-1 rounded-full text-xs font-bold bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400 border border-pink-200 dark:border-pink-800/50">Sedang Disiapkan</span>;
      case 'shipped': return <span className="px-3 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 border border-purple-200 dark:border-purple-800/50">Sedang Dikirim</span>;
      case 'shipped_return': return <span className="px-3 py-1 rounded-full text-xs font-bold bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 border border-orange-200 dark:border-orange-800/50">Menunggu Konfirmasi</span>;
      case 'complained': return <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border border-red-200 dark:border-red-800/50">Dikomplain</span>;
      default: return <span className="px-3 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-700">Unknown</span>;
    }
  };

  const getIconColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/40 dark:text-yellow-400',
      processing: 'bg-pink-100 text-pink-600 dark:bg-pink-900/40 dark:text-pink-400',
      priced: 'bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400',
      shipped: 'bg-purple-100 text-purple-600 dark:bg-purple-900/40 dark:text-purple-400',
      shipped_return: 'bg-orange-100 text-orange-600 dark:bg-orange-900/40 dark:text-orange-400',
      complained: 'bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400',
    };
    return colors[status] || 'bg-gray-100 text-gray-500';
  };

  const handleOpenConfirm = (order) => {
    setSelectedOrder(order);
    const initialReturns = {};
    order.items.forEach(item => {
      initialReturns[item.id] = { isReturning: false, qty: '', reason: '', action_preference: 'replaced' };
    });
    setReturnItems(initialReturns);
    setReturnNotes('');
    setShowConfirmModal(true);
  };

  const handleReturnChange = (itemId, field, value) => {
    setReturnItems(prev => ({
      ...prev,
      [itemId]: { ...prev[itemId], [field]: value }
    }));
  };

  const handleSubmitConfirmation = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    
    const isReturningAny = Object.values(returnItems).some(r => r.isReturning);
    
    if (isReturningAny) {
      // Validate returns
      const invalidReturn = Object.values(returnItems).find(r => r.isReturning && (!r.qty || !r.reason));
      if (invalidReturn) {
        toast.error('Mohon isi kuantitas dan alasan untuk barang yang diretur.');
        setIsSubmitting(false);
        return;
      }
      
      const payload = {
        notes: returnNotes,
        items: Object.entries(returnItems)
          .filter(([_, r]) => r.isReturning)
          .map(([id, r]) => ({
            order_detail_id: id,
            qty_returned: r.qty,
            reason: r.reason,
            action_preference: r.action_preference
          }))
      };

      try {
        const returnPayloads = Object.entries(returnItems)
          .filter(([_, r]) => r.isReturning)
          .map(([id, r]) => ({
            order_id: selectedOrder.id,
            order_item_id: id,
            quantity: r.qty,
            reason: r.reason,
            action: r.action_preference,
            notes: returnNotes,
            status: 'pending'
          }));

        // 1. Insert returns
        const { error: returnError } = await supabase.from('returns').insert(returnPayloads);
        if (returnError) throw returnError;

        // 2. Update order status to complained
        const { error: updateError } = await supabase.from('orders').update({ status: 'complained' }).eq('id', selectedOrder.id);
        if (updateError) throw updateError;

        toast.success('Pengajuan retur berhasil dikirim.');
        setShowConfirmModal(false);
        fetchOrders();
      } catch (error) {
        console.error(error);
        toast.error('Gagal mengirim pengajuan retur.');
      } finally {
        setIsSubmitting(false);
      }
    } else {
      // No returns, just complete order
      try {
        const { error } = await supabase.from('orders').update({ status: 'completed' }).eq('id', selectedOrder.id);
        if (error) throw error;
        
        toast.success('Pesanan berhasil diselesaikan.');
        setShowConfirmModal(false);
        fetchOrders();
      } catch (error) {
        console.error(error);
        toast.error('Gagal menyelesaikan pesanan.');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const filteredOrders = orders.filter(order => 
    order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    order.date.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) return <div className="text-center py-12 text-gray-500">Memuat pesanan...</div>;

  return (
    <div className="space-y-6">
      {filteredOrders.length === 0 ? (
        <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-md rounded-3xl p-12 text-center shadow-xl border border-gray-200 dark:border-slate-700/80">
          <PackageOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-700 dark:text-gray-300">Belum Ada Pesanan Berjalan</h3>
          <p className="text-gray-500 mt-2">Anda tidak memiliki pesanan yang sedang diproses atau dikirim.</p>
        </div>
      ) : (
        filteredOrders.map(order => (
          <motion.div 
            key={order.id} 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-md rounded-3xl overflow-hidden shadow-xl border border-gray-200 dark:border-slate-700/80 transition-colors"
          >
            <div
              onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
              className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer hover:bg-gray-50/50 dark:hover:bg-slate-800/40 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-2xl ${getIconColor(order.status)}`}>
                  <PackageOpen className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">Pesanan <span className="text-mbg-blue-600">{order.orderNumber}</span></h3>
                  <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mt-1">
                    <span>{order.date}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                {getStatusBadge(order.status)}
                <ChevronRight className={`w-5 h-5 text-gray-400 transition-transform ${expandedOrder === order.id ? 'rotate-90' : ''}`} />
              </div>
            </div>

            <AnimatePresence>
              {expandedOrder === order.id && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="p-6 pt-0 border-t border-gray-100 dark:border-slate-800 bg-white/40 dark:bg-slate-900/40">
                    <div className="overflow-x-auto mt-4">
                      <table className="w-full text-left border-collapse min-w-[500px]">
                        <thead>
                          <tr className="border-b border-gray-100 dark:border-slate-700">
                            <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase">No</th>
                            <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Nama Barang</th>
                            <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Qty</th>
                            <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Harga Satuan</th>
                            <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase text-right">Total</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 dark:divide-slate-700/50">
                          {order.items.map((item, index) => (
                            <tr key={item.id} className="hover:bg-gray-50/50 dark:hover:bg-slate-800/50 transition-colors">
                              <td className="py-3 px-4 text-sm text-gray-500">{index + 1}</td>
                              <td className="py-3 px-4 text-sm font-semibold text-gray-800 dark:text-gray-200">
                                {item.itemName}
                              </td>
                              <td className="py-3 px-4 text-sm">
                                <span className="font-bold text-gray-900 dark:text-white">{item.quantity}</span> <span className="text-sm text-gray-500">{item.unit}</span>
                              </td>
                              <td className="py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">
                                {order.status === 'pending' ? '-' : `Rp ${parseFloat(item.sellingPrice || 0).toLocaleString('id-ID')}`}
                              </td>
                              <td className="py-3 px-4 text-sm text-right font-bold text-gray-900 dark:text-white">
                                {order.status === 'pending' ? '-' : `Rp ${(parseFloat(item.sellingPrice || 0) * parseFloat(item.quantity)).toLocaleString('id-ID')}`}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {order.status !== 'pending' && (
                      <div className="mt-4 p-4 bg-gray-50 dark:bg-slate-800/50 rounded-2xl border border-gray-100 dark:border-slate-700 flex justify-end">
                        <div className="flex justify-between items-center w-full md:w-auto md:min-w-[300px]">
                          <div className="text-sm font-medium text-gray-500 dark:text-gray-400">GRAND TOTAL</div>
                          <div className="font-bold text-pink-600 dark:text-pink-400 text-xl">
                            Rp {order.items.reduce((acc, item) => acc + (parseFloat(item.sellingPrice || 0) * parseFloat(item.quantity)), 0).toLocaleString('id-ID')}
                          </div>
                        </div>
                      </div>
                    )}

                    {order.status === 'pending' && (
                      <div className="mt-6 pt-4 border-t border-gray-100 dark:border-slate-700 flex gap-3">
                        <button
                          onClick={() => setEditModalOrder(order)}
                          className="flex-1 py-3 bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/40 dark:text-blue-400 rounded-xl font-medium shadow-sm transition-colors border border-blue-100 dark:border-blue-800"
                        >
                          Ubah Pesanan
                        </button>
                        <button
                          onClick={() => setCancelConfirmDialog({ isOpen: true, orderId: order.id })}
                          className="flex-1 py-3 bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 dark:text-red-400 rounded-xl font-medium shadow-sm transition-colors border border-red-100 dark:border-red-800"
                        >
                          Batalkan
                        </button>
                      </div>
                    )}

                    {(order.status === 'shipped' || order.status === 'shipped_return') && (
                      <div className="mt-6 pt-4 border-t border-gray-100 dark:border-slate-700">
                        {order.status === 'shipped_return' ? (
                           <button
                             onClick={async () => {
                               const toastId = toast.loading('Menyelesaikan pesanan...');
                               try {
                                 const { error } = await supabase.from('orders').update({ status: 'completed' }).eq('id', order.id);
                                 if (error) throw error;
                                 toast.success('Pesanan selesai!', { id: toastId });
                                 window.location.reload(); 
                               } catch (err) {
                                 toast.error('Gagal menyelesaikan pesanan', { id: toastId });
                               }
                             }}
                             className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium shadow-md transition-colors"
                           >
                             Terima Retur & Selesaikan Pesanan
                           </button>
                        ) : (
                           <button
                             onClick={() => handleOpenConfirm(order)}
                             className="w-full py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-medium shadow-md transition-colors"
                           >
                             Konfirmasi Terima Barang
                           </button>
                        )}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))
      )}

      {/* Confirmation Modal */}
      <AnimatePresence>
        {showConfirmModal && selectedOrder && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
              onClick={() => setShowConfirmModal(false)}
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-4xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="px-6 py-4 border-b border-gray-100 dark:border-slate-800 bg-gray-50 dark:bg-slate-900/50 flex justify-between items-center shrink-0">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" /> Konfirmasi Penerimaan
                </h3>
              </div>

              <div className="p-6 overflow-y-auto">
                <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-4 rounded-xl mb-6 text-sm">
                  Silakan periksa barang yang Anda terima. Centang "Retur" jika ada barang yang rusak atau tidak sesuai. Jika semua aman, langsung klik "Terima & Selesaikan".
                </div>

                <div className="overflow-x-auto pb-4">
                  <table className="w-full text-left border-collapse min-w-[800px] table-fixed">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-slate-700">
                        <th className="py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-300 w-[35%]">Nama Barang</th>
                        <th className="py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-300 w-[15%]">Jml Pesan</th>
                        <th className="py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-300 text-center w-[15%]">Ajukan Retur?</th>
                        <th className="py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-300 w-[35%]">Detail Retur</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedOrder.items.map(item => (
                        <tr key={item.id} className="border-b border-gray-100 dark:border-slate-800 hover:bg-gray-50/50 dark:hover:bg-slate-800/50">
                          <td className="py-4 px-4 font-bold text-gray-900 dark:text-white">
                            {item.itemName}
                          </td>
                          <td className="py-4 px-4 text-sm text-gray-600 dark:text-gray-400">
                            {item.quantity} {item.unit}
                          </td>
                          <td className="py-4 px-4 text-center">
                            <input 
                              type="checkbox"
                              checked={returnItems[item.id]?.isReturning || false}
                              onChange={(e) => handleReturnChange(item.id, 'isReturning', e.target.checked)}
                              className="w-5 h-5 text-red-600 rounded border-gray-300 focus:ring-red-500 cursor-pointer"
                            />
                          </td>
                          <td className="py-4 px-4">
                            {returnItems[item.id]?.isReturning ? (
                              <div className="flex items-center gap-2">
                                <input 
                                  type="number"
                                  step="0.01"
                                  max={item.quantity}
                                  value={returnItems[item.id].qty}
                                  onChange={(e) => handleReturnChange(item.id, 'qty', e.target.value)}
                                  className="w-24 px-2 py-1.5 border border-red-300 rounded focus:ring-red-500 focus:border-red-500 text-sm"
                                  placeholder={`Qty (${item.unit})`}
                                />
                                <input 
                                  type="text"
                                  value={returnItems[item.id].reason}
                                  onChange={(e) => handleReturnChange(item.id, 'reason', e.target.value)}
                                  className="w-32 px-2 py-1.5 border border-red-300 rounded focus:ring-red-500 focus:border-red-500 text-sm"
                                  placeholder="Alasan"
                                />
                                <select 
                                  value={returnItems[item.id].action_preference}
                                  onChange={(e) => handleReturnChange(item.id, 'action_preference', e.target.value)}
                                  className="w-40 px-2 py-1.5 border border-red-300 rounded focus:ring-red-500 focus:border-red-500 text-sm bg-white"
                                >
                                  <option value="replaced">Kirim Ulang</option>
                                  <option value="refunded">Beli Sendiri</option>
                                </select>
                              </div>
                            ) : (
                              <span className="text-sm text-gray-400 italic">Diterima sesuai pesanan</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                {Object.values(returnItems).some(r => r.isReturning) && (
                  <div className="mt-6">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Catatan Retur Tambahan</label>
                    <textarea 
                      value={returnNotes}
                      onChange={(e) => setReturnNotes(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-red-500 focus:border-red-500 text-sm"
                      placeholder="Catatan tambahan untuk tim admin dapur pusat..."
                      rows="3"
                    ></textarea>
                  </div>
                )}

              </div>

              <div className="p-6 border-t border-gray-100 dark:border-slate-800 bg-gray-50 dark:bg-slate-900/50 flex gap-4 shrink-0">
                <button
                  onClick={() => setShowConfirmModal(false)}
                  className="flex-1 py-3 text-gray-600 font-medium hover:bg-gray-200 dark:hover:bg-slate-800 rounded-xl transition-colors"
                >
                  Batal
                </button>
                <button
                  onClick={handleSubmitConfirmation}
                  disabled={isSubmitting}
                  className={`flex-1 py-3 text-white font-medium rounded-xl transition-colors ${Object.values(returnItems).some(r => r.isReturning) ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'} ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                  {isSubmitting ? 'Memproses...' : Object.values(returnItems).some(r => r.isReturning) ? 'Ajukan Retur' : 'Terima & Selesaikan'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <ClientEditOrderModal 
        selectedOrderDetails={editModalOrder}
        setSelectedOrderDetails={setEditModalOrder}
        fetchOrders={fetchOrders}
      />
      
      <ConfirmModal
        isOpen={cancelConfirmDialog.isOpen}
        title="Batalkan Pesanan"
        message="Apakah Anda yakin ingin membatalkan pesanan ini? Aksi ini tidak dapat dikembalikan."
        onConfirm={async () => {
          const toastId = toast.loading('Membatalkan pesanan...');
          try {
            const { error } = await supabase.from('orders').delete().eq('id', cancelConfirmDialog.orderId);
            if (error) throw error;
            toast.success('Pesanan berhasil dibatalkan!', { id: toastId });
            fetchOrders();
          } catch (err) {
            toast.error('Gagal membatalkan pesanan', { id: toastId });
          }
        }}
        onCancel={() => setCancelConfirmDialog({ isOpen: false, orderId: null })}
      />
    </div>
  );
}
