import fs from 'fs';
let code = fs.readFileSync('src/pages/AdminDashboard.jsx', 'utf8');

code = code.replace('<InventoryManagement isDarkMode={isDarkMode} />', '<InventoryManagement isDarkMode={isDarkMode} showConfirm={showConfirm} />');
code = code.replace('<ClientManagement isDarkMode={isDarkMode} />', '<ClientManagement isDarkMode={isDarkMode} showConfirm={showConfirm} />');

fs.writeFileSync('src/pages/AdminDashboard.jsx', code);
console.log("Updated AdminDashboard props");
