import fs from 'fs';
let code = fs.readFileSync('src/components/admin/ClientManagement.jsx', 'utf8');

// 1. Remove Add logic from Modal, make it Edit only
const oldModalHeader = `{currentClient ? 'Edit SPPG' : 'Tambah SPPG Baru'}`;
const newModalHeader = `'Edit Nama SPPG'`;
code = code.replace(oldModalHeader, newModalHeader);

// 2. Remove email and password from formData and inputs
const oldInputs = `                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Username / Email Login
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-mbg-blue-500 dark:text-white transition-all"
                    placeholder="Contoh: klien@email.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Password {currentClient && <span className="text-gray-400 font-normal text-xs">(Kosongkan jika tidak ingin diubah)</span>}
                  </label>
                  <input
                    type="password"
                    required={!currentClient}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-mbg-blue-500 dark:text-white transition-all"
                    placeholder={currentClient ? "••••••••" : "Minimal 6 karakter"}
                  />
                </div>`;

const newInputs = `                <div className="bg-yellow-50 dark:bg-yellow-900/30 p-4 rounded-xl border border-yellow-200 dark:border-yellow-800">
                  <p className="text-sm text-yellow-800 dark:text-yellow-400">
                    <strong>Catatan Keamanan:</strong> Email dan Password hanya dapat diubah oleh pemilik akun (Klien) melalui halaman profil mereka sendiri. Admin hanya diizinkan mengubah nama tampilan.
                  </p>
                </div>`;

code = code.replace(oldInputs, newInputs);

// 3. Update the Submit logic
const oldSubmit = `      if (currentClient) {
        await supabase.from('profiles').update({ name: formData.name }).eq('id', currentClient.id);
        toast.success('Data SPPG berhasil diperbarui');
      } else {
        toast.error('Menambah klien baru harus melalui halaman registrasi (Supabase Auth).');
        toast.success('SPPG berhasil ditambahkan');
      }`;

const newSubmit = `      if (currentClient) {
        await supabase.from('profiles').update({ name: formData.name }).eq('id', currentClient.id);
        toast.success('Nama SPPG berhasil diperbarui');
      }`;
code = code.replace(oldSubmit, newSubmit);

// 4. Update the "+ Tambah SPPG" button
const oldAddButton = `          <button 
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 px-4 py-2.5 bg-mbg-blue-600 hover:bg-mbg-blue-700 text-white font-medium rounded-xl shadow-lg shadow-mbg-blue-500/30 transition-all active:scale-95 whitespace-nowrap"
          >
            <Plus className="w-5 h-5" />
            <span className="hidden sm:inline">Tambah SPPG</span>
          </button>`;

const newAddButton = `          <button 
            onClick={() => {
              if (window.confirm('Untuk menambah akun SPPG baru, Anda harus mendaftarkannya melalui halaman Registrasi. Mengunjungi halaman registrasi akan mengeluarkan (logout) Anda dari sesi Admin saat ini. Lanjutkan?')) {
                window.location.href = '/register';
              }
            }}
            className="flex items-center gap-2 px-4 py-2.5 bg-mbg-blue-600 hover:bg-mbg-blue-700 text-white font-medium rounded-xl shadow-lg shadow-mbg-blue-500/30 transition-all active:scale-95 whitespace-nowrap"
          >
            <Plus className="w-5 h-5" />
            <span className="hidden sm:inline">Tambah SPPG Baru</span>
          </button>`;
code = code.replace(oldAddButton, newAddButton);

fs.writeFileSync('src/components/admin/ClientManagement.jsx', code);
console.log("Updated ClientManagement UI");
