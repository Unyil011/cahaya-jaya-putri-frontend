import fs from 'fs';
let code = fs.readFileSync('src/utils/pdfGenerator.js', 'utf8');
code = code.replace("doc.text('Supir,', pageWidth / 2, finalY + 30, { align: 'center' });", "doc.text('Sopir,', pageWidth / 2, finalY + 30, { align: 'center' });");
fs.writeFileSync('src/utils/pdfGenerator.js', code);
console.log('Fixed Sopir');
