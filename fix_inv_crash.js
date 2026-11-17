import fs from 'fs';
let code = fs.readFileSync('src/components/admin/InventoryManagement.jsx', 'utf8');

code = code.replace(/item\.name\.toLowerCase/g, "(item.item_name || '').toLowerCase");
code = code.replace(/name: inventory\.name,/g, "name: inventory.item_name,");

fs.writeFileSync('src/components/admin/InventoryManagement.jsx', code);
console.log("Fixed undefined name crashes in InventoryManagement");
