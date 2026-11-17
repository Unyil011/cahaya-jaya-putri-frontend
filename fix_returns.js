import fs from 'fs';

// 1. Fix ReturnsManagement.jsx to read item.action instead of item.action_preference
let rmCode = fs.readFileSync('src/components/admin/ReturnsManagement.jsx', 'utf8');
rmCode = rmCode.replace(/{item\.action_preference === 'refunded' \? \(/g, "{(item.action_preference || item.action) === 'refunded' ? (");
rmCode = rmCode.replace(/\) : item\.action_preference === 'replaced' \? \(/g, ") : (item.action_preference || item.action) === 'replaced' ? (");
fs.writeFileSync('src/components/admin/ReturnsManagement.jsx', rmCode);

// 2. Fix ClientActiveOrders.jsx to not hide 'complained' orders
let caoCode = fs.readFileSync('src/components/client/ClientActiveOrders.jsx', 'utf8');
caoCode = caoCode.replace(/\.neq\('status', 'complained'\)/g, "");
fs.writeFileSync('src/components/client/ClientActiveOrders.jsx', caoCode);

console.log("Fixed ReturnsManagement Permintaan SPPG and ClientActiveOrders missing complained orders");
