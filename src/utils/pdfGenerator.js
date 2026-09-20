import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const generateInvoicePDF = (order, type) => {
  const doc = new jsPDF({ format: 'a4' });
  const isInvoice = type === 'Invoice';
  const title = isInvoice ? 'INVOICE' : 'SURAT JALAN';
  
  // Header Logo Box
  doc.setFillColor(30, 58, 138); // Dark blue for CJ box
  doc.rect(14, 15, 20, 20, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('CJ', 17, 28);
  
  // Header Text Cahaya Jaya
  doc.setTextColor(30, 58, 138); // Dark blue text
  doc.setFontSize(20);
  doc.text('CV. CAHAYA JAYA PUTRI', 40, 22);
  
  doc.setTextColor(100, 100, 100);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('Kp. Cigaru Rt. 004/005 Desa Wangunjaya, Kec. Naringgul,', 40, 27);
  doc.text('Kab. Cianjur Jawa Barat 43274', 40, 31);
  doc.text('WhatsApp: 0821 2157 0968 ', 40, 35);
  
  // Title (INVOICE / SURAT JALAN) right aligned
  doc.setTextColor(30, 58, 138);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  // Right align
  const titleWidth = doc.getTextWidth(title);
  const pageWidth = doc.internal.pageSize.width;
  doc.text(title, pageWidth - 14 - titleWidth, 25);
  
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  const noText = `No: ${order.orderNumber || 'ORD-UNKNOWN'}`;
  const noWidth = doc.getTextWidth(noText);
  doc.text(noText, pageWidth - 14 - noWidth, 32);
  
  // Line separator
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.5);
  doc.line(14, 40, pageWidth - 14, 40);

  // Client info section
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  
  let rawClientName = order.profiles?.name ? order.profiles.name : (order.clientName || 'Cihanjawar');
  const clientName = rawClientName.charAt(0).toUpperCase() + rawClientName.slice(1).toLowerCase();
  
  if (isInvoice) {
    doc.text('Kepada Yth.', 14, 50);
    doc.setFont('helvetica', 'normal');
    doc.text(`: SPPG ${clientName}`, 50, 50);
    
    // doc.setFont('helvetica', 'bold');
    // doc.text('Alamat', 14, 56);
    // doc.setFont('helvetica', 'normal');
    // doc.text(': (Alamat Klien)', 50, 56);
    
    doc.setFont('helvetica', 'bold');
    doc.text('Status Pembayaran', 14, 62);
    
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

    
    // Right side info
    doc.setFont('helvetica', 'bold');
    doc.text('Tanggal Invoice', 120, 50);
    doc.setFont('helvetica', 'normal');
    
    // Format date properly
    let dateStr = order.created_at ? new Date(order.created_at).toLocaleDateString('id-ID', {day: 'numeric', month: 'long', year: 'numeric'}) : '14 September 2026';
    doc.text(`: ${dateStr}`, 155, 50);
    
    
  } else {
    // Surat Jalan info
    doc.text('Kepada Yth.', 14, 50);
    doc.setFont('helvetica', 'normal');
    doc.text(`: SPPG ${clientName}`, 45, 50);
    
    doc.setFont('helvetica', 'bold');
    doc.text('Tanggal', 120, 50);
    doc.setFont('helvetica', 'normal');
    let dateStr = order.created_at ? new Date(order.created_at).toLocaleDateString('id-ID', {day: 'numeric', month: 'long', year: 'numeric'}) : '14 September 2026';
    doc.text(`: ${dateStr}`, 145, 50);
    
    doc.text('Bersama ini kami kirimkan barang-barang sebagai berikut:', 14, 62);
  }

  // Table
  const tableColumn = isInvoice 
    ? ["No", "Nama Barang", "Qty", "Harga Satuan", "Total Harga"]
    : ["No", "Nama Barang", "Qty", "Keterangan"];
    
  const tableRows = [];
  let grandTotal = 0;

  const items = order.items || [];
  
  items.forEach((item, index) => {
    if (isInvoice) {
      const price = parseFloat(item.sellingPrice || item.selling_price) || 0;
      const qty = parseFloat(item.quantity) || 0;
      const total = price * qty;
      grandTotal += total;
      tableRows.push([
        index + 1,
        item.itemName || item.item_name || 'Item',
        `${qty} ${item.unit || 'pcs'}`,
        `Rp ${price.toLocaleString('id-ID')}`,
        `Rp ${total.toLocaleString('id-ID')}`
      ]);
    } else {
      const qty = parseFloat(item.quantity) || 0;
      tableRows.push([
        index + 1,
        item.itemName || item.item_name || 'Item',
        `${qty} ${item.unit || 'pcs'}`,
        '[    ]'
      ]);
    }
  });

  autoTable(doc, {
    startY: 70,
    head: [tableColumn],
    body: tableRows,
    theme: 'grid',
    headStyles: { fillColor: [255, 255, 255], textColor: [0, 0, 0], fontStyle: 'bold', lineWidth: 0.1, lineColor: [200, 200, 200], halign: 'center' },
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
    }
  });

  const finalY = doc.lastAutoTable.finalY || 70;

  if (isInvoice) {
    // Grand Total Box
    doc.setFillColor(240, 253, 244); // light green
    doc.rect(14, finalY, pageWidth - 28, 10, 'F');
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('GRAND TOTAL', pageWidth - 80, finalY + 7);
    doc.text(`Rp ${grandTotal.toLocaleString('id-ID')}`, pageWidth - 16, finalY + 7, { align: 'right' });
    
    // Info Pembayaran Box
    // doc.setFillColor(248, 250, 252);
    // doc.setDrawColor(200, 200, 200);
    // doc.roundedRect(14, finalY + 15, 90, 25, 2, 2, 'FD');
    
    // doc.setFontSize(9);
    // doc.setFont('helvetica', 'bold');
    // doc.text('Informasi Pembayaran:', 17, finalY + 20);
    // doc.setFont('helvetica', 'normal');
    // doc.text('Transfer ke Rekening BCA:', 17, finalY + 25);
    // doc.text('No. Rek: ', 17, finalY + 30);
    // doc.setFont('helvetica', 'bold');
    // doc.text('1234567890', 32, finalY + 30);
    // doc.setFont('helvetica', 'normal');
    // doc.text('Atas Nama: ', 17, finalY + 35);
    // doc.setFont('helvetica', 'bold');
    // doc.text('PT Cahaya Jaya', 35, finalY + 35);
    
    // Signatures
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Diterima Oleh,', 50, finalY + 60, { align: 'center' });
    doc.line(25, finalY + 80, 75, finalY + 80);
    doc.setFontSize(8);
    // doc.text('Tanda Tangan & Nama Klien', 50, finalY + 85, { align: 'center' });
    
    doc.setFontSize(10);
    doc.text('Hormat Kami,', pageWidth - 50, finalY + 60, { align: 'center' });
    doc.line(pageWidth - 75, finalY + 80, pageWidth - 25, finalY + 80);
    doc.setFont('helvetica', 'bold');
    doc.text('CV. Cahaya Jaya Putri', pageWidth - 50, finalY + 85, { align: 'center' });
    
  } else {
    // Surat Jalan Footer
    doc.setFontSize(8);
    doc.setFont('helvetica', 'italic');
    const footerMsg = '* Mohon dicek kembali barang yang diterima. Barang yang sudah diterima dengan baik tidak dapat ditukar atau dikembalikan tanpa konfirmasi maksimal 1x24 jam.';
    const splitMsg = doc.splitTextToSize(footerMsg, pageWidth - 28);
    doc.text(splitMsg, 14, finalY + 5);
    
    // Signatures
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    
    doc.text('Penerima,', 40, finalY + 30, { align: 'center' });
    doc.line(15, finalY + 50, 65, finalY + 50);
    doc.setFontSize(8);
    // doc.text('Tanda Tangan & Nama Penerima', 40, finalY + 55, { align: 'center' });
    
    doc.setFontSize(10);
    doc.text('Supir,', pageWidth / 2, finalY + 30, { align: 'center' });
    doc.line(pageWidth / 2 - 25, finalY + 50, pageWidth / 2 + 25, finalY + 50);
    doc.setFontSize(8);
    // doc.text('Tanda Tangan & Nama Terang', pageWidth / 2, finalY + 55, { align: 'center' });
    
    doc.setFontSize(10);
    doc.text('Hormat Kami,', pageWidth - 40, finalY + 30, { align: 'center' });
    doc.line(pageWidth - 65, finalY + 50, pageWidth - 15, finalY + 50);
    doc.setFont('helvetica', 'bold');
    doc.text('CV. Cahaya Jaya Putri', pageWidth - 40, finalY + 55, { align: 'center' });
  }

  // Download
  const safeType = type.replace(/\s+/g, '_');
  const filename = `${safeType}_${order.orderNumber}.pdf`;
  doc.save(filename);
};
