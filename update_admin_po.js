import fs from 'fs';

let code = fs.readFileSync('src/pages/AdminDashboard.jsx', 'utf8');

// 1. Add import
if (!code.includes("import PurchaseOrders from '../components/admin/PurchaseOrders';")) {
  code = code.replace(
    "import StockHistory from '../components/admin/StockHistory';",
    "import StockHistory from '../components/admin/StockHistory';\nimport PurchaseOrders from '../components/admin/PurchaseOrders';"
  );
}

// 2. Add to desktop sidebar nav
if (!code.includes("label=\"Surat Pesanan\"")) {
  code = code.replace(
    '<NavItem icon={PackagePlus} label="Update Stok" isActive={currentView === \'stock_updates\'} onClick={() => setCurrentView(\'stock_updates\')} />',
    '<NavItem icon={PackagePlus} label="Update Stok" isActive={currentView === \'stock_updates\'} onClick={() => setCurrentView(\'stock_updates\')} />\n          <NavItem icon={FileText} label="Surat Pesanan" isActive={currentView === \'purchase_orders\'} onClick={() => setCurrentView(\'purchase_orders\')} />'
  );
}

// 3. Add to Topbar Title
if (!code.includes("Surat Pesanan</>")) {
  code = code.replace(
    "<><PackagePlus className=\"w-5 h-5 text-mbg-blue-600 md:hidden\" /> Update Stok</>",
    "<><PackagePlus className=\"w-5 h-5 text-mbg-blue-600 md:hidden\" /> Update Stok</>\n              ) : currentView === 'purchase_orders' ? (\n                <><FileText className=\"w-5 h-5 text-mbg-blue-600 md:hidden\" /> Surat Pesanan</>"
  );
}

// 4. Add to Topbar Subtitle
if (!code.includes("Buat dan cetak surat pesanan barang ke supplier.")) {
  code = code.replace(
    ": currentView === 'stock_updates' ? 'Kelola barang masuk dan pantau riwayat pergerakan stok.' : 'Kelola akun SPPG.'",
    ": currentView === 'stock_updates' ? 'Kelola barang masuk dan pantau riwayat pergerakan stok.' : currentView === 'purchase_orders' ? 'Buat dan cetak surat pesanan barang ke supplier.' : 'Kelola akun SPPG.'"
  );
}

// 5. Add to View Switching in Main Content
if (!code.includes("<PurchaseOrders isDarkMode={isDarkMode} />")) {
  code = code.replace(
    ") : currentView === 'inventory' ? (\n              <InventoryManagement isDarkMode={isDarkMode} showConfirm={showConfirm} setCurrentView={setCurrentView} />",
    ") : currentView === 'inventory' ? (\n              <InventoryManagement isDarkMode={isDarkMode} showConfirm={showConfirm} setCurrentView={setCurrentView} />\n            ) : currentView === 'purchase_orders' ? (\n              <PurchaseOrders isDarkMode={isDarkMode} />"
  );
}

// 6. Add to Mobile Bottom Nav
if (!code.includes("setCurrentView('purchase_orders')")) {
  const stockBtn = `<button
            onClick={() => setCurrentView('stock_updates')}
            className={\`p-2 rounded-2xl flex flex-col items-center gap-1 transition-all \${currentView === 'stock_updates' ? 'text-mbg-blue-600 bg-mbg-blue-50 dark:bg-mbg-blue-900/30 dark:text-mbg-blue-400' : 'text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-slate-800'}\`}
          >
            <PackagePlus className="w-5 h-5" />
          </button>`;

  const stockWithPOBtn = `<button
            onClick={() => setCurrentView('stock_updates')}
            className={\`p-1.5 rounded-xl flex flex-col items-center gap-1 transition-all \${currentView === 'stock_updates' ? 'text-mbg-blue-600 bg-mbg-blue-50 dark:bg-mbg-blue-900/30 dark:text-mbg-blue-400' : 'text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-slate-800'}\`}
            title="Update Stok"
          >
            <PackagePlus className="w-5 h-5" />
          </button>

          <button
            onClick={() => setCurrentView('purchase_orders')}
            className={\`p-1.5 rounded-xl flex flex-col items-center gap-1 transition-all \${currentView === 'purchase_orders' ? 'text-mbg-blue-600 bg-mbg-blue-50 dark:bg-mbg-blue-900/30 dark:text-mbg-blue-400' : 'text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-slate-800'}\`}
            title="Surat Pesanan"
          >
            <FileText className="w-5 h-5" />
          </button>`;

  // Replace regardless of CRLF
  code = code.replace(stockBtn.replace(/\r\n/g, '\n'), stockWithPOBtn);
  code = code.replace(stockBtn.replace(/\n/g, '\r\n'), stockWithPOBtn.replace(/\n/g, '\r\n'));

  // Also adjust container padding to px-1 for mobile
  code = code.replace('flex justify-between px-2 items-center pb-safe pt-2', 'flex justify-between px-1 items-center pb-safe pt-2');
}

fs.writeFileSync('src/pages/AdminDashboard.jsx', code, 'utf8');
console.log('AdminDashboard.jsx updated successfully with PurchaseOrders');
