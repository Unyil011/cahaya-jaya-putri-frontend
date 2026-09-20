import fs from 'fs';
let code = fs.readFileSync('src/pages/AdminDashboard.jsx', 'utf8');

const replacement = `const user = JSON.parse(localStorage.getItem('user')) || {};
  let rawAdminName = user.name ? user.name : (user.email ? user.email.split('@')[0] : 'Admin');
  const adminName = rawAdminName.charAt(0).toUpperCase() + rawAdminName.slice(1).toLowerCase();`;

code = code.replace(/const user = JSON\.parse\(localStorage\.getItem\('user'\)\) \|\| \{\};/, replacement);

code = code.replace(/<p className="text-xs font-bold text-gray-700 dark:text-gray-200">Hi, admin<\/p>/, '<p className="text-xs font-bold text-gray-700 dark:text-gray-200">Hi, {adminName}</p>');

fs.writeFileSync('src/pages/AdminDashboard.jsx', code);
