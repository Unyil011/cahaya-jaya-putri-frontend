import fs from 'fs';
let code = fs.readFileSync('src/pages/AdminDashboard.jsx', 'utf8');

// The polling interval is:
// const interval = setInterval(() => {
//   if (document.activeElement.tagName !== 'INPUT') { fetchOrders(false); }
// }, 15000);
// return () => clearInterval(interval);

// We will just replace the setInterval with nothing.
code = code.replace(/const interval = setInterval\([\s\S]*?clearInterval\(interval\);/g, '');

fs.writeFileSync('src/pages/AdminDashboard.jsx', code);
console.log('Polling removed');
