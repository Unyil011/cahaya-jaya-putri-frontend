import fs from 'fs';
let code = fs.readFileSync('src/pages/AdminDashboard.jsx', 'utf8');

const oldHandlePriceChange = `  const handlePriceChange = (orderId, itemId, field, value) => {
    setOrders(orders.map(order => {
      if (order.id === orderId) {
        return {
          ...order,
          items: order.items.map(item => {
            if (item.id === itemId) {
              return { ...item, [field]: value };
            }
            return item;
          })
        };
      }
      return order;
    }));
  };`;

const newHandlePriceChange = `  const handlePriceChange = (orderId, itemId, field, value) => {
    let numericValue = value;
    if (field === 'sellingPrice' || field === 'hpp') {
      numericValue = value.replace(/^0+(?=\\d)/, '');
      if (parseFloat(numericValue) < 0) numericValue = '0';
    }
    
    setOrders(orders.map(order => {
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
    }));
  };`;

code = code.replace(oldHandlePriceChange, newHandlePriceChange);
fs.writeFileSync('src/pages/AdminDashboard.jsx', code);
console.log("Updated handlePriceChange in AdminDashboard");
