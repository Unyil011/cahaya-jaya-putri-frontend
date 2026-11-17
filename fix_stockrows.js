import fs from 'fs';
let code = fs.readFileSync('src/components/admin/InventoryManagement.jsx', 'utf8');

const oldLoop = `      for (const row of stockRows) {
        if (!row.id || row.quantity === '') continue;
        const item = inventories.find(inv => inv.id === row.id);`;

const newLoop = `      for (const row of updateStockItems) {
        if (!row.inventory_id || row.quantity === '') continue;
        const item = inventories.find(inv => inv.id === row.inventory_id);`;

code = code.replace(oldLoop, newLoop);
fs.writeFileSync('src/components/admin/InventoryManagement.jsx', code);
console.log("Fixed undefined stockRows variable in handleUpdateStockSubmit");
