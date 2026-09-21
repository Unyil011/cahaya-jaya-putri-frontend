import fs from 'fs';

// 1. ReturnsManagement.jsx -> set status to shipped_return
let returnsCode = fs.readFileSync('src/components/admin/ReturnsManagement.jsx', 'utf8');
returnsCode = returnsCode.replace(
  /await supabase\.from\('orders'\)\.update\(\{ status: 'completed' \}\)\.eq\('id', orderId\);/g,
  "await supabase.from('orders').update({ status: 'shipped_return' }).eq('id', orderId);"
);
fs.writeFileSync('src/components/admin/ReturnsManagement.jsx', returnsCode);

// 2. ClientActiveOrders.jsx -> support shipped_return
let activeCode = fs.readFileSync('src/components/client/ClientActiveOrders.jsx', 'utf8');

// Include shipped_return in the select filter
activeCode = activeCode.replace(
  /\.in\('status', \['pending', 'processing', 'priced', 'shipped'\]\)/g,
  ".in('status', ['pending', 'processing', 'priced', 'shipped', 'shipped_return'])"
);

// Map shipped_return in JSX
const statusBadgeLogic = `const getStatusBadge = (status) => {
    switch(status) {
      case 'pending': return <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-bold border border-yellow-200">Menunggu Harga</span>;
      case 'processing': return <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold border border-blue-200">Diproses</span>;
      case 'priced': return <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold border border-blue-200">Diproses / Dikirim</span>;
      case 'shipped': return <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-bold border border-purple-200">Dikirim</span>;
      case 'shipped_return': return <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-bold border border-orange-200">Retur Diproses (Menunggu Konfirmasi Anda)</span>;
      default: return <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-bold border border-gray-200">Unknown</span>;
    }
  };`;
activeCode = activeCode.replace(/const getStatusBadge = \([\s\S]*?\}\s*};\s*/, statusBadgeLogic + '\n');

// Change button logic
const buttonLogic = `{(order.status === 'priced' || order.status === 'shipped' || order.status === 'shipped_return') && (
                  <div className="flex flex-col sm:flex-row justify-end gap-3 mt-4 pt-4 border-t border-gray-100 dark:border-slate-700">
                    {order.status === 'shipped_return' ? (
                      <button
                        onClick={() => updateOrderStatus(order.id, 'completed')}
                        className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-colors font-medium text-sm"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Selesaikan Retur (Barang/Tagihan Diterima)
                      </button>
                    ) : (
                      <>
                        <button
                          onClick={() => updateOrderStatus(order.id, 'complained')}
                          className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors font-medium text-sm"
                        >
                          <AlertTriangle className="w-4 h-4" />
                          Komplain
                        </button>
                        <button
                          onClick={() => updateOrderStatus(order.id, 'completed')}
                          className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-colors font-medium text-sm"
                        >
                          <CheckCircle className="w-4 h-4" />
                          Pesanan Diterima (Selesai)
                        </button>
                      </>
                    )}
                  </div>
                )}`;
activeCode = activeCode.replace(/\{\(order\.status === 'priced' \|\| order\.status === 'shipped'\) && \([\s\S]*?\}\)/, buttonLogic);

fs.writeFileSync('src/components/client/ClientActiveOrders.jsx', activeCode);

// 3. AdminDashboard.jsx -> Add shipped_return to getStatusBadge
let adminCode = fs.readFileSync('src/pages/AdminDashboard.jsx', 'utf8');
adminCode = adminCode.replace(
  /complained: <span className="px-3 py-1 bg-red-100 text-red-700 dark:bg-red-900\/40 dark:text-red-400 rounded-full text-xs font-bold border border-red-200 dark:border-red-800">Dikomplain<\/span>,/g,
  `complained: <span className="px-3 py-1 bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400 rounded-full text-xs font-bold border border-red-200 dark:border-red-800">Dikomplain</span>,
      shipped_return: <span className="px-3 py-1 bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-400 rounded-full text-xs font-bold border border-orange-200 dark:border-orange-800">Menunggu Konfirmasi Klien</span>,`
);
// Also modify IncomingOrders filter to show shipped_return in Active Orders!
adminCode = adminCode.replace(
  /if \(currentView === 'incoming' && order\.status === 'completed'\) return false;/g,
  "if (currentView === 'incoming' && (order.status === 'completed' || order.status === 'shipped_return')) return false;"
);
// Wait, if shipped_return is NOT 'completed', it will SHOW in Incoming Orders by default!
// But wait! If it's shipped_return, it means Admin has finished processing it. Should it stay in Incoming Orders?
// The user said: "Setelah Admin selesai merespons retur, pesanan TIDAK langsung Selesai. Statusnya berubah kembali menjadi Sedang Dikirim".
// If it stays in IncomingOrders, it's fine. But wait, if it's shipped_return, the Admin can't do anything with it anyway. 
// It's better if it stays in "Pesanan Masuk" so Admin knows it's pending Client confirmation!

fs.writeFileSync('src/pages/AdminDashboard.jsx', adminCode);

console.log("Implemented Opsi A logic");
