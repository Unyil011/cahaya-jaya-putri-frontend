import fs from 'fs';
let code = fs.readFileSync('src/pages/AdminDashboard.jsx', 'utf8');

// Replace imports
code = code.replace(/import \{ LayoutDashboard, /g, "import { Home, Inbox, History, Undo2, Boxes, ");
code = code.replace(/<NavItem icon=\{LayoutDashboard\} label="Ringkasan"/g, "<NavItem icon={Home} label=\"Beranda\"");
code = code.replace(/<NavItem icon=\{FileText\} label="Pesanan Masuk"/g, "<NavItem icon={Inbox} label=\"Pesanan Masuk\"");
code = code.replace(/<NavItem icon=\{CheckCircle\} label="Riwayat Pesanan"/g, "<NavItem icon={History} label=\"Riwayat Pesanan\"");
code = code.replace(/<NavItem icon=\{PackageOpen\} label="Manajemen Retur"/g, "<NavItem icon={Undo2} label=\"Manajemen Retur\"");
code = code.replace(/<NavItem icon=\{Archive\} label="Data Barang"/g, "<NavItem icon={Boxes} label=\"Data Barang\"");

fs.writeFileSync('src/pages/AdminDashboard.jsx', code);
console.log('Fixed AdminDashboard icons');
