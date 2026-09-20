import fs from 'fs';
let code = fs.readFileSync('src/components/admin/ClientManagement.jsx', 'utf8');

if (!code.includes('import { supabase }')) {
  code = code.replace(/import api from '\.\.\/\.\.\/api';/g, "import { supabase } from '../../supabaseClient';");
}

code = code.replace(/const fetchClients = async \(\) => [\s\S]*?finally \{\s*setLoading\(false\);\s*\}\s*\};/, `const fetchClients = async () => {
  try {
    const { data, error } = await supabase.from('profiles').select('*').eq('role', 'client');
    if (error) throw error;
    setClients(data);
  } catch(e) {} finally { setLoading(false); }
};`);

code = code.replace(/await api\.put\(\`\/clients\/\$\{currentClient\.id\}\`[\s\S]*?\);/, `await supabase.from('profiles').update({ name: formData.name }).eq('id', currentClient.id);`);
code = code.replace(/await api\.post\('\/clients'[\s\S]*?\);/, `toast.error('Menambah klien baru harus melalui halaman registrasi (Supabase Auth).');`);
code = code.replace(/await api\.delete\(\`\/clients\/\$\{id\}\`\);/, `await supabase.from('profiles').delete().eq('id', id);`);

fs.writeFileSync('src/components/admin/ClientManagement.jsx', code);
console.log('ClientManagement rewritten');
