import fs from 'fs';
let code = fs.readFileSync('src/pages/ClientDashboard.jsx', 'utf8');

const oldHandleChange = `  const handleChange = (id, field, value) => {
    setItems(items.map(item =>
      item.id === id ? { ...item, [field]: value } : item
    ));
  };`;

const newHandleChange = `  const handleChange = (id, field, value) => {
    if (field === 'quantity') {
      let numericValue = value.replace(/^0+(?=\d)/, '');
      if (parseFloat(numericValue) < 0) numericValue = '0';
      setItems(items.map(item =>
        item.id === id ? { ...item, [field]: numericValue } : item
      ));
    } else {
      setItems(items.map(item =>
        item.id === id ? { ...item, [field]: value } : item
      ));
    }
  };`;

code = code.replace(oldHandleChange, newHandleChange);
fs.writeFileSync('src/pages/ClientDashboard.jsx', code);
console.log("Updated handleChange in ClientDashboard");
