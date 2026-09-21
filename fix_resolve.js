import fs from 'fs';
let code = fs.readFileSync('src/components/admin/ReturnsManagement.jsx', 'utf8');

const replacement = `const handleResolveItem = async (itemId, orderId, resolution) => {
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
      let isAllResolved = true;
      setReturns(returns.map(group => {
        if (group.id !== orderId) return group;
        
        const newItems = group.items.map(item => item.id === itemId ? { ...item, status: resolution } : item);
        const hasPending = newItems.some(i => i.status === 'pending');
        isAllResolved = !hasPending;
        
        return {
          ...group,
          items: newItems,
          status: hasPending ? 'pending' : 'resolved'
        };
      }));

      // If all items for this order are resolved, mark the order as completed
      if (isAllResolved) {
         await supabase.from('orders').update({ status: 'completed' }).eq('id', orderId);
      }
      
      toast.success('Status retur berhasil diperbarui', { id: toastId });
    } catch (error) {
      console.error(error);
      toast.error('Gagal memperbarui status');
    } finally {
      setIsSubmitting(false);
    }
  };`;

code = code.replace(/const handleResolveItem = async \([\s\S]*?finally \{\s*setIsSubmitting\(false\);\s*\}\s*\};/, replacement);

// Update calls to pass orderId
code = code.replace(/handleResolveItem\(item\.id, 'replaced'\)/g, "handleResolveItem(item.id, ret.id, 'replaced')");
code = code.replace(/handleResolveItem\(item\.id, 'refunded'\)/g, "handleResolveItem(item.id, ret.id, 'refunded')");
code = code.replace(/handleResolveItem\(item\.id, 'rejected'\)/g, "handleResolveItem(item.id, ret.id, 'rejected')");

fs.writeFileSync('src/components/admin/ReturnsManagement.jsx', code);
console.log("Fixed handleResolveItem");
