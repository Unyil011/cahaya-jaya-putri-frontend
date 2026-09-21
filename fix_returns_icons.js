import fs from 'fs';
let code = fs.readFileSync('src/components/admin/ReturnsManagement.jsx', 'utf8');

// Add Truck and Wallet to imports if not there
if (!code.includes('Truck')) {
    code = code.replace("import { Check, ", "import { Truck, Wallet, Check, ");
}

// Replace Kirim Ulang icon
code = code.replace(/title="Kirim Ulang"[\s\S]*?<Package/g, 'title="Kirim Ulang"\n                                  >\n                                    <Truck');

// Replace Potong Tagihan icon
code = code.replace(/title="Potong Tagihan"[\s\S]*?<Check/g, 'title="Potong Tagihan"\n                                  >\n                                    <Wallet');

fs.writeFileSync('src/components/admin/ReturnsManagement.jsx', code);
console.log("Updated action icons in ReturnsManagement");
