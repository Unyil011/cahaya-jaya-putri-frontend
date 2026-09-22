import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, Plus, Edit2, Trash2, X, Check, Search, AlertCircle } from 'lucide-react';
import { supabase } from '../../supabaseClient';

import toast from 'react-hot-toast';

const InventoryManagement = () => {
  const [inventories, setInventories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentInventory, setCurrentInventory] = useState(null);
  
  const [isUpdateStockModalOpen, setIsUpdateStockModalOpen] = useState(false);
  const [updateStockItems, setUpdateStockItems] = useState([
    { id: 1, inventory_id: '', quantity: '' }
  ]);
  
  const [formData, setFormData] = useState({
    name: '',
    stock: 0,
    unit: 'Pcs',
    hpp: ''
  });

  const fetchInventories = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.from('inventory').select('*').order('item_name');
      if (error) throw error;
      setInventories(data);
    } catch (err) {
      setError('Gagal memuat data inventaris');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventories();
  }, []);

  const handleOpenModal = (inventory = null) => {
    if (inventory) {
      setCurrentInventory(inventory);
      setFormData({
        name: inventory.item_name,
        stock: inventory.stock,
        unit: inventory.unit,
        hpp: inventory.hpp || ''
      });
    } else {
      setCurrentInventory(null);
      setFormData({ name: '', stock: 0, unit: 'Pcs', hpp: '' });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentInventory(null);
    setError('');
  };

  const handleAddStockRow = () => {
    const newId = updateStockItems.length > 0 ? updateStockItems[updateStockItems.length - 1].id + 1 : 1;
    setUpdateStockItems([...updateStockItems, { id: newId, inventory_id: '', search_name: '', quantity: '' }]);
  };

  const handleRemoveStockRow = (id) => {
    if (updateStockItems.length > 1) {
      setUpdateStockItems(updateStockItems.filter(item => item.id !== id));
    } else {
      toast.error('Minimal harus ada 1 baris');
    }
  };

  const handleStockChange = (id, field, value) => {
    setUpdateStockItems(updateStockItems.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const handleStockAutocomplete = (id, val) => {
    const matched = inventories.find(inv => (inv.item_name || '').toLowerCase() === val.toLowerCase());
    setUpdateStockItems(updateStockItems.map(item => 
      item.id === id ? { ...item, search_name: val, inventory_id: matched ? matched.id : '' } : item
    ));
  };

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState({ show: false, id: null });

  const handleUpdateStockSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    try {
      setIsSubmitting(true);
      
      for (const row of stockRows) {
        if (!row.id || row.quantity === '') continue;
        const item = inventories.find(inv => inv.id === row.id);
        if (!item) continue;
        
        let qty = parseFloat(row.quantity);
        if (row.type === 'kurang') qty = -qty;
        
        const { error } = await supabase.from('inventory').update({ stock: item.stock + qty }).eq('id', item.id);
        if (error) throw error;
      }
      
      handleCloseModal();
      fetchInventories();
      toast.success('Stok berhasil diperbarui');
    } catch (err) {
      console.error(err);
      toast.error('Gagal memperbarui stok');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);
      let error;
      if (currentInventory) {
        const result = await supabase.from('inventory').update({ item_name: formData.name, stock: formData.stock, unit: formData.unit, hpp: formData.hpp || null }).eq('id', currentInventory.id);
        error = result.error;
      } else {
        const result = await supabase.from('inventory').insert([{ item_name: formData.name, stock: formData.stock, unit: formData.unit, hpp: formData.hpp || null }]);
        error = result.error;
      }
      if (error) throw error;
      
      handleCloseModal();
      fetchInventories();
      toast.success('Data berhasil disimpan');
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Terjadi kesalahan saat menyimpan data');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Yakin ingin menghapus barang ini dari stok?')) {
      try {
        await supabase.from('inventory').delete().eq('id', id);
        fetchInventories();
      } catch (err) {
        setError('Gagal menghapus barang');
      }
    }
  };

  const filteredInventories = inventories.filter(item => 
    (item.item_name || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        {/* Search Bar */}
        <div className="relative w-full sm:w-64 md:w-80">
          <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Cari nama barang..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-mbg-blue-500 dark:text-white transition-all shadow-sm"
          />
        </div>

        <div className="flex flex-row gap-2 w-full sm:w-auto">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setIsUpdateStockModalOpen(true)}
            className="flex-1 sm:flex-none flex justify-center items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl font-medium transition-colors shadow-sm text-xs sm:text-sm md:text-base"
          >
            <Package className="w-4 h-4 sm:w-5 sm:h-5" />
            Update Stok
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleOpenModal()}
            className="flex-1 sm:flex-none flex justify-center items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 bg-mbg-blue-600 hover:bg-mbg-blue-700 text-white rounded-xl font-medium transition-colors shadow-sm text-xs sm:text-sm md:text-base"
          >
            <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
            Tambah Barang
          </motion.button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-600 rounded-xl flex items-center gap-3">
          <AlertCircle className="w-5 h-5" />
          <p>{error}</p>
        </div>
      )}

      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-gray-50 dark:bg-slate-800/50 border-b border-gray-100 dark:border-slate-700">
                <th className="p-4 font-semibold text-gray-900 dark:text-white w-16 text-center">No</th>
                <th className="p-4 font-semibold text-gray-900 dark:text-white">Nama Barang</th>
                <th className="p-4 font-semibold text-gray-900 dark:text-white text-center">Stok Tersedia</th>
                <th className="p-4 font-semibold text-gray-900 dark:text-white text-right">Harga Pokok (HPP) Standar</th>
                <th className="p-4 font-semibold text-gray-900 dark:text-white text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-gray-500 dark:text-gray-400">
                    Memuat data...
                  </td>
                </tr>
              ) : filteredInventories.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-gray-500 dark:text-gray-400">
                    Belum ada data barang di gudang.
                  </td>
                </tr>
              ) : (
                filteredInventories.map((item, index) => (
                  <tr key={item.id} className="border-b border-gray-50 dark:border-slate-700/50 hover:bg-gray-50/50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="p-4 text-center font-bold text-gray-400">
                      {index + 1}
                    </td>
                    <td className="p-4 font-medium text-gray-900 dark:text-white">
                      {item.item_name}
                    </td>
                    <td className="p-4 text-center">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${item.stock <= 5 ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'}`}>
                        {item.stock} {item.unit}
                      </span>
                    </td>
                    <td className="p-4 text-right text-gray-600 dark:text-gray-300">
                      {item.hpp ? `Rp ${parseInt(item.hpp).toLocaleString('id-ID')}` : '-'}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleOpenModal(item)}
                          className="p-2 text-mbg-blue-600 hover:bg-mbg-blue-50 dark:text-mbg-blue-400 dark:hover:bg-mbg-blue-900/20 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="p-2 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                          title="Hapus"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Form */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-md overflow-hidden shadow-xl"
            >
              <div className="p-6 border-b border-gray-100 dark:border-slate-700 flex justify-between items-center">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  {currentInventory ? 'Edit Barang' : 'Tambah Barang Baru'}
                </h3>
                <button
                  onClick={handleCloseModal}
                  className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Nama Barang
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-mbg-blue-500 dark:text-white transition-all"
                    placeholder="Contoh: Tisu Paseo 250s"
                  />
                </div>

                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Stok
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      disabled={!!currentInventory}
                      value={formData.stock}
                      onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                      className={`w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-mbg-blue-500 dark:text-white transition-all ${currentInventory ? 'opacity-60 cursor-not-allowed' : ''}`}
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Satuan
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.unit}
                      onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                      className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-mbg-blue-500 dark:text-white transition-all"
                      placeholder="Pcs, Kg, Ikat..."
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Harga Pokok Standar (Opsional)
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">Rp</span>
                    <input
                      type="number"
                      value={formData.hpp}
                      onChange={(e) => setFormData({ ...formData, hpp: e.target.value })}
                      className="w-full pl-12 pr-4 py-2.5 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-mbg-blue-500 dark:text-white transition-all"
                      placeholder="0"
                    />
                  </div>
                </div>

                <div className="pt-4 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="px-5 py-2.5 text-gray-600 dark:text-gray-300 font-medium hover:bg-gray-100 dark:hover:bg-slate-700 rounded-xl transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-mbg-blue-600 hover:bg-mbg-blue-700 text-white font-medium rounded-xl shadow-sm transition-colors flex items-center gap-2"
                  >
                    <Check className="w-5 h-5" />
                    Simpan
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {isUpdateStockModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-xl flex flex-col max-h-[90vh]"
            >
              <div className="p-6 border-b border-gray-100 dark:border-slate-700 flex justify-between items-center shrink-0">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  Update Stok Gudang (Barang Masuk)
                </h3>
                <button
                  onClick={() => setIsUpdateStockModalOpen(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleUpdateStockSubmit} className="flex flex-col flex-1 overflow-hidden">
                <div className="p-4 sm:p-6 overflow-x-auto overflow-y-auto flex-1">
                  <div className="min-w-[450px] space-y-4">
                    {updateStockItems.map((item, index) => (
                      <div key={item.id} className="flex items-center gap-4 p-4 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900/50">
                        <div className="font-bold text-gray-400 w-6 text-center">{index + 1}</div>
                        
                        <div className="flex-1 relative">
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
                                  onClick={() => {
                                    handleStockChange(item.id, 'search_name', inv.item_name);
                                    handleStockChange(item.id, 'inventory_id', inv.id);
                                    handleStockChange(item.id, 'isFocused', false);
                                  }}
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
                          <input
                            type="number"
                            step="0.01"
                            required
                            placeholder="Qty Masuk"
                            value={item.quantity}
                            onChange={(e) => handleStockChange(item.id, 'quantity', e.target.value)}
                            className="w-full px-3 py-2 rounded-lg bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 focus:ring-2 focus:ring-green-500 text-gray-900 dark:text-white"
                          />
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRemoveStockRow(item.id)}
                          className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors shrink-0"
                          title="Hapus Baris"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
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
                    onClick={() => setIsUpdateStockModalOpen(false)}
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
      </AnimatePresence>
    </div>
  );
};

export default InventoryManagement;
