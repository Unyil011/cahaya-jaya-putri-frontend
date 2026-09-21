import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const envFile = fs.readFileSync('.env', 'utf8');
const url = envFile.match(/VITE_SUPABASE_URL=(.*)/)[1].trim();
const key = envFile.match(/VITE_SUPABASE_ANON_KEY=(.*)/)[1].trim();

const supabase = createClient(url, key);

async function check() {
  const { data, error } = await supabase
    .from('returns')
    .select('*, orders!inner(id, order_number, status)')
    .eq('orders.status', 'complained');
  console.log(error ? error : `Found ${data.length} complained returns`);
}
check();
