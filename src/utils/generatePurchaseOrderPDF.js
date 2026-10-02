import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import formatIndonesianDate from './dateFormatter';

export const generatePurchaseOrderPDF = (po) => {
  const doc = new jsPDF({ format: 'a4', unit: 'mm' });
  const pageWidth = doc.internal.pageSize.width; // 210mm

  // 1. Header Logo (Dark blue box with 'CJ')
  doc.setFillColor(30, 58, 138);
  doc.rect(14, 14, 18, 18, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('CJ', 17.5, 25.5);

  // 2. Header Company Info (Left)
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text('CV. CAHAYA JAYA PUTRI', 36, 19);

  doc.setTextColor(60, 60, 60);
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.text('Kp. Cigaru RT 004 RW 005 Desa Wangunjaya', 36, 23.5);
  doc.text('Kec. Naringgul Kab. Cianjur', 36, 27.5);
  doc.text('Telp: 0821-2157-0968', 36, 31.5);

  // 3. Header Destination Info (Right)
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('Kepada Yth :', 130, 19);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text((po.supplierName || 'Supplier').toUpperCase(), 130, 24);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.text(`No. Surat: ${po.poNumber || 'SP-001'}`, 130, 29);

  // 4. Horizontal Separator Line (Solid bold line across page)
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.6);
  doc.line(14, 36, pageWidth - 14, 36);

  // 5. Title "SURAT PESANAN" (Center, Bold, Underlined)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  const title = 'SURAT PESANAN';
  const titleX = pageWidth / 2;
  doc.text(title, titleX, 45, { align: 'center' });
  const titleWidth = doc.getTextWidth(title);
  doc.setLineWidth(0.3);
  doc.line(titleX - (titleWidth / 2), 46, titleX + (titleWidth / 2), 46);

  // 6. Lead Text
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.text('Mohon Diberikan/dikirim Barang-barang Sebagai Berikut :', 14, 53);

  // 7. Items Table
  const tableRows = (po.items || []).map((item, index) => [
    `${index + 1}.`,
    item.itemName || '',
    String(item.quantity || ''),
    item.unit || ''
  ]);

  autoTable(doc, {
    startY: 57,
    head: [['No.', 'Nama Barang', 'Jumlah', 'Satuan']],
    body: tableRows,
    theme: 'plain',
    headStyles: {
      fillColor: [245, 245, 245],
      textColor: [0, 0, 0],
      fontStyle: 'bold',
      lineWidth: 0.2,
      lineColor: [0, 0, 0],
      halign: 'center',
      fontSize: 9.5
    },
    bodyStyles: {
      textColor: [0, 0, 0],
      lineWidth: 0.2,
      lineColor: [0, 0, 0],
      fontSize: 9.5
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 14 },
      1: { halign: 'left' },
      2: { halign: 'center', cellWidth: 32 },
      3: { halign: 'center', cellWidth: 32 }
    },
    styles: {
      cellPadding: 2.8,
      overflow: 'linebreak'
    },
    margin: { left: 14, right: 14 }
  });

  // 8. Signature Block (Bottom Right)
  const finalY = (doc.lastAutoTable?.finalY || 100) + 14;
  
  // Format Indonesian date
  const dateStr = formatIndonesianDate(po.createdAt || new Date(), false);
  const sigCenterX = 158;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.text(`Cianjur, ${dateStr}`, sigCenterX, finalY, { align: 'center' });
  doc.text('Hormat Kami,', sigCenterX, finalY + 5.5, { align: 'center' });

  // Space for signature (approx 22mm)
  const sigNameY = finalY + 28;
  doc.setFont('helvetica', 'bold');
  const compName = 'CV. CAHAYA JAYA PUTRI';
  doc.text(compName, sigCenterX, sigNameY, { align: 'center' });
  const compWidth = doc.getTextWidth(compName);
  doc.line(sigCenterX - (compWidth / 2), sigNameY + 1, sigCenterX + (compWidth / 2), sigNameY + 1);

  // 9. Save file
  const fileName = `${po.poNumber || 'Surat_Pesanan'}.pdf`;
  doc.save(fileName);
};
