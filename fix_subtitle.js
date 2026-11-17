import fs from 'fs';
let code = fs.readFileSync('src/pages/AdminDashboard.jsx', 'utf8');

code = code.replace(
    "{currentView === 'overview' ? 'Ringkasan performa dan notifikasi penting.' : currentView === 'incoming' ? 'Kelola pesanan aktif dari SPPG, tentukan HPP & Harga Jual.' : currentView === 'history' ? 'Arsip pesanan SPPG yang sudah selesai.' : currentView === 'returns' ? 'Kelola komplain dan pengembalian barang dari SPPG.' : currentView === 'inventory' ? 'Kelola inventaris dan stok barang di gudang.' : 'Kelola akun SPPG.'}",
    "{currentView === 'overview' ? 'Ringkasan performa dan notifikasi penting.' : currentView === 'incoming' ? 'Kelola pesanan aktif dari SPPG, tentukan HPP & Harga Jual.' : currentView === 'history' ? 'Arsip pesanan SPPG yang sudah selesai.' : currentView === 'returns' ? 'Kelola komplain dan pengembalian barang dari SPPG.' : currentView === 'inventory' ? 'Kelola inventaris dan stok barang di gudang.' : currentView === 'stock_updates' ? 'Kelola barang masuk dan pantau riwayat pergerakan stok.' : 'Kelola akun SPPG.'}"
);

fs.writeFileSync('src/pages/AdminDashboard.jsx', code);
console.log("Updated AdminDashboard subtitle");
