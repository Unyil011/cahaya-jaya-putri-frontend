import fs from 'fs';
let code = fs.readFileSync('src/components/admin/InventoryManagement.jsx', 'utf8');

const submitReplacement = `const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);
      let error;
      if (currentInventory) {
        const result = await supabase.from('inventory').update({ item_name: formData.itemName, stock: formData.stock, unit: formData.unit, hpp: formData.hpp, selling_price: formData.sellingPrice }).eq('id', currentInventory.id);
        error = result.error;
      } else {
        const result = await supabase.from('inventory').insert([{ item_name: formData.itemName, stock: formData.stock, unit: formData.unit, hpp: formData.hpp, selling_price: formData.sellingPrice }]);
        error = result.error;
      }
      if (error) throw error;
      
      handleCloseModal();
      fetchInventories();
      toast.success('Data berhasil disimpan');
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Terjadi kesalahan saat menyimpan data');
    } finally {
      setIsSubmitting(false);
    }
  };`;
code = code.replace(/const handleSubmit = async \([\s\S]*?finally \{\s*setIsSubmitting\(false\);\s*\}\s*\};/, submitReplacement);

const stockReplacement = `const handleUpdateStockSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    try {
      setIsSubmitting(true);
      
      for (const row of stockRows) {
        if (!row.id || row.quantity === '') continue;
        const item = inventories.find(inv => inv.id === row.id);
        if (!item) continue;
        
        let qty = parseFloat(row.quantity);
        if (row.type === 'kurang') qty = -qty;
        
        const { error } = await supabase.from('inventory').update({ stock: item.stock + qty }).eq('id', item.id);
        if (error) throw error;
      }
      
      handleCloseModal();
      fetchInventories();
      toast.success('Stok berhasil diperbarui');
    } catch (err) {
      console.error(err);
      toast.error('Gagal memperbarui stok');
    } finally {
      setIsSubmitting(false);
    }
  };`;
code = code.replace(/const handleUpdateStockSubmit = async \([\s\S]*?finally \{\s*setIsSubmitting\(false\);\s*\}\s*\};/, stockReplacement);

fs.writeFileSync('src/components/admin/InventoryManagement.jsx', code);
console.log("Fixed InventoryManagement error handling");
