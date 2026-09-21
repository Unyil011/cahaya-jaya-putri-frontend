import fs from 'fs';
let code = fs.readFileSync('src/pages/AdminDashboard.jsx', 'utf8');

code = code.replace(/.select\(\'\*, profiles \( name \), order_items \(\*\)\'\)/g, ".select('*, profiles ( name ), order_items (*), returns (*)')");

code = code.replace(/items: o\.order_items\.map\([\s\S]*?\)\)/g, `items: o.order_items.map(i => ({
          id: i.id,
          itemName: i.item_name,
          quantity: i.quantity,
          unit: i.unit,
          sellingPrice: i.selling_price,
          inventoryId: i.inventory_id
        })),
        returns: o.returns`);

fs.writeFileSync('src/pages/AdminDashboard.jsx', code);
console.log("Updated AdminDashboard fetch query");
