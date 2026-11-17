import fs from 'fs';
let code = fs.readFileSync('src/pages/ResetPassword.jsx', 'utf8');
code = code.replace(/navigate\('\/login'\)/g, "navigate('/')");
code = code.replace(/<Link to="\/login"/g, '<Link to="/"');
fs.writeFileSync('src/pages/ResetPassword.jsx', code);
console.log("Fixed ResetPassword navigation");
