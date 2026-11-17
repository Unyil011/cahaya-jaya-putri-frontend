import fs from 'fs';

let code = fs.readFileSync('src/pages/AdminDashboard.jsx', 'utf8');
if (!code.includes('PackagePlus')) {
    code = code.replace("import { Home, Inbox, History, Undo2, Boxes, ShoppingBag", "import { Home, Inbox, History, Undo2, Boxes, ShoppingBag, PackagePlus");
    fs.writeFileSync('src/pages/AdminDashboard.jsx', code);
    console.log("Fixed missing PackagePlus import!");
} else if (!code.match(/import\s+{.*PackagePlus.*}\s+from\s+'lucide-react'/)) {
    code = code.replace(/import\s+{(.*)}\s+from\s+'lucide-react'/, "import {$1, PackagePlus} from 'lucide-react'");
    fs.writeFileSync('src/pages/AdminDashboard.jsx', code);
    console.log("Fixed missing PackagePlus export in lucide-react!");
}
