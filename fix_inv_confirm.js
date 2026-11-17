import fs from 'fs';
let code = fs.readFileSync('src/components/admin/InventoryManagement.jsx', 'utf8');

if (!code.includes('showConfirm })')) {
  code = code.replace('export default function InventoryManagement({ isDarkMode }) {', 'export default function InventoryManagement({ isDarkMode, showConfirm }) {');
}

const oldDelete = `  const handleDelete = async (id) => {
    if (window.confirm('Yakin ingin menghapus barang ini dari stok?')) {
      try {
        await supabase.from('inventory').delete().eq('id', id);
        fetchInventories();
        toast.success('Barang berhasil dihapus');
      } catch (err) {
        toast.error('Gagal menghapus barang');
      }
    }
  };`;

const newDelete = `  const handleDelete = (id) => {
    showConfirm(
      'Hapus Barang',
      'Yakin ingin menghapus barang ini dari stok?',
      async () => {
        try {
          await supabase.from('inventory').delete().eq('id', id);
          fetchInventories();
          toast.success('Barang berhasil dihapus');
        } catch (err) {
          toast.error('Gagal menghapus barang');
        }
      }
    );
  };`;

if (code.includes('window.confirm')) {
  code = code.replace(oldDelete, newDelete);
  fs.writeFileSync('src/components/admin/InventoryManagement.jsx', code);
  console.log("Updated InventoryManagement to use showConfirm");
}
