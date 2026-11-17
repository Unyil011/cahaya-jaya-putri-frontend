import fs from 'fs';
let code = fs.readFileSync('src/components/admin/InventoryManagement.jsx', 'utf8');

const oldUpdate = `update({ item_name: formData.name, stock: formData.stock, unit: formData.unit, hpp: formData.hpp, selling_price: formData.sellingPrice })`;
const newUpdate = `update({ item_name: formData.name, stock: formData.stock, unit: formData.unit, default_price: formData.default_price })`;

const oldInsert = `insert([{ item_name: formData.name, stock: formData.stock, unit: formData.unit, hpp: formData.hpp, selling_price: formData.sellingPrice }])`;
const newInsert = `insert([{ item_name: formData.name, stock: formData.stock, unit: formData.unit, default_price: formData.default_price }])`;

code = code.replace(oldUpdate, newUpdate);
code = code.replace(oldInsert, newInsert);

fs.writeFileSync('src/components/admin/InventoryManagement.jsx', code);
console.log("Fixed InventoryManagement insert/update columns");
