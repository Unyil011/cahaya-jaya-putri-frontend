import fs from 'fs';
let code = fs.readFileSync('src/pages/ClientDashboard.jsx', 'utf8');

const replacement = `const user = JSON.parse(localStorage.getItem('user')) || {};
  let rawClientName = user.name ? user.name : (user.email ? user.email.split('@')[0] : 'Client');
  const clientName = rawClientName.charAt(0).toUpperCase() + rawClientName.slice(1).toLowerCase();`;

code = code.replace(/const user = JSON\.parse\(localStorage\.getItem\('user'\)\) \|\| \{\};\n\s*const clientName = user\.name \? user\.name : \(user\.email \? user\.email\.split\('@'\)\[0\] : 'Client'\);/, replacement);

fs.writeFileSync('src/pages/ClientDashboard.jsx', code);
console.log('Capitalized clientName in ClientDashboard');
