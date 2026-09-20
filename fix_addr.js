import fs from 'fs';
let code = fs.readFileSync('src/utils/pdfGenerator.js', 'utf8');

const oldAddr = "doc.text('Kp. Cigaru Rt. 004/005 Desa Wangunjaya, Kec. Naringgul, Kab. Cianjur Jawa Barat 43274', 40, 31);\n  doc.text('WhatsApp: 0821 2157 0968 ', 40, 35);";
const newAddr = "doc.text('Kp. Cigaru Rt. 004/005 Desa Wangunjaya, Kec. Naringgul,', 40, 27);\n  doc.text('Kab. Cianjur Jawa Barat 43274', 40, 31);\n  doc.text('WhatsApp: 0821 2157 0968 ', 40, 35);";

code = code.replace(oldAddr, newAddr);
fs.writeFileSync('src/utils/pdfGenerator.js', code);
console.log('Fixed address lines');
