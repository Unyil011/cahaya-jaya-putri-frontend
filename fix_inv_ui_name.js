import fs from 'fs';
let code = fs.readFileSync('src/components/admin/InventoryManagement.jsx', 'utf8');

code = code.replace(/{item\.name}/g, '{item.item_name}');

fs.writeFileSync('src/components/admin/InventoryManagement.jsx', code);
console.log("Fixed item.name to item.item_name in UI render");
