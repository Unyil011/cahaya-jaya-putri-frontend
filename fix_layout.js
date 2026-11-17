import fs from 'fs';
let code = fs.readFileSync('src/components/admin/OverviewDashboard.jsx', 'utf8');

// 1. Update topSppgData calculation to use totalAmount
const oldSppgData = `  const topSppgData = useMemo(() => {
    const sppgTotals = {};
    filteredOrders.forEach(o => {
      if (o.status === 'completed') {
        if (!sppgTotals[o.clientName]) sppgTotals[o.clientName] = 0;
        sppgTotals[o.clientName] += 1;
      }
    });
    return Object.keys(sppgTotals)
      .map(name => ({ name, value: sppgTotals[name] }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  }, [filteredOrders]);`;

const newSppgData = `  const topSppgData = useMemo(() => {
    const sppgTotals = {};
    filteredOrders.forEach(o => {
      if (o.status === 'completed') {
        if (!sppgTotals[o.clientName]) sppgTotals[o.clientName] = 0;
        sppgTotals[o.clientName] += parseFloat(o.totalAmount || 0);
      }
    });
    return Object.keys(sppgTotals)
      .map(name => ({ name, value: sppgTotals[name] }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  }, [filteredOrders]);`;

code = code.replace(oldSppgData, newSppgData);

// 2. Replace layout
const startStr = `<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">`;
const endStr = `{/* Recent Orders Table */}`;

const startIndex = code.indexOf(startStr);
const endIndex = code.indexOf(endStr);

if (startIndex !== -1 && endIndex !== -1) {
  const newLayout = `<div className="grid grid-cols-1 gap-6">
        {/* Main Chart */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-md rounded-3xl p-6 shadow-xl border border-gray-200 dark:border-slate-700/80">
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
                <YAxis axisLine={false} tickLine={false} tick={{ fill: isDarkMode ? '#94a3b8' : '#64748b', fontSize: 12 }} width={80} tickFormatter={(val) => \`Rp \${(val/1000).toFixed(0)}k\`} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="revenue" name="Pendapatan" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        {/* Donut Chart - SPPG Terlaris */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-md rounded-3xl p-6 shadow-xl border border-gray-200 dark:border-slate-700/80 flex flex-col">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-500" /> SPPG Paling Aktif (Pesanan Terbanyak)
          </h3>
          <div className="flex-1 w-full flex justify-center items-center h-64 relative">
            {topSppgData.length === 0 ? (
              <div className="text-center text-gray-500">Belum ada data pesanan selesai.</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={topSppgData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {topSppgData.map((entry, index) => {
                      const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
                      return <Cell key={\`cell-\${index}\`} fill={colors[index % colors.length]} />;
                    })}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', backgroundColor: isDarkMode ? '#1e293b' : 'white', color: isDarkMode ? 'white' : 'black' }}
                    formatter={(value) => [\`Rp \${value.toLocaleString('id-ID')}\`, 'Total Omset']}
                  />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </motion.div>

        {/* Alerts & Low Stock */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }} className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-md rounded-3xl p-6 shadow-xl border border-gray-200 dark:border-slate-700/80 flex flex-col">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Bell className="w-5 h-5 text-orange-500" /> Peringatan Stok
          </h3>
          
          <div className="flex-1 overflow-y-auto pr-2 space-y-3 max-h-64">
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

      `;
  
  code = code.slice(0, startIndex) + newLayout + code.slice(endIndex);
  fs.writeFileSync('src/components/admin/OverviewDashboard.jsx', code);
  console.log("Successfully replaced layout block!");
} else {
  console.log("Could not find start or end index.");
}
