import fs from 'fs';
let code = fs.readFileSync('src/pages/AdminDashboard.jsx', 'utf8');

const replacement = `    try {
      setIsSubmitting(true);
      
      for (const item of order.items) {
        await supabase.from('order_items').update({ 
          hpp: parseFloat(item.hpp), 
          selling_price: parseFloat(item.sellingPrice) 
        }).eq('id', item.id);
        
        if (item.inventoryId) {
          const invData = await supabase.from('inventory').select('stock').eq('id', item.inventoryId).single();
          if (invData.data) {
             await supabase.from('inventory').update({ stock: parseFloat(invData.data.stock) - parseFloat(item.quantity) }).eq('id', item.inventoryId);
          }
        }
      }

      const total = order.items.reduce((sum, item) => sum + (parseFloat(item.quantity) * parseFloat(item.sellingPrice)), 0);
      
      const { error } = await supabase.from('orders').update({ status: 'priced', total_amount: total }).eq('id', orderId);
      if (error) throw error;
      
      setOrders(orders.map(o => o.id === orderId ? { ...o, status: 'priced', total_amount: total } : o));
      setExpandedOrder(null);
      toast.success('Harga disimpan! Pesanan masuk ke tahap Diproses.');
    } catch (error) {
      console.error(error);
      toast.error('Gagal menyimpan harga!');
    }`;

code = code.replace(/try \{\s*setIsSubmitting\(true\);\s*const payload = \{[\s\S]*?toast\.error\('Gagal menyimpan harga!'\);\s*\}/, replacement);

fs.writeFileSync('src/pages/AdminDashboard.jsx', code);
console.log('Fixed handleSavePrices');
