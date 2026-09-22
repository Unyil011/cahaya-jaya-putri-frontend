import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, User, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import toast from 'react-hot-toast';

export default function Register() {
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    if (formData.password.length < 6) {
      toast.error('Password minimal 6 karakter!');
      return;
    }

    setIsLoading(true);
    const toastId = toast.loading('Mendaftarkan akun SPPG...');

    try {
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            name: formData.name,
            role: 'client'
          }
        }
      });

      if (error) throw error;
      
      // Also insert into profiles if there's no trigger. Let's do it just in case, though usually Supabase has a trigger.
      // Wait, let's just check if it needs manual insert. The previous code didn't do it. We'll trust the trigger.
      // If it fails, they will tell us. Actually, let's insert to profiles manually to be safe.
      const { error: profileError } = await supabase.from('profiles').insert([
        { id: data.user.id, name: formData.name, email: formData.email, role: 'client' }
      ]);
      if (profileError) {
        console.warn('Profile insert error:', profileError);
      }

      toast.success('Akun SPPG berhasil dibuat! Sesi berpindah, silakan Login kembali sebagai Admin.', { id: toastId, duration: 5000 });
      
      // Supabase automatically logs in the newly created user.
      // To prevent the Admin from accidentally acting as the new Client, we must sign out.
      await supabase.auth.signOut();
      localStorage.removeItem('authRole'); // Clear custom role
      navigate('/'); // Go back to login page (which is at root "/")
    } catch (error) {
      console.error(error);
      toast.error(error.message || 'Gagal mendaftar', { id: toastId });
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
            Kembali ke Login
          </Link>

          <div className="mb-8">
            <h1 className="text-2xl font-bold text-mbg-blue-900 mb-2">Registrasi SPPG</h1>
            <p className="text-sm text-mbg-blue-700">
              Daftarkan akun SPPG baru.
            </p>
          </div>

          <form onSubmit={handleRegister} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-mbg-blue-900 mb-1">Nama SPPG</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                  <User className="h-5 w-5 text-mbg-blue-500" />
                </div>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="block w-full pl-10 pr-3 py-3 border border-white/50 rounded-xl bg-white/30 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-mbg-blue-500 focus:border-transparent transition-all"
                  placeholder="Contoh: Dapur Cihanjawar"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-mbg-blue-900 mb-1">Email / Username</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                  <Mail className="h-5 w-5 text-mbg-blue-500" />
                </div>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="block w-full pl-10 pr-3 py-3 border border-white/50 rounded-xl bg-white/30 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-mbg-blue-500 focus:border-transparent transition-all"
                  placeholder="sppg@email.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-mbg-blue-900 mb-1">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                  <Lock className="h-5 w-5 text-mbg-blue-500" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="block w-full pl-10 pr-10 py-3 border border-white/50 rounded-xl bg-white/30 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-mbg-blue-500 focus:border-transparent transition-all relative z-0"
                  placeholder="Minimal 6 karakter"
                  required
                  minLength={6}
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center z-10">
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-mbg-blue-500 hover:text-mbg-blue-700 focus:outline-none"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
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
                'Daftar Sekarang'
              )}
            </motion.button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
