import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Plus, Trash2, Download, Eye, AlertTriangle, CheckCircle, RefreshCw, X, Calendar, Building, Package } from 'lucide-react';
import toast from 'react-hot-toast';
import { supabase } from '../../supabaseClient';
import formatIndonesianDate from '../../utils/dateFormatter';
import { generatePurchaseOrderPDF } from '../../utils/generatePurchaseOrderPDF';
import ConfirmModal from './ConfirmModal';

const LOCAL_STORAGE_KEY = 'cjp_purchase_orders_archive';

export default function PurchaseOrders({ isDarkMode }) {
  const [activeTab, setActiveTab] = useState('create'); // 'create' | 'history'
  const [inventories, setInventories] = useState([]);
  const [loadingInv, setLoadingInv] = useState(false);

  // Form state
  const [poNumber, setPoNumber] = useState('');
  const [supplierName, setSupplierName] = useState('');
  const [orderDate, setOrderDate] = useState('');
  const [items, setItems] = useState([]);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // History state
  const [historyList, setHistoryList] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [selectedPODetails, setSelectedPODetails] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState({ show: false, id: null });

  // Generate unique PO Number
  const generateNewPONumber = () => {
    const today = new Date();
    const dateStr = today.toISOString().split('T')[0].replace(/-/g, '');
    const randNum = Math.floor(100 + Math.random() * 900);
    return `SP-${dateStr}-${randNum}`;
  };

  // Fetch inventories and auto-populate items with stock < 10
  const loadInventoriesAndAutoPopulate = async () => {
    try {
      setLoadingInv(true);
      const { data, error } = await supabase
        .from('inventory')
        .select('*')
        .order('stock', { ascending: true });

      if (error) throw error;
      setInventories(data || []);

      // Filter items with stock < 10
      const lowStockItems = (data || []).filter(item => item.stock < 10);

      if (lowStockItems.length > 0) {
        // Auto-fill item_name, keep quantity and unit EMPTY for flexibility as requested
        const initialRows = lowStockItems.map((item, idx) => ({
          id: `auto-${item.id}-${idx}`,
          itemName: item.item_name,
          quantity: '',
          unit: '',
          currentStock: item.stock,
          stockUnit: item.unit,
          isLowStock: true
        }));
        setItems(initialRows);
      } else {
        // Start with 1 empty row
        setItems([{
          id: `row-${Date.now()}`,
          itemName: '',
          quantity: '',
          unit: '',
          currentStock: null,
          stockUnit: '',
          isLowStock: false
        }]);
      }
    } catch (err) {
      console.error('Failed to load inventory for PO:', err);
      // Fallback 1 empty row
      setItems([{
        id: `row-${Date.now()}`,
        itemName: '',
        quantity: '',
        unit: '',
        currentStock: null,
        stockUnit: '',
        isLowStock: false
      }]);
    } finally {
      setLoadingInv(false);
    }
  };

  // Fetch History from Supabase or LocalStorage fallback
  const fetchPOHistory = async () => {
    try {
      setLoadingHistory(true);
      // 1. Try Supabase
      const { data, error } = await supabase
        .from('purchase_orders')
        .select(`
          id,
          po_number,
          supplier_name,
          created_at,
          notes,
          purchase_order_items (
            id,
            item_name,
            quantity,
            unit
          )
        `)
        .order('created_at', { ascending: false });

      if (!error && data) {
        const formatted = data.map(po => ({
          id: po.id,
          poNumber: po.po_number,
          supplierName: po.supplier_name,
          createdAt: po.created_at,
          notes: po.notes,
          items: (po.purchase_order_items || []).map(i => ({
            id: i.id,
            itemName: i.item_name,
            quantity: i.quantity,
            unit: i.unit
          }))
        }));
        setHistoryList(formatted);
        // Sync to localStorage
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(formatted));
        return;
      }
      throw error || new Error('No Supabase table');
    } catch (err) {
      // 2. Fallback to localStorage
      const local = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (local) {
        try {
          setHistoryList(JSON.parse(local));
        } catch (e) {
          setHistoryList([]);
        }
      } else {
        setHistoryList([]);
      }
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    setPoNumber(generateNewPONumber());
    setOrderDate(new Date().toISOString().split('T')[0]);
    loadInventoriesAndAutoPopulate();
    fetchPOHistory();
  }, []);

  // Form row handlers
  const handleAddItemRow = () => {
    setItems([
      ...items,
      {
        id: `row-${Date.now()}-${Math.random()}`,
        itemName: '',
        quantity: '',
        unit: '',
        currentStock: null,
        stockUnit: '',
        isLowStock: false
      }
    ]);
  };

  const handleRemoveRow = (id) => {
    if (items.length <= 1) {
      toast.error('Surat pesanan minimal harus memiliki 1 barang!');
      return;
    }
    setItems(items.filter(item => item.id !== id));
  };

  const handleItemChange = (id, field, value) => {
    setItems(items.map(item => {
      if (item.id === id) {
        if (field === 'quantity') {
          // Remove negative and leading zeros
          let num = value.replace(/^0+(?=\d)/, '');
          if (parseFloat(num) < 0) num = '0';
          return { ...item, quantity: num };
        }
        return { ...item, [field]: value };
      }
      return item;
    }));
  };

  const handleSelectFromInventory = (id, inv) => {
    setItems(items.map(item => {
      if (item.id === id) {
        return {
          ...item,
          itemName: inv.item_name,
          currentStock: inv.stock,
          stockUnit: inv.unit,
          unit: item.unit ? item.unit : inv.unit // auto-suggest unit if empty
        };
      }
      return item;
    }));
  };

  // Submit and Generate PDF
  const handleSubmitAndDownload = async (e) => {
    e.preventDefault();

    // 1. Validation for Supplier Name
    if (!supplierName.trim()) {
      toast.error('Mohon isi nama tujuan supplier pada kolom "Kepada Yth"!');
      return;
    }

    if (items.length === 0) {
      toast.error('Daftar barang tidak boleh kosong!');
      return;
    }

    // 2. Strict Row-by-Row Validation (NO RESET ON ERROR!)
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const rowNum = i + 1;

      if (!item.itemName || !item.itemName.trim()) {
        toast.error(`Baris ke-${rowNum}: Nama barang belum diisi! Silakan lengkapi.`);
        return; // Returns immediately without resetting form
      }

      if (!item.quantity || item.quantity.toString().trim() === '' || parseFloat(item.quantity) <= 0) {
        toast.error(`Baris ke-${rowNum} (${item.itemName}): Jumlah pesanan belum diisi atau masih 0!`);
        return; // Returns immediately without resetting form
      }

      if (!item.unit || !item.unit.trim()) {
        toast.error(`Baris ke-${rowNum} (${item.itemName}): Satuan belum diisi (contoh: Pcs, Dus, Botol)!`);
        return; // Returns immediately without resetting form
      }
    }

    setIsSubmitting(true);
    const toastId = toast.loading('Memproses dan membuat Surat Pesanan...');

    const poRecord = {
      id: `po-${Date.now()}`,
      poNumber: poNumber.trim() || generateNewPONumber(),
      supplierName: supplierName.trim(),
      createdAt: orderDate ? new Date(`${orderDate}T12:00:00`).toISOString() : new Date().toISOString(),
      notes: notes.trim(),
      items: items.map(item => ({
        id: item.id,
        itemName: item.itemName.trim(),
        quantity: parseFloat(item.quantity),
        unit: item.unit.trim()
      }))
    };

    try {
      // 1. Try to save to Supabase
      const { data: insertedPO, error: poError } = await supabase
        .from('purchase_orders')
        .insert([{
          po_number: poRecord.poNumber,
          supplier_name: poRecord.supplierName,
          created_at: poRecord.createdAt,
          notes: poRecord.notes
        }])
        .select()
        .single();

      if (!poError && insertedPO) {
        // Insert items
        const poItemsData = poRecord.items.map(it => ({
          po_id: insertedPO.id,
          item_name: it.itemName,
          quantity: it.quantity,
          unit: it.unit
        }));
        await supabase.from('purchase_order_items').insert(poItemsData);
        poRecord.id = insertedPO.id;
      }
    } catch (err) {
      console.warn('Supabase save skipped (table may not exist yet, using local archive):', err);
    }

    // 2. Always save to Local Archive (Ensures persistence 100%)
    try {
      const existing = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || '[]');
      const updated = [poRecord, ...existing.filter(p => p.id !== poRecord.id)];
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
      setHistoryList(updated);
    } catch (err) {
      console.error('LocalStorage save error:', err);
    }

    // 3. Generate & Download PDF A4
    try {
      generatePurchaseOrderPDF(poRecord);
      toast.success('Surat Pesanan berhasil disimpan dan diunduh!', { id: toastId });

      // Reset form after successful save
      setSupplierName('');
      setNotes('');
      setPoNumber(generateNewPONumber());
      loadInventoriesAndAutoPopulate();
    } catch (err) {
      console.error(err);
      toast.error('Gagal mengunduh PDF surat pesanan.', { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete from history
  const handleDeletePO = async (id) => {
    try {
      // 1. Try delete from Supabase
      await supabase.from('purchase_orders').delete().eq('id', id);
    } catch (e) { }

    // 2. Remove from LocalStorage
    const updated = historyList.filter(item => item.id !== id);
    setHistoryList(updated);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
    toast.success('Surat pesanan dihapus dari histori.');
  };

  const lowStockCount = inventories.filter(i => i.stock < 10).length;

  return (
    <div className="space-y-6">
      {/* Top Banner Navigation / Tabs */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('create')}
            className={`px-4 py-2.5 rounded-xl font-semibold text-sm transition-all flex items-center gap-2 ${
              activeTab === 'create'
                ? 'bg-mbg-blue-600 text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700'
            }`}
          >
            <Plus className="w-4 h-4" /> Buat Surat Pesanan
          </button>
          <button
            onClick={() => {
              setActiveTab('history');
              fetchPOHistory();
            }}
            className={`px-4 py-2.5 rounded-xl font-semibold text-sm transition-all flex items-center gap-2 ${
              activeTab === 'history'
                ? 'bg-mbg-blue-600 text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700'
            }`}
          >
            <FileText className="w-4 h-4" /> Riwayat Surat ({historyList.length})
          </button>
        </div>

        {activeTab === 'create' && (
          <button
            onClick={loadInventoriesAndAutoPopulate}
            disabled={loadingInv}
            className="text-xs sm:text-sm text-mbg-blue-600 dark:text-mbg-blue-400 font-medium hover:underline flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loadingInv ? 'animate-spin' : ''}`} />
            Muat Ulang Stok Menipis
          </button>
        )}
      </div>

      {/* TAB 1: FORM BUAT SURAT PESANAN */}
      {activeTab === 'create' && (
        <form onSubmit={handleSubmitAndDownload} className="space-y-6">
          {/* Notification Banner for Low Stock */}
          {lowStockCount > 0 ? (
            <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl flex items-start sm:items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5 sm:mt-0" />
              <div className="flex-1 text-xs sm:text-sm text-amber-800 dark:text-amber-300">
                <span className="font-bold">Otomatis Dimasukkan:</span> Terdeteksi <strong>{lowStockCount} barang</strong> dengan stok menipis di gudang (di bawah 10 unit). Nama barang telah dimasukkan otomatis di bawah. Silakan ketik jumlah dan satuan yang ingin dipesan.
              </div>
            </div>
          ) : (
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0" />
              <div className="text-xs sm:text-sm text-blue-800 dark:text-blue-300">
                Semua stok barang di gudang dalam kondisi aman (≥ 10 unit). Anda dapat menambahkan barang yang ingin dipesan secara manual menggunakan tombol <strong>+ Tambah Barang</strong>.
              </div>
            </div>
          )}

          {/* Letter Header Information Box */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 p-6 space-y-4">
            <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2 border-b border-gray-100 dark:border-slate-700 pb-3">
              <Building className="w-5 h-5 text-mbg-blue-600" />
              Informasi Surat & Tujuan Supplier
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1">
                  Kepada Yth (Nama Supplier / Toko) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: PT INDRA GIRI RAYA"
                  value={supplierName}
                  onChange={(e) => setSupplierName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-mbg-blue-500 dark:text-white text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1">
                  Nomor Surat Pesanan
                </label>
                <input
                  type="text"
                  value={poNumber}
                  onChange={(e) => setPoNumber(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-mbg-blue-500 dark:text-white text-sm font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1">
                  Tanggal Surat
                </label>
                <input
                  type="date"
                  value={orderDate}
                  onChange={(e) => setOrderDate(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-mbg-blue-500 dark:text-white text-sm"
                />
              </div>
            </div>
          </div>

          {/* Table Items to Order */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden">
            <div className="p-4 sm:p-6 border-b border-gray-100 dark:border-slate-700 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Package className="w-5 h-5 text-mbg-blue-600" />
                  Daftar Barang yang Dipesan ({items.length} Barang)
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  Isi jumlah dan satuan untuk setiap barang yang hendak dikirim oleh supplier.
                </p>
              </div>

              <button
                type="button"
                onClick={handleAddItemRow}
                className="px-4 py-2 bg-mbg-blue-50 hover:bg-mbg-blue-100 dark:bg-mbg-blue-900/30 dark:hover:bg-mbg-blue-900/50 text-mbg-blue-600 dark:text-mbg-blue-400 rounded-xl text-xs sm:text-sm font-semibold transition-colors flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" /> Tambah Barang Manual
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse whitespace-nowrap">
                <thead>
                  <tr className="bg-gray-50 dark:bg-slate-800/50 border-b border-gray-100 dark:border-slate-700 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    <th className="p-3 sm:p-4 w-12 text-center">No</th>
                    <th className="p-3 sm:p-4 min-w-[220px]">Nama Barang <span className="text-red-500">*</span></th>
                    <th className="p-3 sm:p-4 w-32 sm:w-36 text-center">Jumlah <span className="text-red-500">*</span></th>
                    <th className="p-3 sm:p-4 w-32 sm:w-36 text-center">Satuan <span className="text-red-500">*</span></th>
                    <th className="p-3 sm:p-4 w-16 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-slate-700/50">
                  {items.map((item, index) => (
                    <tr key={item.id} className="hover:bg-gray-50/50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="p-3 sm:p-4 text-center font-bold text-gray-400 text-sm">
                        {index + 1}.
                      </td>

                      <td className="p-3 sm:p-4">
                        <div className="space-y-1">
                          <input
                            type="text"
                            placeholder="Ketik atau pilih nama barang..."
                            value={item.itemName}
                            onChange={(e) => handleItemChange(item.id, 'itemName', e.target.value)}
                            className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-mbg-blue-500 dark:text-white"
                          />
                          {item.currentStock !== null && item.currentStock !== undefined && (
                            <div className="text-[11px] text-amber-600 dark:text-amber-400 flex items-center gap-1 font-medium">
                              ⚠️ Sisa stok gudang: {item.currentStock} {item.stockUnit || ''}
                            </div>
                          )}
                        </div>
                      </td>

                      <td className="p-3 sm:p-4">
                        <input
                          type="number"
                          step="any"
                          min="0.01"
                          placeholder="0"
                          value={item.quantity}
                          onChange={(e) => handleItemChange(item.id, 'quantity', e.target.value)}
                          className="w-full px-3 py-2 text-center bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-mbg-blue-500 dark:text-white"
                        />
                      </td>

                      <td className="p-3 sm:p-4">
                        <input
                          type="text"
                          placeholder="Pcs / Dus / Botol"
                          value={item.unit}
                          onChange={(e) => handleItemChange(item.id, 'unit', e.target.value)}
                          className="w-full px-3 py-2 text-center bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-mbg-blue-500 dark:text-white"
                        />
                      </td>

                      <td className="p-3 sm:p-4 text-center">
                        <button
                          type="button"
                          onClick={() => handleRemoveRow(item.id)}
                          className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors"
                          title="Hapus Baris"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Bottom Actions */}
            <div className="p-4 sm:p-6 border-t border-gray-100 dark:border-slate-700 flex flex-col sm:flex-row justify-between items-center gap-4 bg-gray-50/50 dark:bg-slate-800/30">
              <button
                type="button"
                onClick={handleAddItemRow}
                className="w-full sm:w-auto px-4 py-2.5 border-2 border-dashed border-gray-200 dark:border-slate-700 hover:border-mbg-blue-500 dark:hover:border-mbg-blue-500 text-gray-600 dark:text-gray-300 hover:text-mbg-blue-600 rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" /> Tambah Baris Barang
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto px-6 py-3 bg-mbg-blue-600 hover:bg-mbg-blue-700 text-white rounded-xl font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Download className="w-5 h-5" />
                {isSubmitting ? 'Menyimpan & Mencetak...' : 'Simpan & Unduh Surat Pesanan (PDF A4)'}
              </button>
            </div>
          </div>
        </form>
      )}

      {/* TAB 2: RIWAYAT SURAT PESANAN */}
      {activeTab === 'history' && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden">
          <div className="p-4 sm:p-6 border-b border-gray-100 dark:border-slate-700 flex justify-between items-center">
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-mbg-blue-600" />
                Riwayat Surat Pesanan Barang
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Daftar arsip surat pesanan yang pernah dicetak dan dikirimkan ke supplier.
              </p>
            </div>

            <button
              onClick={fetchPOHistory}
              disabled={loadingHistory}
              className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-xl"
              title="Segarkan"
            >
              <RefreshCw className={`w-4 h-4 ${loadingHistory ? 'animate-spin' : ''}`} />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead>
                <tr className="bg-gray-50 dark:bg-slate-800/50 border-b border-gray-100 dark:border-slate-700 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  <th className="p-4 w-12 text-center">No</th>
                  <th className="p-4">Tanggal Dibuat</th>
                  <th className="p-4">Nomor Surat</th>
                  <th className="p-4">Kepada Yth (Supplier)</th>
                  <th className="p-4 text-center">Jumlah Macam Barang</th>
                  <th className="p-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-slate-700/50">
                {loadingHistory ? (
                  <tr>
                    <td colSpan="6" className="p-8 text-center text-gray-500 dark:text-gray-400">
                      Memuat riwayat surat pesanan...
                    </td>
                  </tr>
                ) : historyList.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="p-8 text-center text-gray-500 dark:text-gray-400">
                      Belum ada surat pesanan yang dibuat.
                    </td>
                  </tr>
                ) : (
                  historyList.map((po, idx) => (
                    <tr key={po.id} className="hover:bg-gray-50/50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="p-4 text-center font-bold text-gray-400">{idx + 1}</td>
                      <td className="p-4 text-sm text-gray-900 dark:text-white">
                        {formatIndonesianDate(po.createdAt, true)}
                      </td>
                      <td className="p-4 text-sm font-mono font-bold text-mbg-blue-600 dark:text-mbg-blue-400">
                        {po.poNumber}
                      </td>
                      <td className="p-4 text-sm font-semibold text-gray-900 dark:text-white">
                        {po.supplierName}
                      </td>
                      <td className="p-4 text-center text-sm font-medium">
                        <span className="px-2.5 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full text-xs font-bold">
                          {(po.items || []).length} Barang
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => setSelectedPODetails(po)}
                            className="p-2 text-mbg-blue-600 hover:bg-mbg-blue-50 dark:text-mbg-blue-400 dark:hover:bg-mbg-blue-900/20 rounded-lg transition-colors"
                            title="Lihat Detail Barang"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              generatePurchaseOrderPDF(po);
                              toast.success('Mengunduh PDF Surat Pesanan...');
                            }}
                            className="p-2 text-green-600 hover:bg-green-50 dark:text-green-400 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                            title="Unduh PDF Ulang"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteConfirm({ show: true, id: po.id })}
                            className="p-2 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                            title="Hapus dari Histori"
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
      )}

      {/* MODAL LIHAT DETAIL SURAT PESANAN */}
      <AnimatePresence>
        {selectedPODetails && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]"
            >
              <div className="p-6 border-b border-gray-100 dark:border-slate-700 flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    Detail Surat Pesanan
                  </h3>
                  <p className="text-xs text-gray-500 font-mono mt-0.5">
                    {selectedPODetails.poNumber} • Kepada: {selectedPODetails.supplierName}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedPODetails(null)}
                  className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 overflow-y-auto flex-1">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 dark:bg-slate-700/50 border-b border-gray-200 dark:border-slate-700 text-xs font-semibold text-gray-500 uppercase">
                      <th className="py-2.5 px-3 w-12 text-center">No</th>
                      <th className="py-2.5 px-3">Nama Barang</th>
                      <th className="py-2.5 px-3 text-center">Jumlah</th>
                      <th className="py-2.5 px-3 text-center">Satuan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                    {(selectedPODetails.items || []).map((item, idx) => (
                      <tr key={idx} className="text-sm">
                        <td className="py-2.5 px-3 text-center text-gray-400 font-bold">{idx + 1}.</td>
                        <td className="py-2.5 px-3 font-medium text-gray-900 dark:text-white">{item.itemName}</td>
                        <td className="py-2.5 px-3 text-center font-bold">{item.quantity}</td>
                        <td className="py-2.5 px-3 text-center text-gray-600 dark:text-gray-400">{item.unit}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="p-4 sm:p-6 border-t border-gray-100 dark:border-slate-700 flex justify-end gap-3 bg-gray-50 dark:bg-slate-800/50">
                <button
                  onClick={() => setSelectedPODetails(null)}
                  className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium rounded-xl text-sm"
                >
                  Tutup
                </button>
                <button
                  onClick={() => {
                    generatePurchaseOrderPDF(selectedPODetails);
                    toast.success('Mengunduh PDF Surat Pesanan...');
                  }}
                  className="px-5 py-2 bg-mbg-blue-600 hover:bg-mbg-blue-700 text-white font-medium rounded-xl text-sm flex items-center gap-2 shadow-sm"
                >
                  <Download className="w-4 h-4" /> Unduh PDF (A4)
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* CONFIRM DELETE MODAL */}
      <ConfirmModal
        isOpen={deleteConfirm.show}
        title="Hapus Surat Pesanan"
        message="Yakin ingin menghapus arsip surat pesanan ini dari riwayat?"
        onConfirm={() => {
          handleDeletePO(deleteConfirm.id);
          setDeleteConfirm({ show: false, id: null });
        }}
        onCancel={() => setDeleteConfirm({ show: false, id: null })}
      />
    </div>
  );
}
