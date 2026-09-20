import fs from 'fs';
let code = fs.readFileSync('src/pages/ClientDashboard.jsx', 'utf8');
code = code.replace(/setIsSubmitting\(true\);/g, '');
code = code.replace(/setIsSubmitting\(false\);/g, '');
fs.writeFileSync('src/pages/ClientDashboard.jsx', code);
