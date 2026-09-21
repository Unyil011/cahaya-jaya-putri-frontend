import fs from 'fs';
let code = fs.readFileSync('src/components/client/ClientHistory.jsx', 'utf8');

// Add returns (*) to query
code = code.replace(/order_items \(\*\)/g, "order_items (*), returns (*)");

// Map returns into formattedOrders
code = code.replace(/items: o\.order_items\.map\([\s\S]*?\)\)/g, `items: o.order_items.map(i => ({
          id: i.id,
          itemName: i.item_name,
          quantity: i.quantity,
          unit: i.unit,
          sellingPrice: i.selling_price
        })),
        returns: o.returns`);

fs.writeFileSync('src/components/client/ClientHistory.jsx', code);
console.log("Updated ClientHistory query");
