import fs from 'fs';
let code = fs.readFileSync('src/utils/pdfGenerator.js', 'utf8');

// Use A4 explicitly
code = code.replace(/const doc = new jsPDF\(\);/, "const doc = new jsPDF({ format: 'a4' });");

// Replace status logic
const statusRegex = /doc\.setFont\('helvetica', 'bold'\);\n\s*doc\.setTextColor\(234, 179, 8\);\s*\/\/ Yellow-ish orange\n\s*doc\.text\(': BELUM LUNAS', 50, 62\);\n\s*doc\.setTextColor\(0, 0, 0\);/g;
const newStatus = `
    const isPaid = order.payment_status === 'Lunas' || order.paymentStatus === 'Lunas';
    doc.setFont('helvetica', 'bold');
    if (isPaid) {
      doc.setTextColor(22, 163, 74); // Green
      doc.text(': LUNAS', 50, 62);
    } else {
      doc.setTextColor(234, 179, 8); // Yellow
      doc.text(': BELUM LUNAS', 50, 62);
    }
    doc.setTextColor(0, 0, 0);
`;
code = code.replace(statusRegex, newStatus);

// Remove Jatuh Tempo
const jatuhRegex = /doc\.setFont\('helvetica', 'bold'\);\n\s*doc\.text\('Jatuh Tempo', 120, 56\);\n\s*doc\.setFont\('helvetica', 'normal'\);\n\s*let dueDate = new Date\(order\.created_at \|\| new Date\(\)\);\n\s*dueDate\.setDate\(dueDate\.getDate\(\) \+ 7\);\n\s*let dueStr = dueDate\.toLocaleDateString\('id-ID', \{day: 'numeric', month: 'long', year: 'numeric'\}\);\n\s*doc\.text\(\`: \$\{dueStr\}\`, 155, 56\);/;
code = code.replace(jatuhRegex, "");

fs.writeFileSync('src/utils/pdfGenerator.js', code);
console.log('Fixed PDF format');
