import fs from 'fs';
let code = fs.readFileSync('src/pages/AdminDashboard.jsx', 'utf8');

const oldHandlePrice = `  const handlePriceChange = (orderId, itemId, field, value) => {
    let numericValue = value;
    if (field === 'sellingPrice' || field === 'hpp') {
      const strValue = String(value);
      numericValue = strValue.replace(/^0+(?=\d)/, '');
      if (parseFloat(numericValue) < 0) numericValue = '0';
    }
    
    setOrders(prevOrders => prevOrders.map(order => {
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

const newHandlePrice = `  const handlePriceChange = (orderId, itemId, field, value) => {
    setOrders(prevOrders => prevOrders.map(order => {
      if (order.id === orderId) {
        return {
          ...order,
          items: order.items.map(item => {
            if (item.id === itemId) {
              if (typeof field === 'object' && field !== null) {
                let updatedItem = { ...item };
                for (const [k, v] of Object.entries(field)) {
                  let numVal = v;
                  if (k === 'sellingPrice' || k === 'hpp') {
                    const strVal = String(v);
                    numVal = strVal.replace(/^0+(?=\d)/, '');
                    if (parseFloat(numVal) < 0) numVal = '0';
                  }
                  updatedItem[k] = numVal;
                }
                return updatedItem;
              } else {
                let numericValue = value;
                if (field === 'sellingPrice' || field === 'hpp') {
                  const strValue = String(value);
                  numericValue = strValue.replace(/^0+(?=\d)/, '');
                  if (parseFloat(numericValue) < 0) numericValue = '0';
                }
                return { ...item, [field]: numericValue };
              }
            }
            return item;
          })
        };
      }
      return order;
    }));
  };`;

code = code.replace(oldHandlePrice, newHandlePrice);
fs.writeFileSync('src/pages/AdminDashboard.jsx', code);
console.log("Updated handlePriceChange to support batch updates");
