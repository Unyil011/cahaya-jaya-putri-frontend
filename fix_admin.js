import fs from 'fs';
let code = fs.readFileSync('src/pages/AdminDashboard.jsx', 'utf8');

// 1. Remove the accidental StockHistory render from Topbar h1
code = code.replace(
`              ) : currentView === 'returns' ? (
                <><Undo2 className="w-5 h-5 text-orange-600 md:hidden" /> Manajemen Retur</>
              ) : currentView === 'stock_updates' ? (
              <StockHistory isDarkMode={isDarkMode} showConfirm={showConfirm} setCurrentView={setCurrentView} />
            ) : currentView === 'inventory' ? (`,
`              ) : currentView === 'returns' ? (
                <><Undo2 className="w-5 h-5 text-orange-600 md:hidden" /> Manajemen Retur</>
              ) : currentView === 'stock_updates' ? (
                <><History className="w-5 h-5 text-mbg-blue-600 md:hidden" /> Riwayat Stok</>
              ) : currentView === 'inventory' ? (`
);

// 2. Add StockHistory to the actual main content area
// Main content area looks like this:
//            ) : currentView === 'returns' ? (
//              <ReturnsManagement isDarkMode={isDarkMode} fetchOrders={fetchOrders} />
//            ) : currentView === 'inventory' ? (
code = code.replace(
`            ) : currentView === 'returns' ? (
              <ReturnsManagement isDarkMode={isDarkMode} fetchOrders={fetchOrders} />
            ) : currentView === 'inventory' ? (`,
`            ) : currentView === 'returns' ? (
              <ReturnsManagement isDarkMode={isDarkMode} fetchOrders={fetchOrders} />
            ) : currentView === 'stock_updates' ? (
              <StockHistory isDarkMode={isDarkMode} showConfirm={showConfirm} setCurrentView={setCurrentView} />
            ) : currentView === 'inventory' ? (`
);

// 3. Add to sidebar nav
// <NavItem icon={Boxes} label="Data Barang" isActive={currentView === 'inventory'} onClick={() => setCurrentView('inventory')} />
code = code.replace(
    `<NavItem icon={Boxes} label="Data Barang" isActive={currentView === 'inventory'} onClick={() => setCurrentView('inventory')} />`,
    `<NavItem icon={Boxes} label="Data Barang" isActive={currentView === 'inventory'} onClick={() => setCurrentView('inventory')} />\n          <NavItem icon={History} label="Riwayat Stok" isActive={currentView === 'stock_updates'} onClick={() => setCurrentView('stock_updates')} />`
);

fs.writeFileSync('src/pages/AdminDashboard.jsx', code);
console.log("Fixed AdminDashboard routing and Sidebar!");
