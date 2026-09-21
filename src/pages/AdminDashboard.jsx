import { useState, useRef, useEffect } from 'react';
import OverviewDashboard from '../components/admin/OverviewDashboard';
import ReturnsManagement from '../components/admin/ReturnsManagement';
import InventoryManagement from '../components/admin/InventoryManagement';
import ClientManagement from '../components/admin/ClientManagement';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, Inbox, History, Undo2, Boxes, ShoppingBag, LogOut, Package, PackageOpen, Archive, User, Moon, Sun, ChevronDown, Users, FileText, Printer, CheckCircle, ChevronRight, Search, Filter, Eye, Trash2, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

import OrderModal from '../components/admin/OrderModal';
import HistoryOrders from '../components/admin/HistoryOrders';
import IncomingOrders from '../components/admin/IncomingOrders';
import FilterDrawer from '../components/admin/FilterDrawer';
import ConfirmModal from '../components/admin/ConfirmModal';
import { supabase } from '../supabaseClient';
import { generateInvoicePDF } from '../utils/pdfGenerator';
function NavItem({ icon: Icon, label, isActive, onClick, badge }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl transition-all duration-300 ${isActive
          ? 'bg-pink-50 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400 font-semibold shadow-sm'
          : 'text-gray-600 hover:bg-white/60 dark:text-gray-400 dark:hover:bg-slate-800/60 hover:text-pink-600 dark:hover:text-pink-400'
        }`}
    >
      <div className="flex items-center gap-3">
        <Icon className={`w-5 h-5 ${isActive ? 'text-pink-600 dark:text-pink-400' : ''}`} />
        <span>{label}</span>
      </div>
      {badge !== undefined && badge > 0 && (
        <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
          {badge}
        </span>
      )}
    </button>
  );
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user')) || {};
  let rawAdminName = user.name ? user.name : (user.email ? user.email.split('@')[0] : 'Admin');
  const adminName = rawAdminName.charAt(0).toUpperCase() + rawAdminName.slice(1).toLowerCase();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [currentView, setCurrentView] = useState('overview'); // overview, incoming, history, returns, inventory, clients

  // States for Search and Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [filterPayment, setFilterPayment] = useState('Semua');
  const [filterClient, setFilterClient] = useState('Semua');
  const [filterTime, setFilterTime] = useState({ type: '', value: '' });
  const [selectedOrderDetails, setSelectedOrderDetails] = useState(null);

  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, title: '', message: '', onConfirm: null });
  const showConfirm = (title, message, onConfirm) => {
    setConfirmDialog({ isOpen: true, title, message, onConfirm });
  };


  const [orders, setOrders] = useState([]);

  const fetchOrders = async (showLoading = true) => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*, profiles ( name ), order_items (*), returns (*)')
        .eq('is_deleted_by_admin', false)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      const formatted = data.map(o => ({
        id: o.id,
        orderNumber: o.order_number,
        clientName: o.profiles?.name || 'Unknown',
        date: new Date(o.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) + ' WIB',
        status: o.status,
        paymentStatus: o.payment_status,
        totalAmount: o.total_amount,
        items: o.order_items.map(i => ({
          id: i.id,
          itemName: i.item_name,
          quantity: i.quantity,
          unit: i.unit,
          sellingPrice: i.selling_price,
          inventoryId: i.inventory_id
        })),
        returns: o.returns
      }));
      setOrders(formatted);
    } catch (e) {
      if (showLoading) console.error(e);
    }
  };

  useEffect(() => {
    fetchOrders();
    
  }, []);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handlePriceChange = (orderId, itemId, field, value) => {
    setOrders(orders.map(order => {
      if (order.id === orderId) {
        return {
          ...order,
          items: order.items.map(item => {
            if (item.id === itemId) {
              return { ...item, [field]: value };
            }
            return item;
          })
        };
      }
      return order;
    }));
  };

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSavePrices = async (orderId) => {
    if (isSubmitting) return;

    const order = orders.find(o => o.id === orderId);
    const isComplete = order.items.every(item => item.hpp !== '' && item.sellingPrice !== '');
    if (!isComplete) {
      toast.error('Mohon isi semua HPP dan Harga Jual!');
      return;
    }
    const isValidPrice = order.items.every(item => parseFloat(item.hpp) >= 0 && parseFloat(item.sellingPrice) >= 0);
    if (!isValidPrice) {
      toast.error('Harga tidak boleh di bawah 0 (minus)!');
      return;
    }

        try {
      setIsSubmitting(true);
      
      for (const item of order.items) {
        await supabase.from('order_items').update({ 
          hpp: parseFloat(item.hpp), 
          selling_price: parseFloat(item.sellingPrice) 
        }).eq('id', item.id);
        
        if (item.inventoryId) {
          const invData = await supabase.from('inventory').select('stock').eq('id', item.inventoryId).single();
          if (invData.data) {
             await supabase.from('inventory').update({ stock: parseFloat(invData.data.stock) - parseFloat(item.quantity) }).eq('id', item.inventoryId);
          }
        }
      }

      const total = order.items.reduce((sum, item) => sum + (parseFloat(item.quantity) * parseFloat(item.sellingPrice)), 0);
      
      const { error } = await supabase.from('orders').update({ status: 'priced', total_amount: total }).eq('id', orderId);
      if (error) throw error;
      
      setOrders(orders.map(o => o.id === orderId ? { ...o, status: 'priced', total_amount: total } : o));
      setExpandedOrder(null);
      toast.success('Harga disimpan! Pesanan masuk ke tahap Diproses.');
    } catch (error) {
      console.error(error);
      toast.error('Gagal menyimpan harga!');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    window.location.href = '/';
  };

  const handlePrint = async (type, orderId, orderNumber = '') => {
  const order = orders.find(o => o.id === orderId);
  if (order) {
    generateInvoicePDF(order, type);
    toast.success(type + ' berhasil diunduh!');
  }
};

  const getStatusBadge = (status) => {
    const badges = {
      pending: <span className="px-3 py-1 bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-400 rounded-full text-xs font-bold border border-yellow-200 dark:border-yellow-800">Menunggu Harga</span>,
      processing: <span className="px-3 py-1 bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-400 rounded-full text-xs font-bold border border-pink-200 dark:border-pink-800">Diproses</span>,
      priced: <span className="px-3 py-1 bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400 rounded-full text-xs font-bold border border-blue-200 dark:border-blue-800">Diproses</span>,
      shipped: <span className="px-3 py-1 bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-400 rounded-full text-xs font-bold border border-purple-200 dark:border-purple-800">Dikirim</span>,
      completed: <span className="px-3 py-1 bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400 rounded-full text-xs font-bold border border-green-200 dark:border-green-800">Selesai</span>,
      complained: <span className="px-3 py-1 bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400 rounded-full text-xs font-bold border border-red-200 dark:border-red-800">Dikomplain</span>,
    };
    return badges[status] || <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-bold border border-gray-200">Unknown</span>;
  };

  const getIconColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/40 dark:text-yellow-400',
      processing: 'bg-pink-100 text-pink-600 dark:bg-pink-900/40 dark:text-pink-400',
      priced: 'bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400',
      shipped: 'bg-purple-100 text-purple-600 dark:bg-purple-900/40 dark:text-purple-400',
      completed: 'bg-green-100 text-green-600 dark:bg-green-900/40 dark:text-green-400',
      complained: 'bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400',
    };
    return colors[status] || 'bg-gray-100 text-gray-500';
  };

  const activeOrdersCount = orders.filter(o => o.status !== 'completed').length;

  const clientOptions = ['Semua', ...new Set(orders.map(o => o.clientName))];

  const filteredOrders = orders.filter(order => {
    if (currentView === 'incoming' && order.status === 'completed') return false;
    if (currentView === 'history' && order.status !== 'completed') return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      if (!order.clientName.toLowerCase().includes(q) && !order.orderNumber.toLowerCase().includes(q)) return false;
    }
    if (filterPayment !== 'Semua' && order.paymentStatus !== filterPayment) return false;
    if (filterClient !== 'Semua' && order.clientName !== filterClient) return false;

    if (filterTime.type !== '' && filterTime.value !== '') {
      try {
        const orderDateStr = order.date.split(',')[0]; // "12 Sep 2026"
        const orderDate = new Date(orderDateStr);

        if (filterTime.type === 'Mingguan') {
          // 2 weeks from the selected date
          const startDate = new Date(filterTime.value);
          const endDate = new Date(startDate);
          endDate.setDate(endDate.getDate() + 14);
          if (orderDate < startDate || orderDate > endDate) return false;
        }
        else if (filterTime.type === 'Bulanan') {
          // filterTime.value is "YYYY-MM"
          const [year, month] = filterTime.value.split('-');
          if (orderDate.getFullYear() !== parseInt(year) || (orderDate.getMonth() + 1) !== parseInt(month)) return false;
        }
        else if (filterTime.type === 'Tahunan') {
          // filterTime.value is "YYYY"
          if (orderDate.getFullYear() !== parseInt(filterTime.value)) return false;
        }
      } catch (e) {
        // skip filter on error
      }
    }
    return true;
  });

  return (
    <div className="relative min-h-screen w-full bg-[#f8fafc] dark:bg-[#0f172a] transition-colors duration-300 overflow-hidden flex">
      <div className="absolute top-[-10%] left-[20%] w-96 h-96 bg-pink-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 dark:opacity-10 pointer-events-none transition-opacity"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-mbg-blue-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 dark:opacity-10 pointer-events-none transition-opacity"></div>

      {/* Sidebar */}
      <div className="w-64 bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl border-r border-gray-200 dark:border-slate-800 p-6 flex flex-col z-10 hidden md:flex transition-colors">
        <div className="flex items-center gap-3 mb-10 text-mbg-blue-900 dark:text-white transition-colors">
          <div className="w-10 h-10 rounded-lg overflow-hidden flex items-center justify-center bg-pink-500 text-white font-bold shrink-0 shadow-md shadow-pink-500/30">
            <span className="text-sm">MBG</span>
          </div>
          <h2 className="text-xl font-bold truncate">Admin Panel</h2>
        </div>

        <nav className="flex-1 space-y-2">
          <NavItem icon={Home} label="Beranda" isActive={currentView === 'overview'} onClick={() => setCurrentView('overview')} />
          <NavItem icon={Inbox} label="Pesanan Masuk" isActive={currentView === 'incoming'} onClick={() => setCurrentView('incoming')} badge={activeOrdersCount} />
          <NavItem icon={History} label="Riwayat Pesanan" isActive={currentView === 'history'} onClick={() => setCurrentView('history')} />
          <NavItem icon={Undo2} label="Manajemen Retur" isActive={currentView === 'returns'} onClick={() => setCurrentView('returns')} />
          <NavItem icon={Boxes} label="Data Barang" isActive={currentView === 'inventory'} onClick={() => setCurrentView('inventory')} />
          <NavItem icon={Users} label="Kelola SPPG" isActive={currentView === 'clients'} onClick={() => setCurrentView('clients')} />
        </nav>
      </div>

      <div className="flex-1 flex flex-col h-screen overflow-hidden">

        {/* Topbar */}
        <header className="relative z-50 bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl border-b border-gray-200 dark:border-slate-800 px-6 py-4 flex justify-between items-center shrink-0 transition-colors">

          {/* Title Area */}
          <div className={`${showMobileSearch ? 'hidden md:block' : 'block'}`}>
            <h1 className="text-lg md:text-xl font-bold text-mbg-blue-900 dark:text-white transition-colors flex items-center gap-2">
              {currentView === 'overview' ? (
                <><Home className="w-5 h-5 text-mbg-blue-600 md:hidden" /> Ringkasan Dashboard</>
              ) : currentView === 'incoming' ? (
                <><Inbox className="w-5 h-5 text-pink-600 md:hidden" /> Pesanan Masuk</>
              ) : currentView === 'history' ? (
                <><History className="w-5 h-5 text-green-600 md:hidden" /> Riwayat Pesanan</>
              ) : currentView === 'returns' ? (
                <><Undo2 className="w-5 h-5 text-orange-600 md:hidden" /> Manajemen Retur</>
              ) : currentView === 'inventory' ? (
                <><Boxes className="w-5 h-5 text-mbg-blue-600 md:hidden" /> Data Barang</>
              ) : (
                <><Users className="w-5 h-5 text-mbg-blue-600 md:hidden" /> Kelola SPPG</>
              )}
            </h1>
            <p className="hidden md:block text-xs md:text-sm text-gray-600 dark:text-gray-400 mt-0.5 transition-colors">
              {currentView === 'overview' ? 'Ringkasan performa dan notifikasi penting.' : currentView === 'incoming' ? 'Kelola pesanan aktif dari SPPG, tentukan HPP & Harga Jual.' : currentView === 'history' ? 'Arsip pesanan SPPG yang sudah selesai.' : currentView === 'returns' ? 'Kelola komplain dan pengembalian barang dari SPPG.' : currentView === 'inventory' ? 'Kelola inventaris dan stok barang di gudang.' : 'Kelola akun SPPG.'}
            </p>
          </div>

          {/* Mobile Search Input Overlay */}
          {showMobileSearch && currentView !== 'inventory' && (
            <div className="md:hidden flex-1 flex items-center gap-2 pr-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
                <input
                  type="text"
                  autoFocus
                  placeholder="Cari pesanan..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-800 border border-pink-200 dark:border-pink-900/50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 transition-all dark:text-white"
                />
              </div>
              <button onClick={() => setShowMobileSearch(false)} className="p-2 text-gray-500 bg-gray-100 dark:bg-slate-800 rounded-xl">
                <X className="w-5 h-5" />
              </button>
            </div>
          )}

          {/* Actions Area */}
          <div className={`flex items-center gap-2 md:gap-4 ${showMobileSearch ? 'hidden md:flex' : 'flex'}`}>

            {/* Desktop Search */}
            {currentView !== 'inventory' && (
              <div className="hidden md:flex relative">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Cari pesanan..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-4 py-2 w-48 lg:w-64 bg-white/60 dark:bg-slate-800/60 border border-gray-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 transition-all dark:text-white placeholder-gray-400"
                />
              </div>
            )}

            {/* Mobile Search Toggle */}
            {currentView !== 'inventory' && (
              <button
                onClick={() => setShowMobileSearch(true)}
                className="md:hidden p-2 rounded-xl border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 dark:bg-slate-800 dark:border-slate-700 dark:text-gray-300"
              >
                <Search className="w-5 h-5" />
              </button>
            )}

            {/* Filter Toggle */}
            {currentView !== 'inventory' && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowFilterDropdown(true)}
                className={`relative p-2 rounded-xl border transition-colors shadow-sm focus:outline-none flex items-center justify-center ${(filterPayment !== 'Semua' || filterClient !== 'Semua' || filterTime.type !== '') ? 'bg-pink-50 border-pink-200 text-pink-600 dark:bg-pink-900/30 dark:border-pink-800 dark:text-pink-400' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50 dark:bg-[#1a2332] dark:border-slate-700 dark:text-gray-300 dark:hover:bg-slate-800'}`}
              >
                <Filter className="w-5 h-5" />
                {(filterPayment !== 'Semua' || filterClient !== 'Semua' || filterTime.type !== '') && (
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
                <span className="hidden md:block text-sm font-bold text-gray-700 dark:text-gray-200">
                  Hi, admin
                </span>
                <ChevronDown className="w-4 h-4 text-gray-500 hidden md:block shrink-0" />
              </motion.button>

              <AnimatePresence>
                {showDropdown && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-3 w-48 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-gray-100 dark:border-slate-700 overflow-hidden"
                  >
                    <div className="px-4 py-3 border-b border-gray-50 dark:border-slate-700/50">
                      <p className="text-sm font-bold text-gray-900 dark:text-white">Hi, admin</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">admin@gmail.com</p>
                    </div>

                    {/* Mobile Dark Mode inside Profile */}
                    <div className="md:hidden">
                      <button
                        onClick={() => { setIsDarkMode(!isDarkMode); setShowDropdown(false); }}
                        className="w-full text-left px-4 py-3 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors flex items-center gap-2"
                      >
                        {isDarkMode ? <Sun className="w-4 h-4 text-gray-400" /> : <Moon className="w-4 h-4 text-gray-400" />}
                        {isDarkMode ? 'Mode Terang' : 'Mode Gelap'}
                      </button>
                      <div className="border-t border-gray-50 dark:border-slate-700/50"></div>
                    </div>

                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-3 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors flex items-center gap-2"
                    >
                      <LogOut className="w-4 h-4" />
                      Keluar
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

          {/* Main Workspace Area */}
          <div className="flex-1 overflow-y-auto p-4 md:p-6 pb-24 md:pb-6 relative z-10 custom-scrollbar">
            {currentView === 'overview' ? (
              <OverviewDashboard filteredOrders={filteredOrders} isDarkMode={isDarkMode} />
            ) : currentView === 'incoming' ? (
              <IncomingOrders
                filteredOrders={filteredOrders}
                expandedOrder={expandedOrder}
                setExpandedOrder={setExpandedOrder}
                handlePriceChange={handlePriceChange}
                handleSavePrices={handleSavePrices}
                setOrders={setOrders}
                orders={orders}
                isDarkMode={isDarkMode}
                handlePrint={handlePrint}
                getIconColor={getIconColor}
                getStatusBadge={getStatusBadge}
              />
            ) : currentView === 'history' ? (
              <HistoryOrders
                filteredOrders={filteredOrders}
                setOrders={setOrders}
                orders={orders}
                setSelectedOrderDetails={setSelectedOrderDetails}
                showConfirm={showConfirm}
              />
            ) : currentView === 'returns' ? (
              <ReturnsManagement isDarkMode={isDarkMode} />
            ) : currentView === 'inventory' ? (
              <InventoryManagement isDarkMode={isDarkMode} />
            ) : (
              <ClientManagement isDarkMode={isDarkMode} />
            )}
          </div>

        {/* Filter Drawer (Sidebar) */}
        <FilterDrawer
          showFilterDropdown={showFilterDropdown}
          setShowFilterDropdown={setShowFilterDropdown}
          filterPayment={filterPayment}
          setFilterPayment={setFilterPayment}
          filterClient={filterClient}
          setFilterClient={setFilterClient}
          clientOptions={clientOptions}
          filterTime={filterTime}
          setFilterTime={setFilterTime}
        />

        {/* Order Details Modal */}
        <OrderModal
          selectedOrderDetails={selectedOrderDetails}
          setSelectedOrderDetails={setSelectedOrderDetails}
          handlePrint={handlePrint}
        />

        {/* Custom Confirm Modal */}
        <ConfirmModal
          isOpen={confirmDialog.isOpen}
          title={confirmDialog.title}
          message={confirmDialog.message}
          onConfirm={confirmDialog.onConfirm}
          onCancel={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
        />

        {/* Mobile Bottom Navigation */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-t border-gray-200 dark:border-slate-800 flex justify-around items-center p-3 z-50 transition-colors">
          <button
            onClick={() => setCurrentView('overview')}
            className={`p-3 rounded-2xl flex flex-col items-center gap-1 transition-all ${currentView === 'overview' ? 'text-blue-600 bg-blue-50 dark:bg-blue-900/30 dark:text-blue-400' : 'text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-slate-800'}`}
          >
            <Home className="w-6 h-6" />
          </button>

          <button
            onClick={() => setCurrentView('incoming')}
            className={`relative p-3 rounded-2xl flex flex-col items-center gap-1 transition-all ${currentView === 'incoming' ? 'text-pink-600 bg-pink-50 dark:bg-pink-900/30 dark:text-pink-400' : 'text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-slate-800'}`}
          >
            <Inbox className="w-6 h-6" />
            {activeOrdersCount > 0 && (
              <span className="absolute top-1.5 right-1.5 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full border-2 border-white dark:border-slate-900">
                {activeOrdersCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setCurrentView('history')}
            className={`p-3 rounded-2xl flex flex-col items-center gap-1 transition-all ${currentView === 'history' ? 'text-pink-600 bg-pink-50 dark:bg-pink-900/30 dark:text-pink-400' : 'text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-slate-800'}`}
          >
            <History className="w-6 h-6" />
          </button>

          <button
            onClick={() => setCurrentView('returns')}
            className={`p-3 rounded-2xl flex flex-col items-center gap-1 transition-all ${currentView === 'returns' ? 'text-pink-600 bg-pink-50 dark:bg-pink-900/30 dark:text-pink-400' : 'text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-slate-800'}`}
          >
            <Undo2 className="w-6 h-6" />
          </button>
          
          <button
            onClick={() => setCurrentView('inventory')}
            className={`p-3 rounded-2xl flex flex-col items-center gap-1 transition-all ${currentView === 'inventory' ? 'text-mbg-blue-600 bg-mbg-blue-50 dark:bg-mbg-blue-900/30 dark:text-mbg-blue-400' : 'text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-slate-800'}`}
          >
            <Boxes className="w-6 h-6" />
          </button>

          <button
            onClick={() => setCurrentView('clients')}
            className={`p-3 rounded-2xl flex flex-col items-center gap-1 transition-all ${currentView === 'clients' ? 'text-mbg-blue-600 bg-mbg-blue-50 dark:bg-mbg-blue-900/30 dark:text-mbg-blue-400' : 'text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-slate-800'}`}
          >
            <Users className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
}
