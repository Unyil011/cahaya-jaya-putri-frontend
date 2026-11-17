import fs from 'fs';
let code = fs.readFileSync('src/App.jsx', 'utf8');

if (!code.includes('import Register')) {
  code = code.replace("import ResetPassword from './pages/ResetPassword';", "import ResetPassword from './pages/ResetPassword';\nimport Register from './pages/Register';");
}

if (!code.includes('path="/register"')) {
  code = code.replace('<Route path="/forgot-password" element={<ForgotPassword />} />', '<Route path="/register" element={<Register />} />\n        <Route path="/forgot-password" element={<ForgotPassword />} />');
}

fs.writeFileSync('src/App.jsx', code);
console.log("Updated App.jsx with Register route");
