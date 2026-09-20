import fs from 'fs';
let code = fs.readFileSync('src/pages/AdminDashboard.jsx', 'utf8');
code = code.replace(/fetchOrders\(false\);/, `if (document.activeElement.tagName !== 'INPUT') { fetchOrders(false); }`);
fs.writeFileSync('src/pages/AdminDashboard.jsx', code);
