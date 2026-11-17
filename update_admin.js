import fs from 'fs';

let content = fs.readFileSync('src/pages/AdminDashboard.jsx', 'utf8');

// Import StockHistory
if (!content.includes('import StockHistory')) {
    content = content.replace("import ClientManagement from '../components/admin/ClientManagement';", "import ClientManagement from '../components/admin/ClientManagement';\nimport StockHistory from '../components/admin/StockHistory';");
}

// Add the view to rendering
if (!content.includes('currentView === \'stock_updates\'')) {
    content = content.replace(
        ") : currentView === 'inventory' ? (",
        ") : currentView === 'stock_updates' ? (\n              <StockHistory isDarkMode={isDarkMode} showConfirm={showConfirm} setCurrentView={setCurrentView} />\n            ) : currentView === 'inventory' ? ("
    );
}

// Add setCurrentView prop to InventoryManagement
if (content.includes('<InventoryManagement isDarkMode={isDarkMode} showConfirm={showConfirm} />')) {
    content = content.replace(
        '<InventoryManagement isDarkMode={isDarkMode} showConfirm={showConfirm} />',
        '<InventoryManagement isDarkMode={isDarkMode} showConfirm={showConfirm} setCurrentView={setCurrentView} />'
    );
}

fs.writeFileSync('src/pages/AdminDashboard.jsx', content);
console.log("Updated AdminDashboard.jsx");
