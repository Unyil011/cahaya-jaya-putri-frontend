import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';
import { AlertTriangle, TrendingUp, Package, CheckCircle, CreditCard, Clock, Bell } from 'lucide-react';
import api from '../../api';

export default function OverviewDashboard({ filteredOrders, isDarkMode }) {
  const [lowStockItems, setLowStockItems] = useState([]);
  const [pendingReturns, setPendingReturns] = useState(0);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [invRes, retRes] = await Promise.all([
        api.get('/inventories'),
        api.get('/returns')
      ]);
      // Filter barang yang stoknya di bawah 10
      const lowStock = invRes.data.filter(item => parseFloat(item.stock) < 10);
      setLowStockItems(lowStock);

      // Filter retur yang berstatus pending
      const pendingCount = retRes.data.filter(r => r.status === 'pending').length;
      setPendingReturns(pendingCount);
    } catch (err) {
      console.error('Failed to fetch dashboard data', err);
    }
  };

  // Kalkulasi KPI
  const kpi = useMemo(() => {
    const activeOrders = filteredOrders.filter(o => o.status !== 'completed').length;
    
    // Total Revenue (Hanya dari pesanan completed)
    const revenue = filteredOrders
      .filter(o => o.status === 'completed')
      .reduce((acc, order) => acc + parseFloat(order.totalAmount || 0), 0);
      
    // Total Piutang (Pesanan selesai tapi belum lunas)
    const unpaid = filteredOrders
      .filter(o => o.status === 'completed' && o.paymentStatus !== 'Lunas')
      .reduce((acc, order) => acc + parseFloat(order.totalAmount || 0), 0);

    return { activeOrders, revenue, unpaid };
  }, [filteredOrders]);

  // Data untuk Grafik Harian (Area Chart)
  const chartData = useMemo(() => {
    const dailyData = {};
    
    filteredOrders.forEach(order => {
      // Ambil tanggal saja "14 Sep 2026"
      const dateStr = order.date.split(',')[0];
      
      if (!dailyData[dateStr]) {
        dailyData[dateStr] = { date: dateStr, orders: 0, revenue: 0 };
      }
      
      dailyData[dateStr].orders += 1;
      
      if (order.status === 'completed') {
        dailyData[dateStr].revenue += parseFloat(order.totalAmount || 0);
      }
    });

    // Urutkan berdasarkan tanggal
    return Object.values(dailyData).sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [filteredOrders]);

  // Data 5 Pesanan Terbaru
  const recentOrders = useMemo(() => {
    return [...filteredOrders]
      .sort((a, b) => new Date(b.created_at || b.date) - new Date(a.created_at || a.date))
      .slice(0, 5);
  }, [filteredOrders]);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-lg border border-gray-100 dark:border-slate-700">
          <p className="font-bold text-gray-900 dark:text-white mb-2">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }} className="text-sm font-medium">
              {entry.name}: {entry.name === 'Pendapatan' ? `Rp ${entry.value.toLocaleString('id-ID')}` : entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-md rounded-3xl p-6 shadow-xl border border-gray-200 dark:border-slate-700/80">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Pesanan Aktif</p>
              <h3 className="text-3xl font-black text-gray-900 dark:text-white mt-1">{kpi.activeOrders}</h3>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <Clock className="w-6 h-6" />
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-md rounded-3xl p-6 shadow-xl border border-gray-200 dark:border-slate-700/80">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Pendapatan Selesai</p>
              <h3 className="text-2xl font-black text-green-600 dark:text-green-400 mt-1">Rp {kpi.revenue.toLocaleString('id-ID')}</h3>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-green-100 dark:bg-green-900/40 flex items-center justify-center text-green-600 dark:text-green-400">
              <TrendingUp className="w-6 h-6" />
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-md rounded-3xl p-6 shadow-xl border border-gray-200 dark:border-slate-700/80">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Tagihan Belum Lunas</p>
              <h3 className="text-2xl font-black text-orange-600 dark:text-orange-400 mt-1">Rp {kpi.unpaid.toLocaleString('id-ID')}</h3>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-orange-100 dark:bg-orange-900/40 flex items-center justify-center text-orange-600 dark:text-orange-400">
              <CreditCard className="w-6 h-6" />
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-md rounded-3xl p-6 shadow-xl border border-gray-200 dark:border-slate-700/80">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Retur Menunggu</p>
              <h3 className="text-3xl font-black text-red-600 dark:text-red-400 mt-1">{pendingReturns}</h3>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-red-100 dark:bg-red-900/40 flex items-center justify-center text-red-600 dark:text-red-400">
              <AlertTriangle className="w-6 h-6" />
            </div>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="lg:col-span-2 bg-white/60 dark:bg-slate-900/60 backdrop-blur-md rounded-3xl p-6 shadow-xl border border-gray-200 dark:border-slate-700/80">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Statistik Pendapatan</h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDarkMode ? '#334155' : '#e2e8f0'} />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: isDarkMode ? '#94a3b8' : '#64748b', fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: isDarkMode ? '#94a3b8' : '#64748b', fontSize: 12 }} width={80} tickFormatter={(val) => `Rp ${(val/1000).toFixed(0)}k`} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="revenue" name="Pendapatan" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Alerts & Low Stock */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-md rounded-3xl p-6 shadow-xl border border-gray-200 dark:border-slate-700/80 flex flex-col">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Bell className="w-5 h-5 text-orange-500" /> Peringatan Stok
          </h3>
          
          <div className="flex-1 overflow-y-auto pr-2 space-y-3">
            {lowStockItems.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-2 opacity-50" />
                <p>Semua stok barang aman.</p>
              </div>
            ) : (
              lowStockItems.map(item => (
                <div key={item.id} className="flex items-center justify-between p-3 bg-orange-50 dark:bg-orange-900/20 rounded-xl border border-orange-100 dark:border-orange-900/50">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className="w-10 h-10 rounded-lg bg-orange-100 dark:bg-orange-800/50 flex items-center justify-center text-orange-600 dark:text-orange-400 shrink-0">
                      <Package className="w-5 h-5" />
                    </div>
                    <div className="truncate">
                      <h4 className="font-bold text-gray-900 dark:text-white truncate">{item.name}</h4>
                      <p className="text-xs text-orange-600 dark:text-orange-400 font-medium">Sisa: {item.stock} {item.unit}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </motion.div>
      </div>

      {/* Recent Orders Table */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }} className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-md rounded-3xl shadow-xl border border-gray-200 dark:border-slate-700 overflow-hidden">
        <div className="p-6 border-b border-gray-100 dark:border-slate-800">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Aktivitas Pesanan Terbaru</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50 dark:bg-slate-800/50 border-b border-gray-200 dark:border-slate-700">
                <th className="py-4 px-6 font-semibold text-gray-600 dark:text-gray-300">No. Pesanan</th>
                <th className="py-4 px-6 font-semibold text-gray-600 dark:text-gray-300">SPPG</th>
                <th className="py-4 px-6 font-semibold text-gray-600 dark:text-gray-300">Status</th>
                <th className="py-4 px-6 font-semibold text-gray-600 dark:text-gray-300">Tanggal</th>
                <th className="py-4 px-6 font-semibold text-gray-600 dark:text-gray-300 text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-8 text-center text-gray-500">Tidak ada pesanan terbaru.</td>
                </tr>
              ) : (
                recentOrders.map(order => (
                  <tr key={order.id} className="border-b border-gray-100 dark:border-slate-800/50 hover:bg-gray-50/50 dark:hover:bg-slate-800/50 transition-colors whitespace-nowrap">
                    <td className="py-4 px-6 font-medium text-gray-900 dark:text-white">{order.orderNumber}</td>
                    <td className="py-4 px-6 text-gray-600 dark:text-gray-300">{order.clientName}</td>
                    <td className="py-4 px-6">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        order.status === 'pending' ? 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/40' :
                        order.status === 'processing' ? 'bg-pink-100 text-pink-600 dark:bg-pink-900/40' :
                        order.status === 'priced' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/40' :
                        order.status === 'shipped' ? 'bg-purple-100 text-purple-600 dark:bg-purple-900/40' :
                        order.status === 'completed' ? 'bg-green-100 text-green-600 dark:bg-green-900/40' :
                        'bg-red-100 text-red-600 dark:bg-red-900/40'
                      }`}>
                        {order.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-gray-600 dark:text-gray-300">{order.date}</td>
                    <td className="py-4 px-6 text-right font-bold text-gray-900 dark:text-white">
                      Rp {(parseFloat(order.totalAmount) || 0).toLocaleString('id-ID')}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
