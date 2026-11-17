import fs from 'fs';

let code = fs.readFileSync('src/pages/AdminDashboard.jsx', 'utf8');

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

// If PackagePlus is not in the mobile nav, insert it.
// I can just replace the `<Users className="w-6 h-6" />` block since it seems Users WAS inserted but PackagePlus wasn't? 
// Wait, looking at the previous output:
/*
            <button
              onClick={() => setCurrentView('clients')}
              className={`p-2 rounded-2xl flex flex-col items-center gap-1 transition-all ${currentView === 'clients' 
? 'text-mbg-blue-600 bg-mbg-blue-50 dark:bg-mbg-blue-900/30 dark:text-mbg-blue-400' : 'text-gray-500 hover:bg-gray-100 
dark:text-gray-400 dark:hover:bg-slate-800'}`}
            >
              <Users className="w-6 h-6" />
            </button>
          </div>
*/

// Let's replace the whole mobile nav to be absolutely sure.
const mobileNavStart = code.indexOf('{/* Mobile Bottom Navigation */}');
const mobileNavEnd = code.indexOf('</div>\n      </div>\n    </div>', mobileNavStart); // find end of component

if (mobileNavStart !== -1 && mobileNavEnd !== -1) {
    const fullMobileNav = `
        {/* Mobile Bottom Navigation */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-t border-gray-200 dark:border-slate-800 flex justify-between px-2 items-center pb-safe pt-2 z-50 transition-colors">
          <button
            onClick={() => setCurrentView('overview')}
            className={\`p-2 rounded-2xl flex flex-col items-center gap-1 transition-all \${currentView === 'overview' ? 'text-blue-600 bg-blue-50 dark:bg-blue-900/30 dark:text-blue-400' : 'text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-slate-800'}\`}
          >
            <Home className="w-5 h-5" />
          </button>

          <button
            onClick={() => setCurrentView('incoming')}
            className={\`relative p-2 rounded-2xl flex flex-col items-center gap-1 transition-all \${currentView === 'incoming' ? 'text-pink-600 bg-pink-50 dark:bg-pink-900/30 dark:text-pink-400' : 'text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-slate-800'}\`}
          >
            <Inbox className="w-5 h-5" />
            {activeOrdersCount > 0 && (
              <span className="absolute top-1.5 right-1.5 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full border-2 border-white dark:border-slate-900">
                {activeOrdersCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setCurrentView('history')}
            className={\`p-2 rounded-2xl flex flex-col items-center gap-1 transition-all \${currentView === 'history' ? 'text-pink-600 bg-pink-50 dark:bg-pink-900/30 dark:text-pink-400' : 'text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-slate-800'}\`}
          >
            <History className="w-5 h-5" />
          </button>

          <button
            onClick={() => setCurrentView('returns')}
            className={\`p-2 rounded-2xl flex flex-col items-center gap-1 transition-all \${currentView === 'returns' ? 'text-pink-600 bg-pink-50 dark:bg-pink-900/30 dark:text-pink-400' : 'text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-slate-800'}\`}
          >
            <Undo2 className="w-5 h-5" />
          </button>
          
          <button
            onClick={() => setCurrentView('inventory')}
            className={\`p-2 rounded-2xl flex flex-col items-center gap-1 transition-all \${currentView === 'inventory' ? 'text-mbg-blue-600 bg-mbg-blue-50 dark:bg-mbg-blue-900/30 dark:text-mbg-blue-400' : 'text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-slate-800'}\`}
          >
            <Boxes className="w-5 h-5" />
          </button>

          <button
            onClick={() => setCurrentView('stock_updates')}
            className={\`p-2 rounded-2xl flex flex-col items-center gap-1 transition-all \${currentView === 'stock_updates' ? 'text-mbg-blue-600 bg-mbg-blue-50 dark:bg-mbg-blue-900/30 dark:text-mbg-blue-400' : 'text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-slate-800'}\`}
          >
            <PackagePlus className="w-5 h-5" />
          </button>

          <button
            onClick={() => setCurrentView('clients')}
            className={\`p-2 rounded-2xl flex flex-col items-center gap-1 transition-all \${currentView === 'clients' ? 'text-mbg-blue-600 bg-mbg-blue-50 dark:bg-mbg-blue-900/30 dark:text-mbg-blue-400' : 'text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-slate-800'}\`}
          >
            <Users className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>`;

    code = code.substring(0, mobileNavStart) + fullMobileNav + code.substring(mobileNavEnd + 24);
    fs.writeFileSync('src/pages/AdminDashboard.jsx', code);
    console.log("Forced replacement of entire mobile nav block!");
} else {
    console.log("Could not find mobile nav boundaries");
}
