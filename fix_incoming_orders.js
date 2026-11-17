import fs from 'fs';
let code = fs.readFileSync('src/components/admin/IncomingOrders.jsx', 'utf8');

// 1. Add supabase import if not present
if (!code.includes('import { supabase } from')) {
    code = code.replace("import api from '../../api';", "import { supabase } from '../../supabaseClient';\nimport api from '../../api';");
} else {
    code = code.replace("import api from '../../api';", "");
}

// 2. Fix fetchInventories
const oldFetch = `  useEffect(() => {
    const fetchInventories = async () => {
      try {
        const res = await api.get('/inventories');
        setInventories(res.data);
      } catch (err) {
        console.error('Failed to fetch inventories', err);
      }
    };
    fetchInventories();
  }, []);`;

const newFetch = `  useEffect(() => {
    const fetchInventories = async () => {
      try {
        const { data, error } = await supabase.from('inventory').select('*').order('item_name');
        if (error) throw error;
        setInventories(data || []);
      } catch (err) {
        console.error('Failed to fetch inventories', err);
      }
    };
    fetchInventories();
  }, []);`;

code = code.replace(oldFetch, newFetch);

// 3. Fix inv.name to inv.item_name
code = code.replace(/\{inv.name\} \(Sisa: \{inv.stock\}\)/g, "{inv.item_name} (Sisa: {inv.stock})");

fs.writeFileSync('src/components/admin/IncomingOrders.jsx', code);
console.log("Fixed inventories fetch in IncomingOrders");
