import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, ChevronRight, CheckCircle, Printer, FileText } from 'lucide-react';
import toast from 'react-hot-toast';
import { supabase } from '../../supabaseClient';

export default function IncomingOrders({
  filteredOrders,
  expandedOrder,
  setExpandedOrder,
  handlePriceChange,
  handleSavePrices,
  setOrders,
  orders,
  isDarkMode,
  handlePrint,
  getIconColor,
  getStatusBadge
}) {
  const [inventories, setInventories] = useState([]);

    const handleTogglePayment = async (order, newStatus) => {
    const toastId = toast.loading('Mengubah status pembayaran...');
    try {
      const { error } = await supabase.from('orders').update({ payment_status: newStatus }).eq('id', order.id);
      if (error) throw error;
      setOrders(orders.map(o => o.id === order.id ? { ...o, paymentStatus: newStatus } : o));
      toast.success('Status pembayaran diubah menjadi ' + newStatus, { id: toastId });
    } catch (error) {
      console.error(error);
      toast.error('Gagal mengubah status', { id: toastId });
    }
  };

  useEffect(() => {
    const fetchInventories = async () => {
      try {
        const res = await api.get('/inventories');
        setInventories(res.data);
      } catch (err) {
        console.error('Failed to fetch inventories', err);
      }
    };
    fetchInventories();
  }, []);

  return (
    <div className="space-y-6">
      {filteredOrders.length === 0 ? (
        <div className="text-center py-12">
          <div className="inline-block p-4 rounded-full bg-white/50 dark:bg-slate-800/50 text-mbg-blue-400 mb-4">
            <FileText className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Tidak ada pesanan</h3>
          <p className="text-gray-500 dark:text-gray-400">Semua daftar kosong untuk kategori ini.</p>
        </div>
      ) : (
        filteredOrders.map((order) => (
          <motion.div
            key={order.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-md rounded-3xl overflow-hidden shadow-xl border border-gray-200 dark:border-slate-700/80 transition-colors"
          >
            <div
              onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
              className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer hover:bg-pink-50/40 dark:hover:bg-slate-800/40 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-2xl ${getIconColor(order.status)}`}>
                  <Package className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">{order.clientName}</h3>
                  <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                    <span>{order.orderNumber}</span>
                    <span>•</span>
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
                  className="border-t border-gray-200 dark:border-slate-700"
                >
                  <div className="p-6 bg-gray-50/50 dark:bg-slate-800/30">

                    <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm">
                      <table className="w-full text-left border-collapse whitespace-nowrap bg-white dark:bg-slate-800">
                        <thead>
                          <tr className="bg-gray-50 dark:bg-slate-800/80 border-b border-gray-200 dark:border-slate-700">
                            <th className="py-3 px-4 text-xs font-semibold text-gray-600 dark:text-gray-300 w-12 text-center">No</th>
                            <th className="py-3 px-4 text-xs font-semibold text-gray-600 dark:text-gray-300">Nama Barang</th>
                            <th className="py-3 px-4 text-xs font-semibold text-gray-600 dark:text-gray-300 text-center">Qty</th>
                            <th className="py-3 px-4 text-xs font-semibold text-gray-600 dark:text-gray-300">Ambil Stok?</th>
                            <th className="py-3 px-4 text-xs font-semibold text-gray-600 dark:text-gray-300">HPP</th>
                            <th className="py-3 px-4 text-xs font-semibold text-gray-600 dark:text-gray-300">Harga Jual</th>
                            <th className="py-3 px-4 text-xs font-semibold text-gray-600 dark:text-gray-300 text-right">Total HPP</th>
                            <th className="py-3 px-4 text-xs font-semibold text-gray-600 dark:text-gray-300 text-right">Total Harga</th>
                          </tr>
                        </thead>
                        <tbody>
                          {order.items.map((item, index) => (
                            <tr key={item.id} className="border-b border-gray-100 dark:border-slate-700/50 hover:bg-gray-50/50 dark:hover:bg-slate-800/50 transition-colors">
                              <td className="py-3 px-4 text-center font-bold text-gray-400">{index + 1}</td>
                              <td className="py-3 px-4 font-bold text-gray-900 dark:text-white max-w-[200px] truncate" title={item.itemName}>{item.itemName}</td>
                              <td className="py-3 px-4 text-center">
                                <span className="font-bold text-gray-900 dark:text-white">{item.quantity}</span> <span className="text-sm text-gray-500">{item.unit}</span>
                              </td>
                              <td className="py-3 px-4">
                                <select
                                  value={item.inventoryId || ''}
                                  onChange={(e) => {
                                    const invId = e.target.value;
                                    handlePriceChange(order.id, item.id, 'inventoryId', invId);
                                    if (invId) {
                                      const inv = inventories.find(i => i.id == invId);
                                      if (inv && inv.default_price) {
                                        handlePriceChange(order.id, item.id, 'hpp', inv.default_price);
                                      }
                                    }
                                  }}
                                  disabled={order.status !== 'pending'}
                                  className="w-32 md:w-40 py-1.5 px-2 rounded-lg bg-gray-50 dark:bg-slate-900 border border-gray-300 dark:border-slate-600 focus:ring-2 focus:ring-pink-500 text-gray-900 dark:text-white text-sm"
                                >
                                  <option value="">- Non Stok -</option>
                                  {inventories.map(inv => (
                                    <option key={inv.id} value={inv.id}>
                                      {inv.name} (Sisa: {inv.stock})
                                    </option>
                                  ))}
                                </select>
                                {item.inventoryId && (
                                  inventories.find(i => i.id == item.inventoryId)?.stock < parseFloat(item.quantity)
                                ) && (
                                  <div className="text-[10px] text-red-500 mt-1 font-medium leading-tight">
                                    ⚠️ Kurang {parseFloat(item.quantity) - inventories.find(i => i.id == item.inventoryId).stock} {item.unit}
                                  </div>
                                )}
                              </td>
                              <td className="py-3 px-4">
                                <div className="relative w-32 md:w-36">
                                  <span className="absolute left-3 top-2 text-gray-400 text-sm">Rp</span>
                                  <input
                                    type="number"
                                    min="0"
                                    value={item.hpp}
                                    onFocus={(e) => e.target.select()}
                                    onChange={(e) => handlePriceChange(order.id, item.id, 'hpp', e.target.value)}
                                    className="w-full pl-9 pr-2 py-1.5 rounded-lg bg-gray-50 dark:bg-slate-900 border border-gray-300 dark:border-slate-600 focus:ring-2 focus:ring-pink-500 text-gray-900 dark:text-white text-sm"
                                    placeholder="0"
                                    disabled={order.status !== 'pending'}
                                  />
                                </div>
                              </td>
                              <td className="py-3 px-4">
                                <div className="relative w-32 md:w-36">
                                  <span className="absolute left-3 top-2 text-gray-400 text-sm">Rp</span>
                                  <input
                                    type="number"
                                    min="0"
                                    value={item.sellingPrice}
                                    onFocus={(e) => e.target.select()}
                                    onChange={(e) => handlePriceChange(order.id, item.id, 'sellingPrice', e.target.value)}
                                    className="w-full pl-9 pr-2 py-1.5 rounded-lg bg-gray-50 dark:bg-slate-900 border border-gray-300 dark:border-slate-600 focus:ring-2 focus:ring-pink-500 text-gray-900 dark:text-white text-sm"
                                    placeholder="0"
                                    disabled={order.status !== 'pending'}
                                  />
                                </div>
                              </td>
                              <td className="py-3 px-4 text-right font-medium text-gray-600 dark:text-gray-300">
                                Rp {((parseFloat(item.hpp) || 0) * parseFloat(item.quantity)).toLocaleString('id-ID')}
                              </td>
                              <td className="py-3 px-4 text-right font-bold text-gray-900 dark:text-white">
                                Rp {((parseFloat(item.sellingPrice) || 0) * parseFloat(item.quantity)).toLocaleString('id-ID')}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <div className="mt-6 p-4 md:p-6 bg-pink-50/50 dark:bg-slate-900/50 rounded-2xl border border-pink-100 dark:border-slate-700/50 flex flex-col md:flex-row justify-end items-end md:items-center gap-4 md:gap-8">
                      <div className="text-right w-full md:w-auto flex md:block justify-between items-center">
                        <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Modal (HPP)</div>
                        <div className="font-bold text-gray-700 dark:text-gray-300 text-lg">Rp {order.items.reduce((acc, item) => acc + (parseFloat(item.hpp) || 0) * parseFloat(item.quantity), 0).toLocaleString('id-ID')}</div>
                      </div>
                      <div className="text-right w-full md:w-auto flex md:block justify-between items-center">
                        <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Estimasi Laba</div>
                        <div className="font-bold text-green-600 dark:text-green-400 text-lg">Rp {order.items.reduce((acc, item) => acc + ((parseFloat(item.sellingPrice) || 0) - (parseFloat(item.hpp) || 0)) * parseFloat(item.quantity), 0).toLocaleString('id-ID')}</div>
                      </div>
                      <div className="hidden md:block w-px h-12 bg-gray-300 dark:bg-slate-700"></div>
                      <div className="text-right w-full md:w-auto flex md:block justify-between items-center border-t md:border-t-0 border-gray-200 dark:border-slate-700 pt-3 md:pt-0 mt-2 md:mt-0">
                        <div className="text-sm font-bold text-gray-500 dark:text-gray-400">GRAND TOTAL JUAL</div>
                        <div className="text-2xl font-black text-pink-600 dark:text-pink-400">Rp {order.items.reduce((acc, item) => acc + (parseFloat(item.sellingPrice) || 0) * parseFloat(item.quantity), 0).toLocaleString('id-ID')}</div>
                      </div>
                    </div>

                    <div className="mt-6 flex flex-col md:flex-row justify-end items-center gap-4">
                      {order.status === 'pending' && (
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleSavePrices(order.id)}
                          className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-mbg-blue-600 text-white font-medium hover:bg-mbg-blue-700 shadow-md"
                        >
                          <CheckCircle className="w-5 h-5" />
                          Simpan Harga & Proses
                        </motion.button>
                      )}

                      {(order.status === 'priced' || order.status === 'shipped') && (
                        <div className="flex flex-col md:flex-row w-full md:w-auto gap-3">
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handlePrint('Surat Jalan', order.id, order.orderNumber)}
                            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-700 shadow-sm"
                          >
                            <Printer className="w-4 h-4" />
                            Surat Jalan
                          </motion.button>
                          
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handlePrint('Invoice', order.id, order.orderNumber)}
                            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-700 shadow-sm"
                          >
                            <FileText className="w-4 h-4" />
                            Invoice
                          </motion.button>

                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleTogglePayment(order, order.paymentStatus === 'Lunas' ? 'Belum Lunas' : 'Lunas')}
                            className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl shadow-sm text-white ${order.paymentStatus === 'Lunas' ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-400 hover:bg-gray-500'}`}
                          >
                            {order.paymentStatus === 'Lunas' ? 'LUNAS (Batalkan)' : 'Tandai Lunas'}
                          </motion.button>

                          {order.status === 'priced' && (
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={async () => {
                                try {
                                  await supabase.from('orders').update({ status: 'shipped' }).eq('id', order.id);
                                  setOrders(orders.map(o => o.id === order.id ? { ...o, status: 'shipped' } : o));
                                  toast.success('Status diubah: Sedang Dikirim!', { style: { background: isDarkMode ? 'rgba(30, 41, 59, 0.8)' : 'rgba(255, 255, 255, 0.7)', backdropFilter: 'blur(10px)', color: isDarkMode ? '#fff' : '#000' } });
                                } catch (err) {
                                  toast.error('Gagal memperbarui status');
                                }
                              }}
                              className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 text-white font-medium hover:bg-purple-700 shadow-md"
                            >
                              <Package className="w-4 h-4" />
                              Mulai Pengiriman
                            </motion.button>
                          )}
                        </div>
                      )}
                    </div>

                  </div>
                </motion.div>
              )}
            </AnimatePresence>

          </motion.div>
        ))
      )}
    </div>
  );
}
