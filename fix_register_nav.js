import fs from 'fs';
let code = fs.readFileSync('src/pages/Register.jsx', 'utf8');

const oldSuccess = `      toast.success('Akun SPPG berhasil dibuat! Silakan login.', { id: toastId });
      
      // Ensure we are signed out immediately so they have to login properly
      await supabase.auth.signOut();
      navigate('/admin/dashboard');`;

const newSuccess = `      toast.success('Akun SPPG berhasil dibuat! Sesi berpindah, silakan Login kembali sebagai Admin.', { id: toastId, duration: 5000 });
      
      // Supabase automatically logs in the newly created user.
      // To prevent the Admin from accidentally acting as the new Client, we must sign out.
      await supabase.auth.signOut();
      localStorage.removeItem('authRole'); // Clear custom role
      navigate('/'); // Go back to login page (which is at root "/")`;

code = code.replace(oldSuccess, newSuccess);

// Also fix the "Kembali ke Login" link
code = code.replace('<Link to="/login"', '<Link to="/"');

fs.writeFileSync('src/pages/Register.jsx', code);
console.log("Fixed Register navigation and logout");
