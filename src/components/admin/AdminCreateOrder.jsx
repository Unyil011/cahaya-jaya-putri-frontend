import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingCart, Plus, Trash2, Send, RotateCcw, User,
  ChevronDown, AlertCircle, Info, Search, X, CheckCircle
} from 'lucide-react';
import toast from 'react-hot-toast';
import { supabase } from '../../supabaseClient';

const DRAFT_KEY = 'admin_draft_order';

const defaultItem = () => ({ id: Date.now(), itemName: '', quantity: '', unit: '' });

function loadDraft() {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveDraft(data) {
  try {
    localStorage.setItem(DRAFT_KEY, JSON.stringify(data));
  } catch {}
}

function clearDraft() {
  localStorage.removeItem(DRAFT_KEY);
}

export default function AdminCreateOrder({ isDarkMode, setCurrentView }) {
  // --- State utama form ---
  const [clientId, setClientId] = useState('');
  const [clientName, setClientName] = useState('');
  const [orderDate, setOrderDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [items, setItems] = useState([defaultItem()]);

  // --- State klien ---
  const [clients, setClients] = useState([]);
  const [clientSearch, setClientSearch] = useState('');
  const [showClientDropdown, setShowClientDropdown] = useState(false);
  const clientDropdownRef = useRef(null);

  // --- UI state ---
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasDraft, setHasDraft] = useState(false);
  const [showDraftBanner, setShowDraftBanner] = useState(false);

  // ============================================================
  // Load draft dari localStorage saat mount
  // ============================================================
  useEffect(() => {
    const draft = loadDraft();
    if (draft) {
      setClientId(draft.clientId || '');
      setClientName(draft.clientName || '');
      setOrderDate(draft.orderDate || new Date().toISOString().split('T')[0]);
      setItems(draft.items?.length > 0 ? draft.items : [defaultItem()]);
      setHasDraft(true);
      setShowDraftBanner(true);
    }
  }, []);

  // ============================================================
  // Simpan draft ke localStorage setiap kali state berubah
  // ============================================================
  useEffect(() => {
    // Jangan simpan draft kosong awal
    const isEmpty =
      !clientId &&
      !clientName &&
      items.length === 1 &&
      !items[0].itemName &&
      !items[0].quantity &&
      !items[0].unit;
    if (isEmpty) return;

    saveDraft({ clientId, clientName, orderDate, items });
    setHasDraft(true);
  }, [clientId, clientName, orderDate, items]);

  // ============================================================
  // Fetch daftar klien
  // ============================================================
  useEffect(() => {
    const fetchClients = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, name, email')
          .eq('role', 'client')
          .order('name', { ascending: true });
        if (!error && data) setClients(data);
      } catch (e) {
        console.error('Gagal memuat daftar klien:', e);
      }
    };
    fetchClients();
  }, []);

  // ============================================================
  // Close dropdown klien saat klik luar
  // ============================================================
  useEffect(() => {
    function handleClickOutside(e) {
      if (clientDropdownRef.current && !clientDropdownRef.current.contains(e.target)) {
        setShowClientDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // ============================================================
  // Handlers item rows
  // ============================================================
  const handleAddRow = () => {
    setItems(prev => [...prev, { id: Date.now(), itemName: '', quantity: '', unit: '' }]);
  };

  const handleRemoveRow = (id) => {
    if (items.length === 1) {
      toast.error('Minimal harus ada 1 barang!');
      return;
    }
    setItems(prev => prev.filter(i => i.id !== id));
  };

  const handleChange = (id, field, value) => {
    setItems(prev => prev.map(i => i.id === id ? { ...i, [field]: value } : i));
  };

  // ============================================================
  // Handler pilih klien
  // ============================================================
  const handleSelectClient = (client) => {
    setClientId(client.id);
    setClientName(client.name);
    setClientSearch('');
    setShowClientDropdown(false);
  };

  const handleClearClient = () => {
    setClientId('');
    setClientName('');
    setClientSearch('');
  };

  // ============================================================
  // Reset form
  // ============================================================
  const handleReset = () => {
    clearDraft();
    setClientId('');
    setClientName('');
    setClientSearch('');
    setOrderDate(new Date().toISOString().split('T')[0]);
    setItems([defaultItem()]);
    setHasDraft(false);
    setShowDraftBanner(false);
    toast.success('Form berhasil direset.');
  };

  // ============================================================
  // Submit pesanan
  // ============================================================
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    // Validasi klien
    if (!clientId) {
      toast.error('Mohon pilih SPPG tujuan terlebih dahulu!');
      return;
    }

    // Validasi items
    const isValid = items.every(
      i => i.itemName.trim() !== '' && i.quantity !== '' && i.unit.trim() !== ''
    );
    if (!isValid) {
      toast.error('Mohon lengkapi semua data barang (nama, qty, satuan)!');
      return;
    }

    const isQtyValid = items.every(i => parseFloat(i.quantity) > 0);
    if (!isQtyValid) {
      toast.error('Kuantitas barang tidak boleh 0 atau minus!');
      return;
    }

    setIsSubmitting(true);

    try {
      // Generate order number
      const now = new Date();
      const dateForNumber = orderDate ? new Date(orderDate) : now;
      const dateString = dateForNumber.toISOString().split('T')[0].replace(/-/g, '');
      const orderNumber = `ORD-${dateString}-${Math.floor(Math.random() * 900 + 100)}`;

      // Tanggal: pakai tanggal dipilih + jam realtime saat submit
      let finalDate = null;
      if (orderDate) {
        const [y, m, d] = orderDate.split('-').map(Number);
        const combined = new Date(y, m - 1, d, now.getHours(), now.getMinutes(), now.getSeconds());
        finalDate = combined.toISOString();
      }

      // Insert ke orders
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert([{
          user_id: clientId,
          order_number: orderNumber,
          status: 'pending',
          payment_status: 'Belum Lunas',
          total_amount: 0,
          custom_order_date: finalDate
        }])
        .select()
        .single();

      if (orderError) throw orderError;

      // Insert order_items
      const orderItems = items.map(i => ({
        order_id: orderData.id,
        item_name: i.itemName,
        quantity: parseFloat(i.quantity),
        unit: i.unit
      }));

      const { error: itemsError } = await supabase.from('order_items').insert(orderItems);
      if (itemsError) throw itemsError;

      // Sukses
      clearDraft();
      setClientId('');
      setClientName('');
      setClientSearch('');
      setOrderDate(new Date().toISOString().split('T')[0]);
      setItems([defaultItem()]);
      setHasDraft(false);
      setShowDraftBanner(false);

      toast.success(`Pesanan ${orderNumber} untuk ${clientName} berhasil dibuat!`);

      // Pindah ke pesanan masuk
      setTimeout(() => setCurrentView('incoming'), 1200);
    } catch (err) {
      console.error(err);
      toast.error('Gagal membuat pesanan: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter klien berdasarkan pencarian
  const filteredClients = clients.filter(c =>
    c.name?.toLowerCase().includes(clientSearch.toLowerCase()) ||
    c.email?.toLowerCase().includes(clientSearch.toLowerCase())
  );

  return (
    <div className="max-w-3xl mx-auto space-y-5">

      {/* ---- Banner Draft ---- */}
      <AnimatePresence>
        {showDraftBanner && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl"
          >
            <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">Draft Tersimpan</p>
              <p className="text-xs text-amber-700 dark:text-amber-400 mt-0.5">
                Anda memiliki draft pesanan yang belum dikirim. Data telah dimuat kembali secara otomatis.
              </p>
            </div>
            <button onClick={() => setShowDraftBanner(false)} className="text-amber-500 hover:text-amber-700 shrink-0">
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ---- Header Card ---- */}
      <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl rounded-2xl border border-gray-200 dark:border-slate-700 p-5 shadow-sm">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-pink-100 dark:bg-pink-900/30 flex items-center justify-center">
              <ShoppingCart className="w-5 h-5 text-pink-600 dark:text-pink-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900 dark:text-white">Buat Pesanan Manual</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">Input pesanan atas nama SPPG yang terdaftar</p>
            </div>
          </div>
          {hasDraft && (
            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 text-xs text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 px-3 py-1.5 rounded-xl transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset Draft
            </button>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">

        {/* ---- Pilih SPPG Tujuan ---- */}
        <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl rounded-2xl border border-gray-200 dark:border-slate-700 p-5 shadow-sm space-y-4">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
            <User className="w-4 h-4 text-pink-500" />
            Informasi Pesanan
          </h3>

          {/* Pilih SPPG */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">
              SPPG Tujuan <span className="text-red-500">*</span>
            </label>
            <div className="relative" ref={clientDropdownRef}>
              {/* Input / tampilan klien terpilih */}
              {clientId ? (
                <div className="flex items-center gap-2 px-3 py-2.5 bg-green-50 dark:bg-green-900/20 border border-green-300 dark:border-green-700 rounded-xl">
                  <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400 shrink-0" />
                  <span className="flex-1 text-sm font-semibold text-green-800 dark:text-green-300">{clientName}</span>
                  <button
                    type="button"
                    onClick={handleClearClient}
                    className="p-0.5 text-green-500 hover:text-green-700 dark:hover:text-green-300 rounded"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Cari nama atau email SPPG..."
                    value={clientSearch}
                    onChange={e => { setClientSearch(e.target.value); setShowClientDropdown(true); }}
                    onFocus={() => setShowClientDropdown(true)}
                    className="w-full pl-9 pr-4 py-2.5 bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-400 dark:text-white placeholder-gray-400"
                  />
                </div>
              )}

              {/* Dropdown list klien */}
              <AnimatePresence>
                {showClientDropdown && !clientId && (
                  <motion.div
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 4 }}
                    className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl shadow-xl z-50 max-h-52 overflow-y-auto"
                  >
                    {filteredClients.length === 0 ? (
                      <div className="px-4 py-3 text-sm text-gray-400 text-center">Tidak ada SPPG ditemukan</div>
                    ) : (
                      filteredClients.map(client => (
                        <button
                          key={client.id}
                          type="button"
                          onClick={() => handleSelectClient(client)}
                          className="w-full text-left px-4 py-2.5 hover:bg-pink-50 dark:hover:bg-pink-900/20 transition-colors"
                        >
                          <p className="text-sm font-semibold text-gray-800 dark:text-white">{client.name}</p>
                          <p className="text-xs text-gray-400 dark:text-gray-500">{client.email}</p>
                        </button>
                      ))
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Pilih Tanggal */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">
              Tanggal Pesanan <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={orderDate}
              onChange={e => setOrderDate(e.target.value)}
              className="w-full px-3 py-2.5 bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-400 dark:text-white"
            />
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 flex items-center gap-1">
              <Info className="w-3.5 h-3.5 shrink-0" />
              Jam pesanan akan menggunakan waktu saat ini secara otomatis.
            </p>
          </div>
        </div>

        {/* ---- Daftar Barang ---- */}
        <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl rounded-2xl border border-gray-200 dark:border-slate-700 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
              <ShoppingCart className="w-4 h-4 text-pink-500" />
              Daftar Barang ({items.length} baris)
            </h3>
            <motion.button
              type="button"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleAddRow}
              className="flex items-center gap-1.5 text-xs font-semibold text-pink-600 dark:text-pink-400 hover:text-pink-800 dark:hover:text-pink-200 bg-pink-50 dark:bg-pink-900/20 border border-pink-200 dark:border-pink-800 px-3 py-1.5 rounded-xl transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Tambah Baris
            </motion.button>
          </div>

          {/* Header tabel */}
          <div className="hidden md:grid grid-cols-12 gap-2 px-1 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
            <div className="col-span-6">Nama Barang</div>
            <div className="col-span-2 text-center">Qty</div>
            <div className="col-span-3">Satuan</div>
            <div className="col-span-1"></div>
          </div>

          <div className="space-y-2">
            <AnimatePresence>
              {items.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.15 }}
                  className="grid grid-cols-12 gap-2 items-center bg-gray-50 dark:bg-slate-700/40 rounded-xl p-2"
                >
                  {/* Nomor baris (mobile only) */}
                  <div className="col-span-12 md:hidden text-xs text-gray-400 font-semibold pb-1 border-b border-gray-200 dark:border-slate-600">
                    Barang #{index + 1}
                  </div>

                  {/* Nama Barang */}
                  <div className="col-span-12 md:col-span-6">
                    <input
                      type="text"
                      placeholder="Nama barang..."
                      value={item.itemName}
                      onChange={e => handleChange(item.id, 'itemName', e.target.value)}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pink-400 dark:text-white placeholder-gray-400"
                    />
                  </div>

                  {/* Qty */}
                  <div className="col-span-5 md:col-span-2">
                    <input
                      type="number"
                      placeholder="Qty"
                      min="0"
                      step="any"
                      value={item.quantity}
                      onChange={e => handleChange(item.id, 'quantity', e.target.value)}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pink-400 dark:text-white placeholder-gray-400 text-center"
                    />
                  </div>

                  {/* Satuan */}
                  <div className="col-span-6 md:col-span-3">
                    <input
                      type="text"
                      placeholder="Satuan"
                      value={item.unit}
                      onChange={e => handleChange(item.id, 'unit', e.target.value)}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pink-400 dark:text-white placeholder-gray-400"
                    />
                  </div>

                  {/* Tombol Hapus */}
                  <div className="col-span-1 flex justify-center">
                    <button
                      type="button"
                      onClick={() => handleRemoveRow(item.id)}
                      className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      title="Hapus baris"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* ---- Tombol Aksi ---- */}
        <div className="flex gap-3 justify-end flex-wrap">
          <motion.button
            type="button"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleReset}
            className="flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 rounded-xl text-sm font-semibold transition-colors shadow-sm"
          >
            <RotateCcw className="w-4 h-4" />
            Reset
          </motion.button>

          <motion.button
            type="submit"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={isSubmitting}
            className="flex items-center gap-2 px-6 py-2.5 bg-pink-600 hover:bg-pink-700 disabled:bg-pink-400 text-white rounded-xl text-sm font-semibold transition-colors shadow-md shadow-pink-500/20"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Mengirim...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Kirim Pesanan
              </>
            )}
          </motion.button>
        </div>
      </form>
    </div>
  );
}
