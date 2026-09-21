import fs from 'fs';
let code = fs.readFileSync('src/components/client/ClientActiveOrders.jsx', 'utf8');

const oldCode = `                    {(order.status === 'shipped' || order.status === 'shipped_return') && (
                      <div className="mt-6 pt-4 border-t border-gray-100 dark:border-slate-700">`;

const newCode = `                    {order.status === 'pending' && (
                      <div className="mt-6 pt-4 border-t border-gray-100 dark:border-slate-700">
                        <button
                          onClick={async () => {
                            if (window.confirm('Yakin ingin membatalkan pesanan ini?')) {
                              const toastId = toast.loading('Membatalkan pesanan...');
                              try {
                                const { error } = await supabase.from('orders').delete().eq('id', order.id);
                                if (error) throw error;
                                toast.success('Pesanan berhasil dibatalkan!', { id: toastId });
                                fetchOrders();
                              } catch (err) {
                                toast.error('Gagal membatalkan pesanan', { id: toastId });
                              }
                            }
                          }}
                          className="w-full py-3 bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 dark:text-red-400 rounded-xl font-medium shadow-sm transition-colors border border-red-100 dark:border-red-800"
                        >
                          Batalkan Pesanan
                        </button>
                      </div>
                    )}

                    {(order.status === 'shipped' || order.status === 'shipped_return') && (
                      <div className="mt-6 pt-4 border-t border-gray-100 dark:border-slate-700">`;

code = code.replace(oldCode, newCode);
fs.writeFileSync('src/components/client/ClientActiveOrders.jsx', code);
console.log("Updated ClientActiveOrders with Batalkan Pesanan button");
