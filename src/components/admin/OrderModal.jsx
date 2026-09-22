import { motion, AnimatePresence } from 'framer-motion';
import { Printer, Edit, Check, X, Plus, Trash2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import toast from 'react-hot-toast';

export default function OrderModal({ selectedOrderDetails, setSelectedOrderDetails, handlePrint, inventories = [], fetchOrders }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedItems, setEditedItems] = useState([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (selectedOrderDetails) {
      setEditedItems(selectedOrderDetails.items.map(i => ({...i})));
      setIsEditing(false);
    }
  }, [selectedOrderDetails]);

  const handleEditChange = (id, field, value) => {
    if (field === 'quantity' || field === 'sellingPrice') {
      // Prevent negative, remove leading zero
      let numericValue = value.replace(/^0+(?=\d)/, '');
      if (parseFloat(numericValue) < 0) numericValue = '0';
      setEditedItems(editedItems.map(item => item.id === id ? { ...item, [field]: numericValue } : item));
    } else {
      setEditedItems(editedItems.map(item => item.id === id ? { ...item, [field]: value } : item));
    }
  };

  const handleRemoveItem = (id) => {
    setEditedItems(editedItems.filter(item => item.id !== id));
  };

  const handleAddItem = () => {
    setEditedItems([...editedItems, {
      id: `new-${Date.now()}`,
      itemName: '',
      quantity: '',
      unit: '',
      sellingPrice: ''
    }]);
  };

  const saveEdits = async () => {
    if (editedItems.length === 0) {
      toast.error('Pesanan harus memiliki minimal 1 barang');
      return;
    }
    
    // Validate
    const isValid = editedItems.every(i => i.itemName.trim() !== '' && i.quantity !== '' && parseFloat(i.quantity) > 0);
    if (!isValid) {
      toast.error('Mohon lengkapi semua data barang dan kuantitas > 0');
      return;
    }

    setIsSaving(true);
    const toastId = toast.loading('Menyimpan perubahan pesanan...');
    
    try {
      // 1. Calculate new total
      const newTotal = editedItems.reduce((acc, item) => acc + (parseFloat(item.sellingPrice) || 0) * parseFloat(item.quantity), 0);
      
      // 2. Update order total in DB
      const { error: orderError } = await supabase
        .from('orders')
        .update({ total_amount: newTotal })
        .eq('id', selectedOrderDetails.id);
      if (orderError) throw orderError;

      // 3. Sync order_items (delete old, insert new)
      // Since it's complex to match, easiest is to delete all existing items for this order and re-insert
      const { error: delError } = await supabase
        .from('order_items')
        .delete()
        .eq('order_id', selectedOrderDetails.id);
      if (delError) throw delError;

      const newOrderItems = editedItems.map(item => ({
        order_id: selectedOrderDetails.id,
        item_name: item.itemName,
        quantity: parseFloat(item.quantity),
        unit: item.unit,
        selling_price: parseFloat(item.sellingPrice) || 0
      }));

      const { error: insertError } = await supabase
        .from('order_items')
        .insert(newOrderItems);
      if (insertError) throw insertError;

      toast.success('Pesanan berhasil diperbarui!', { id: toastId });
      setIsEditing(false);
      
      // Re-fetch orders to update UI globally
      if (fetchOrders) {
        await fetchOrders();
      }
      setSelectedOrderDetails(null); // Close modal
    } catch (e) {
      console.error(e);
      toast.error('Gagal menyimpan pesanan', { id: toastId });
    } finally {
      setIsSaving(false);
    }
  };

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
                {isEditing ? (
                  <>
                    <div className="overflow-x-auto pb-2 -mx-2 px-2 md:mx-0 md:px-0">
                      <div className="min-w-[650px] space-y-2">
                        {editedItems.map((item, index) => (
                          <div key={item.id} className="grid grid-cols-12 gap-3 items-center p-3 bg-white dark:bg-slate-800 rounded-xl border border-blue-200 dark:border-blue-900/50 relative">
                            <div className="col-span-1 text-center font-bold text-gray-400">{index + 1}</div>
                            <div className="col-span-4">
                              <input type="text" value={item.itemName} onChange={e => handleEditChange(item.id, 'itemName', e.target.value)} placeholder="Nama Barang" className="w-full px-3 py-1.5 border border-gray-200 dark:border-slate-600 rounded-lg text-sm bg-gray-50 dark:bg-slate-700 dark:text-white" />
                            </div>
                            <div className="col-span-2 flex gap-1">
                              <input type="number" min="0" value={item.quantity} onChange={e => handleEditChange(item.id, 'quantity', e.target.value)} placeholder="Qty" className="w-full px-2 py-1.5 border border-gray-200 dark:border-slate-600 rounded-lg text-sm bg-gray-50 dark:bg-slate-700 dark:text-white text-center" />
                              <input type="text" value={item.unit} onChange={e => handleEditChange(item.id, 'unit', e.target.value)} placeholder="Satuan" className="w-full px-2 py-1.5 border border-gray-200 dark:border-slate-600 rounded-lg text-sm bg-gray-50 dark:bg-slate-700 dark:text-white text-center" />
                            </div>
                            <div className="col-span-4">
                              <div className="flex items-center">
                                <span className="text-gray-500 mr-2 text-sm">Rp</span>
                                <input type="number" min="0" value={item.sellingPrice} onChange={e => handleEditChange(item.id, 'sellingPrice', e.target.value)} placeholder="Harga Satuan" className="w-full px-3 py-1.5 border border-gray-200 dark:border-slate-600 rounded-lg text-sm bg-gray-50 dark:bg-slate-700 dark:text-white" />
                              </div>
                            </div>
                            <div className="col-span-1 text-right">
                              <button onClick={() => handleRemoveItem(item.id)} className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <button onClick={handleAddItem} className="w-full py-3 mt-2 border-2 border-dashed border-blue-200 dark:border-blue-900/50 text-blue-600 dark:text-blue-400 font-medium rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/20 flex items-center justify-center gap-2 transition-colors">
                      <Plus className="w-4 h-4" /> Tambah Barang
                    </button>
                  </>
                ) : (
                  selectedOrderDetails.items.map((item, index) => (
                    <div key={item.id} className="grid grid-cols-12 gap-4 items-center p-4 bg-gray-50 dark:bg-slate-800/50 rounded-xl border border-gray-100 dark:border-slate-700/50 hover:border-pink-200 dark:hover:border-pink-900/30 transition-colors">
                      <div className="col-span-1 text-center font-bold text-gray-400">{index + 1}</div>
                      <div className="col-span-5 font-bold text-gray-900 dark:text-white truncate" title={item.itemName}>{item.itemName}</div>
                      <div className="col-span-2 text-center font-medium text-gray-600 dark:text-gray-300">{item.quantity} {item.unit}</div>
                      <div className="col-span-4 text-right font-bold text-gray-900 dark:text-white truncate">
                        Rp {((parseFloat(item.sellingPrice) || 0) * parseFloat(item.quantity)).toLocaleString('id-ID')}
                      </div>
                    </div>
                  ))
                )}
              </div>
              
              <div className="mt-6 pt-6 border-t border-gray-100 dark:border-slate-800 flex justify-between items-center">
                <div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Total Tagihan</div>
                  <div className="text-2xl font-black text-pink-600 dark:text-pink-400">
                    Rp {(isEditing ? editedItems : selectedOrderDetails.items).reduce((acc, item) => acc + (parseFloat(item.sellingPrice) || 0) * parseFloat(item.quantity), 0).toLocaleString('id-ID')}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="px-6 py-4 border-t border-gray-100 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-800/50 flex flex-col md:flex-row justify-between gap-3">
              <div>
                {!isEditing ? (
                  <button onClick={() => setIsEditing(true)} className="flex items-center justify-center gap-2 px-6 py-2.5 bg-yellow-100 text-yellow-700 hover:bg-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 rounded-xl font-medium transition-colors">
                    <Edit className="w-5 h-5" /> Ubah Pesanan
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button onClick={() => setIsEditing(false)} className="flex items-center justify-center gap-2 px-6 py-2.5 bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-slate-700 dark:text-gray-300 rounded-xl font-medium transition-colors">
                      <X className="w-5 h-5" /> Batal
                    </button>
                    <button onClick={saveEdits} disabled={isSaving} className="flex items-center justify-center gap-2 px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl font-medium shadow-md transition-colors">
                      <Check className="w-5 h-5" /> {isSaving ? 'Menyimpan...' : 'Simpan'}
                    </button>
                  </div>
                )}
              </div>

              {!isEditing && (
                <div className="flex flex-col md:flex-row gap-3">
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
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
