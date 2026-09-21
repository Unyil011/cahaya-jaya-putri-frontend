import fs from 'fs';
let code = fs.readFileSync('src/api.js', 'utf8');
code = code.replace(/api\.interceptors\.response\.use\([\s\S]*?\);/g, '');
fs.writeFileSync('src/api.js', code);
console.log("Removed 401 interceptor");
