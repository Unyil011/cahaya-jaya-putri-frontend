import fs from 'fs';
let code = fs.readFileSync('src/pages/ForgotPassword.jsx', 'utf8');

if (!code.includes('supabase.auth.resetPasswordForEmail')) {
  // Add supabase import if not present
  if (!code.includes('import { supabase } from')) {
    code = code.replace("import toast from 'react-hot-toast';", "import toast from 'react-hot-toast';\nimport { supabase } from '../supabaseClient';");
  }

  const oldHandle = `  const handleReset = (e) => {
    e.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      setIsSent(true);
      toast.success('Link reset password telah dikirim ke email Anda!', {
        style: { background: 'rgba(255, 255, 255, 0.7)', backdropFilter: 'blur(10px)' },
      });
    }, 1500);
  };`;

  const newHandle = `  const handleReset = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + '/reset-password',
      });
      
      if (error) throw error;
      
      setIsSent(true);
      toast.success('Link reset password telah dikirim ke email Anda!', {
        style: { background: 'rgba(255, 255, 255, 0.7)', backdropFilter: 'blur(10px)' },
      });
    } catch (error) {
      console.error(error);
      toast.error(error.message || 'Gagal mengirim email reset', {
        style: { background: 'rgba(255, 255, 255, 0.7)', backdropFilter: 'blur(10px)' },
      });
    } finally {
      setIsLoading(false);
    }
  };`;

  code = code.replace(oldHandle, newHandle);
  fs.writeFileSync('src/pages/ForgotPassword.jsx', code);
  console.log("Updated ForgotPassword.jsx to use Supabase API");
} else {
  console.log("Already updated");
}
