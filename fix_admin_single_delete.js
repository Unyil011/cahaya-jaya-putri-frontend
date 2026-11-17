import fs from 'fs';
let code = fs.readFileSync('src/components/admin/HistoryOrders.jsx', 'utf8');

const oldSingle = `                            () => {
                              setOrders(orders.filter(o => o.id !== order.id));
                              toast.success('Pesanan dihapus dari riwayat.');
                            }`;

const newSingle = `                            async () => {
                              const toastId = toast.loading('Menghapus...');
                              try {
                                await supabase.from('orders').update({ is_deleted_by_admin: true }).eq('id', order.id);
                                setOrders(orders.filter(o => o.id !== order.id));
                                toast.success('Pesanan dihapus dari riwayat.', { id: toastId });
                              } catch (e) {
                                toast.error('Gagal menghapus pesanan.', { id: toastId });
                              }
                            }`;

code = code.replace(oldSingle, newSingle);
fs.writeFileSync('src/components/admin/HistoryOrders.jsx', code);
console.log("Fixed admin single delete");
