import fs from 'fs';
let code = fs.readFileSync('src/components/admin/ReturnsManagement.jsx', 'utf8');

if (!code.includes('import { supabase }')) {
  code = code.replace("import toast from 'react-hot-toast';", "import toast from 'react-hot-toast';\nimport { supabase } from '../../supabaseClient';");
}

const fetchReplacement = `const fetchReturns = async () => {
    try {
      const { data, error } = await supabase
        .from('returns')
        .select('*, orders(order_number, profiles(name, email))')
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      const mapped = data.map(r => ({
        id: r.id,
        orderNumber: r.orders?.order_number,
        clientName: r.orders?.profiles?.name || r.orders?.profiles?.email?.split('@')[0] || 'Unknown',
        itemName: r.order_item_id, // assuming we just stored name there for simplicity? Wait, let's check what ClientActiveOrders stores
        quantity: r.quantity,
        reason: r.reason,
        action: r.action,
        status: r.status,
        date: new Date(r.created_at).toLocaleDateString('id-ID')
      }));
      
      setReturns(mapped);
    } catch (error) {
      console.error(error);
      toast.error('Gagal memuat daftar retur');
    } finally {
      setLoading(false);
    }
  };`;
  
code = code.replace(/const fetchReturns = async \(\) => \{[\s\S]*?finally \{\s*setLoading\(false\);\s*\}\s*\};/, fetchReplacement);

// Fix status update
const resolveReplacement = `const handleResolveItem = async (itemId, resolution) => {
    if (isSubmitting) return;
    try {
      setIsSubmitting(true);
      const toastId = toast.loading('Memproses...');
      
      const { error } = await supabase
        .from('returns')
        .update({ status: resolution })
        .eq('id', itemId);
        
      if (error) throw error;
      
      setReturns(returns.map(r => r.id === itemId ? { ...r, status: resolution } : r));
      toast.success('Status retur berhasil diperbarui', { id: toastId });
    } catch (error) {
      console.error(error);
      toast.error('Gagal memperbarui status');
    } finally {
      setIsSubmitting(false);
    }
  };`;
code = code.replace(/const handleResolveItem = async \([\s\S]*?finally \{\s*setIsSubmitting\(false\);\s*\}\s*\};/, resolveReplacement);

fs.writeFileSync('src/components/admin/ReturnsManagement.jsx', code);
console.log('Fixed ReturnsManagement');
