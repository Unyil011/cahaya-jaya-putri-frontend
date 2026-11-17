import fs from 'fs';
let code = fs.readFileSync('src/pages/AdminDashboard.jsx', 'utf8');

const oldHandlePrice = `  const handlePriceChange = (orderId, itemId, field, value) => {
    let numericValue = value;
    if (field === 'sellingPrice' || field === 'hpp') {
      numericValue = value.replace(/^0+(?=\d)/, '');
      if (parseFloat(numericValue) < 0) numericValue = '0';
    }`;

const newHandlePrice = `  const handlePriceChange = (orderId, itemId, field, value) => {
    let numericValue = value;
    if (field === 'sellingPrice' || field === 'hpp') {
      const strValue = String(value);
      numericValue = strValue.replace(/^0+(?=\d)/, '');
      if (parseFloat(numericValue) < 0) numericValue = '0';
    }`;

code = code.replace(oldHandlePrice, newHandlePrice);
fs.writeFileSync('src/pages/AdminDashboard.jsx', code);
console.log("Fixed handlePriceChange String conversion in AdminDashboard");
