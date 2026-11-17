import fs from 'fs';

let code = fs.readFileSync('src/components/admin/InventoryManagement.jsx', 'utf8');

// Add format currency function if not exists
if (!code.includes('formatCurrency')) {
    code = code.replace("const fetchInventories =", `
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount || 0);
  };
  
  const fetchInventories =`);
}

// Calculate summary
if (!code.includes('const totalModal =')) {
    code = code.replace("const filteredInventories =", `
  const totalMacam = inventories.length;
  const totalFisik = inventories.reduce((sum, item) => sum + (item.stock > 0 ? item.stock : 0), 0);
  const totalModal = inventories.reduce((sum, item) => sum + (item.stock > 0 ? item.stock * (item.hpp || 0) : 0), 0);

  const filteredInventories =`);
}

// Inject cards
if (!code.includes('<div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">')) {
    code = code.replace('<div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden flex flex-col flex-1">', `
        {/* Dashboard Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 flex flex-col">
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Total Macam Barang</span>
            <span className="text-2xl font-bold text-gray-900 dark:text-white">{totalMacam} Item</span>
          </div>
          <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 flex flex-col">
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Total Fisik Barang</span>
            <span className="text-2xl font-bold text-gray-900 dark:text-white">{totalFisik} Pcs</span>
          </div>
          <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 flex flex-col">
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Total Modal Mengendap</span>
            <span className="text-2xl font-bold text-mbg-blue-600 dark:text-mbg-blue-400">{formatCurrency(totalModal)}</span>
          </div>
        </div>
        
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden flex flex-col flex-1">`);
}

// Replace button onClick
code = code.replace(
    /onClick=\{\(\) => setIsUpdateStockModalOpen\(true\)\}/g,
    "onClick={() => setCurrentView('stock_updates')}"
);

// Add setCurrentView to props
code = code.replace(
    'const InventoryManagement = () => {',
    'const InventoryManagement = ({ setCurrentView }) => {'
);

fs.writeFileSync('src/components/admin/InventoryManagement.jsx', code);
console.log("Updated InventoryManagement.jsx");
