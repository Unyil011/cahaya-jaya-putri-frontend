import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const envFile = fs.readFileSync('.env', 'utf8');
const url = envFile.match(/VITE_SUPABASE_URL=(.*)/)[1].trim();
const key = envFile.match(/VITE_SUPABASE_ANON_KEY=(.*)/)[1].trim();

const supabase = createClient(url, key);

async function check() {
  const { data: orders } = await supabase.from('orders').select('id, status, order_number').eq('order_number', 'ORD-20260921-744');
  console.log("Order:", orders);
  if(orders.length > 0) {
     const { data: returns } = await supabase.from('returns').select('id, status, order_id').eq('order_id', orders[0].id);
     console.log("Returns:", returns);
  }
}
check();
