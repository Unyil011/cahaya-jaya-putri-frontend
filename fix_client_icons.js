import fs from 'fs';
let code = fs.readFileSync('src/pages/ClientDashboard.jsx', 'utf8');

// The client dashboard uses Plus, Package, History. Those are actually decent.
// But let's check if there is a 'Home' or 'Beranda' we should add?
// Currently it's: Buat Pesanan, Pesanan Berjalan, Riwayat Pesanan
// Let's add Home for Buat Pesanan? No, ShoppingCart is better for Buat Pesanan.
if (!code.includes('ShoppingCart')) {
    code = code.replace(/import \{ /, "import { ShoppingCart, ");
}
code = code.replace(/<NavItem icon=\{Plus\} label="Buat Pesanan"/g, "<NavItem icon={ShoppingCart} label=\"Buat Pesanan\"");

fs.writeFileSync('src/pages/ClientDashboard.jsx', code);
console.log('Fixed ClientDashboard icons');
