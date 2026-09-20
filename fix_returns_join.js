import fs from 'fs';
let code = fs.readFileSync('src/components/admin/ReturnsManagement.jsx', 'utf8');

code = code.replace(/select\('\*, orders\(order_number, profiles\(name, email\)\)'\)/, "select('*, orders(order_number, profiles(name, email))')"); // wait, wait! 

const fetchReplacement = `const fetchReturns = async () => {
    try {
      const { data, error } = await supabase
        .from('returns')
        .select('*, orders(order_number, profiles(name, email)), order_items(item_name)')
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      const mapped = data.map(r => ({
        id: r.id,
        orderNumber: r.orders?.order_number,
        clientName: r.orders?.profiles?.name || r.orders?.profiles?.email?.split('@')[0] || 'Unknown',
        itemName: r.order_items?.item_name || r.order_item_id,
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

fs.writeFileSync('src/components/admin/ReturnsManagement.jsx', code);
console.log('Fixed Returns fetch join');
