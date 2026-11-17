import fs from 'fs';

let code = fs.readFileSync('src/components/admin/StockHistory.jsx', 'utf8');

code = code.replace(
    'message="Yakin ingin menghapus riwayat ini? Peringatan: Stok barang saat ini akan dikurangi secara otomatis!"',
    'message="Yakin ingin menghapus riwayat ini dari log histori? (Catatan: Stok asli di gudang tidak akan berubah/berkurang)."'
);

code = code.replace(
    'message={"Yakin ingin menghapus " + selectedIds.length + " riwayat sekaligus? Peringatan: Stok barang saat ini akan disesuaikan otomatis untuk semua riwayat yang dihapus!"}',
    'message={"Yakin ingin menghapus " + selectedIds.length + " riwayat sekaligus dari log histori? (Stok gudang tidak akan berubah)."}'
);

code = code.replace(
    "toast.success('Riwayat berhasil dihapus, stok telah disesuaikan!', { id: toastId });",
    "toast.success('Log riwayat berhasil dihapus!', { id: toastId });"
);

fs.writeFileSync('src/components/admin/StockHistory.jsx', code);
console.log("UI warnings updated.");
