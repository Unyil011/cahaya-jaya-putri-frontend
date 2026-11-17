import fs from 'fs';
let code = fs.readFileSync('src/pages/AdminDashboard.jsx', 'utf8');

const oldSetOrders = `      setOrders(formatted);`;

const newSetOrders = `      setOrders(prevOrders => {
        if (prevOrders.length === 0) return formatted;
        return formatted.map(newOrder => {
          const oldOrder = prevOrders.find(o => o.id === newOrder.id);
          if (!oldOrder) return newOrder;
          
          return {
            ...newOrder,
            items: newOrder.items.map(newItem => {
              const oldItem = oldOrder.items.find(i => i.id === newItem.id);
              if (!oldItem) return newItem;
              
              // Preserve local edits if they exist and order is still pending
              if (newOrder.status === 'pending') {
                return {
                  ...newItem,
                  searchName: oldItem.searchName !== undefined ? oldItem.searchName : newItem.searchName,
                  isSearchFocused: oldItem.isSearchFocused !== undefined ? oldItem.isSearchFocused : newItem.isSearchFocused,
                  hpp: (oldItem.hpp !== undefined && oldItem.hpp !== '') ? oldItem.hpp : newItem.hpp,
                  sellingPrice: (oldItem.sellingPrice !== undefined && oldItem.sellingPrice !== '') ? oldItem.sellingPrice : newItem.sellingPrice,
                  inventoryId: (oldItem.inventoryId !== undefined) ? oldItem.inventoryId : newItem.inventoryId,
                };
              }
              return newItem;
            })
          };
        });
      });`;

code = code.replace(oldSetOrders, newSetOrders);
fs.writeFileSync('src/pages/AdminDashboard.jsx', code);
console.log("Fixed state reset on interval in AdminDashboard");
