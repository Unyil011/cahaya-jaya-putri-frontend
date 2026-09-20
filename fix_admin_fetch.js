import fs from 'fs';
let code = fs.readFileSync('src/pages/AdminDashboard.jsx', 'utf8');

// Update fetch
code = code.replace(/\.order\('created_at', \{ ascending: false \}\);/, ".eq('is_deleted_by_admin', false)\n        .order('created_at', { ascending: false });");

fs.writeFileSync('src/pages/AdminDashboard.jsx', code);
console.log('Fixed AdminDashboard fetch soft delete');
