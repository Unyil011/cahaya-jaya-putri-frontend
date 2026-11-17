import fs from 'fs';

let code = fs.readFileSync('src/pages/AdminDashboard.jsx', 'utf8');

// Replace icon import History with PackagePlus
if (!code.includes('PackagePlus')) {
    code = code.replace("import { Home, Inbox, History, Undo2, Boxes, Users, Search, Moon, Sun, ChevronDown, User, LogOut } from 'lucide-react';", 
                        "import { Home, Inbox, History, Undo2, Boxes, Users, Search, Moon, Sun, ChevronDown, User, LogOut, PackagePlus } from 'lucide-react';");
}

// Replace sidebar item
code = code.replace(
    `<NavItem icon={History} label="Riwayat Stok" isActive={currentView === 'stock_updates'} onClick={() => setCurrentView('stock_updates')} />`,
    `<NavItem icon={PackagePlus} label="Update Stok" isActive={currentView === 'stock_updates'} onClick={() => setCurrentView('stock_updates')} />`
);

// Replace mobile top bar header text
code = code.replace(
    `<><History className="w-5 h-5 text-mbg-blue-600 md:hidden" /> Riwayat Stok</>`,
    `<><PackagePlus className="w-5 h-5 text-mbg-blue-600 md:hidden" /> Update Stok</>`
);

fs.writeFileSync('src/pages/AdminDashboard.jsx', code);
console.log("Updated AdminDashboard Sidebar");
