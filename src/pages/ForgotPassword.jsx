import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const handleReset = (e) => {
    e.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      setIsSent(true);
      toast.success('Link reset password telah dikirim ke email Anda!', {
        style: { background: 'rgba(255, 255, 255, 0.7)', backdropFilter: 'blur(10px)' },
      });
    }, 1500);
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-mbg-blue-50 to-mbg-blue-100 p-4 overflow-hidden">
      
      {/* Decorative Blur Orbs */}
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
            <h1 className="text-2xl font-bold text-mbg-blue-900 mb-2">Lupa Password?</h1>
            <p className="text-sm text-mbg-blue-700">
              {isSent 
                ? "Silakan periksa kotak masuk email Anda untuk instruksi selanjutnya."
                : "Masukkan email yang terdaftar, kami akan mengirimkan link untuk mereset password Anda."}
            </p>
          </div>

          {!isSent ? (
            <form onSubmit={handleReset} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-mbg-blue-900 mb-1">Email Anda</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-mbg-blue-500" />
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
                  'Kirim Link Reset'
                )}
              </motion.button>
            </form>
          ) : (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              className="p-4 rounded-xl bg-green-50 border border-green-200 text-green-800 text-sm"
            >
              Link reset password berhasil dikirim ke <strong>{email}</strong>.
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
