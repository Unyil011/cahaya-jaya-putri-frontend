import fs from 'fs';
let code = fs.readFileSync('src/pages/AdminDashboard.jsx', 'utf8');

const replacement = `const handlePrint = async (type, orderId, orderNumber = '') => {
  alert('Fitur cetak ' + type + ' belum tersedia secara otomatis di mode baru. Silakan gunakan fitur cetak bawaan browser (Ctrl+P).');
};`;

code = code.replace(/const handlePrint = async[\s\S]*?Gagal mengunduh dokumen'\);\s*\}/, replacement);

fs.writeFileSync('src/pages/AdminDashboard.jsx', code);
console.log('Fixed handlePrint');
