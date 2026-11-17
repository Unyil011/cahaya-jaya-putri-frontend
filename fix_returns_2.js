import fs from 'fs';

// 1. Fix ReturnsManagement.jsx mapping
let rmCode = fs.readFileSync('src/components/admin/ReturnsManagement.jsx', 'utf8');
rmCode = rmCode.replace(/action_preference: r\.action_preference/g, "action_preference: r.action_preference, action: r.action");
fs.writeFileSync('src/components/admin/ReturnsManagement.jsx', rmCode);

// 2. Fix AdminDashboard.jsx pendingReturnsCount logic
let adCode = fs.readFileSync('src/pages/AdminDashboard.jsx', 'utf8');
adCode = adCode.replace(
  /setPendingReturnsCount\(data\.length\);/g,
  "setPendingReturnsCount(new Set(data.map(r => r.order_id)).size);"
);

// 3. Rename "Manajemen Retur" to "Ajuan Retur" in sidebar
adCode = adCode.replace(/label="Manajemen Retur"/g, 'label="Ajuan Retur"');

fs.writeFileSync('src/pages/AdminDashboard.jsx', adCode);

console.log("Fixed Returns bugs part 2");
