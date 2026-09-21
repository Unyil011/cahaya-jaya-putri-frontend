import { ShoppingCart, useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, Plus, Trash2, Send, ShoppingBag, LogOut, Package, User, Moon, Sun, ChevronDown, History, Search, X, Filter } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import axios from 'axios';

import ClientActiveOrders from '../components/client/ClientActiveOrders';
import ClientHistory from '../components/client/ClientHistory';
import FilterDrawer from '../components/client/FilterDrawer';
import { supabase } from '../supabaseClient';

export default function ClientDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem('user')) || {};
  let rawClientName = user.name ? user.name : (user.email ? user.email.split('@')[0] : 'Client');
  const clientName = rawClientName.charAt(0).toUpperCase() + rawClientName.slice(1).toLowerCase();
  const [isLoading, setIsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [currentView, setCurrentView] = useState('create'); // 'create', 'active', 'history'

  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [filterPayment, setFilterPayment] = useState('Semua');
  const [filterTime, setFilterTime] = useState({ type: '', value: '' });

  // State for dynamic rows
  const [items, setItems] = useState([
    { id: 1, itemName: '', quantity: '', unit: '' }
  ]);
  
  const [inventories, setInventories] = useState([]);

  useEffect(() => {
    const fetchInventories = async () => {
      try {
        const res = await api.get('/inventories');
        setInventories(res.data);
      } catch (err) {
        console.error('Gagal memuat inventaris', err);
      }
    };
    fetchInventories();
  }, []);



  // Web Push Subscription
  useEffect(() => {
    async function subscribeToPush() {
      if ('serviceWorker' in navigator && 'PushManager' in window) {
        try {
          const swReg = await navigator.serviceWorker.register('/sw.js');
          let sub = await swReg.pushManager.getSubscription();
          
          if (!sub) {
            const vapidPublicKey = import.meta.env.VITE_VAPID_PUBLIC_KEY;
            if (vapidPublicKey) {
              const convertedVapidKey = urlBase64ToUint8Array(vapidPublicKey);
              sub = await swReg.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: convertedVapidKey
              });
              
              await api.post('/push-subscriptions', sub);
            }
          }
        } catch (e) {
          console.error('Push registration failed', e);
        }
      }
    }
    
    // Call subscribe logic after a slight delay to not block rendering
    setTimeout(subscribeToPush, 2000);
  }, []);

  function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  // Handle Dark Mode
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownRef]);

  const handleAddRow = () => {
    const newId = items.length > 0 ? items[items.length - 1].id + 1 : 1;
    setItems([...items, { id: newId, itemName: '', quantity: '', unit: '' }]);
  };

  const handleRemoveRow = (idToRemove) => {
    if (items.length === 1) {
      toast.error('Minimal harus ada 1 barang!', {
        style: { background: isDarkMode ? 'rgba(30, 41, 59, 0.8)' : 'rgba(255, 255, 255, 0.7)', backdropFilter: 'blur(10px)', color: isDarkMode ? '#fff' : '#000' }
      });
      return;
    }
    setItems(items.filter(item => item.id !== idToRemove));
  };

  const handleChange = (id, field, value) => {
    setItems(items.map(item =>
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const isValid = items.every(item => item.itemName.trim() !== '' && item.quantity !== '' && item.unit.trim() !== '');
    if (!isValid) {
      toast.error('Mohon masukan daftar barang yang dibutuhkan!', { style: { background: 'rgba(255, 255, 255, 0.7)', backdropFilter: 'blur(10px)' } });
      return;
    }

    const isQuantityValid = items.every(item => parseFloat(item.quantity) > 0);
    if (!isQuantityValid) {
      toast.error('Kuantitas barang tidak boleh 0 atau minus!');
      return;
    }

    setIsLoading(true);
    

    try {
      const date = new Date();
      const dateString = date.toISOString().split('T')[0].replace(/-/g, '');
      const orderNumber = `ORD-${dateString}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
      
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert([{ user_id: user.id, order_number: orderNumber, status: 'pending', payment_status: 'Belum Lunas', total_amount: 0 }])
        .select().single();

      if (orderError) throw orderError;

      const orderItems = items.map(item => ({
        order_id: orderData.id,
        item_name: item.itemName,
        quantity: parseFloat(item.quantity),
        unit: item.unit
      }));

      const { error: itemsError } = await supabase.from('order_items').insert(orderItems);
      if (itemsError) throw itemsError;

      toast.success('Pesanan berhasil dikirim ke Supplier!');
      setItems([{ id: 1, itemName: '', quantity: '', unit: '' }]);
      setTimeout(() => setCurrentView('active'), 1000);
    } catch (error) {
      toast.error('Gagal mengirim pesanan');
    } finally {
      setIsLoading(false);
      
    }
  };

  const handleLogout = async () => {
    try {
      await api.post('/logout');
    } catch (e) { }
    localStorage.removeItem('auth_token');
    localStorage.removeItem('authRole');
    localStorage.removeItem('user');
    navigate('/');
  };

  // Nav Item Component for Sidebar
  const NavItem = ({ icon: Icon, label, isActive, onClick }) => (
    <button
      onClick={onClick}
      className={`w-full text-left flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${isActive
          ? 'bg-mbg-blue-500/10 text-mbg-blue-600 dark:bg-mbg-blue-500/20 dark:text-mbg-blue-400 border border-mbg-blue-200 dark:border-mbg-blue-500/30'
          : 'text-gray-600 hover:bg-white/40 dark:text-gray-400 dark:hover:bg-slate-800 border border-transparent'
        }`}
    >
      <Icon className="w-5 h-5" />
      {label}
    </button>
  );

  return (
    <div className="relative min-h-screen w-full bg-[#f8fafc] dark:bg-[#0f172a] transition-colors duration-300 overflow-hidden flex">
      {/* Decorative Blur Orbs */}
      <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-mbg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 dark:opacity-10 pointer-events-none transition-opacity"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-96 h-96 bg-mbg-blue-700 rounded-full mix-blend-multiply filter blur-3xl opacity-20 dark:opacity-10 pointer-events-none transition-opacity"></div>

      {/* Sidebar */}
      <div className="w-64 bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl border-r border-gray-200 dark:border-slate-800 p-6 flex flex-col z-10 hidden md:flex transition-colors">
        <div className="flex items-center gap-3 mb-10 text-mbg-blue-900 dark:text-white transition-colors">
          <div className="w-10 h-10 rounded-lg overflow-hidden flex items-center justify-center bg-mbg-blue-600 text-white font-bold shrink-0 shadow-md shadow-mbg-blue-500/30">
            <span className="text-sm">MBG</span>
          </div>
          <h2 className="text-xl font-bold truncate">SPPG {clientName}</h2>
        </div>

        <nav className="flex-1 space-y-2">
          <NavItem icon={ShoppingCart} label="Buat Pesanan" isActive={currentView === 'create'} onClick={() => setCurrentView('create')} />
          <NavItem icon={Package} label="Pesanan Berjalan" isActive={currentView === 'active'} onClick={() => setCurrentView('active')} />
          <NavItem icon={History} label="Riwayat Pesanan" isActive={currentView === 'history'} onClick={() => setCurrentView('history')} />
        </nav>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">

        {/* Top Navbar */}
        <header className="relative z-50 bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl border-b border-gray-200 dark:border-slate-800 px-6 py-4 flex justify-between items-center shrink-0 transition-colors">

          {/* Judul Halaman di Topbar */}
          <div className={`${showMobileSearch ? 'hidden md:block' : 'block'}`}>
            <h1 className="text-lg md:text-xl font-bold text-mbg-blue-900 dark:text-white transition-colors flex items-center gap-2">
              <Package className="w-5 h-5 text-mbg-blue-600 md:hidden" />
              {currentView === 'create' ? 'Buat Pesanan Baru' : currentView === 'active' ? 'Pesanan Berjalan' : 'Riwayat Pesanan'}
            </h1>
            <p className="hidden md:block text-xs md:text-sm text-gray-600 dark:text-gray-400 mt-0.5 transition-colors">
              {currentView === 'create' ? 'Masukkan daftar barang yang dibutuhkan dapur hari ini.' : currentView === 'active' ? 'Lacak dan konfirmasi pesanan yang sedang diproses atau dikirim.' : 'Arsip pesanan yang sudah selesai atau diretur.'}
            </p>
          </div>

          {/* Mobile Search Input Overlay */}
          {showMobileSearch && currentView !== 'create' && (
            <div className="md:hidden flex-1 flex items-center gap-2 pr-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
                <input
                  type="text"
                  autoFocus
                  placeholder="Cari pesanan..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-800 border border-mbg-blue-200 dark:border-mbg-blue-900/50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-mbg-blue-500 transition-all dark:text-white"
                />
              </div>
              <button onClick={() => setShowMobileSearch(false)} className="p-2 text-gray-500 bg-gray-100 dark:bg-slate-800 rounded-xl">
                <X className="w-5 h-5" />
              </button>
            </div>
          )}

          <div className={`flex items-center gap-2 md:gap-4 ${showMobileSearch ? 'hidden md:flex' : 'flex'}`}>
            
            {/* Desktop Search */}
            {currentView !== 'create' && (
              <div className="hidden md:flex relative">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Cari pesanan..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-4 py-2 w-48 lg:w-64 bg-white/60 dark:bg-slate-800/60 border border-gray-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-mbg-blue-500 transition-all dark:text-white placeholder-gray-400"
                />
              </div>
            )}

            {/* Mobile Search Toggle */}
            {currentView !== 'create' && (
              <button
                onClick={() => setShowMobileSearch(true)}
                className="md:hidden p-2 rounded-xl border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 dark:bg-slate-800 dark:border-slate-700 dark:text-gray-300"
              >
                <Search className="w-5 h-5" />
              </button>
            )}

            {/* Filter Toggle */}
            {currentView === 'history' && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowFilterDropdown(true)}
                className={`relative p-2 rounded-xl border transition-colors shadow-sm focus:outline-none flex items-center justify-center ${(filterPayment !== 'Semua' || filterTime.type !== '') ? 'bg-mbg-blue-50 border-mbg-blue-200 text-mbg-blue-600 dark:bg-mbg-blue-900/30 dark:border-mbg-blue-800 dark:text-mbg-blue-400' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50 dark:bg-[#1a2332] dark:border-slate-700 dark:text-gray-300 dark:hover:bg-slate-800'}`}
              >
                <Filter className="w-5 h-5" />
                {(filterPayment !== 'Semua' || filterTime.type !== '') && (
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white dark:border-slate-900"></span>
                )}
              </motion.button>
            )}

            {/* Desktop Dark Mode Toggle */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="hidden md:flex p-2 rounded-xl bg-white/60 dark:bg-slate-800/60 border border-gray-200 dark:border-slate-700 text-gray-600 dark:text-gray-300 hover:bg-white dark:hover:bg-slate-700 transition-colors shadow-sm"
              title="Toggle Dark Mode"
            >
              {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </motion.button>

            {/* Profile Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center gap-2 p-1.5 md:pl-2 md:pr-4 rounded-xl bg-white/60 dark:bg-slate-800/60 border border-gray-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-700 transition-colors shadow-sm"
              >
                <div className="w-8 h-8 rounded-lg bg-mbg-blue-100 dark:bg-mbg-blue-900/50 flex items-center justify-center text-mbg-blue-600 dark:text-mbg-blue-400 shrink-0">
                  <User className="w-4 h-4" />
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-xs font-bold text-gray-700 dark:text-gray-200 truncate max-w-[100px]">Hi, {clientName}</p>
                </div>
                <ChevronDown className="hidden md:block w-4 h-4 text-gray-400" />
              </motion.button>

              <AnimatePresence>
                {showDropdown && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-48 rounded-xl shadow-lg bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 overflow-hidden z-[100]"
                  >
                    <div className="py-2">
                      <div className="px-4 py-2 border-b border-gray-100 dark:border-slate-700 mb-1">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{user?.name || 'SPPG'}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user?.email || ''}</p>
                      </div>
                      <div className="md:hidden px-4 py-2 border-b border-gray-100 dark:border-slate-700 mb-1 flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-200">Tema Gelap</span>
                        <button onClick={() => setIsDarkMode(!isDarkMode)} className="p-1 rounded-md bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300">
                          {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                        </button>
                      </div>
                      <motion.button
                        whileHover={{ x: 5 }}
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors flex items-center gap-2"
                      >
                        <LogOut className="w-4 h-4" />
                        Keluar
                      </motion.button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* Scrollable Form Content */}
        <div className="flex-1 p-4 md:p-8 pb-24 md:pb-8 overflow-y-auto">
          <div className="max-w-4xl mx-auto">
            {currentView === 'create' ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-md rounded-3xl p-6 md:p-8 shadow-xl border border-white/50 dark:border-slate-700/50 transition-colors"
              >
                <form onSubmit={handleSubmit}>

                  {/* Dynamic Rows Container */}
                  <div className="mb-8 w-full overflow-x-auto pb-4">
                    <div className="min-w-[650px] md:min-w-0 space-y-4">
                      {/* Headers */}
                      <div className="grid grid-cols-12 gap-4 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300 transition-colors">
                        <div className="col-span-1 text-center">No</div>
                        <div className="col-span-5">Nama Barang</div>
                        <div className="col-span-3">Kuantitas</div>
                        <div className="col-span-2">Satuan</div>
                        <div className="col-span-1"></div>
                      </div>

                      <AnimatePresence>
                        {items.map((item, index) => (
                          <motion.div
                            key={item.id}
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.2 }}
                            className="grid grid-cols-12 gap-4 items-center bg-white/60 dark:bg-slate-800/60 p-4 rounded-xl border border-gray-200 dark:border-slate-700 transition-colors"
                          >
                            <div className="col-span-1 flex justify-center items-center">
                              <div className="w-8 h-8 rounded-full bg-mbg-blue-100 dark:bg-mbg-blue-900/30 flex items-center justify-center text-mbg-blue-600 dark:text-mbg-blue-400 font-bold shrink-0">
                                {index + 1}
                              </div>
                            </div>

                            <div className="col-span-5 w-full">
                              <input
                                type="text"
                                value={item.itemName}
                                onChange={(e) => handleChange(item.id, 'itemName', e.target.value)}
                                placeholder="Contoh: Bawang Merah Besar"
                                className="w-full px-4 py-2 md:py-3 border border-gray-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-mbg-blue-500 focus:border-mbg-blue-500 bg-gray-50 dark:bg-slate-700 hover:bg-gray-100 dark:hover:bg-slate-600 transition-colors text-gray-800 dark:text-gray-200"
                                required
                              />
                            </div>

                            <div className="col-span-3">
                              <input
                                type="number"
                                step="0.01"
                                min="0.01"
                                value={item.quantity}
                                onChange={(e) => handleChange(item.id, 'quantity', e.target.value)}
                                placeholder="0"
                                className="w-full px-4 py-2 rounded-lg bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-mbg-blue-500 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition-colors"
                              />
                            </div>
                            
                            <div className="col-span-2">
                              <input
                                type="text"
                                value={item.unit}
                                onChange={(e) => handleChange(item.id, 'unit', e.target.value)}
                                placeholder="kg, pcs..."
                                className="w-full px-4 py-2 rounded-lg bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-mbg-blue-500 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition-colors"
                              />
                            </div>

                            <div className="col-span-1 flex justify-center">
                              <motion.button
                                whileHover={{ scale: 1.15 }}
                                whileTap={{ scale: 0.85 }}
                                type="button"
                                onClick={() => handleRemoveRow(item.id)}
                                className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
                                title="Hapus Baris"
                              >
                                <Trash2 className="w-5 h-5" />
                              </motion.button>
                            </div>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-6 border-t border-gray-200 dark:border-slate-700 transition-colors">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="button"
                      onClick={handleAddRow}
                      className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl border-2 border-dashed border-mbg-blue-400 dark:border-mbg-blue-500 text-mbg-blue-600 dark:text-mbg-blue-400 font-medium hover:bg-mbg-blue-50 dark:hover:bg-mbg-blue-500/10 transition-colors"
                    >
                      <Plus className="w-5 h-5" />
                      Tambah Barang Lain
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      type="submit"
                      disabled={isLoading}
                      className="w-full md:w-auto flex items-center justify-center gap-2 px-8 py-3 rounded-xl bg-mbg-blue-600 text-white font-medium hover:bg-mbg-blue-700 focus:ring-2 focus:ring-offset-2 focus:ring-mbg-blue-500 transition-all shadow-md disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                      {isLoading ? (
                        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} className="w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
                      ) : (
                        <>
                          <Send className="w-5 h-5" />
                          Kirim Pesanan
                        </>
                      )}
                    </motion.button>
                  </div>
                </form>
              </motion.div>
            ) : currentView === 'active' ? (
              <ClientActiveOrders searchQuery={searchQuery} />
            ) : (
              <ClientHistory 
                searchQuery={searchQuery}
                filterPayment={filterPayment}
                filterTime={filterTime}
              />
            )}
          </div>
        </div>
      </div>

      {/* Filter Drawer */}
      <FilterDrawer
        showFilterDropdown={showFilterDropdown}
        setShowFilterDropdown={setShowFilterDropdown}
        filterPayment={filterPayment}
        setFilterPayment={setFilterPayment}
        filterTime={filterTime}
        setFilterTime={setFilterTime}
      />

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-t border-gray-200 dark:border-slate-800 flex justify-around items-center p-3 z-50 transition-colors">
        <button
          onClick={() => setCurrentView('create')}
          className={`relative p-3 rounded-2xl flex flex-col items-center gap-1 transition-all ${currentView === 'create' ? 'text-mbg-blue-600 bg-mbg-blue-50 dark:bg-mbg-blue-900/30' : 'text-gray-500'}`}
        >
          <Plus className="w-6 h-6" />
        </button>
        <button
          onClick={() => setCurrentView('active')}
          className={`relative p-3 rounded-2xl flex flex-col items-center gap-1 transition-all ${currentView === 'active' ? 'text-mbg-blue-600 bg-mbg-blue-50 dark:bg-mbg-blue-900/30' : 'text-gray-500'}`}
        >
          <Package className="w-6 h-6" />
        </button>
        <button
          onClick={() => setCurrentView('history')}
          className={`relative p-3 rounded-2xl flex flex-col items-center gap-1 transition-all ${currentView === 'history' ? 'text-mbg-blue-600 bg-mbg-blue-50 dark:bg-mbg-blue-900/30' : 'text-gray-500'}`}
        >
          <History className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
}
