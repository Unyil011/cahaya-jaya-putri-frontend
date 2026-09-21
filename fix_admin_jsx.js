import fs from 'fs';
let code = fs.readFileSync('src/pages/AdminDashboard.jsx', 'utf8');

// Replace usages in JSX
code = code.replace(/<LayoutDashboard/g, "<Home");
code = code.replace(/<FileText/g, "<Inbox");
code = code.replace(/<CheckCircle/g, "<History");
code = code.replace(/<PackageOpen/g, "<Undo2");
code = code.replace(/<Archive/g, "<Boxes");

fs.writeFileSync('src/pages/AdminDashboard.jsx', code);
console.log("Replaced all old icon usages with new ones in AdminDashboard");
