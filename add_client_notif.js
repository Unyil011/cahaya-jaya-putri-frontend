import fs from 'fs';
let code = fs.readFileSync('src/components/client/ClientActiveOrders.jsx', 'utf8');

// 1. Remove the complained filter
code = code.replace("        .neq('status', 'complained')\n", "");

// 2. Add useRef import if missing
if (!code.includes('useRef')) {
  code = code.replace("import { useState, useEffect }", "import { useState, useEffect, useRef }");
}

// 3. Add a ref for tracking previous orders
if (!code.includes('const prevOrdersRef = useRef')) {
  code = code.replace(
    "const [selectedOrder, setSelectedOrder] = useState(null);",
    "const [selectedOrder, setSelectedOrder] = useState(null);\n  const prevOrdersRef = useRef([]);"
  );
}

// 4. Add the toast logic inside fetchOrders
const replacement = `
      setOrders(prev => {
        // Compare new data with prev data to show toasts
        if (!showLoading) {
           formattedOrders.forEach(newOrder => {
              const oldOrder = prev.find(o => o.id === newOrder.id);
              if (oldOrder && oldOrder.status === 'pending' && newOrder.status === 'priced') {
                 toast.success('Admin telah memberikan harga untuk pesanan ' + newOrder.orderNumber + '!', { duration: 6000, icon: '💰' });
              }
              if (oldOrder && oldOrder.status === 'complained' && newOrder.status === 'shipped_return') {
                 toast.success('Retur pesanan ' + newOrder.orderNumber + ' telah diproses Admin. Silakan periksa.', { duration: 6000, icon: '🔄' });
              }
           });
        }
        return formattedOrders;
      });
`;
code = code.replace("setOrders(formattedOrders);", replacement);

fs.writeFileSync('src/components/client/ClientActiveOrders.jsx', code);
console.log("Added notifications to ClientActiveOrders");
