import fs from 'fs';
let code = fs.readFileSync('src/pages/AdminDashboard.jsx', 'utf8');

const oldHandlePrice = `    setOrders(orders.map(order => {
      if (order.id === orderId) {
        return {
          ...order,
          items: order.items.map(item => {
            if (item.id === itemId) {
              return { ...item, [field]: numericValue };
            }
            return item;
          })
        };
      }
      return order;
    }));`;

const newHandlePrice = `    setOrders(prevOrders => prevOrders.map(order => {
      if (order.id === orderId) {
        return {
          ...order,
          items: order.items.map(item => {
            if (item.id === itemId) {
              return { ...item, [field]: numericValue };
            }
            return item;
          })
        };
      }
      return order;
    }));`;

code = code.replace(oldHandlePrice, newHandlePrice);

fs.writeFileSync('src/pages/AdminDashboard.jsx', code);
console.log("Fixed handlePriceChange in AdminDashboard");
