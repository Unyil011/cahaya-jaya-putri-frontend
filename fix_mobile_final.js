import fs from 'fs';

let code = fs.readFileSync('src/pages/AdminDashboard.jsx', 'utf8');

// First, fix the container div to be simple flex justify-around
code = code.replace(
    /className="md:hidden fixed bottom-0 left-0 right-0 bg-white\/80 dark:bg-slate-900\/80 backdrop-blur-xl border-t border-gray-200 dark:border-slate-800 flex overflow-x-auto hide-scrollbar justify-start sm:justify-around items-center p-2 px-4 gap-2 z-50 transition-colors"/g,
    'className="md:hidden fixed bottom-0 left-0 right-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-t border-gray-200 dark:border-slate-800 flex justify-between px-2 items-center pb-safe pt-2 z-50 transition-colors"'
);

// We need to inject PackagePlus and Users if they don't exist
if (!code.includes('setCurrentView(\'stock_updates\')') || !code.includes('PackagePlus className="w-6 h-6"')) {
    const additionalNav = `
          <button
            onClick={() => setCurrentView('stock_updates')}
            className={\`p-2 rounded-xl flex flex-col items-center gap-1 transition-all \${currentView === 'stock_updates' ? 'text-mbg-blue-600 bg-mbg-blue-50 dark:bg-mbg-blue-900/30 dark:text-mbg-blue-400' : 'text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-slate-800'}\`}
          >
            <PackagePlus className="w-5 h-5" />
          </button>
          <button
            onClick={() => setCurrentView('clients')}
            className={\`p-2 rounded-xl flex flex-col items-center gap-1 transition-all \${currentView === 'clients' ? 'text-mbg-blue-600 bg-mbg-blue-50 dark:bg-mbg-blue-900/30 dark:text-mbg-blue-400' : 'text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-slate-800'}\`}
          >
            <Users className="w-5 h-5" />
          </button>
        </div>`;

    // Regex to match the end of the Boxes button and the closing div of the mobile nav
    code = code.replace(
        /<Boxes className="w-6 h-6" \/>\s*<\/button>\s*<\/div>/,
        '<Boxes className="w-5 h-5" />\n          </button>\n' + additionalNav
    );
}

// Let's also shrink all other icons to w-5 h-5 so they fit better on mobile when there are 7 items
code = code.replace(/<Home className="w-6 h-6" \/>/, '<Home className="w-5 h-5" />');
code = code.replace(/<Inbox className="w-6 h-6" \/>/, '<Inbox className="w-5 h-5" />');
code = code.replace(/<History className="w-6 h-6" \/>/, '<History className="w-5 h-5" />');
code = code.replace(/<Undo2 className="w-6 h-6" \/>/, '<Undo2 className="w-5 h-5" />');
code = code.replace(/<Boxes className="w-6 h-6" \/>/, '<Boxes className="w-5 h-5" />');

// also replace padding p-3 to p-2 for all buttons in mobile nav
code = code.replace(/className={`shrink-0 p-3 /g, 'className={`p-2 ');
code = code.replace(/className={`shrink-0 relative p-3 /g, 'className={`relative p-2 ');

fs.writeFileSync('src/pages/AdminDashboard.jsx', code);
console.log("Fixed mobile nav items!");
