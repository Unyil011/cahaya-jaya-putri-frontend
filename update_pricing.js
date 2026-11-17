import fs from 'fs';

// 1. Update IncomingOrders.jsx
let incCode = fs.readFileSync('src/components/admin/IncomingOrders.jsx', 'utf8');

const oldPattern = /if\s*\(\s*inv\.hpp\s*!==\s*undefined\s*&&\s*inv\.hpp\s*!==\s*null\s*\)\s*\{\s*updates\.hpp\s*=\s*inv\.hpp;\s*\}/;
const newReplacement = `if (inv.hpp !== undefined && inv.hpp !== null && inv.hpp !== '') {
                                                  updates.hpp = inv.hpp;
                                                }
                                                if (inv.selling_price !== undefined && inv.selling_price !== null && inv.selling_price !== '' && parseFloat(inv.selling_price) > 0) {
                                                  updates.sellingPrice = inv.selling_price;
                                                }`;

if (oldPattern.test(incCode)) {
  incCode = incCode.replace(oldPattern, newReplacement);
  incCode = incCode.replace(
    '<div className="text-[10px] text-gray-500">Sisa Stok: {inv.stock} {inv.unit}</div>',
    `<div className="text-[10px] text-gray-500 flex flex-wrap gap-x-2">
                                                <span>Stok: {inv.stock} {inv.unit}</span>
                                                {inv.hpp ? <span>• HPP: Rp {parseInt(inv.hpp).toLocaleString('id-ID')}</span> : null}
                                                {inv.selling_price ? <span className="text-pink-600 dark:text-pink-400 font-medium">• Jual: Rp {parseInt(inv.selling_price).toLocaleString('id-ID')}</span> : null}
                                              </div>`
  );
  fs.writeFileSync('src/components/admin/IncomingOrders.jsx', incCode, 'utf8');
  console.log('Updated IncomingOrders.jsx successfully');
} else {
  console.log('IncomingOrders.jsx pattern not found');
}

// 2. Update ClientDashboard.jsx for custom order date
let cdCode = fs.readFileSync('src/pages/ClientDashboard.jsx', 'utf8');

const oldSubmit = `      const date = new Date();
      const dateString = date.toISOString().split('T')[0].replace(/-/g, '');
      const orderNumber = \`ORD-\${dateString}-\${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}\`;
      
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert([{ user_id: user.id, order_number: orderNumber, status: 'pending', payment_status: 'Belum Lunas', total_amount: 0 }])
        .select().single();`;

const newSubmit = `      let finalDate = null;
      if (customDate) {
        const timePart = customTime ? customTime : '00:00';
        finalDate = new Date(\`\${customDate}T\${timePart}:00\`).toISOString();
      }

      const dateObj = customDate ? new Date(customDate) : new Date();
      const dateString = dateObj.toISOString().split('T')[0].replace(/-/g, '');
      const orderNumber = \`ORD-\${dateString}-\${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}\`;
      
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert([{ 
          user_id: user.id, 
          order_number: orderNumber, 
          status: 'pending', 
          payment_status: 'Belum Lunas', 
          total_amount: 0,
          custom_order_date: finalDate
        }])
        .select().single();`;

if (cdCode.includes(oldSubmit)) {
  cdCode = cdCode.replace(oldSubmit, newSubmit);
  fs.writeFileSync('src/pages/ClientDashboard.jsx', cdCode, 'utf8');
  console.log('Updated ClientDashboard.jsx successfully');
} else {
  // Try CRLF normalized replace
  const normCd = cdCode.replace(/\r\n/g, '\n');
  const normOld = oldSubmit.replace(/\r\n/g, '\n');
  if (normCd.includes(normOld)) {
    const replaced = normCd.replace(normOld, newSubmit);
    fs.writeFileSync('src/pages/ClientDashboard.jsx', replaced, 'utf8');
    console.log('Updated ClientDashboard.jsx (normalized) successfully');
  } else {
    console.log('ClientDashboard.jsx pattern not found');
  }
}
