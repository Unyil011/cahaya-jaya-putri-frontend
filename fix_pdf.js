import fs from 'fs';
let code = fs.readFileSync('src/utils/pdfGenerator.js', 'utf8');

const logic = `
  let items = JSON.parse(JSON.stringify(order.items || []));
  let hasReturnNotes = false;
  
  if (order.returns && order.returns.length > 0) {
    const replacedReturns = order.returns.filter(r => r.status === 'replaced');
    const refundedReturns = order.returns.filter(r => r.status === 'refunded');

    if (!isInvoice && replacedReturns.length > 0) {
      items = replacedReturns.map(r => ({
        itemName: r.item_name || 'Item',
        quantity: r.quantity,
        unit: r.unit || 'pcs'
      }));
      hasReturnNotes = true;
    } else {
      if (refundedReturns.length > 0) {
        refundedReturns.forEach(ret => {
          const existingItem = items.find(i => i.itemName === ret.item_name || i.item_name === ret.item_name);
          if (existingItem) {
            existingItem.quantity = Math.max(0, parseFloat(existingItem.quantity) - parseFloat(ret.quantity));
          }
        });
        items = items.filter(i => parseFloat(i.quantity) > 0);
        hasReturnNotes = true;
      }
    }
  }

  items.forEach((item, index) => {
`;

code = code.replace(/const items = order\.items \|\| \[\];\s*items\.forEach\(\(item, index\) => \{/, logic);

// Add footer note if hasReturnNotes is true for Surat Jalan
code = code.replace(/const footerMsg = '\* Mohon dicek kembali barang yang diterima\. Barang yang sudah diterima dengan baik tidak dapat ditukar atau dikembalikan tanpa konfirmasi maksimal 1x24 jam\.'\;/, 
  "const footerMsg = hasReturnNotes ? '* PENTING: Surat Jalan ini merupakan pengiriman barang pengganti atau barang revisi atas proses komplain/retur sebelumnya.' : '* Mohon dicek kembali barang yang diterima. Barang yang sudah diterima dengan baik tidak dapat ditukar atau dikembalikan tanpa konfirmasi maksimal 1x24 jam.';");


fs.writeFileSync('src/utils/pdfGenerator.js', code);
console.log("Updated pdfGenerator.js");
