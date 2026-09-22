import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Plus, Edit2, Trash2, X, Check, Search, Lock } from 'lucide-react';
import toast from 'react-hot-toast';
import { supabase } from '../../supabaseClient';

export default function ClientManagement({ isDarkMode, showConfirm }) {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentClient, setCurrentClient] = useState(null);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState({ show: false, id: null });

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
  try {
    const { data, error } = await supabase.from('profiles').select('*').eq('role', 'client');
    if (error) throw error;
    setClients(data);
  } catch(e) {} finally { setLoading(false); }
};

  const handleOpenModal = (client = null) => {
    if (client) {
      setCurrentClient(client);
      setFormData({ name: client.name, email: client.email, password: '' });
    } else {
      setCurrentClient(null);
      setFormData({ name: '', email: '', password: '' });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentClient(null);
    setFormData({ name: '', email: '', password: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);
      if (currentClient) {
        await supabase.from('profiles').update({ name: formData.name }).eq('id', currentClient.id);
        toast.success('Nama SPPG berhasil diperbarui');
      }
      handleCloseModal();
      fetchClients();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal menyimpan data');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Yakin ingin menghapus SPPG ini? Semua data pesanan yang sudah ada tetap aman di sistem.')) {
      try {
        await supabase.from('profiles').delete().eq('id', id);
        toast.success('SPPG berhasil dihapus');
        fetchClients();
      } catch (err) {
        toast.error('Gagal menghapus SPPG');
      }
    }
  };

  const filteredClients = clients.filter(client => 
    (client.name || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
    (client.email || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative w-full sm:w-64">
          <Search className="w-5 h-5 absolute left-3 top-2.5 text-gray-400" />
          <input
            type="text"
            placeholder="Cari nama SPPG..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-mbg-blue-500 dark:text-white transition-all shadow-sm"
          />
        </div>

        <motion.button
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
        </motion.button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500">Memuat data SPPG...</div>
      ) : filteredClients.length === 0 ? (
        <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-md rounded-3xl p-12 text-center shadow-xl border border-gray-200 dark:border-slate-700/80">
          <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-700 dark:text-gray-300">Data SPPG Kosong</h3>
          <p className="text-gray-500 mt-2">Belum ada akun SPPG yang terdaftar.</p>
        </div>
      ) : (
        <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-md rounded-3xl shadow-xl border border-gray-200 dark:border-slate-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 dark:bg-slate-800/50 border-b border-gray-200 dark:border-slate-700">
                  <th className="py-4 px-6 font-semibold text-gray-600 dark:text-gray-300 w-16 text-center">No</th>
                  <th className="py-4 px-6 font-semibold text-gray-600 dark:text-gray-300">Nama SPPG</th>
                  <th className="py-4 px-6 font-semibold text-gray-600 dark:text-gray-300">Username/Email</th>
                  <th className="py-4 px-6 font-semibold text-gray-600 dark:text-gray-300 text-center w-32">Aksi</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {filteredClients.map((client, index) => (
                    <motion.tr
                      key={client.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="border-b border-gray-100 dark:border-slate-800/50 hover:bg-gray-50/50 dark:hover:bg-slate-800/50 transition-colors whitespace-nowrap"
                    >
                      <td className="py-4 px-6 text-gray-500 dark:text-gray-400 text-center font-medium">
                        {index + 1}
                      </td>
                      <td className="py-4 px-6">
                        <span className="font-bold text-gray-900 dark:text-white">{client.name}</span>
                      </td>
                      <td className="py-4 px-6 text-gray-600 dark:text-gray-300">
                        {client.email}
                      </td>
                      <td className="py-4 px-6 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleOpenModal(client)}
                            className="p-2 text-mbg-blue-500 hover:bg-mbg-blue-50 dark:hover:bg-mbg-blue-500/20 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit2 className="w-5 h-5" />
                          </button>
                          <button
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
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Tambah/Edit */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm"
            onClick={handleCloseModal}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-gray-200 dark:border-slate-700 w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="px-6 py-4 border-b border-gray-100 dark:border-slate-800 flex justify-between items-center bg-gray-50/50 dark:bg-slate-800/50">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  'Edit Nama SPPG'
                </h3>
                <button
                  onClick={handleCloseModal}
                  className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
                <div className="p-6 overflow-y-auto flex-1 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Nama SPPG
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 focus:ring-2 focus:ring-mbg-blue-500 text-gray-900 dark:text-white transition-all shadow-sm"
                      placeholder="Masukkan nama SPPG..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Username / Email
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 focus:ring-2 focus:ring-mbg-blue-500 text-gray-900 dark:text-white transition-all shadow-sm"
                      placeholder="Contoh: rscm@gmail.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Password {currentClient && <span className="text-gray-400 font-normal">(Kosongkan jika tidak diubah)</span>}
                    </label>
                    <div className="relative">
                      <Lock className="w-5 h-5 absolute left-3 top-3 text-gray-400" />
                      <input
                        type="password"
                        required={!currentClient}
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 focus:ring-2 focus:ring-mbg-blue-500 text-gray-900 dark:text-white transition-all shadow-sm"
                        placeholder={currentClient ? "Ketik password baru..." : "Buat password..."}
                      />
                    </div>
                  </div>
                </div>

                <div className="p-6 border-t border-gray-100 dark:border-slate-700 shrink-0 flex justify-end gap-3 bg-white dark:bg-slate-800">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="px-5 py-2.5 text-gray-600 dark:text-gray-300 font-medium hover:bg-gray-100 dark:hover:bg-slate-700 rounded-xl transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-5 py-2.5 bg-mbg-blue-600 hover:bg-mbg-blue-700 text-white font-medium rounded-xl shadow-sm transition-colors flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} className="w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
                    ) : (
                      <Check className="w-5 h-5" />
                    )}
                    Simpan
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
