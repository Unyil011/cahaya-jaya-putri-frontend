import fs from 'fs';
let code = fs.readFileSync('src/components/admin/InventoryManagement.jsx', 'utf8');

const cardsHTML = `
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
`;

if (!code.includes("Dashboard Cards")) {
    // Find the return statement
    code = code.replace(
        /return \(\s*<div className="flex flex-col h-full space-y-4">/, 
        `return (\n    <div className="flex flex-col h-full space-y-4">\n${cardsHTML}`
    );
    // Wait, let's look at what's in return
    // Maybe it's not flex flex-col h-full space-y-4
}
fs.writeFileSync('inject.js', code);
