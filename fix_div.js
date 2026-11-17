import fs from 'fs';

let code = fs.readFileSync('src/pages/AdminDashboard.jsx', 'utf8');
code = code.replace(/<\/div><\/div>\n  \);\n}/, '</div>\n  );\n}');
fs.writeFileSync('src/pages/AdminDashboard.jsx', code);
console.log("Fixed extra div tag!");
