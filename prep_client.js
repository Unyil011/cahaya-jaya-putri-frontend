import fs from 'fs';
let code = fs.readFileSync('src/components/admin/ClientManagement.jsx', 'utf8');

// 1. Add showConfirm to props
code = code.replace('export default function ClientManagement({ isDarkMode }) {', 'export default function ClientManagement({ isDarkMode, showConfirm }) {');

// 2. Replace window.confirm for Delete
const oldDeleteConfirm = `  const handleDelete = async (id) => {
    if (window.confirm('Yakin ingin menghapus SPPG ini? Semua data pesanan yang sudah ada tetap aman di sistem.')) {
      try {
        await supabase.from('profiles').delete().eq('id', id);
        toast.success('SPPG berhasil dihapus');
        fetchClients();
      } catch (err) {
        toast.error('Gagal menghapus SPPG');
      }
    }
  };`;

const newDeleteConfirm = `  const handleDelete = (id) => {
    showConfirm(
      'Hapus Akun SPPG',
      'Yakin ingin menghapus SPPG ini? Semua data pesanan yang sudah ada tetap aman di sistem.',
      async () => {
        try {
          await supabase.from('profiles').delete().eq('id', id);
          toast.success('SPPG berhasil dihapus');
          fetchClients();
        } catch (err) {
          toast.error('Gagal menghapus SPPG');
        }
      }
    );
  };`;
code = code.replace(oldDeleteConfirm, newDeleteConfirm);

// 3. Replace window.confirm for Add
const oldAddConfirm = `          onClick={() => {
            if (window.confirm('Untuk menambah akun SPPG baru, Anda harus mendaftarkannya melalui halaman Registrasi. Mengunjungi halaman registrasi akan mengeluarkan (logout) Anda dari sesi Admin saat ini. Lanjutkan?')) {
              window.location.href = '/register';
            }
          }}`;

const newAddConfirm = `          onClick={() => {
            showConfirm(
              'Tambah SPPG Baru',
              'Untuk menambah akun SPPG baru, Anda harus mendaftarkannya melalui halaman Registrasi. Mengunjungi halaman registrasi akan mengeluarkan (logout) Anda dari sesi Admin saat ini. Lanjutkan?',
              () => {
                window.location.href = '/register';
              }
            );
          }}`;
code = code.replace(oldAddConfirm, newAddConfirm);

// Wait, the delete button was using setDeleteConfirm, or handleDelete directly?
// Let me check if handleDelete is called from onClick.
// Ah, the button does: onClick={() => setDeleteConfirm({ show: true, id: client.id })} !!
// Wait! `setDeleteConfirm` was doing something else? Let me check how it was used in ClientManagement.
