import fs from 'fs';

function rewriteIncomingOrders() {
  let code = fs.readFileSync('src/components/admin/IncomingOrders.jsx', 'utf8');
  
  if (!code.includes('import { supabase }')) {
    code = code.replace("import api from '../../api';", "import { supabase } from '../../supabaseClient';");
  }

  code = code.replace(/const fetchInventories = async[\s\S]*?finally \{\s*setLoadingInventory\(false\);\s*\}\s*\};/, `const fetchInventories = async () => {
    try {
      const { data, error } = await supabase.from('inventory').select('*');
      if (error) throw error;
      setInventories(data.map(i => ({...i, itemName: i.item_name, sellingPrice: i.selling_price})));
    } catch(e) {
      console.error(e);
    } finally {
      setLoadingInventory(false);
    }
  };`);
  
  code = code.replace(/await api\.put\(\`\/orders\/\$\{\s*order\.id\s*\}\/status\`,\s*\{\s*status:\s*'shipped'\s*\}\);/g, `await supabase.from('orders').update({ status: 'shipped' }).eq('id', order.id);`);
  
  fs.writeFileSync('src/components/admin/IncomingOrders.jsx', code);
}

rewriteIncomingOrders();
console.log("IncomingOrders rewritten!");
