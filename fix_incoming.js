import fs from 'fs';
let code = fs.readFileSync('src/components/admin/IncomingOrders.jsx', 'utf8');
code = code.replace(/inv\.default_price/g, 'inv.hpp');
fs.writeFileSync('src/components/admin/IncomingOrders.jsx', code);
console.log("Fixed IncomingOrders to use inv.hpp");
