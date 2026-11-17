import fs from 'fs';
let code = fs.readFileSync('src/components/admin/InventoryManagement.jsx', 'utf8');

// 1. Replace all default_price with hpp in state and usage
code = code.replace(/default_price/g, 'hpp');

// 2. Fix the insert/update queries to use formData.hpp for the hpp column.
// Previously I set them to: update({ item_name: formData.name, stock: formData.stock, unit: formData.unit, hpp: formData.hpp })
const oldUpdate = `update({ item_name: formData.name, stock: formData.stock, unit: formData.unit, hpp: formData.hpp })`;
const oldInsert = `insert([{ item_name: formData.name, stock: formData.stock, unit: formData.unit, hpp: formData.hpp }])`;
// Wait, my previous commit was default_price: formData.default_price
code = code.replace(`hpp: formData.hpp`, `hpp: formData.hpp || null`); 
// Actually, it will now be hpp: formData.hpp (since I replaced default_price with hpp globally).
// Let's make sure it parses the number correctly or saves it as is.
// Supabase handles string numbers just fine.

fs.writeFileSync('src/components/admin/InventoryManagement.jsx', code);
console.log("Fixed InventoryManagement to use hpp instead of default_price");
