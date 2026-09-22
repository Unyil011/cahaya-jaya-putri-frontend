import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Trash2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import toast from 'react-hot-toast';

export default function ClientEditOrderModal({ selectedOrderDetails, setSelectedOrderDetails, fetchOrders }) {
  const [editedItems, setEditedItems] = useState([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (selectedOrderDetails) {
      setEditedItems(selectedOrderDetails.items.map(i => ({...i})));
    }
  }, [selectedOrderDetails]);

  const handleEditChange = (id, field, value) => {
    if (field === 'quantity') {
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
      sellingPrice: 0 // Client doesn't edit this, but we need it for DB
    }]);
  };

  const saveEdits = async () => {
    if (editedItems.length === 0) {
      toast.error('Pesanan harus memiliki minimal 1 barang');
      return;
    }
    
    const isValid = editedItems.every(i => i.itemName.trim() !== '' && i.quantity !== '' && parseFloat(i.quantity) > 0);
    if (!isValid) {
      toast.error('Mohon lengkapi semua data barang dan kuantitas > 0');
      return;
    }

    setIsSaving(true);
    const toastId = toast.loading('Menyimpan perubahan pesanan...');
    
    try {
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
      
      if (fetchOrders) {
        await fetchOrders();
      }
      setSelectedOrderDetails(null);
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
            className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-6 border-b border-gray-100 dark:border-slate-800 flex justify-between items-start bg-gray-50/50 dark:bg-slate-800/50">
              <div>
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-3">
                  Ubah Pesanan
                </h2>
                <p className="text-gray-500 text-sm mt-1">
                  {selectedOrderDetails.orderNumber}
                </p>
              </div>
              <button 
                onClick={() => setSelectedOrderDetails(null)}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto custom-scrollbar">
              <div className="space-y-2">
                <div className="overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0">
                  <div className="min-w-[650px] space-y-2">
                    {editedItems.map((item, index) => (
                      <div key={item.id} className="grid grid-cols-12 gap-3 items-center p-3 bg-white dark:bg-slate-800 rounded-xl border border-blue-200 dark:border-blue-900/50 relative">
                        <div className="col-span-1 text-center font-bold text-gray-400">{index + 1}</div>
                        <div className="col-span-6">
                          <input type="text" value={item.itemName} onChange={e => handleEditChange(item.id, 'itemName', e.target.value)} placeholder="Nama Barang" className="w-full px-3 py-1.5 border border-gray-200 dark:border-slate-600 rounded-lg text-sm bg-gray-50 dark:bg-slate-700 dark:text-white" />
                        </div>
                        <div className="col-span-4 flex gap-2">
                          <input type="number" min="0" value={item.quantity} onChange={e => handleEditChange(item.id, 'quantity', e.target.value)} placeholder="Qty" className="w-full px-2 py-1.5 border border-gray-200 dark:border-slate-600 rounded-lg text-sm bg-gray-50 dark:bg-slate-700 dark:text-white text-center" />
                          <input type="text" value={item.unit} onChange={e => handleEditChange(item.id, 'unit', e.target.value)} placeholder="Satuan" className="w-full px-2 py-1.5 border border-gray-200 dark:border-slate-600 rounded-lg text-sm bg-gray-50 dark:bg-slate-700 dark:text-white text-center" />
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
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-gray-100 dark:border-slate-800 bg-gray-50 dark:bg-slate-900/50 flex gap-4">
              <button 
                onClick={() => setSelectedOrderDetails(null)}
                className="flex-1 py-3 px-4 flex items-center justify-center gap-2 text-gray-700 dark:text-gray-200 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700/50 rounded-xl font-medium transition-colors"
              >
                Batal
              </button>
              <button 
                onClick={saveEdits}
                disabled={isSaving}
                className={`flex-1 py-3 px-4 flex items-center justify-center gap-2 text-white bg-green-600 hover:bg-green-700 rounded-xl font-medium transition-colors shadow-sm ${isSaving ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {isSaving ? 'Menyimpan...' : 'Simpan Perubahan'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
