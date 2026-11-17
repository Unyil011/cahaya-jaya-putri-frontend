import fs from 'fs';
let code = fs.readFileSync('src/components/client/ClientActiveOrders.jsx', 'utf8');

const regex = /\s*\}\)\}\s*<\/AnimatePresence>\s*<\/div>\s*\);\s*\}/;

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
  code = code.replace(regex, newRender);
  fs.writeFileSync('src/components/client/ClientActiveOrders.jsx', code);
  console.log("Injected ConfirmModal successfully");
} else {
  console.log("ConfirmModal already present");
}
