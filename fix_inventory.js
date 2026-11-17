import fs from 'fs';
let code = fs.readFileSync('src/components/admin/InventoryManagement.jsx', 'utf8');
code = code.replace(/item_name: formData.itemName/g, "item_name: formData.name");
fs.writeFileSync('src/components/admin/InventoryManagement.jsx', code);
console.log("Fixed itemName mismatch in InventoryManagement");
