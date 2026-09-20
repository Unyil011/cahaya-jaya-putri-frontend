import fs from 'fs';

function rewriteClientDashboard() {
  let code = fs.readFileSync('src/pages/ClientDashboard.jsx', 'utf8');
  
  // import supabase
  if (!code.includes('import { supabase }')) {
    code = code.replace("import api from '../api';", "import { supabase } from '../supabaseClient';");
  }
  
  // replace the timeoutPromise part which is causing it to spin!
  // Wait, I replaced fetch('/backend/create-pesanan') with supabase before, but maybe the target failed because of some mismatch?
  // Let me replace the entire handleSubmit
  code = code.replace(/const handleSubmit = async[\s\S]*?finally \{\s*setIsLoading\(false\);\s*setIsSubmitting\(false\);\s*\}\s*\};/, `const handleSubmit = async (e) => {
    e.preventDefault();

    const isValid = items.every(item => item.itemName.trim() !== '' && item.quantity !== '' && item.unit.trim() !== '');
    if (!isValid) {
      toast.error('Mohon masukan daftar barang yang dibutuhkan!', { style: { background: 'rgba(255, 255, 255, 0.7)', backdropFilter: 'blur(10px)' } });
      return;
    }

    const isQuantityValid = items.every(item => parseFloat(item.quantity) > 0);
    if (!isQuantityValid) {
      toast.error('Kuantitas barang tidak boleh 0 atau minus!');
      return;
    }

    setIsLoading(true);
    setIsSubmitting(true);

    try {
      const date = new Date();
      const dateString = date.toISOString().split('T')[0].replace(/-/g, '');
      const orderNumber = \`ORD-\${dateString}-\${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}\`;
      
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert([{ user_id: user.id, order_number: orderNumber, status: 'pending', payment_status: 'Belum Lunas', total_amount: 0 }])
        .select().single();

      if (orderError) throw orderError;

      const orderItems = items.map(item => ({
        order_id: orderData.id,
        item_name: item.itemName,
        quantity: parseFloat(item.quantity),
        unit: item.unit
      }));

      const { error: itemsError } = await supabase.from('order_items').insert(orderItems);
      if (itemsError) throw itemsError;

      toast.success('Pesanan berhasil dikirim ke Supplier!');
      setItems([{ id: 1, itemName: '', quantity: '', unit: '' }]);
      setTimeout(() => setCurrentView('active'), 1000);
    } catch (error) {
      toast.error('Gagal mengirim pesanan');
    } finally {
      setIsLoading(false);
      setIsSubmitting(false);
    }
  };`);
  
  // replace handleLogout
  code = code.replace(/const handleLogout = \(\) => \{\s*localStorage\.removeItem\('auth_token'\);\s*localStorage\.removeItem\('authRole'\);\s*localStorage\.removeItem\('user'\);\s*navigate\('\/'\);\s*\};/, `const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem('auth_token');
    localStorage.removeItem('authRole');
    localStorage.removeItem('user');
    navigate('/');
  };`);

  fs.writeFileSync('src/pages/ClientDashboard.jsx', code);
}

rewriteClientDashboard();
console.log("ClientDashboard fixed!");
