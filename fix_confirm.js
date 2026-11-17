import fs from 'fs';
let code = fs.readFileSync('src/components/admin/InventoryManagement.jsx', 'utf8');

// Add import if not present
if (!code.includes('import ConfirmModal')) {
    code = code.replace("import { Package", "import ConfirmModal from './ConfirmModal';\nimport { Package");
}

// Replace handleDelete logic
const oldHandleDelete = `  const handleDelete = async (id) => {
    if (window.confirm('Yakin ingin menghapus barang ini dari stok?')) {
      try {
        await supabase.from('inventory').delete().eq('id', id);
        fetchInventories();
      } catch (err) {
        setError('Gagal menghapus barang');
      }
    }
  };`;

const newHandleDelete = `  const handleDeleteClick = (id) => {
    setDeleteConfirm({ show: true, id });
  };

  const confirmDelete = async () => {
    try {
      await supabase.from('inventory').delete().eq('id', deleteConfirm.id);
      fetchInventories();
      toast.success('Barang berhasil dihapus');
    } catch (err) {
      setError('Gagal menghapus barang');
      toast.error('Gagal menghapus barang');
    } finally {
      setDeleteConfirm({ show: false, id: null });
    }
  };`;

code = code.replace(oldHandleDelete, newHandleDelete);

// Replace the trash icon onClick
code = code.replace(/onClick=\{\(\) => handleDelete\(item\.id\)\}/g, "onClick={() => handleDeleteClick(item.id)}");

// Insert the ConfirmModal at the end of the return statement, just before the closing </div>
const returnEndStr = `    </div>
  );
}`;
const confirmModalStr = `      <ConfirmModal 
        isOpen={deleteConfirm.show}
        title="Hapus Barang"
        message="Yakin ingin menghapus barang ini dari stok? Tindakan ini tidak dapat dibatalkan."
        onConfirm={confirmDelete}
        onCancel={() => setDeleteConfirm({ show: false, id: null })}
      />
    </div>
  );
}`;
code = code.replace(returnEndStr, confirmModalStr);

fs.writeFileSync('src/components/admin/InventoryManagement.jsx', code);
console.log("Replaced window.confirm with ConfirmModal in InventoryManagement");
