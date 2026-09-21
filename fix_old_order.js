import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const envFile = fs.readFileSync('.env', 'utf8');
const url = envFile.match(/VITE_SUPABASE_URL=(.*)/)[1].trim();
const key = envFile.match(/VITE_SUPABASE_ANON_KEY=(.*)/)[1].trim();

const supabase = createClient(url, key);

async function run() {
  const { data, error } = await supabase
    .from('orders')
    .update({ status: 'shipped_return' })
    .eq('order_number', 'ORD-20260920-460')
    .select();
  console.log(error ? error : "Updated old order to shipped_return!");
}
run();
