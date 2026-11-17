import fs from 'fs';
let code = fs.readFileSync('src/components/admin/ClientManagement.jsx', 'utf8');

code = code.replace(/client\.name\.toLowerCase/g, "(client.name || '').toLowerCase");
code = code.replace(/client\.email\.toLowerCase/g, "(client.email || '').toLowerCase");

fs.writeFileSync('src/components/admin/ClientManagement.jsx', code);
console.log("Fixed ClientManagement undefined crashes");
