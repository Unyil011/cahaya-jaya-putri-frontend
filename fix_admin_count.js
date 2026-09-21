import fs from 'fs';
let code = fs.readFileSync('src/pages/AdminDashboard.jsx', 'utf8');
code = code.replace(
  "const activeOrdersCount = orders.filter(o => o.status !== 'completed').length;",
  "const activeOrdersCount = orders.filter(o => o.status !== 'completed' && o.status !== 'shipped_return').length;"
);
fs.writeFileSync('src/pages/AdminDashboard.jsx', code);
console.log("Fixed AdminDashboard activeOrdersCount");
