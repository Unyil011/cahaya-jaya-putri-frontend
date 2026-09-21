import fs from 'fs';
let code = fs.readFileSync('src/api.js', 'utf8');

const oldCreateOrder = `export const createOrder = async (userId, items, orderNumber) => {
  try {
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert([
        { 
          user_id: userId,
          order_number: orderNumber,
          status: 'pending',
          payment_status: 'Belum Lunas',
          total_amount: 0
        }
      ])`;

const newCreateOrder = `export const createOrder = async (userId, items, orderNumber, customOrderDate = null) => {
  try {
    const orderPayload = { 
      user_id: userId,
      order_number: orderNumber,
      status: 'pending',
      payment_status: 'Belum Lunas',
      total_amount: 0
    };
    if (customOrderDate) {
      orderPayload.custom_order_date = customOrderDate;
    }

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert([orderPayload])`;

code = code.replace(oldCreateOrder, newCreateOrder);
fs.writeFileSync('src/api.js', code);
console.log("Updated createOrder in api.js");
