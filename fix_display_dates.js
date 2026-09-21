import fs from 'fs';

// Update AdminDashboard.jsx
let adminCode = fs.readFileSync('src/pages/AdminDashboard.jsx', 'utf8');
const oldAdminDate = `date: new Date(o.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) + ' WIB',`;
const newAdminDate = `date: (o.custom_order_date ? new Date(o.custom_order_date) : new Date(o.created_at)).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) + ' WIB',`;
adminCode = adminCode.replace(oldAdminDate, newAdminDate);
fs.writeFileSync('src/pages/AdminDashboard.jsx', adminCode);

// Update ClientHistory.jsx
let clientHistoryCode = fs.readFileSync('src/components/client/ClientHistory.jsx', 'utf8');
clientHistoryCode = clientHistoryCode.replace(oldAdminDate, newAdminDate);
fs.writeFileSync('src/components/client/ClientHistory.jsx', clientHistoryCode);

// Update ClientActiveOrders.jsx
let clientActiveCode = fs.readFileSync('src/components/client/ClientActiveOrders.jsx', 'utf8');
clientActiveCode = clientActiveCode.replace(oldAdminDate, newAdminDate);
fs.writeFileSync('src/components/client/ClientActiveOrders.jsx', clientActiveCode);

console.log("Updated date mappings");
