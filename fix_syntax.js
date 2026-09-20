import fs from 'fs';
let code = fs.readFileSync('src/pages/AdminDashboard.jsx', 'utf8');

code = code.replace(/toast\.success\(type \+ ' berhasil diunduh!'\);\s*\}\s*\};\s*\};\s*const getStatusBadge/g, "toast.success(type + ' berhasil diunduh!');\n  }\n};\n\n  const getStatusBadge");

fs.writeFileSync('src/pages/AdminDashboard.jsx', code);
console.log('Fixed syntax error');
