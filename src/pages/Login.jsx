import { useState } from 'react';
import { motion } from 'framer-motion';
import { LogIn, KeyRound, Eye, EyeOff } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import axios from 'axios';
import { supabase } from '../supabaseClient';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // Ambil profile role
      let { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .maybeSingle();

      // Jika profile belum terbuat (mungkin karena trigger belum jalan saat user mendaftar)
      if (!profileData) {
        const newProfile = {
          id: data.user.id,
          role: 'client',
          name: data.user.email.split('@')[0],
          email: data.user.email
        };
        const { data: insertedProfile, error: insertError } = await supabase
          .from('profiles')
          .insert([newProfile])
          .select()
          .single();
          
        if (insertError) throw insertError;
        profileData = insertedProfile;
      }

      const userRole = profileData.role;

      localStorage.setItem('auth_token', data.session.access_token);
      localStorage.setItem('authRole', userRole);
      localStorage.setItem('user', JSON.stringify({
        id: data.user.id,
        email: data.user.email,
        name: profileData.name,
        role: userRole
      }));

      toast.success(`Berhasil login sebagai ${userRole}!`, {
        style: { background: 'rgba(255, 255, 255, 0.7)', backdropFilter: 'blur(10px)' },
      });

      if (userRole === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/client/dashboard');
      }
    } catch (error) {
      toast.error(error.message || 'Email atau Password salah!', {
        style: { background: 'rgba(255, 255, 255, 0.7)', backdropFilter: 'blur(10px)' },
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-mbg-blue-50 to-mbg-blue-100 p-4 overflow-hidden">

      {/* Decorative Blur Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-mbg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
      <div className="absolute top-[20%] right-[-10%] w-96 h-96 bg-mbg-blue-600 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-[-10%] left-[20%] w-96 h-96 bg-mbg-blue-700 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="glass p-8 rounded-3xl shadow-xl border border-white/40">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-mbg-blue-900 mb-2">Login</h1>
            <p className="text-sm text-mbg-blue-700">Sistem Manajemen Pesanan & Invoice B2B</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-mbg-blue-900 mb-1">Email</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                  <LogIn className="h-5 w-5 text-mbg-blue-500" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-white/50 rounded-xl bg-white/30 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-mbg-blue-500 focus:border-transparent transition-all"
                  placeholder="anda@dapurmbg.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-mbg-blue-900 mb-1">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                  <KeyRound className="h-5 w-5 text-mbg-blue-500" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-10 py-3 border border-white/50 rounded-xl bg-white/30 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-mbg-blue-500 focus:border-transparent transition-all"
                  placeholder="••••••••"
                  required
                />
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-mbg-blue-500 hover:text-mbg-blue-700 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </motion.button>
              </div>
            </div>

            <div className="flex items-center justify-end">
              <Link to="/forgot-password" className="text-sm font-medium text-mbg-blue-600 hover:text-mbg-blue-800 transition-colors">
                Lupa password?
              </Link>
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
                'Masuk ke Dashboard'
              )}
            </motion.button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
