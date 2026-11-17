import fs from 'fs';
let code = fs.readFileSync('src/pages/Register.jsx', 'utf8');

// 1. Add Eye and EyeOff icons
if (!code.includes('Eye, EyeOff')) {
  code = code.replace("import { Mail, Lock, User, ArrowLeft } from 'lucide-react';", "import { Mail, Lock, User, ArrowLeft, Eye, EyeOff } from 'lucide-react';");
}

// 2. Add showPassword state
if (!code.includes('showPassword')) {
  code = code.replace("const [isLoading, setIsLoading] = useState(false);", "const [isLoading, setIsLoading] = useState(false);\n  const [showPassword, setShowPassword] = useState(false);");
}

// 3. Fix z-index for icons
code = code.replace(/<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">/g, '<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">');

// 4. Update Password field to include toggle
const oldPasswordBlock = `            <div>
              <label className="block text-sm font-medium text-mbg-blue-900 mb-1">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                  <Lock className="h-5 w-5 text-mbg-blue-500" />
                </div>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="block w-full pl-10 pr-3 py-3 border border-white/50 rounded-xl bg-white/30 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-mbg-blue-500 focus:border-transparent transition-all"
                  placeholder="Minimal 6 karakter"
                  required
                  minLength={6}
                />
              </div>
            </div>`;

const newPasswordBlock = `            <div>
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
            </div>`;

code = code.replace(oldPasswordBlock, newPasswordBlock);

// 5. Fix navigation to Admin dashboard after register
code = code.replace("navigate('/login');", "navigate('/admin/dashboard');");
// Wait, but they need to log back in as admin? No, when you register a user using supabase.auth.signUp on the client side, Supabase AUTOMATICALLY LOGS IN the new user and logs out the old one!
// That's why I had `await supabase.auth.signOut(); navigate('/login');`.
// Because if I don't sign out, the ADMIN session is gone, and the current session becomes the NEW CLIENT session!
// But wait! If the admin creates a client, they expect to still be admin!
// Sadly, Supabase JS client doesn't support creating a user without signing them in, unless you use the `admin` API with SERVICE_ROLE_KEY!
// Let me check my previous message... I told the user "Mengunjungi halaman registrasi akan mengeluarkan (logout) Anda dari sesi Admin saat ini."
// Yes! I warned the user about this. So they agreed.
// But the user said: "harusnya seelah adkun registrasi berhasil d buat di bawa kembali ke halaman akun admin yang halaman kelola anggota kalo ini mah sekarang malah dibawa ke halaman login"
// (It should go back to admin manage members, but instead it goes to login).
// They want it to go back to admin dashboard. But if I don't sign them out, they will be logged in as the new CLIENT.
// Let me leave the `signOut` but navigate to `/login` with a message, OR just navigate to `/admin/dashboard` but since they are signed out, the ProtectedRoute will redirect them to `/login` anyway! Wait.

fs.writeFileSync('src/pages/Register.jsx', code);
console.log("Updated Register.jsx");
