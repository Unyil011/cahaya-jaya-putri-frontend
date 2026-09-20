import fs from 'fs';
let code = fs.readFileSync('src/components/admin/HistoryOrders.jsx', 'utf8');

if (!code.includes('import { supabase }')) {
  code = code.replace("import { motion, AnimatePresence } from 'framer-motion';", "import { motion, AnimatePresence } from 'framer-motion';\nimport { supabase } from '../../supabaseClient';");
}

const toggleReplacement = `const handleTogglePayment = async (order, newStatus) => {
    const toastId = toast.loading('Mengubah status...');
    try {
      const { error } = await supabase
        .from('orders')
        .update({ payment_status: newStatus })
        .eq('id', order.id);
        
      if (error) throw error;
      
      setOrders(orders.map(o => o.id === order.id ? { ...o, paymentStatus: newStatus } : o));
      setProofModalOrder(null);
      toast.success(\`Status pembayaran diubah menjadi \${newStatus}\`, { id: toastId });
    } catch (error) {
      console.error(error);
      toast.error('Gagal mengubah status.', { id: toastId });
    }
  };`;

code = code.replace(/const handleTogglePayment = async[\s\S]*?toast\.error\('Gagal mengubah status\.', \{ id: toastId \}\);\s*\}\s*\};/, toggleReplacement);

// Also remove the download image button since we have a direct link now
const imgReplacement = `<img src={proofModalOrder.paymentProofUrl} alt="Bukti Pembayaran" className="max-h-64 object-contain" />
                    <a
                      href={proofModalOrder.paymentProofUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="absolute top-2 right-2 p-2 bg-white/90 rounded-lg shadow-sm text-gray-700 hover:text-mbg-blue-600 transition-colors"
                      title="Buka Gambar Asli"
                    >
                      <Download className="w-5 h-5" />
                    </a>`;
code = code.replace(/<img src=\{proofModalOrder\.paymentProofUrl\} alt="Bukti Pembayaran" className="max-h-64 object-contain" \/>[\s\S]*?<\/button>/, imgReplacement);

fs.writeFileSync('src/components/admin/HistoryOrders.jsx', code);
console.log('Fixed HistoryOrders');
