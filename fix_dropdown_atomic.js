import fs from 'fs';
let code = fs.readFileSync('src/components/admin/InventoryManagement.jsx', 'utf8');

const selectFunc = `
  const handleStockSelect = (id, inv) => {
    setUpdateStockItems(items => items.map(item => 
      item.id === id ? { ...item, search_name: inv.item_name, inventory_id: inv.id, isFocused: false } : item
    ));
  };
`;

// Insert the new function right before handleUpdateStockSubmit
code = code.replace(/const handleUpdateStockSubmit = async/g, selectFunc + '\n  const handleUpdateStockSubmit = async');

// Replace the old onMouseDown block
const oldMouseDownRegex = /onMouseDown=\{\(e\) => \{ e\.preventDefault\(\);\s*handleStockChange\(item\.id, 'search_name', inv\.item_name\);\s*handleStockChange\(item\.id, 'inventory_id', inv\.id\);\s*handleStockChange\(item\.id, 'isFocused', false\);\s*\}\}/g;

code = code.replace(oldMouseDownRegex, "onMouseDown={() => handleStockSelect(item.id, inv)}");

fs.writeFileSync('src/components/admin/InventoryManagement.jsx', code);
console.log("Fixed dropdown click logic with single atomic update");
