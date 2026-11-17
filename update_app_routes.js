import fs from 'fs';
let code = fs.readFileSync('src/App.jsx', 'utf8');

if (!code.includes('import ResetPassword')) {
  code = code.replace("import ForgotPassword from './pages/ForgotPassword';", "import ForgotPassword from './pages/ForgotPassword';\nimport ResetPassword from './pages/ResetPassword';");
}

if (!code.includes('path="/reset-password"')) {
  code = code.replace('<Route path="/forgot-password" element={<ForgotPassword />} />', '<Route path="/forgot-password" element={<ForgotPassword />} />\n        <Route path="/reset-password" element={<ResetPassword />} />');
}

fs.writeFileSync('src/App.jsx', code);
console.log("Updated App.jsx routing");
