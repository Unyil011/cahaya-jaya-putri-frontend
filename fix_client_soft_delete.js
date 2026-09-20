import fs from 'fs';
let code = fs.readFileSync('src/components/client/ClientHistory.jsx', 'utf8');

// Update fetch
code = code.replace(/\.eq\('user_id', userData\.id\)/, ".eq('user_id', userData.id)\n        .eq('is_deleted_by_client', false)");

// Update handleDelete
code = code.replace(/await supabase\.from\('orders'\)\.delete\(\)\.eq\('id', deleteConfirm\.id\);/, "await supabase.from('orders').update({ is_deleted_by_client: true }).eq('id', deleteConfirm.id);");

// Update handleBulkDelete
code = code.replace(/await Promise\.all\(selectedIds\.map\(id => supabase\.from\('orders'\)\.delete\(\)\.eq\('id', id\)\)\);/, "await Promise.all(selectedIds.map(id => supabase.from('orders').update({ is_deleted_by_client: true }).eq('id', id)));");

fs.writeFileSync('src/components/client/ClientHistory.jsx', code);
console.log('Fixed ClientHistory soft delete');
