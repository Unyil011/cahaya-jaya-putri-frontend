import fs from 'fs';

function replaceConfirm(file) {
  let code = fs.readFileSync(file, 'utf8');
  
  // Add state for delete modal
  if (!code.includes('deleteConfirm')) {
    code = code.replace(/const \[isSubmitting, setIsSubmitting\] = useState\(false\);/, "const [isSubmitting, setIsSubmitting] = useState(false);\n  const [deleteConfirm, setDeleteConfirm] = useState({ show: false, id: null });");
  }
  
  // Replace handle delete logic
  if (file.includes('ClientManagement')) {
    code = code.replace(/const handleDelete = async \(id\) => \{\n\s*if \(window\.confirm\('Yakin ingin menghapus SPPG ini\? Semua data pesanan yang sudah ada tetap aman di sistem\.'\)\) \{\n\s*try \{\n\s*await supabase\.from\('profiles'\)\.delete\(\)\.eq\('id', id\);\n\s*setClients\(clients\.filter\(c => c\.id !== id\)\);\n\s*toast\.success\('SPPG berhasil dihapus'\);\n\s*\} catch \(e\) \{\n\s*toast\.error\('Gagal menghapus SPPG'\);\n\s*\}\n\s*\}\n\s*\};/, 
    `const handleDelete = async (id) => {
    try {
      await supabase.from('profiles').delete().eq('id', id);
      setClients(clients.filter(c => c.id !== id));
      toast.success('SPPG berhasil dihapus');
    } catch (e) {
      toast.error('Gagal menghapus SPPG');
    } finally {
      setDeleteConfirm({ show: false, id: null });
    }
  };`);
  } else if (file.includes('InventoryManagement')) {
    code = code.replace(/const handleDelete = async \(id\) => \{\n\s*if \(window\.confirm\('Yakin ingin menghapus barang ini dari stok\?'\)\) \{\n\s*try \{\n\s*await supabase\.from\('inventory'\)\.delete\(\)\.eq\('id', id\);\n\s*toast\.success\('Barang dihapus'\);\n\s*fetchInventories\(\);\n\s*\} catch \(err\) \{\n\s*toast\.error\('Gagal menghapus barang'\);\n\s*\}\n\s*\}\n\s*\};/, 
    `const handleDelete = async (id) => {
    try {
      await supabase.from('inventory').delete().eq('id', id);
      toast.success('Barang dihapus');
      fetchInventories();
    } catch (err) {
      toast.error('Gagal menghapus barang');
    } finally {
      setDeleteConfirm({ show: false, id: null });
    }
  };`);
  }

  // Find where to insert the modal JSX (just before the last closing div)
  const modalJSX = `
      {deleteConfirm.show && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-sm overflow-hidden border border-gray-100 dark:border-slate-800">
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Konfirmasi Hapus</h3>
              <p className="text-gray-500 text-sm mb-6">Yakin ingin menghapus data ini? Tindakan ini tidak dapat dibatalkan.</p>
              <div className="flex gap-3">
                <button onClick={() => setDeleteConfirm({ show: false, id: null })} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-medium hover:bg-gray-50">Batal</button>
                <button onClick={() => handleDelete(deleteConfirm.id)} className="flex-1 py-2.5 rounded-xl bg-red-600 text-white font-medium hover:bg-red-700">Ya, Hapus</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>`;
  
  code = code.replace(/<\/div>\s*$/, modalJSX);

  // Replace onClick calls to open modal instead of confirm
  code = code.replace(/onClick=\{\(\) => handleDelete\(client\.id\)\}/g, "onClick={() => setDeleteConfirm({ show: true, id: client.id })}");
  code = code.replace(/onClick=\{\(\) => handleDelete\(inventory\.id\)\}/g, "onClick={() => setDeleteConfirm({ show: true, id: inventory.id })}");
  
  fs.writeFileSync(file, code);
}

replaceConfirm('src/components/admin/ClientManagement.jsx');
replaceConfirm('src/components/admin/InventoryManagement.jsx');
console.log('Fixed window.confirm');
