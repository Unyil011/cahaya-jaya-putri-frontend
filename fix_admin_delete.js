import fs from 'fs';
let code = fs.readFileSync('src/components/admin/HistoryOrders.jsx', 'utf8');

// The original delete uses `api.delete`
// Let's check how it's implemented.
code = code.replace(/await api\.delete\(\`\/orders\/\$\{deleteConfirm\.id\}\`\);/, "await supabase.from('orders').update({ is_deleted_by_admin: true }).eq('id', deleteConfirm.id);");

code = code.replace(/await Promise\.all\(selectedIds\.map\(id => api\.delete\(\`\/orders\/\$\{id\}\`\)\)\);/, "await Promise.all(selectedIds.map(id => supabase.from('orders').update({ is_deleted_by_admin: true }).eq('id', id)));");

fs.writeFileSync('src/components/admin/HistoryOrders.jsx', code);
console.log('Fixed HistoryOrders delete');
