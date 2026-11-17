import fs from 'fs';
let code = fs.readFileSync('src/components/client/ClientActiveOrders.jsx', 'utf8');

// Import
if (!code.includes('import ClientEditOrderModal')) {
  code = code.replace("import ConfirmModal from '../admin/ConfirmModal';", "import ConfirmModal from '../admin/ConfirmModal';\nimport ClientEditOrderModal from './ClientEditOrderModal';");
}

// Add state
if (!code.includes('editModalOrder')) {
  const stateAnchor = `  const [cancelConfirmDialog, setCancelConfirmDialog] = useState({ isOpen: false, orderId: null });`;
  code = code.replace(stateAnchor, stateAnchor + `\n  const [editModalOrder, setEditModalOrder] = useState(null);`);
}

// Update buttons
const oldButtons = `                    {order.status === 'pending' && (
                      <div className="mt-6 pt-4 border-t border-gray-100 dark:border-slate-700">
                        <button
                          onClick={() => setCancelConfirmDialog({ isOpen: true, orderId: order.id })}
                          className="w-full py-3 bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 dark:text-red-400 rounded-xl font-medium shadow-sm transition-colors border border-red-100 dark:border-red-800"
                        >
                          Batalkan Pesanan
                        </button>
                      </div>
                    )}`;

const newButtons = `                    {order.status === 'pending' && (
                      <div className="mt-6 pt-4 border-t border-gray-100 dark:border-slate-700 flex gap-3">
                        <button
                          onClick={() => setEditModalOrder(order)}
                          className="flex-1 py-3 bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/40 dark:text-blue-400 rounded-xl font-medium shadow-sm transition-colors border border-blue-100 dark:border-blue-800"
                        >
                          Ubah Pesanan
                        </button>
                        <button
                          onClick={() => setCancelConfirmDialog({ isOpen: true, orderId: order.id })}
                          className="flex-1 py-3 bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 dark:text-red-400 rounded-xl font-medium shadow-sm transition-colors border border-red-100 dark:border-red-800"
                        >
                          Batalkan
                        </button>
                      </div>
                    )}`;

code = code.replace(oldButtons, newButtons);

// Render modal
if (!code.includes('<ClientEditOrderModal')) {
  const renderAnchor = `      <ConfirmModal`;
  const renderNew = `      <ClientEditOrderModal 
        selectedOrderDetails={editModalOrder}
        setSelectedOrderDetails={setEditModalOrder}
        fetchOrders={fetchOrders}
      />
      
      <ConfirmModal`;
  code = code.replace(renderAnchor, renderNew);
}

fs.writeFileSync('src/components/client/ClientActiveOrders.jsx', code);
console.log("Updated ClientActiveOrders with Edit feature");
