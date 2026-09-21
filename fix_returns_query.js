import fs from 'fs';
let code = fs.readFileSync('src/components/admin/ReturnsManagement.jsx', 'utf8');
code = code.replace(
  ".select('*', orders(id, order_number, profiles(name, email)), order_items(item_name, unit)')",
  ".select('*, orders!inner(id, order_number, profiles(name, email)), order_items(item_name, unit)')\n        .eq('orders.status', 'complained')"
);
code = code.replace(
  ".select('*, orders(id, order_number, profiles(name, email)), order_items(item_name, unit)')",
  ".select('*, orders!inner(id, order_number, profiles(name, email)), order_items(item_name, unit)')\n        .eq('orders.status', 'complained')"
);
fs.writeFileSync('src/components/admin/ReturnsManagement.jsx', code);
console.log("Fixed ReturnsManagement query");
