import fs from 'fs';
let code = fs.readFileSync('src/utils/pdfGenerator.js', 'utf8');

code = code.replace(/import 'jspdf-autotable';/, "import autoTable from 'jspdf-autotable';");
code = code.replace(/doc\.autoTable\(\{/g, "autoTable(doc, {");

fs.writeFileSync('src/utils/pdfGenerator.js', code);
console.log('Fixed autoTable');
