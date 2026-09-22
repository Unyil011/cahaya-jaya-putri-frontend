import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Lock, ArrowLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import toast from 'react-hot-toast';

export default function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if the user is actually in a recovery session
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error('Sesi tidak valid atau telah kedaluwarsa. Silakan ulangi proses lupa password.');
        navigate('/');
      }
    };
    checkSession();
  }, [navigate]);

  const handleReset = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error('Password tidak cocok!');
      return;
    }
    if (password.length < 6) {
      toast.error('Password minimal 6 karakter!');
      return;
    }

    setIsLoading(true);
    const toastId = toast.loading('Menyimpan password baru...');

    try {
      const { error } = await supabase.auth.updateUser({ password: password });
      if (error) throw error;

      toast.success('Password berhasil diubah!', { id: toastId });
      
      // Sign out immediately so they have to login with new password (optional, but good practice)
      await supabase.auth.signOut();
      navigate('/');
    } catch (error) {
      console.error(error);
      toast.error(error.message || 'Gagal mengubah password', { id: toastId });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-mbg-blue-50 to-mbg-blue-100 p-4 overflow-hidden">
      <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-mbg-blue-600 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-96 h-96 bg-mbg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="glass p-8 rounded-3xl shadow-xl border border-white/40">
          <Link to="/" className="inline-flex items-center text-sm font-medium text-mbg-blue-600 hover:text-mbg-blue-800 mb-6 transition-colors">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Batal & Kembali ke Login
          </Link>

          <div className="mb-8">
            <h1 className="text-2xl font-bold text-mbg-blue-900 mb-2">Buat Password Baru</h1>
            <p className="text-sm text-mbg-blue-700">
              Silakan masukkan password baru Anda.
            </p>
          </div>

          <form onSubmit={handleReset} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-mbg-blue-900 mb-1">Password Baru</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-mbg-blue-500" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-white/50 rounded-xl bg-white/30 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-mbg-blue-500 focus:border-transparent transition-all"
                  placeholder="Minimal 6 karakter"
                  required
                  minLength={6}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-mbg-blue-900 mb-1">Konfirmasi Password Baru</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-mbg-blue-500" />
                </div>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-white/50 rounded-xl bg-white/30 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-mbg-blue-500 focus:border-transparent transition-all"
                  placeholder="Ketik ulang password"
                  required
                  minLength={6}
                />
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-mbg-blue-600 hover:bg-mbg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-mbg-blue-500 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                  className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                />
              ) : (
                'Simpan Password Baru'
              )}
            </motion.button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
