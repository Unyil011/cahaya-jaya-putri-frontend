import fs from 'fs';
let activeCode = fs.readFileSync('src/components/client/ClientActiveOrders.jsx', 'utf8');

const replacement = `                    {(order.status === 'shipped' || order.status === 'shipped_return') && (
                      <div className="mt-6 pt-4 border-t border-gray-100 dark:border-slate-700">
                        {order.status === 'shipped_return' ? (
                           <button
                             onClick={async () => {
                               const toastId = toast.loading('Menyelesaikan pesanan...');
                               try {
                                 const { error } = await supabase.from('orders').update({ status: 'completed' }).eq('id', order.id);
                                 if (error) throw error;
                                 toast.success('Pesanan selesai!', { id: toastId });
                                 // refresh is handled by polling/interval, but we can fast-update local state if we want, or just wait for the interval.
                                 // Actually let's just trigger fetchOrders:
                                 window.location.reload(); 
                               } catch (err) {
                                 toast.error('Gagal menyelesaikan pesanan', { id: toastId });
                               }
                             }}
                             className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium shadow-md transition-colors"
                           >
                             Terima Retur & Selesaikan Pesanan
                           </button>
                        ) : (
                           <button
                             onClick={() => handleOpenConfirm(order)}
                             className="w-full py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-medium shadow-md transition-colors"
                           >
                             Konfirmasi Terima Barang
                           </button>
                        )}
                      </div>
                    )}`;

activeCode = activeCode.replace(/\{order\.status === 'shipped' && \([\s\S]*?<\/button>\s*<\/div>\s*\}\)/, replacement);

fs.writeFileSync('src/components/client/ClientActiveOrders.jsx', activeCode);
console.log("Fixed ClientActiveOrders button logic");
