import fs from 'fs';
let code = fs.readFileSync('src/components/admin/OverviewDashboard.jsx', 'utf8');

const oldCards = `<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-md rounded-3xl p-6 shadow-xl border border-gray-200 dark:border-slate-700/80">
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
        </motion.div>`;

const newCards = `<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-md rounded-3xl p-6 shadow-xl border border-gray-200 dark:border-slate-700/80">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Pendapatan Kotor</p>
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
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Keuntungan Bersih</p>
              <h3 className="text-2xl font-black text-blue-600 dark:text-blue-400 mt-1">Rp {kpi.netProfit.toLocaleString('id-ID')}</h3>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <TrendingUp className="w-6 h-6" />
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-md rounded-3xl p-6 shadow-xl border border-gray-200 dark:border-slate-700/80">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Tagihan Belum Lunas</p>
              <h3 className="text-2xl font-black text-orange-600 dark:text-orange-400 mt-1">Rp {kpi.unpaid.toLocaleString('id-ID')}</h3>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-orange-100 dark:bg-orange-900/40 flex items-center justify-center text-orange-600 dark:text-orange-400">
              <CreditCard className="w-6 h-6" />
            </div>
          </div>
        </motion.div>`;

code = code.replace(oldCards, newCards);

fs.writeFileSync('src/components/admin/OverviewDashboard.jsx', code);
console.log("Updated cards");
