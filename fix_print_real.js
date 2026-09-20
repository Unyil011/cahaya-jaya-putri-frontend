import fs from 'fs';
let code = fs.readFileSync('src/pages/AdminDashboard.jsx', 'utf8');

// Insert import if not present
if (!code.includes('generateInvoicePDF')) {
  code = code.replace("import { supabase } from '../supabaseClient';", "import { supabase } from '../supabaseClient';\nimport { generateInvoicePDF } from '../utils/pdfGenerator';");
}

const replacement = `const handlePrint = async (type, orderId, orderNumber = '') => {
  const order = orders.find(o => o.id === orderId);
  if (order) {
    generateInvoicePDF(order, type);
    toast.success(type + ' berhasil diunduh!');
  }
};`;

code = code.replace(/const handlePrint = async[\s\S]*?Silakan gunakan fitur cetak bawaan browser \(Ctrl\+P\)\.'\);\s*\};/, replacement);

fs.writeFileSync('src/pages/AdminDashboard.jsx', code);
console.log('Fixed handlePrint again!');
