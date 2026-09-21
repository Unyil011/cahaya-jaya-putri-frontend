import fs from 'fs';
let code = fs.readFileSync('src/pages/ClientDashboard.jsx', 'utf8');

// Fix Topbar mobile icons
const topbarReplacement = `<h1 className="text-lg md:text-xl font-bold text-mbg-blue-900 dark:text-white transition-colors flex items-center gap-2">
              {currentView === 'create' ? <ShoppingCart className="w-5 h-5 text-mbg-blue-600 md:hidden" /> : currentView === 'active' ? <Package className="w-5 h-5 text-mbg-blue-600 md:hidden" /> : <History className="w-5 h-5 text-mbg-blue-600 md:hidden" />}
              {currentView === 'create' ? 'Buat Pesanan Baru' : currentView === 'active' ? 'Pesanan Berjalan' : 'Riwayat Pesanan'}
            </h1>`;
code = code.replace(/<h1 className="text-lg md:text-xl font-bold text-mbg-blue-900 dark:text-white transition-colors flex items-center gap-2">[\s\S]*?<\/h1>/, topbarReplacement);

// Fix Bottom Navigation icons
const navReplacement = `<button
          onClick={() => setCurrentView('create')}
          className={\`relative p-3 rounded-2xl flex flex-col items-center gap-1 transition-all \${currentView === 'create' ? 'text-mbg-blue-600 bg-mbg-blue-50 dark:bg-mbg-blue-900/30' : 'text-gray-500'}\`}
        >
          <ShoppingCart className="w-6 h-6" />
        </button>`;
code = code.replace(/<button[\s\S]*?onClick=\{\(\) => setCurrentView\('create'\)\}[\s\S]*?className=\{`relative p-3 rounded-2xl flex flex-col items-center gap-1 transition-all[^`]+`\}[\s\S]*?>[\s\S]*?<Plus className="w-6 h-6" \/>[\s\S]*?<\/button>/, navReplacement);

fs.writeFileSync('src/pages/ClientDashboard.jsx', code);
console.log("Updated ClientDashboard mobile icons");
