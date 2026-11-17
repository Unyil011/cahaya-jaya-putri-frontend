import fs from 'fs';
let code = fs.readFileSync('src/components/admin/OverviewDashboard.jsx', 'utf8');

code = code.replace("import api from '../../api';", "import { supabase } from '../../supabaseClient';");

const oldFetch = `  const fetchDashboardData = async () => {
    try {
      const [invRes, retRes] = await Promise.all([
        api.get('/inventories'),
        api.get('/returns')
      ]);
      // Filter barang yang stoknya di bawah 10
      const lowStock = invRes.data.filter(item => parseFloat(item.stock) < 10);
      setLowStockItems(lowStock);

      // Filter retur yang berstatus pending
      const pendingCount = retRes.data.filter(r => r.status === 'pending').length;
      setPendingReturns(pendingCount);
    } catch (err) {
      console.error('Failed to fetch dashboard data', err);
    }
  };`;

const newFetch = `  const fetchDashboardData = async () => {
    try {
      const [invRes, retRes] = await Promise.all([
        supabase.from('inventory').select('*'),
        supabase.from('returns').select('*')
      ]);
      if (invRes.data) {
        const lowStock = invRes.data.filter(item => parseFloat(item.stock) < 10).map(i => ({...i, name: i.item_name}));
        setLowStockItems(lowStock);
      }
      if (retRes.data) {
        const pendingCount = retRes.data.filter(r => r.status === 'pending').length;
        setPendingReturns(pendingCount);
      }
    } catch (err) {
      console.error('Failed to fetch dashboard data', err);
    }
  };`;

code = code.replace(oldFetch, newFetch);

// Also replace kpi logic
const oldKpi = `  const kpi = useMemo(() => {
    const activeOrders = filteredOrders.filter(o => o.status !== 'completed').length;
    
    // Total Revenue (Hanya dari pesanan completed)
    const revenue = filteredOrders
      .filter(o => o.status === 'completed')
      .reduce((acc, order) => acc + parseFloat(order.totalAmount || 0), 0);
      
    // Total Piutang (Pesanan selesai tapi belum lunas)
    const unpaid = filteredOrders
      .filter(o => o.status === 'completed' && o.paymentStatus !== 'Lunas')
      .reduce((acc, order) => acc + parseFloat(order.totalAmount || 0), 0);

    return { activeOrders, revenue, unpaid };
  }, [filteredOrders]);`;

const newKpi = `  const kpi = useMemo(() => {
    const activeOrders = filteredOrders.filter(o => o.status !== 'completed' && o.status !== 'shipped_return').length;
    
    // Total Revenue (Hanya dari pesanan completed)
    const revenue = filteredOrders
      .filter(o => o.status === 'completed')
      .reduce((acc, order) => acc + parseFloat(order.totalAmount || 0), 0);

    // Keuntungan Bersih (Profit) = Harga Jual - HPP
    const netProfit = filteredOrders
      .filter(o => o.status === 'completed')
      .reduce((acc, order) => {
        const orderProfit = (order.items || []).reduce((sum, item) => sum + ((parseFloat(item.sellingPrice || 0) - parseFloat(item.hpp || 0)) * parseFloat(item.quantity || 0)), 0);
        return acc + orderProfit;
      }, 0);
      
    // Total Piutang (Pesanan selesai tapi belum lunas)
    const unpaid = filteredOrders
      .filter(o => o.status === 'completed' && o.paymentStatus !== 'Lunas')
      .reduce((acc, order) => acc + parseFloat(order.totalAmount || 0), 0);

    return { activeOrders, revenue, netProfit, unpaid };
  }, [filteredOrders]);`;

code = code.replace(oldKpi, newKpi);

fs.writeFileSync('src/components/admin/OverviewDashboard.jsx', code);
console.log("Updated OverviewDashboard API and KPI logic");
