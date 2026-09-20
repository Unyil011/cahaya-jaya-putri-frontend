import fs from 'fs';
let code = fs.readFileSync('src/pages/Login.jsx', 'utf8');

code = code.replace(/name: data\.user\.email\.split\('@'\)\[0\]/, "name: data.user.email.split('@')[0],\n          email: data.user.email");

fs.writeFileSync('src/pages/Login.jsx', code);
console.log('Fixed Login email insert');
