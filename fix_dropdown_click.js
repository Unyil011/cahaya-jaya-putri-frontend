import fs from 'fs';
let code = fs.readFileSync('src/components/admin/InventoryManagement.jsx', 'utf8');

// Change onClick to onMouseDown
code = code.replace(/onClick=\{\(\) => \{/g, 'onMouseDown={(e) => { e.preventDefault();');

fs.writeFileSync('src/components/admin/InventoryManagement.jsx', code);
console.log("Fixed dropdown onClick to onMouseDown");
