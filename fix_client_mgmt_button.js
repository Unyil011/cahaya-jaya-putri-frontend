import fs from 'fs';
let code = fs.readFileSync('src/components/admin/ClientManagement.jsx', 'utf8');

// 1. Fix the + Tambah SPPG button
const oldBtn = `        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => handleOpenModal()}
          className="flex justify-center items-center gap-2 w-full sm:w-auto px-4 py-2 bg-mbg-blue-600 hover:bg-mbg-blue-700 text-white rounded-xl font-medium transition-colors shadow-sm text-sm md:text-base"
        >
          <Plus className="w-5 h-5" />
          Tambah SPPG
        </motion.button>`;

const newBtn = `        <motion.button
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

if (code.includes('handleOpenModal()') && code.includes('Tambah SPPG')) {
  code = code.replace(oldBtn, newBtn);
  console.log("Replaced Add button");
}

fs.writeFileSync('src/components/admin/ClientManagement.jsx', code);
