import fs from 'fs';
let code = fs.readFileSync('src/components/client/ClientActiveOrders.jsx', 'utf8');

const anchor = `      </AnimatePresence>
    </div>
  );
}`;

const newRender = `      </AnimatePresence>

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

code = code.replace(anchor, newRender);

// Also handles the \r\n vs \n just in case
if (!code.includes('<ConfirmModal')) {
  const crlfAnchor = anchor.replace(/\n/g, "\r\n");
  code = code.replace(crlfAnchor, newRender);
}
if (!code.includes('<ConfirmModal')) {
    // try removing spaces
    const looseRegex = /<\/AnimatePresence>\s*<\/div>\s*\);\s*\}\s*$/;
    code = code.replace(looseRegex, newRender.replace('      </AnimatePresence>\n', ''));
}

fs.writeFileSync('src/components/client/ClientActiveOrders.jsx', code);
console.log("Appended ConfirmModal");
