import fs from 'fs';
let code = fs.readFileSync('src/pages/AdminDashboard.jsx', 'utf8');

const oldMap = `        paymentStatus: o.payment_status,
        totalAmount: o.total_amount,
        items: o.order_items.map(i => ({`;

const newMap = `        paymentStatus: o.payment_status,
        paymentProofUrl: o.payment_proof_url,
        totalAmount: o.total_amount,
        items: o.order_items.map(i => ({`;

code = code.replace(oldMap, newMap);
fs.writeFileSync('src/pages/AdminDashboard.jsx', code);
console.log("Updated AdminDashboard.jsx");
