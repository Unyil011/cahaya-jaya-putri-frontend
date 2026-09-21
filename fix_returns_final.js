import fs from 'fs';

// 1. Fix ReturnsManagement
let code = fs.readFileSync('src/components/admin/ReturnsManagement.jsx', 'utf8');

// Fix handleResolveItem logic
const resolveReplacement = `const handleResolveItem = async (itemId, orderId, resolution) => {
    if (isSubmitting) return;
    try {
      setIsSubmitting(true);
      const toastId = toast.loading('Memproses...');
      
      const { error } = await supabase
        .from('returns')
        .update({ status: resolution })
        .eq('id', itemId);
        
      if (error) throw error;
      
      // Update local state properly for nested items
      setReturns(prev => prev.map(group => {
        if (group.id !== orderId) return group;
        const newItems = group.items.map(item => item.id === itemId ? { ...item, status: resolution } : item);
        const hasPending = newItems.some(i => i.status === 'pending');
        return { ...group, items: newItems, status: hasPending ? 'pending' : 'resolved' };
      }));

      // Check DB directly to avoid React closure race conditions
      const { data: pendingReturns, error: pendingErr } = await supabase
        .from('returns')
        .select('id')
        .eq('order_id', orderId)
        .eq('status', 'pending');
        
      if (!pendingErr && pendingReturns.length === 0) {
         await supabase.from('orders').update({ status: 'completed' }).eq('id', orderId);
         if (fetchOrders) fetchOrders(); // Sync AdminDashboard
      }
      
      toast.success('Status retur berhasil diperbarui', { id: toastId });
    } catch (error) {
      console.error(error);
      toast.error('Gagal memperbarui status');
    } finally {
      setIsSubmitting(false);
    }
  };`;
code = code.replace(/const handleResolveItem = async \([\s\S]*?finally \{\s*setIsSubmitting\(false\);\s*\}\s*\};/, resolveReplacement);

// Add fetchOrders to props
code = code.replace(/export default function ReturnsManagement\(\{ isDarkMode \}\) \{/, "export default function ReturnsManagement({ isDarkMode, fetchOrders }) {");

// Fix fetchReturns group status logic
const fetchReplacement = `const grouped = {};
      data.forEach(r => {
        const orderId = r.order_id || r.orders?.id || 'unknown';
        if (!grouped[orderId]) {
          grouped[orderId] = {
            id: orderId, // using orderId as the group id
            order: {
              order_number: r.orders?.order_number,
              profiles: {
                name: r.orders?.profiles?.name || r.orders?.profiles?.email?.split('@')[0] || 'Unknown'
              }
            },
            created_at: r.created_at,
            status: 'resolved', // will be overwritten below if any pending
            items: []
          };
        }
        
        grouped[orderId].items.push({
          id: r.id,
          order_detail: {
            item_name: r.order_items?.item_name || r.order_item_id,
            unit: r.unit || r.order_items?.unit || 'pcs'
          },
          qty_returned: r.quantity,
          reason: r.reason,
          status: r.status,
          action_preference: r.action_preference
        });
      });
      
      // Compute overall status for each group
      Object.values(grouped).forEach(group => {
        const hasPending = group.items.some(item => item.status === 'pending');
        group.status = hasPending ? 'pending' : 'resolved';
      });

      setReturns(Object.values(grouped));`;
code = code.replace(/const grouped = \{\};[\s\S]*?setReturns\(Object\.values\(grouped\)\);/, fetchReplacement);

fs.writeFileSync('src/components/admin/ReturnsManagement.jsx', code);


// 2. Fix AdminDashboard passing fetchOrders
let adminCode = fs.readFileSync('src/pages/AdminDashboard.jsx', 'utf8');
adminCode = adminCode.replace(/<ReturnsManagement isDarkMode=\{isDarkMode\} \/>/g, "<ReturnsManagement isDarkMode={isDarkMode} fetchOrders={fetchOrders} />");
fs.writeFileSync('src/pages/AdminDashboard.jsx', adminCode);

console.log("Fixed Returns bugs");
