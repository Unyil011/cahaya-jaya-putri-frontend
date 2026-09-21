import fs from 'fs';

// Update ClientHistory.jsx
let clientCode = fs.readFileSync('src/components/client/ClientHistory.jsx', 'utf8');
const oldClientLink = `href={selectedOrderDetails.paymentProofUrl} 
                          target="_blank" 
                          rel="noreferrer"
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium text-sm transition-colors whitespace-nowrap"`;
const newClientLink = `href={selectedOrderDetails.paymentProofUrl} 
                          download={\`Bukti Pembayaran \${selectedOrderDetails.orderNumber}.jpg\`}
                          target="_blank" 
                          rel="noreferrer"
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium text-sm transition-colors whitespace-nowrap"`;
clientCode = clientCode.replace(oldClientLink, newClientLink);
fs.writeFileSync('src/components/client/ClientHistory.jsx', clientCode);

// Update HistoryOrders.jsx
let adminCode = fs.readFileSync('src/components/admin/HistoryOrders.jsx', 'utf8');
const oldAdminLink = `href={proofModalOrder.paymentProofUrl}
                      target="_blank"
                      rel="noreferrer"`;
const newAdminLink = `href={proofModalOrder.paymentProofUrl}
                      download={\`Bukti Pembayaran \${proofModalOrder.orderNumber}.jpg\`}
                      target="_blank"
                      rel="noreferrer"`;
adminCode = adminCode.replace(oldAdminLink, newAdminLink);
fs.writeFileSync('src/components/admin/HistoryOrders.jsx', adminCode);

console.log("Updated download attributes");
