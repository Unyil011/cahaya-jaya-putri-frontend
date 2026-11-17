import fs from 'fs';
let code = fs.readFileSync('src/components/admin/InventoryManagement.jsx', 'utf8');

code = code.replace(`hpp: formData.hpp }])`, `hpp: formData.hpp || null }])`);

fs.writeFileSync('src/components/admin/InventoryManagement.jsx', code);
console.log("Fixed insert hpp || null");
