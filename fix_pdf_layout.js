import fs from 'fs';
let code = fs.readFileSync('src/utils/pdfGenerator.js', 'utf8');

code = code.replace(/"No", "Nama Barang", "Jml Pesan", "Ceklis Diterima"/, '"No", "Nama Barang", "Jml Pesan", "Keterangan"');

const oldAutoTableOptions = `headStyles: { fillColor: [255, 255, 255], textColor: [0, 0, 0], fontStyle: 'bold', lineWidth: 0.1, lineColor: [200, 200, 200] },
    bodyStyles: { textColor: [0, 0, 0], lineWidth: 0.1, lineColor: [200, 200, 200] },
    columnStyles: isInvoice ? {
      0: { halign: 'center', cellWidth: 10 },
      1: { cellWidth: 60 },
      2: { halign: 'center' },
      3: { halign: 'right' },
      4: { halign: 'right' }
    } : {
      0: { halign: 'center', cellWidth: 10 },
      1: { cellWidth: 80 },
      2: { halign: 'center' },
      3: { halign: 'center' }
    }`;

const newAutoTableOptions = `headStyles: { fillColor: [255, 255, 255], textColor: [0, 0, 0], fontStyle: 'bold', lineWidth: 0.1, lineColor: [200, 200, 200], halign: 'center' },
    bodyStyles: { textColor: [0, 0, 0], lineWidth: 0.1, lineColor: [200, 200, 200] },
    columnStyles: isInvoice ? {
      0: { halign: 'center', cellWidth: 10 },
      1: { cellWidth: 82 },
      2: { halign: 'center', cellWidth: 20 },
      3: { halign: 'right', cellWidth: 35 },
      4: { halign: 'right', cellWidth: 35 }
    } : {
      0: { halign: 'center', cellWidth: 10 },
      1: { cellWidth: 117 },
      2: { halign: 'center', cellWidth: 30 },
      3: { halign: 'center', cellWidth: 25 }
    }`;

code = code.replace(oldAutoTableOptions, newAutoTableOptions);
fs.writeFileSync('src/utils/pdfGenerator.js', code);
console.log('Fixed PDF widths');
