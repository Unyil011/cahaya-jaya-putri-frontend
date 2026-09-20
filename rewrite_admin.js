import fs from 'fs';

function rewriteAdminDashboard() {
  let code = fs.readFileSync('src/pages/AdminDashboard.jsx', 'utf8');
  
  code = code.replace(/import api from '\.\.\/api';/g, "import { supabase } from '../supabaseClient';");
  
  code = code.replace(/const fetchOrders = async[\s\S]*?};/, `const fetchOrders = async (showLoading = true) => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*, profiles ( name ), order_items (*)')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      const formatted = data.map(o => ({
        id: o.id,
        orderNumber: o.order_number,
        clientName: o.profiles?.name || 'Unknown',
        date: new Date(o.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) + ' WIB',
        status: o.status,
        paymentStatus: o.payment_status,
        totalAmount: o.total_amount,
        items: o.order_items.map(i => ({
          id: i.id,
          itemName: i.item_name,
          quantity: i.quantity,
          unit: i.unit,
          hpp: i.hpp,
          sellingPrice: i.selling_price
        }))
      }));
      setOrders(formatted);
    } catch (e) {
      if (showLoading) console.error(e);
    }
  };`);

  code = code.replace(/const handleSavePrice = async[\s\S]*?};/, `const handleSavePrice = async (orderId, items, shippingCost) => {
    try {
      for (const item of items) {
        await supabase.from('order_items').update({ hpp: item.hpp, selling_price: item.sellingPrice }).eq('id', item.id);
      }
      const total = items.reduce((sum, item) => sum + (item.quantity * item.sellingPrice), 0) + shippingCost;
      await supabase.from('orders').update({ status: 'priced', total_amount: total }).eq('id', orderId);
      
      fetchOrders(false);
    } catch(e) {}
  };`);
  
  code = code.replace(/const handleLogout = async[\s\S]*?navigate\('\/'\);\s*\};/, `const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    window.location.href = '/';
  };`);

  code = code.replace(/const handlePrint = async[\s\S]*?toast\.error\('Gagal mengunduh laporan\.', \{ id: toastId \}\);\s*\}\s*\};/, `const handlePrint = async (type, orderId = null, orderNumber = null) => {
    alert('Fitur cetak PDF saat ini sedang dalam perbaikan (Migrasi Supabase).');
  };`);
  
  fs.writeFileSync('src/pages/AdminDashboard.jsx', code);
}

rewriteAdminDashboard();
console.log("Rewritten!");
