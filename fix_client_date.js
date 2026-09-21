import fs from 'fs';
let code = fs.readFileSync('src/pages/ClientDashboard.jsx', 'utf8');

// 1. Add states for custom order date and time
code = code.replace(
  "  const [inventories, setInventories] = useState([]);",
  `  const [inventories, setInventories] = useState([]);
  const [customDate, setCustomDate] = useState('');
  const [customTime, setCustomTime] = useState('');`
);

// 2. Modify handleSubmit to include custom_order_date
const oldHandleSubmit = `      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert([{ user_id: user.id, order_number: orderNumber, status: 'pending', payment_status: 'Belum Lunas', total_amount: 0 }])
        .select().single();`;

const newHandleSubmit = `      let customOrderDateObj = null;
      if (customDate) {
        // If time is not provided, default to current time
        const timePart = customTime || new Date().toTimeString().split(' ')[0].substring(0,5);
        customOrderDateObj = new Date(\`\${customDate}T\${timePart}:00+07:00\`).toISOString();
      }

      const orderPayload = { user_id: user.id, order_number: orderNumber, status: 'pending', payment_status: 'Belum Lunas', total_amount: 0 };
      if (customOrderDateObj) {
        orderPayload.custom_order_date = customOrderDateObj;
      }

      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert([orderPayload])
        .select().single();`;

code = code.replace(oldHandleSubmit, newHandleSubmit);

// 3. Add UI inputs for Date and Time above the dynamic rows
const oldDynamicRowsContainer = `                  {/* Dynamic Rows Container */}`;

const newDateTimeUI = `                  {/* Custom Date Time Selection */}
                  <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-gray-100 dark:border-slate-700">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                        Tanggal Pesanan (Opsional)
                      </label>
                      <input 
                        type="date"
                        value={customDate}
                        onChange={(e) => setCustomDate(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-mbg-blue-500 bg-white dark:bg-slate-700 dark:text-white"
                      />
                      <p className="text-xs text-gray-500 mt-1">Kosongkan jika untuk hari ini.</p>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                        Waktu Pesanan (Opsional)
                      </label>
                      <input 
                        type="time"
                        value={customTime}
                        onChange={(e) => setCustomTime(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-mbg-blue-500 bg-white dark:bg-slate-700 dark:text-white"
                      />
                      <p className="text-xs text-gray-500 mt-1">Hanya berlaku jika tanggal diisi.</p>
                    </div>
                  </div>

                  {/* Dynamic Rows Container */}`;

code = code.replace(oldDynamicRowsContainer, newDateTimeUI);

// Reset custom date/time on success
const oldSuccess = `      setItems([{ id: 1, itemName: '', quantity: '', unit: '' }]);`;
const newSuccess = `      setItems([{ id: 1, itemName: '', quantity: '', unit: '' }]);
      setCustomDate('');
      setCustomTime('');`;

code = code.replace(oldSuccess, newSuccess);


fs.writeFileSync('src/pages/ClientDashboard.jsx', code);
console.log("Updated ClientDashboard with Custom Date/Time");
