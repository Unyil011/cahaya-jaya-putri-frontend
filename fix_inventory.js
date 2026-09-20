import fs from 'fs';
let code = fs.readFileSync('src/components/admin/InventoryManagement.jsx', 'utf8');

if (!code.includes('import { supabase }')) {
  code = code.replace("import toast from 'react-hot-toast';", "import toast from 'react-hot-toast';\nimport { supabase } from '../../supabaseClient';");
}

code = code.replace(/const response = await api\.get\('\/inventories'\);\n\s*setInventories\(response\.data\);/, "const { data, error } = await supabase.from('inventory').select('*').order('item_name');\n      if (error) throw error;\n      setInventories(data);");

code = code.replace(/await api\.post\('\/inventories', payload\);/, "await supabase.from('inventory').insert([{\n        item_name: payload.itemName,\n        stock: payload.stock,\n        base_price: payload.basePrice\n      }]);");

code = code.replace(/await api\.put\(\`\/inventories\/\$\{editingId\}\`, payload\);/, "await supabase.from('inventory').update({\n        item_name: payload.itemName,\n        stock: payload.stock,\n        base_price: payload.basePrice\n      }).eq('id', editingId);");

code = code.replace(/await api\.delete\(\`\/inventories\/\$\{id\}\`\);/, "await supabase.from('inventory').delete().eq('id', id);");

// Ensure item names match the database columns in JSX
// e.g., inventory.item_name instead of inventory.itemName
code = code.replace(/inventory\.itemName/g, "inventory.item_name");
code = code.replace(/inventory\.basePrice/g, "inventory.base_price");

fs.writeFileSync('src/components/admin/InventoryManagement.jsx', code);
console.log('Fixed InventoryManagement');
