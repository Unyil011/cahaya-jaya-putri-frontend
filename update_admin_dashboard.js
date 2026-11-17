import fs from 'fs';
let code = fs.readFileSync('src/pages/AdminDashboard.jsx', 'utf8');

// 1. Add hpp to order_items parsing
code = code.replace(/sellingPrice: i\.selling_price,/g, "sellingPrice: i.selling_price,\n          hpp: i.hpp,");

// 2. Fetch pending returns count for the sidebar badge
code = code.replace(/const activeOrdersCount = orders.filter/g, `
  const [pendingReturnsCount, setPendingReturnsCount] = useState(0);

  useEffect(() => {
    const fetchPendingReturns = async () => {
      const { data, error } = await supabase.from('returns').select('*').eq('status', 'pending');
      if (!error && data) {
        setPendingReturnsCount(data.length);
      }
    };
    fetchPendingReturns();
    
    // Subscribe to changes in returns table to update badge live
    const subscription = supabase
      .channel('public:returns')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'returns' }, payload => {
        fetchPendingReturns();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  const activeOrdersCount = orders.filter`);

// 3. Add badge to NavItem for Manajemen Retur
code = code.replace(/<NavItem icon=\{Undo2\} label="Manajemen Retur" isActive=\{currentView === 'returns'\} onClick=\{\(\) => setCurrentView\('returns'\)\} \/>/g, 
  `<NavItem icon={Undo2} label="Manajemen Retur" isActive={currentView === 'returns'} onClick={() => setCurrentView('returns')} badge={pendingReturnsCount} />`);

fs.writeFileSync('src/pages/AdminDashboard.jsx', code);
console.log("Updated AdminDashboard.jsx");
