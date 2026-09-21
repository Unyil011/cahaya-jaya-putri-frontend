import fs from 'fs';
let code = fs.readFileSync('src/pages/Login.jsx', 'utf8');

if (!code.includes('useEffect(() => {')) {
  code = code.replace(
    "import { useState } from 'react';",
    "import { useState, useEffect } from 'react';"
  );
  
  const effectCode = `
  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    const role = localStorage.getItem('authRole');
    if (token && role) {
      if (role === 'admin') navigate('/admin/dashboard');
      else navigate('/client/dashboard');
    }
  }, [navigate]);
`;
  
  code = code.replace(
    "const navigate = useNavigate();",
    "const navigate = useNavigate();\n" + effectCode
  );
  
  fs.writeFileSync('src/pages/Login.jsx', code);
  console.log("Added login redirect");
} else {
  console.log("Login redirect already exists");
}
