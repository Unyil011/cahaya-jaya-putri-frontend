import fs from 'fs';
let code = fs.readFileSync('src/components/admin/ClientManagement.jsx', 'utf8');

// Use showConfirm from props
if (!code.includes('showConfirm })')) {
  code = code.replace('export default function ClientManagement({ isDarkMode }) {', 'export default function ClientManagement({ isDarkMode, showConfirm }) {');
}

// 1. Fix Add button
const oldAdd = `        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => {
            if (window.confirm('Untuk menambah akun SPPG baru, Anda harus mendaftarkannya melalui halaman Registrasi. Mengunjungi halaman registrasi akan mengeluarkan (logout) Anda dari sesi Admin saat ini. Lanjutkan?')) {
              window.location.href = '/register';
            }
          }}
          className="flex justify-center items-center gap-2 w-full sm:w-auto px-4 py-2 bg-mbg-blue-600 hover:bg-mbg-blue-700 text-white rounded-xl font-medium transition-colors shadow-sm text-sm md:text-base"
        >
          <Plus className="w-5 h-5" />
          Tambah SPPG Baru
        </motion.button>`;

const newAdd = `        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => {
            showConfirm(
              'Tambah SPPG Baru',
              'Untuk menambah akun SPPG baru, Anda harus mendaftarkannya melalui halaman Registrasi. Mengunjungi halaman registrasi akan mengeluarkan (logout) Anda dari sesi Admin saat ini. Lanjutkan?',
              () => {
                window.location.href = '/register';
              }
            );
          }}
          className="flex justify-center items-center gap-2 w-full sm:w-auto px-4 py-2 bg-mbg-blue-600 hover:bg-mbg-blue-700 text-white rounded-xl font-medium transition-colors shadow-sm text-sm md:text-base"
        >
          <Plus className="w-5 h-5" />
          Tambah SPPG Baru
        </motion.button>`;
code = code.replace(oldAdd, newAdd);

// 2. Fix Delete button
const oldDeleteBtn = `                          <button
                            onClick={() => setDeleteConfirm({ show: true, id: client.id })}
                            className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/20 rounded-lg transition-colors"
                            title="Hapus"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>`;

const newDeleteBtn = `                          <button
                            onClick={() => {
                              showConfirm(
                                'Hapus Akun SPPG',
                                'Yakin ingin menghapus SPPG ini? Semua data pesanan yang sudah ada tetap aman di sistem.',
                                async () => {
                                  try {
                                    await supabase.from('profiles').delete().eq('id', client.id);
                                    toast.success('SPPG berhasil dihapus');
                                    fetchClients();
                                  } catch (err) {
                                    toast.error('Gagal menghapus SPPG');
                                  }
                                }
                              );
                            }}
                            className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/20 rounded-lg transition-colors"
                            title="Hapus"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>`;
code = code.replace(oldDeleteBtn, newDeleteBtn);

fs.writeFileSync('src/components/admin/ClientManagement.jsx', code);
console.log("Updated ClientManagement to use showConfirm");
