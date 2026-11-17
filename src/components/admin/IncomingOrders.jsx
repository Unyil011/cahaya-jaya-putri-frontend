import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, ChevronRight, CheckCircle, Printer, FileText, X, GitFork, Plus, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { supabase } from '../../supabaseClient';

export default function IncomingOrders({
  filteredOrders,
  expandedOrder,
  setExpandedOrder,
  handlePriceChange,
  handleSavePrices,
  handleSplitItem,
  handleAddSplitSubItem,
  handleDeleteSplitItem,
  setOrders,
  orders,
  isDarkMode,
  handlePrint,
  getIconColor,
  getStatusBadge
}) {
  const [inventories, setInventories] = useState([]);
  const [activeDropdown, setActiveDropdown] = useState(null); // { orderId, itemId }
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 280 });

  const updateDropdownPosition = (orderId, itemId) => {
    const inputEl = document.getElementById(`stock-search-${orderId}-${itemId}`);
    if (inputEl) {
      const rect = inputEl.getBoundingClientRect();
      const openUpward = rect.bottom + 230 > window.innerHeight && rect.top > 240;
      setDropdownPosition({
        top: openUpward ? rect.top - 230 : rect.bottom + 4,
        left: rect.left,
        width: Math.max(rect.width, 300)
      });
    }
  };

  useEffect(() => {
    if (!activeDropdown) return;
    updateDropdownPosition(activeDropdown.orderId, activeDropdown.itemId);

    const handleScrollOrResize = () => {
      updateDropdownPosition(activeDropdown.orderId, activeDropdown.itemId);
    };

    window.addEventListener('scroll', handleScrollOrResize, true);
    window.addEventListener('resize', handleScrollOrResize);
    return () => {
      window.removeEventListener('scroll', handleScrollOrResize, true);
      window.removeEventListener('resize', handleScrollOrResize);
    };
  }, [activeDropdown]);

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
        const { data, error } = await supabase.from('inventory').select('*').order('item_name');
        if (error) throw error;
        setInventories(data || []);
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
                            <th className="py-3 px-4 text-xs font-semibold text-gray-600 dark:text-gray-300 text-center w-24">Aksi</th>
                          </tr>
                        </thead>
                        <tbody>
                          {order.items.map((item, index) => (
                            <tr key={item.id} className={`border-b border-gray-100 dark:border-slate-700/50 hover:bg-gray-50/50 dark:hover:bg-slate-800/50 transition-colors ${item.isSplit ? 'bg-purple-50/20 dark:bg-purple-950/20' : ''}`}>
                              <td className="py-3 px-4 text-center font-bold text-gray-400">{index + 1}</td>
                              <td className="py-3 px-4">
                                {item.isSplit && order.status === 'pending' ? (
                                  <div className="space-y-1">
                                    <div className="flex items-center gap-1.5">
                                      <span className="text-[10px] bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300 font-bold px-1.5 py-0.5 rounded">
                                        Pecahan
                                      </span>
                                    </div>
                                    <input
                                      type="text"
                                      value={item.itemName}
                                      onChange={(e) => handlePriceChange(order.id, item.id, 'itemName', e.target.value)}
                                      placeholder="Nama barang..."
                                      className="w-48 px-2 py-1 text-sm font-semibold rounded-lg border border-purple-300 dark:border-purple-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                                    />
                                  </div>
                                ) : (
                                  <div>
                                    <div className="font-bold text-gray-900 dark:text-white max-w-[200px] truncate" title={item.itemName}>
                                      {item.itemName}
                                    </div>
                                    {item.isSplit && (
                                      <span className="inline-block text-[10px] bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300 font-bold px-1.5 py-0.2 rounded mt-0.5">
                                        Pecahan
                                      </span>
                                    )}
                                  </div>
                                )}
                              </td>
                              <td className="py-3 px-4 text-center">
                                {item.isSplit && order.status === 'pending' ? (
                                  <div className="flex items-center justify-center gap-1">
                                    <input
                                      type="number"
                                      min="0"
                                      step="any"
                                      value={item.quantity}
                                      onChange={(e) => handlePriceChange(order.id, item.id, 'quantity', e.target.value)}
                                      className="w-16 px-1.5 py-1 text-center text-sm font-bold rounded-lg border border-purple-300 dark:border-purple-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                                    />
                                    <span className="text-xs text-gray-500">{item.unit}</span>
                                  </div>
                                ) : (
                                  <div>
                                    <span className="font-bold text-gray-900 dark:text-white">{item.quantity}</span>{' '}
                                    <span className="text-sm text-gray-500">{item.unit}</span>
                                  </div>
                                )}
                              </td>
                              <td className="py-3 px-4">
                                <div className="relative flex items-center gap-1.5">
                                  <input
                                    id={`stock-search-${order.id}-${item.id}`}
                                    type="text"
                                    disabled={order.status !== 'pending'}
                                    placeholder="- Ketik nama stok -"
                                    value={item.searchName !== undefined ? item.searchName : (inventories.find(i => i.id == item.inventoryId)?.item_name || '')}
                                    onChange={(e) => {
                                      handlePriceChange(order.id, item.id, 'searchName', e.target.value);
                                      if (e.target.value === '') {
                                        handlePriceChange(order.id, item.id, {
                                          inventoryId: '',
                                          stockDeductQty: ''
                                        });
                                      }
                                      setActiveDropdown({ orderId: order.id, itemId: item.id });
                                      updateDropdownPosition(order.id, item.id);
                                    }}
                                    onFocus={() => {
                                      setActiveDropdown({ orderId: order.id, itemId: item.id });
                                      updateDropdownPosition(order.id, item.id);
                                    }}
                                    onBlur={() => {
                                      setTimeout(() => {
                                        setActiveDropdown(prev => (prev?.orderId === order.id && prev?.itemId === item.id ? null : prev));
                                      }, 200);
                                    }}
                                    className="w-48 md:w-60 py-1.5 px-2 rounded-lg bg-gray-50 dark:bg-slate-900 border border-gray-300 dark:border-slate-600 focus:ring-2 focus:ring-pink-500 text-gray-900 dark:text-white text-sm"
                                  />
                                  {item.inventoryId && order.status === 'pending' && (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        handlePriceChange(order.id, item.id, {
                                          inventoryId: '',
                                          searchName: '',
                                          stockDeductQty: ''
                                        });
                                      }}
                                      className="p-1 text-gray-400 hover:text-red-500 rounded transition-colors"
                                      title="Batalkan pilihan stok"
                                    >
                                      <X className="w-4 h-4" />
                                    </button>
                                  )}
                                </div>
                                {item.inventoryId && (() => {
                                  const selectedInv = inventories.find(i => i.id == item.inventoryId);
                                  const deductVal = parseFloat(item.stockDeductQty || 0);
                                  const stockAvailable = parseFloat(selectedInv?.stock || 0);
                                  const isOverStock = deductVal > stockAvailable;

                                  return (
                                    <div className="mt-2 p-2 bg-blue-50/80 dark:bg-slate-700/60 rounded-xl border border-blue-100 dark:border-slate-600 text-xs space-y-1.5 max-w-[260px]">
                                      <div className="flex items-center justify-between text-gray-600 dark:text-gray-300">
                                        <span>Stok Gudang:</span>
                                        <span className="font-bold text-gray-900 dark:text-white">
                                          {selectedInv?.stock} {selectedInv?.unit}
                                        </span>
                                      </div>
                                      <div className="flex items-center gap-1.5 pt-1 border-t border-blue-200/50 dark:border-slate-600">
                                        <label className="text-[11px] font-bold text-gray-700 dark:text-gray-300 shrink-0">
                                          Qty Potong:
                                        </label>
                                        <input
                                          type="number"
                                          min="0"
                                          step="any"
                                          disabled={order.status !== 'pending'}
                                          placeholder="0"
                                          value={item.stockDeductQty !== undefined ? item.stockDeductQty : ''}
                                          onChange={(e) => handlePriceChange(order.id, item.id, 'stockDeductQty', e.target.value)}
                                          className="w-20 px-2 py-1 text-center font-bold text-xs rounded-lg border border-gray-300 dark:border-slate-500 bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 shadow-inner"
                                        />
                                        <span className="text-xs font-semibold text-gray-600 dark:text-gray-300">
                                          {selectedInv?.unit}
                                        </span>
                                      </div>
                                      {isOverStock && (
                                        <div className="text-[10px] text-red-600 dark:text-red-400 font-bold leading-tight">
                                          ⚠️ Melebihi stok! (Kurang {deductVal - stockAvailable} {selectedInv?.unit})
                                        </div>
                                      )}
                                      {!item.stockDeductQty && order.status === 'pending' && (
                                        <div className="text-[10px] text-amber-600 dark:text-amber-400 font-medium leading-tight">
                                          ℹ️ Isi qty di atas untuk memotong stok gudang
                                        </div>
                                      )}
                                    </div>
                                  );
                                })()}
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
                              <td className="py-3 px-4 text-center">
                                {order.status === 'pending' ? (
                                  <div className="flex items-center justify-center gap-1.5">
                                    {!item.isSplit ? (
                                      <button
                                        type="button"
                                        onClick={() => handleSplitItem && handleSplitItem(order.id, item.id)}
                                        className="px-2.5 py-1.5 bg-purple-50 hover:bg-purple-100 dark:bg-purple-900/30 dark:hover:bg-purple-900/50 text-purple-700 dark:text-purple-300 rounded-lg text-xs font-semibold border border-purple-200 dark:border-purple-800 flex items-center gap-1 transition-all shadow-sm active:scale-95"
                                        title="Pecah baris pesanan ini menjadi beberapa sumber/merk berbeda"
                                      >
                                        <GitFork className="w-3.5 h-3.5" />
                                        <span>Pecah</span>
                                      </button>
                                    ) : (
                                      <div className="flex items-center justify-center gap-1">
                                        <button
                                          type="button"
                                          onClick={() => handleAddSplitSubItem && handleAddSplitSubItem(order.id, item.splitGroupId || item.id, item)}
                                          className="p-1.5 bg-purple-50 hover:bg-purple-100 dark:bg-purple-900/30 dark:hover:bg-purple-900/50 text-purple-700 dark:text-purple-300 rounded-lg border border-purple-200 dark:border-purple-800 transition-all shadow-sm active:scale-95"
                                          title="Tambah pecahan baris lagi"
                                        >
                                          <Plus className="w-3.5 h-3.5" />
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => handleDeleteSplitItem && handleDeleteSplitItem(order.id, item.id, item.splitGroupId || item.id)}
                                          className="p-1.5 bg-red-50 hover:bg-red-100 dark:bg-red-900/30 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400 rounded-lg border border-red-200 dark:border-red-800 transition-all shadow-sm active:scale-95"
                                          title="Hapus baris pecahan ini"
                                        >
                                          <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                ) : (
                                  <span className="text-gray-400 text-xs">-</span>
                                )}
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

      {typeof document !== 'undefined' && createPortal(
        activeDropdown && (() => {
          const currentOrder = orders.find(o => o.id === activeDropdown.orderId);
          const currentItem = currentOrder?.items?.find(i => i.id === activeDropdown.itemId);
          const searchVal = (currentItem?.searchName !== undefined ? currentItem.searchName : '').trim();
          if (!currentItem || searchVal.length === 0) return null;

          const filtered = inventories.filter(inv =>
            (inv.item_name || '').toLowerCase().includes(searchVal.toLowerCase())
          );

          return (
            <div
              style={{
                position: 'fixed',
                top: `${dropdownPosition.top}px`,
                left: `${dropdownPosition.left}px`,
                width: `${dropdownPosition.width}px`,
                zIndex: 99999,
              }}
              className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl shadow-2xl max-h-60 overflow-y-auto flex flex-col whitespace-normal divide-y divide-gray-100 dark:divide-slate-700"
            >
              {filtered.map(inv => (
                <button
                  key={inv.id}
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    const updates = {
                      inventoryId: inv.id,
                      searchName: inv.item_name,
                      isSearchFocused: false
                    };
                    if (currentItem.isSplit) {
                      updates.itemName = inv.item_name;
                    }
                    if (inv.hpp !== undefined && inv.hpp !== null && inv.hpp !== '') {
                      updates.hpp = inv.hpp;
                    }
                    if (inv.selling_price !== undefined && inv.selling_price !== null && inv.selling_price !== '' && parseFloat(inv.selling_price) > 0) {
                      updates.sellingPrice = inv.selling_price;
                    }
                    handlePriceChange(currentOrder.id, currentItem.id, updates);
                    setActiveDropdown(null);
                  }}
                  className="w-full block text-left px-3.5 py-2.5 hover:bg-pink-50/70 dark:hover:bg-slate-700/70 text-gray-900 dark:text-white transition-colors cursor-pointer"
                >
                  <div className="font-semibold text-sm leading-tight text-gray-900 dark:text-white truncate">
                    {inv.item_name}
                  </div>
                  <div className="text-[11px] text-gray-500 dark:text-gray-400 mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5">
                    <span className="font-medium text-gray-600 dark:text-gray-300">
                      Stok: {inv.stock} {inv.unit}
                    </span>
                    {inv.hpp ? <span>• HPP: Rp {parseInt(inv.hpp).toLocaleString('id-ID')}</span> : null}
                    {inv.selling_price ? (
                      <span className="text-pink-600 dark:text-pink-400 font-semibold">
                        • Jual: Rp {parseInt(inv.selling_price).toLocaleString('id-ID')}
                      </span>
                    ) : null}
                  </div>
                </button>
              ))}
              {filtered.length === 0 && (
                <div className="px-3 py-3 text-xs text-gray-500 dark:text-gray-400 text-center">
                  Barang tidak ditemukan
                </div>
              )}
            </div>
          );
        })(),
        document.body
      )}
    </div>
  );
}
