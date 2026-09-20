import fs from 'fs';
let code = fs.readFileSync('src/pages/ClientDashboard.jsx', 'utf8');

code = code.replace(/const user = JSON\.parse\(localStorage\.getItem\('user'\)\) \|\| \{\};/, "const user = JSON.parse(localStorage.getItem('user')) || {};\n  const clientName = user.name ? user.name : (user.email ? user.email.split('@')[0] : 'Client');");

code = code.replace(/<h2 className="text-xl font-bold truncate">Dapur MBG<\/h2>/, '<h2 className="text-xl font-bold truncate">SPPG {clientName}</h2>');
code = code.replace(/<p className="text-xs font-bold text-gray-700 dark:text-gray-200">Hi, SPPG<\/p>/, '<p className="text-xs font-bold text-gray-700 dark:text-gray-200 truncate max-w-[100px]">Hi, {clientName}</p>');

fs.writeFileSync('src/pages/ClientDashboard.jsx', code);
console.log('Fixed Client UI');
