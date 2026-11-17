import fs from 'fs';
let code = fs.readFileSync('src/components/admin/StockHistory.jsx', 'utf8');

const regex = /<div className="flex items-center gap-3">[\s\S]*?<\/div>\s*<div className="flex items-center gap-2">/;

code = code.replace(
    '<div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center shrink-0">',
    '<div className="flex justify-end shrink-0">'
);
code = code.replace(regex, '<div className="flex items-center gap-2">');

fs.writeFileSync('src/components/admin/StockHistory.jsx', code);
console.log("Removed redundant header");
