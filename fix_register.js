import fs from 'fs';

let code = fs.readFileSync('src/pages/Register.jsx', 'utf8');

// Replace insert with upsert
code = code.replace(
  /\.insert\(\[\s*\{\s*id: data\.user\.id,\s*name: formData\.name,\s*email: formData\.email,\s*role: 'client'\s*\}\s*\]\)/g,
  ".upsert([{ id: data.user.id, name: formData.name, email: formData.email, role: 'client' }])"
);

fs.writeFileSync('src/pages/Register.jsx', code);
console.log("Updated Register.jsx to use upsert");
