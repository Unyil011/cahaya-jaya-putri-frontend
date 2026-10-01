import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../supabaseClient';
import toast from 'react-hot-toast';
import { ArrowLeft, Plus, History, Eye, Edit2, Trash2, Check, X, AlertCircle, PackagePlus } from 'lucide-react';
import ConfirmModal from './ConfirmModal';

const StockHistory = ({ setCurrentView }) => {
  const [updates, setUpdates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorSetup, setErrorSetup] = useState(false);
  
  // Modal states
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [updateItems, setUpdateItems] = useState([{ id: 1, inventory_id: '', quantity: '', search_name: '', hpp: '' }]);
  const [inventories, setInventories] = useState([]);
  
  const [deleteConfirm, setDeleteConfirm] = useState({ show: false, id: null });
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedDetails, setSelectedDetails] = useState(null);
  const [bulkDeleteConfirm, setBulkDeleteConfirm] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount || 0);
  };

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('stock_updates')
        .select('*, stock_update_items(*, inventory(item_name, unit))')
        .order('created_at', { ascending: false });
        
      if (error) {
        if (error.code === '42P01') {
           setErrorSetup(true);
        } else {
           throw error;
        }
      } else {
        setUpdates(data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchInventories = async () => {
    const { data } = await supabase.from('inventory').select('*').order('item_name');
    if (data) setInventories(data);
  };

  useEffect(() => {
    fetchHistory();
    fetchInventories();
  }, []);

  const handleStockChange = (id, field, value) => {
    setUpdateItems(prev => prev.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const handleStockAutocomplete = (id, value) => {
    handleStockChange(id, 'search_name', value);
    const matched = inventories.find(inv => inv.item_name.toLowerCase() === value.toLowerCase());
    if (matched) {
      handleStockChange(id, 'inventory_id', matched.id);
      handleStockChange(id, 'hpp', matched.hpp || '');
    } else {
      handleStockChange(id, 'inventory_id', '');
      handleStockChange(id, 'hpp', '');
    }
  };

  const handleStockSelect = (id, inv) => {
    handleStockChange(id, 'search_name', inv.item_name);
    handleStockChange(id, 'inventory_id', inv.id);
    handleStockChange(id, 'hpp', inv.hpp || '');
  };

  const handleAddStockRow = () => {
    setUpdateItems(prev => [...prev, { id: Date.now(), inventory_id: '', quantity: '', search_name: '', hpp: '' }]);
  };

  const handleRemoveStockRow = (id) => {
    if (updateItems.length > 1) {
      setUpdateItems(prev => prev.filter(item => item.id !== id));
    }
  };

  const handleSaveUpdate = async (e) => {
    e.preventDefault();
    if (errorSetup) return toast.error('Database belum disetup!');
    
    const validItems = updateItems.filter(item => item.inventory_id && item.quantity > 0 && item.hpp !== '');
    if (validItems.length === 0) return toast.error('Pilih minimal 1 barang, isi Qty & HPP');
    
    const toastId = toast.loading('Menyimpan riwayat...');
    try {
      const { data: updateRecord, error: updateError } = await supabase
        .from('stock_updates')
        .insert([{ notes: 'Update Manual' }])
        .select()
        .single();
        
      if (updateError) throw updateError;
      
      const itemsToInsert = validItems.map(item => ({
        update_id: updateRecord.id,
        inventory_id: item.inventory_id,
        qty_added: parseInt(item.quantity),
        hpp: parseFloat(item.hpp)
      }));
      
      const { error: itemsError } = await supabase.from('stock_update_items').insert(itemsToInsert);
      if (itemsError) throw itemsError;
      
      toast.success('Stok berhasil diupdate!', { id: toastId });
      setIsUpdateModalOpen(false);
      setUpdateItems([{ id: 1, inventory_id: '', quantity: '', search_name: '', hpp: '' }]);
      fetchHistory();
      fetchInventories();
    } catch (err) {
      toast.error('Gagal menyimpan: ' + err.message, { id: toastId });
    }
  };
  
  const handleDelete = async (id) => {
    const toastId = toast.loading('Menghapus riwayat...');
    try {
      await supabase.from('stock_updates').delete().eq('id', id);
      toast.success('Log riwayat berhasil dihapus!', { id: toastId });
      fetchHistory();
      setSelectedIds(prev => prev.filter(selectedId => selectedId !== id));
    } catch (err) {
      toast.error('Gagal menghapus', { id: toastId });
    }
  };
  
  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    const toastId = toast.loading('Menghapus riwayat masal...');
    try {
      await supabase.from('stock_updates').delete().in('id', selectedIds);
      toast.success(selectedIds.length + ' riwayat berhasil dihapus!', { id: toastId });
      setSelectedIds([]);
      setBulkDeleteConfirm(false);
      fetchHistory();
    } catch (err) {
      toast.error('Gagal menghapus masal', { id: toastId });
    }
  };
  
  const toggleSelect = (id) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };
  
  const toggleSelectAll = () => {
    if (selectedIds.length === updates.length) setSelectedIds([]);
    else setSelectedIds(updates.map(u => u.id));
  };

  if (errorSetup) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-orange-200">
         <AlertCircle className="w-16 h-16 text-orange-500 mb-4" />
         <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Setup Database Diperlukan</h2>
         <p className="text-gray-600 dark:text-gray-300 max-w-lg mb-6">
           Sistem belum mendeteksi tabel <b>Riwayat Stok</b> di Supabase. Mohon jalankan kode SQL migrasi yang telah diberikan agen AI di SQL Editor Supabase Anda.
         </p>
         <button onClick={() => setCurrentView('inventory')} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg font-medium hover:bg-gray-300">
           Kembali ke Data Barang
         </button>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {selectedIds.length > 0 && (
             <button onClick={() => setBulkDeleteConfirm(true)} className="px-4 py-2 bg-red-100 text-red-600 rounded-xl font-medium flex items-center gap-2 hover:bg-red-200">
               <Trash2 className="w-4 h-4" /> Hapus Terpilih ({selectedIds.length})
             </button>
          )}
          <button onClick={() => setIsUpdateModalOpen(true)} className="px-4 py-2 bg-green-600 text-white rounded-xl font-medium shadow-sm flex items-center gap-2 hover:bg-green-700 transition-colors">
            <Plus className="w-5 h-5" /> Stok Masuk Baru
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 flex-1 overflow-hidden flex flex-col">
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-slate-800/50 border-b border-gray-100 dark:border-slate-700">
                <th className="py-4 px-4 w-12 text-center">
                  <input type="checkbox" checked={selectedIds.length === updates.length && updates.length > 0} onChange={toggleSelectAll} className="w-4 h-4 rounded text-mbg-blue-600" />
                </th>
                <th className="py-4 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Waktu Update</th>
                <th className="py-4 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Item Masuk</th>
                <th className="py-4 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Nilai Modal (HPP)</th>
                <th className="py-4 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-700/50">
              {loading ? (
                <tr><td colSpan="5" className="py-8 text-center text-gray-500">Memuat data riwayat...</td></tr>
              ) : updates.length === 0 ? (
                <tr><td colSpan="5" className="py-8 text-center text-gray-500">Belum ada riwayat update stok.</td></tr>
              ) : updates.map(update => {
                const totalNilai = update.stock_update_items.reduce((sum, item) => sum + (item.qty_added * item.hpp), 0);
                const itemSummary = update.stock_update_items.slice(0,2).map(i => i.inventory?.item_name).join(', ') + (update.stock_update_items.length > 2 ? ' ...' : '');
                
                return (
                  <tr key={update.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/50">
                    <td className="py-3 px-4 text-center">
                      <input type="checkbox" checked={selectedIds.includes(update.id)} onChange={() => toggleSelect(update.id)} className="w-4 h-4 rounded text-mbg-blue-600" />
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {new Date(update.created_at).toLocaleDateString('id-ID', { day:'numeric', month:'short', year:'numeric'})}
                      </div>
                      <div className="text-xs text-gray-500">{new Date(update.created_at).toLocaleTimeString('id-ID')}</div>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-300">
                      <div className="font-medium">{update.stock_update_items.length} Macam Barang</div>
                      <div className="text-xs text-gray-500">{itemSummary}</div>
                    </td>
                    <td className="py-3 px-4 text-sm font-bold text-gray-900 dark:text-white text-right">
                      {formatCurrency(totalNilai)}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => { setSelectedDetails(update); setIsDetailsModalOpen(true); }} className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors" title="Lihat Detail">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button onClick={() => setDeleteConfirm({ show: true, id: update.id })} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors" title="Hapus Riwayat">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      
      {isUpdateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-4xl overflow-hidden shadow-xl flex flex-col max-h-[90vh]"
            >
              <div className="p-6 border-b border-gray-100 dark:border-slate-700 flex justify-between items-center shrink-0">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  Update Stok Gudang (Barang Masuk)
                </h3>
                <button
                  onClick={() => setIsUpdateModalOpen(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveUpdate} className="flex flex-col flex-1 overflow-hidden">
                <div className="p-4 sm:p-6 overflow-x-auto overflow-y-auto flex-1">
                  <div className="min-w-[650px] space-y-4">
                    {updateItems.map((item, index) => (
                      <div key={item.id} className="flex items-center gap-4 p-4 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900/50">
                        <div className="font-bold text-gray-400 w-6 text-center">{index + 1}</div>
                        
                        <div className="flex-1 relative">
                          <label className="block text-xs font-medium text-gray-500 mb-1">Nama Barang</label>
                          <input
                            type="text"
                            required
                            placeholder="Ketik nama barang..."
                            value={item.search_name || ''}
                            onChange={(e) => handleStockAutocomplete(item.id, e.target.value)}
                            onFocus={() => handleStockChange(item.id, 'isFocused', true)}
                            onBlur={() => setTimeout(() => handleStockChange(item.id, 'isFocused', false), 200)}
                            className="w-full px-3 py-2 rounded-lg bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 focus:ring-2 focus:ring-green-500 text-gray-900 dark:text-white"
                          />
                          {item.isFocused && item.search_name && item.search_name.length > 0 && (
                            <div className="absolute z-10 w-full mt-1 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                              {inventories.filter(inv => (inv.item_name || '').toLowerCase().includes(item.search_name.toLowerCase())).map(inv => (
                                <button
                                  key={inv.id}
                                  type="button"
                                  onMouseDown={() => handleStockSelect(item.id, inv)}
                                  className="w-full text-left px-4 py-2 hover:bg-gray-50 dark:hover:bg-slate-700 text-gray-900 dark:text-white border-b border-gray-100 dark:border-slate-700 last:border-0"
                                >
                                  <div className="font-medium">{inv.item_name}</div>
                                  <div className="text-xs text-gray-500">Sisa Stok: {inv.stock} {inv.unit}</div>
                                </button>
                              ))}
                              {inventories.filter(inv => (inv.item_name || '').toLowerCase().includes(item.search_name.toLowerCase())).length === 0 && (
                                <div className="px-4 py-3 text-sm text-gray-500 text-center">Barang tidak ditemukan</div>
                              )}
                            </div>
                          )}
                        </div>

                        <div className="w-32">
                          <label className="block text-xs font-medium text-gray-500 mb-1">HPP Beli (Rp)</label>
                          <input
                            type="number"
                            required
                            placeholder="Harga Pokok"
                            value={item.hpp}
                            onChange={(e) => handleStockChange(item.id, 'hpp', e.target.value)}
                            className="w-full px-3 py-2 rounded-lg bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 focus:ring-2 focus:ring-green-500 text-gray-900 dark:text-white"
                          />
                        </div>

                        <div className="w-32">
                          <label className="block text-xs font-medium text-gray-500 mb-1">Qty Masuk</label>
                          <input
                            type="number"
                            step="0.01"
                            required
                            placeholder="Qty"
                            value={item.quantity}
                            onChange={(e) => handleStockChange(item.id, 'quantity', e.target.value)}
                            className="w-full px-3 py-2 rounded-lg bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 focus:ring-2 focus:ring-green-500 text-gray-900 dark:text-white"
                          />
                        </div>

                        <div className="pt-5">
                          <button
                            type="button"
                            onClick={() => handleRemoveStockRow(item.id)}
                            className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors shrink-0"
                            title="Hapus Baris"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    ))}

                    <button
                      type="button"
                      onClick={handleAddStockRow}
                      className="flex items-center gap-2 text-green-600 dark:text-green-400 font-medium hover:underline mt-2 px-2"
                    >
                      <Plus className="w-4 h-4" /> Tambah Baris
                    </button>
                  </div>
                </div>

                <div className="p-6 border-t border-gray-100 dark:border-slate-700 shrink-0 flex justify-end gap-3 bg-white dark:bg-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsUpdateModalOpen(false)}
                    className="px-5 py-2.5 text-gray-600 dark:text-gray-300 font-medium hover:bg-gray-100 dark:hover:bg-slate-700 rounded-xl transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white font-medium rounded-xl shadow-sm transition-colors flex items-center gap-2"
                  >
                    <Check className="w-5 h-5" />
                    Simpan Stok
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
      )}
      
      
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

      <ConfirmModal 
        isOpen={deleteConfirm.show}
        title="Hapus Riwayat"
        message="Yakin ingin menghapus riwayat ini dari log histori? (Catatan: Stok asli di gudang tidak akan berubah/berkurang)."
        onConfirm={() => {
          handleDelete(deleteConfirm.id);
          setDeleteConfirm({ show: false, id: null });
        }}
        onCancel={() => setDeleteConfirm({ show: false, id: null })}
      />
      
      <ConfirmModal 
        isOpen={bulkDeleteConfirm}
        title="Hapus Massal Riwayat"
        message={"Yakin ingin menghapus " + selectedIds.length + " riwayat sekaligus dari log histori? (Stok gudang tidak akan berubah)."}
        onConfirm={handleBulkDelete}
        onCancel={() => setBulkDeleteConfirm(false)}
      />
    </div>
  );
};

export default StockHistory;
