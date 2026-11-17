import fs from 'fs';

// 1. ClientActiveOrders.jsx
let cao = fs.readFileSync('src/components/client/ClientActiveOrders.jsx', 'utf8');
if (cao.includes('custom_order_date')) {
  console.log('ClientActiveOrders already includes custom_order_date');
} else {
  cao = cao.replace(/created_at,\s*order_items/g, "created_at,\n          custom_order_date,\n          order_items");
  fs.writeFileSync('src/components/client/ClientActiveOrders.jsx', cao, 'utf8');
  console.log('Updated ClientActiveOrders.jsx successfully');
}

// 2. ClientHistory.jsx
let ch = fs.readFileSync('src/components/client/ClientHistory.jsx', 'utf8');
if (ch.includes('custom_order_date,\n') || ch.includes('custom_order_date,\r\n')) {
  console.log('ClientHistory already includes custom_order_date in select');
} else {
  ch = ch.replace(/created_at,\s*order_items/g, "created_at,\n          custom_order_date,\n          order_items");
  fs.writeFileSync('src/components/client/ClientHistory.jsx', ch, 'utf8');
  console.log('Updated ClientHistory.jsx successfully');
}

// 3. InventoryManagement.jsx responsive adjustments
let inv = fs.readFileSync('src/components/admin/InventoryManagement.jsx', 'utf8');
inv = inv.replace('<div className="flex gap-4">\n                  <div className="flex-1">\n                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">\n                      HPP Standar (Modal)',
                  '<div className="flex flex-col sm:flex-row gap-4">\n                  <div className="flex-1">\n                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">\n                      HPP Standar (Modal)');

// Also handle CRLF for InventoryManagement
inv = inv.replace('<div className="flex gap-4">\r\n                  <div className="flex-1">\r\n                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">\r\n                      HPP Standar (Modal)',
                  '<div className="flex flex-col sm:flex-row gap-4">\r\n                  <div className="flex-1">\r\n                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">\r\n                      HPP Standar (Modal)');

fs.writeFileSync('src/components/admin/InventoryManagement.jsx', inv, 'utf8');
console.log('Updated InventoryManagement.jsx responsive adjustments successfully');
