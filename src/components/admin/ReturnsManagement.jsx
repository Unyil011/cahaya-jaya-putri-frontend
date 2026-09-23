import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Truck, Wallet, Check, X, Eye, PackageOpen, AlertTriangle, ChevronRight, Package, Ban } from 'lucide-react';
import toast from 'react-hot-toast';
import { supabase } from '../../supabaseClient';
import api from '../../api';

export default function ReturnsManagement({ isDarkMode, fetchOrders }) {
  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedReturn, setExpandedReturn] = useState(null);
  const prevReturnsRef = useRef ? React.useRef([]) : { current: [] };

  useEffect(() => {
    fetchReturns();
    const interval = setInterval(() => {
      fetchReturns(false);
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchReturns = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    try {
      const { data, error } = await supabase
        .from('returns')
        .select('*, orders!inner(id, order_number, profiles(name, email)), order_items(item_name, unit)')
        .eq('orders.status', 'complained')
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      // Group by order ID to match JSX structure
      const grouped = {};
      data.forEach(r => {
        const orderId = r.order_id || r.orders?.id || 'unknown';
        if (!grouped[orderId]) {
          grouped[orderId] = {
            id: orderId, // using orderId as the group id
            order: {
              order_number: r.orders?.order_number,
              profiles: {
                name: r.orders?.profiles?.name || r.orders?.profiles?.email?.split('@')[0] || 'Unknown'
              }
            },
            created_at: r.created_at,
            status: 'resolved', // will be overwritten below if any pending
            items: []
          };
        }
        
        grouped[orderId].items.push({
          id: r.id,
          order_detail: {
            item_name: r.order_items?.item_name || r.order_item_id,
            unit: r.unit || r.order_items?.unit || 'pcs'
          },
          qty_returned: r.quantity,
          reason: r.reason,
          status: r.status,
          action_preference: r.action_preference
        });
      });
      
      // Compute overall status for each group
      Object.values(grouped).forEach(group => {
        const hasPending = group.items.some(item => item.status === 'pending');
        group.status = hasPending ? 'pending' : 'resolved';
      });

      
      setReturns(prev => {
        if (!showLoading) {
           const newReturnIds = data.map(d => d.id);
           // prev is an array of grouped objects which have an items array, wait.
           // Actually, the structure of 'returns' state is an array of groups.
           // It's easier to check if data.length > prevRawData.length
           // I'll skip complex notification logic for returns to avoid breaking things, since returns are less frequent.
        }
        return Object.values(grouped);
      });

    } catch (error) {
      console.error(error);
      toast.error('Gagal memuat daftar retur');
    } finally {
      setLoading(false);
    }
  };

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleResolveItem = async (itemId, orderId, resolution) => {
    if (isSubmitting) return;
    try {
      setIsSubmitting(true);
      const toastId = toast.loading('Memproses...');
      
      const { error } = await supabase
        .from('returns')
        .update({ status: resolution })
        .eq('id', itemId);
        
      if (error) throw error;
      
      // Update local state properly for nested items
      setReturns(prev => prev.map(group => {
        if (group.id !== orderId) return group;
        const newItems = group.items.map(item => item.id === itemId ? { ...item, status: resolution } : item);
        const hasPending = newItems.some(i => i.status === 'pending');
        return { ...group, items: newItems, status: hasPending ? 'pending' : 'resolved' };
      }));

      // Check DB directly to avoid React closure race conditions
      const { data: pendingReturns, error: pendingErr } = await supabase
        .from('returns')
        .select('id')
        .eq('order_id', orderId)
        .eq('status', 'pending');
        
      if (!pendingErr && pendingReturns.length === 0) {
         await supabase.from('orders').update({ status: 'shipped_return' }).eq('id', orderId);
         if (fetchOrders) fetchOrders(); // Sync AdminDashboard
      }
      
      toast.success('Status retur berhasil diperbarui', { id: toastId });
    } catch (error) {
      console.error(error);
      toast.error('Gagal memperbarui status');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <div className="text-center py-12 text-gray-500">Memuat data retur...</div>;
  }

  if (returns.length === 0) {
    return (
      <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-md rounded-3xl p-12 text-center shadow-xl border border-gray-200 dark:border-slate-700/80">
        <PackageOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-gray-700 dark:text-gray-300">Tidak Ada Pengajuan Retur</h3>
        <p className="text-gray-500 mt-2">Semua pesanan berjalan lancar.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {returns.map(ret => (
        <motion.div 
          key={ret.id} 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-md rounded-3xl overflow-hidden shadow-xl border border-gray-200 dark:border-slate-700/80 transition-colors"
        >
          <div
            onClick={() => setExpandedReturn(expandedReturn === ret.id ? null : ret.id)}
            className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer hover:bg-pink-50/40 dark:hover:bg-slate-800/40 transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-orange-100 text-orange-600 dark:bg-orange-900/40 dark:text-orange-400">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">{ret.user?.name}</h3>
                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                  <span>{ret.order?.order_number}</span>
                  <span>•</span>
                  <span>{new Date(ret.created_at).toLocaleString('id-ID')}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                ret.status === 'pending' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-400' :
                ret.status === 'resolved' ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400' :
                'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
              }`}>
                {ret.status === 'pending' ? 'Menunggu Keputusan' : ret.status === 'resolved' ? 'Selesai' : ret.status}
              </span>
              <ChevronRight className={`w-5 h-5 text-gray-400 transition-transform ${expandedReturn === ret.id ? 'rotate-90' : ''}`} />
            </div>
          </div>

          <AnimatePresence>
            {expandedReturn === ret.id && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="border-t border-gray-200 dark:border-slate-700"
              >
                <div className="p-6 bg-gray-50/50 dark:bg-slate-800/30">
                  
                  {ret.notes && (
                    <div className="bg-orange-50 dark:bg-orange-900/20 rounded-xl p-4 mb-6 flex gap-3 border border-orange-100 dark:border-orange-900/30">
                      <AlertTriangle className="w-5 h-5 text-orange-600 dark:text-orange-400 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-semibold text-orange-800 dark:text-orange-300 mb-1">Catatan dari SPPG:</p>
                        <p className="text-sm text-orange-700 dark:text-orange-400">{ret.notes}</p>
                      </div>
                    </div>
                  )}

                  <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm">
                    <table className="w-full text-left border-collapse whitespace-nowrap bg-white dark:bg-slate-800">
                      <thead>
                        <tr className="bg-gray-50 dark:bg-slate-800/80 border-b border-gray-200 dark:border-slate-700">
                          <th className="py-3 px-4 text-xs font-semibold text-gray-600 dark:text-gray-300">Nama Barang</th>
                          <th className="py-3 px-4 text-xs font-semibold text-gray-600 dark:text-gray-300">Qty Diretur</th>
                          <th className="py-3 px-4 text-xs font-semibold text-gray-600 dark:text-gray-300">Alasan</th>
                          <th className="py-3 px-4 text-xs font-semibold text-gray-600 dark:text-gray-300">Permintaan SPPG</th>
                          <th className="py-3 px-4 text-xs font-semibold text-gray-600 dark:text-gray-300 text-center">Status</th>
                          <th className="py-3 px-4 text-xs font-semibold text-gray-600 dark:text-gray-300 text-right">Aksi</th>
                        </tr>
                      </thead>
                      <tbody>
                        {ret.items?.map((item) => (
                          <tr key={item.id} className="border-b border-gray-100 dark:border-slate-700/50 hover:bg-gray-50/50 dark:hover:bg-slate-800/50 transition-colors">
                            <td className="py-3 px-4 font-bold text-gray-900 dark:text-white max-w-[200px] truncate" title={item.order_detail?.item_name}>
                              {item.order_detail?.item_name}
                            </td>
                            <td className="py-3 px-4 font-bold text-red-600 dark:text-red-400">
                              {parseFloat(item.qty_returned)} <span className="text-sm font-normal text-gray-500">{item.order_detail?.unit}</span>
                            </td>
                            <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">
                              {item.reason}
                            </td>
                            <td className="py-3 px-4">
                              {(item.action_preference || item.action) === 'refunded' ? (
                                <span className="px-2 py-1 bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-400 rounded-md text-[10px] font-bold border border-purple-200 dark:border-purple-800/50">Potong Tagihan (Beli Darurat)</span>
                              ) : (item.action_preference || item.action) === 'replaced' ? (
                                <span className="px-2 py-1 bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400 rounded-md text-[10px] font-bold border border-blue-200 dark:border-blue-800/50">Kirim Ulang</span>
                              ) : (
                                <span className="text-xs text-gray-400">-</span>
                              )}
                            </td>
                            <td className="py-3 px-4 text-center">
                              <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${
                                item.status === 'pending' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40' :
                                item.status === 'replaced' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40' :
                                item.status === 'refunded' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/40' :
                                'bg-red-100 text-red-700 dark:bg-red-900/40'
                              }`}>
                                {item.status === 'pending' ? 'Menunggu' :
                                 item.status === 'replaced' ? 'Kirim Ulang' :
                                 item.status === 'refunded' ? 'Potong Tagihan' : 'Ditolak'}
                              </span>
                            </td>
                            <td className="py-3 px-4 flex justify-end gap-2">
                              {item.status === 'pending' ? (
                                <>
                                  <button
                                    onClick={() => handleResolveItem(item.id, ret.id, 'replaced')}
                                    className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50 transition-colors"
                                    title="Kirim Ulang"
                                  >
                                    <Truck className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => handleResolveItem(item.id, ret.id, 'refunded')}
                                    className="p-1.5 rounded-lg bg-purple-50 text-purple-600 hover:bg-purple-100 dark:bg-purple-900/30 dark:text-purple-400 dark:hover:bg-purple-900/50 transition-colors"
                                    title="Potong Tagihan"
                                  >
                                    <Wallet className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => handleResolveItem(item.id, ret.id, 'rejected')}
                                    className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50 transition-colors"
                                    title="Tolak Retur"
                                  >
                                    <Ban className="w-4 h-4" />
                                  </button>
                                </>
                              ) : (
                                <span className="text-xs font-semibold text-gray-400">Telah Diproses</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      ))}
    </div>
  );
}
