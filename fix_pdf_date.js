import fs from 'fs';

function updateFile(filePath) {
  let code = fs.readFileSync(filePath, 'utf8');
  // Find where date is defined
  const oldDate = `date: (o.custom_order_date ? new Date(o.custom_order_date) : new Date(o.created_at)).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) + ' WIB',`;
  const newDate = `date: (o.custom_order_date ? new Date(o.custom_order_date) : new Date(o.created_at)).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) + ' WIB',
        created_at: o.custom_order_date || o.created_at,`;
  
  if(code.includes(oldDate)) {
    code = code.replace(oldDate, newDate);
    fs.writeFileSync(filePath, code);
  }
}

updateFile('src/pages/AdminDashboard.jsx');
updateFile('src/components/client/ClientHistory.jsx');
updateFile('src/components/client/ClientActiveOrders.jsx');

console.log("Updated created_at passing to fix PDF dates");
