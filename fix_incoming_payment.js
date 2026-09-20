import fs from 'fs';
let code = fs.readFileSync('src/components/admin/IncomingOrders.jsx', 'utf8');

// Ensure supabase is imported
if (!code.includes('import { supabase }')) {
  code = code.replace("import { motion, AnimatePresence } from 'framer-motion';", "import { motion, AnimatePresence } from 'framer-motion';\nimport { supabase } from '../../supabaseClient';");
}

// Add handleTogglePayment inside the component if not exists
if (!code.includes('const handleTogglePayment = async')) {
  const func = `  const handleTogglePayment = async (order, newStatus) => {
    const toastId = toast.loading('Mengubah status pembayaran...');
    try {
      const { error } = await supabase.from('orders').update({ payment_status: newStatus }).eq('id', order.id);
      if (error) throw error;
      setOrders(orders.map(o => o.id === order.id ? { ...o, paymentStatus: newStatus } : o));
      toast.success('Status pembayaran diubah menjadi ' + newStatus, { id: toastId });
    } catch (error) {
      console.error(error);
      toast.error('Gagal mengubah status', { id: toastId });
    }
  };`;
  code = code.replace(/useEffect\(\(\) => \{/, func + '\n\n  useEffect(() => {');
}

// Add the button
const printButtonRegex = /<motion\.button\s+whileHover=\{\{ scale: 1\.05 \}\}\s+whileTap=\{\{ scale: 0\.95 \}\}\s+onClick=\{.*handlePrint\('Invoice'[\s\S]*?<\/motion\.button>/;

const newButtons = `<motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handlePrint('Invoice', order.id, order.orderNumber)}
                            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-700 shadow-sm"
                          >
                            <FileText className="w-4 h-4" />
                            Invoice
                          </motion.button>

                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleTogglePayment(order, order.paymentStatus === 'Lunas' ? 'Belum Lunas' : 'Lunas')}
                            className={\`flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl shadow-sm text-white \${order.paymentStatus === 'Lunas' ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-400 hover:bg-gray-500'}\`}
                          >
                            {order.paymentStatus === 'Lunas' ? 'LUNAS (Batalkan)' : 'Tandai Lunas'}
                          </motion.button>`;

code = code.replace(printButtonRegex, newButtons);

fs.writeFileSync('src/components/admin/IncomingOrders.jsx', code);
console.log('Fixed IncomingOrders payment');
