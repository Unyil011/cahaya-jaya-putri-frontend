import fs from 'fs';
let code = fs.readFileSync('src/components/admin/ReturnsManagement.jsx', 'utf8');

const replacement = `const fetchReturns = async () => {
    try {
      const { data, error } = await supabase
        .from('returns')
        .select('*, orders(id, order_number, profiles(name, email)), order_items(item_name, unit)')
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      // Group by order ID to match JSX structure
      const grouped = {};
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
            status: r.status, // overall status
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
          action_preference: r.action,
          status: r.status
        });
        
        // Update overall status to pending if any item is pending
        if (r.status === 'pending') {
          grouped[orderId].status = 'pending';
        }
      });
      
      setReturns(Object.values(grouped));
    } catch (error) {
      console.error(error);
      toast.error('Gagal memuat daftar retur');
    } finally {
      setLoading(false);
    }
  };`;

code = code.replace(/const fetchReturns = async \(\) => \{[\s\S]*?finally \{\s*setLoading\(false\);\s*\}\s*\};/, replacement);

fs.writeFileSync('src/components/admin/ReturnsManagement.jsx', code);
console.log('Fixed ReturnsManagement fetch');
