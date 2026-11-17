import fs from 'fs';

let code = fs.readFileSync('src/pages/AdminDashboard.jsx', 'utf8');

const additionalNav = `
          <button
            onClick={() => setCurrentView('stock_updates')}
            className={\`shrink-0 p-3 rounded-2xl flex flex-col items-center gap-1 transition-all \${currentView === 'stock_updates' ? 'text-mbg-blue-600 bg-mbg-blue-50 dark:bg-mbg-blue-900/30 dark:text-mbg-blue-400' : 'text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-slate-800'}\`}
          >
            <PackagePlus className="w-6 h-6" />
          </button>
          <button
            onClick={() => setCurrentView('clients')}
            className={\`shrink-0 p-3 rounded-2xl flex flex-col items-center gap-1 transition-all \${currentView === 'clients' ? 'text-mbg-blue-600 bg-mbg-blue-50 dark:bg-mbg-blue-900/30 dark:text-mbg-blue-400' : 'text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-slate-800'}\`}
          >
            <Users className="w-6 h-6" />
          </button>
        </div>`;

code = code.replace(
    '<div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-t border-gray-200 dark:border-slate-800 flex justify-around items-center p-3 z-50 transition-colors">',
    '<div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-t border-gray-200 dark:border-slate-800 flex overflow-x-auto hide-scrollbar justify-start sm:justify-around items-center p-2 px-4 gap-2 z-50 transition-colors">'
);

// add shrink-0 to existing buttons
code = code.replace(/className={\`relative p-3 rounded-2xl flex flex-col items-center gap-1/g, "className={`shrink-0 relative p-3 rounded-2xl flex flex-col items-center gap-1");
code = code.replace(/className={\`p-3 rounded-2xl flex flex-col items-center gap-1/g, "className={`shrink-0 p-3 rounded-2xl flex flex-col items-center gap-1");

code = code.replace(
    `            <Boxes className="w-6 h-6" />\n          </button>\n        </div>`,
    `            <Boxes className="w-6 h-6" />\n          </button>\n${additionalNav}`
);

fs.writeFileSync('src/pages/AdminDashboard.jsx', code);
console.log("Updated Mobile Nav!");
