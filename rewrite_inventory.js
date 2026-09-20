import fs from 'fs';
let code = fs.readFileSync('src/components/admin/InventoryManagement.jsx', 'utf8');

if (!code.includes('import { supabase }')) {
  code = code.replace(/import api from '\.\.\/\.\.\/api';/g, "import { supabase } from '../../supabaseClient';");
}

code = code.replace(/const fetchInventory = async \(\) => [\s\S]*?finally \{\s*setLoading\(false\);\s*\}\s*\};/, `const fetchInventory = async () => {
  try {
    const { data, error } = await supabase.from('inventory').select('*').order('item_name');
    if (error) throw error;
    setInventory(data.map(i => ({...i, itemName: i.item_name, sellingPrice: i.selling_price})));
  } catch(e) {} finally { setLoading(false); }
};`);

code = code.replace(/await api\.post\('\/inventories\/add-stock'[\s\S]*?\);/, `
for (const item of updateStockItems) {
  const inv = inventory.find(i => i.id === item.id);
  await supabase.from('inventory').update({ stock: parseFloat(inv.stock) + parseFloat(item.quantity) }).eq('id', item.id);
}`);

code = code.replace(/await api\.put\(\`\/inventories\/\$\{currentInventory\.id\}\`[\s\S]*?\);/, `await supabase.from('inventory').update({ item_name: formData.itemName, stock: formData.stock, unit: formData.unit, hpp: formData.hpp, selling_price: formData.sellingPrice }).eq('id', currentInventory.id);`);

code = code.replace(/await api\.post\('\/inventories'[\s\S]*?\);/, `await supabase.from('inventory').insert([{ item_name: formData.itemName, stock: formData.stock, unit: formData.unit, hpp: formData.hpp, selling_price: formData.sellingPrice }]);`);

code = code.replace(/await api\.delete\(\`\/inventories\/\$\{deleteConfirm\}\`\);/, `await supabase.from('inventory').delete().eq('id', deleteConfirm);`);

fs.writeFileSync('src/components/admin/InventoryManagement.jsx', code);
console.log('Inventory rewritten');
