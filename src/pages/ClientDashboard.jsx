import { useState, useRef, useEffect } from 'react';
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
          onClick={() => setCurrentView('create')}
          className={`relative p-3 rounded-2xl flex flex-col items-center gap-1 transition-all ${currentView === 'create' ? 'text-mbg-blue-600 bg-mbg-blue-50 dark:bg-mbg-blue-900/30' : 'text-gray-500'}`}
        >
          <ShoppingCart className="w-6 h-6" />
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
