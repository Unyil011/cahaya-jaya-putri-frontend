import fs from 'fs';
let code = fs.readFileSync('src/components/client/ClientHistory.jsx', 'utf8');

if (!code.includes('generateInvoicePDF')) {
  code = code.replace("import { supabase } from '../../supabaseClient';", "import { supabase } from '../../supabaseClient';\nimport { generateInvoicePDF } from '../../utils/pdfGenerator';");
}

code = code.replace(/toast\.error\('Fitur PDF sedang dalam perbaikan \(Migrasi\)\.', \{ id: toastId \}\);/, `generateInvoicePDF(selectedOrderDetails, 'Invoice');\ntoast.success('Laporan berhasil diunduh!', { id: toastId });`);

fs.writeFileSync('src/components/client/ClientHistory.jsx', code);
console.log('Fixed ClientHistory PDF');
