import fs from 'fs';
let code = fs.readFileSync('src/pages/AdminDashboard.jsx', 'utf8');

code = code.replace(
  "  useEffect(() => {\n    fetchOrders();\n    \n  }, []);",
  `  useEffect(() => {
    fetchOrders();
    const interval = setInterval(() => {
      fetchOrders(false);
    }, 10000);
    return () => clearInterval(interval);
  }, []);`
);

fs.writeFileSync('src/pages/AdminDashboard.jsx', code);
console.log("Added polling to AdminDashboard");
