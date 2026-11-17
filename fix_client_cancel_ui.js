import fs from 'fs';
let code = fs.readFileSync('src/components/client/ClientActiveOrders.jsx', 'utf8');

// Import ConfirmModal if not exists
if (!code.includes('import ConfirmModal')) {
  code = code.replace("import { supabase }", "import ConfirmModal from '../admin/ConfirmModal';\nimport { supabase }");
}

// Add state
const oldState = `  const [showConfirmModal, setShowConfirmModal] = useState(false);`;
const newState = `  const [showConfirmModal, setShowConfirmModal] = useState(false);\n  const [cancelConfirmDialog, setCancelConfirmDialog] = useState({ isOpen: false, orderId: null });`;
if (!code.includes('cancelConfirmDialog')) {
  code = code.replace(oldState, newState);
}

// Replace window.confirm
const oldCancelBtn = `                        <button
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
                        >`;

const newCancelBtn = `                        <button
                          onClick={() => setCancelConfirmDialog({ isOpen: true, orderId: order.id })}
                          className="w-full py-3 bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 dark:text-red-400 rounded-xl font-medium shadow-sm transition-colors border border-red-100 dark:border-red-800"
                        >`;

if (code.includes('window.confirm')) {
  code = code.replace(oldCancelBtn, newCancelBtn);
}

// Render ConfirmModal at the end
const oldRender = `        )}
      </AnimatePresence>
    </div>
  );
}`;

const newRender = `        )}
      </AnimatePresence>

      <ConfirmModal
        isOpen={cancelConfirmDialog.isOpen}
        title="Batalkan Pesanan"
        message="Apakah Anda yakin ingin membatalkan pesanan ini? Aksi ini tidak dapat dikembalikan."
        onConfirm={async () => {
          const toastId = toast.loading('Membatalkan pesanan...');
          try {
            const { error } = await supabase.from('orders').delete().eq('id', cancelConfirmDialog.orderId);
            if (error) throw error;
            toast.success('Pesanan berhasil dibatalkan!', { id: toastId });
            fetchOrders();
          } catch (err) {
            toast.error('Gagal membatalkan pesanan', { id: toastId });
          }
        }}
        onCancel={() => setCancelConfirmDialog({ isOpen: false, orderId: null })}
      />
    </div>
  );
}`;

if (!code.includes('<ConfirmModal')) {
  code = code.replace(oldRender, newRender);
}

fs.writeFileSync('src/components/client/ClientActiveOrders.jsx', code);
console.log("Updated cancel confirmation UI");
