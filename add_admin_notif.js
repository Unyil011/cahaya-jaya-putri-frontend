import fs from 'fs';
let code = fs.readFileSync('src/pages/AdminDashboard.jsx', 'utf8');

if (!code.includes('const prevOrdersRef = useRef')) {
  code = code.replace(
    "const [orders, setOrders] = useState([]);",
    "const [orders, setOrders] = useState([]);\n  const prevOrdersRef = useRef([]);"
  );
}

const replacement = `
      setOrders(prev => {
        if (!showLoading) {
           const newOrderIds = data.filter(d => d.status === 'pending').map(d => d.id);
           const oldOrderIds = prev.filter(o => o.status === 'pending').map(o => o.id);
           const freshlyAdded = newOrderIds.filter(id => !oldOrderIds.includes(id));
           if (freshlyAdded.length > 0) {
              const count = freshlyAdded.length;
              toast.success(\`Ada \${count} pesanan baru dari SPPG!\`, { duration: 6000, icon: '🛎️' });
           }
        }
        return data.map(o => ({
`;
code = code.replace("setOrders(data.map(o => ({", replacement);

fs.writeFileSync('src/pages/AdminDashboard.jsx', code);
console.log("Added notifications to AdminDashboard");
