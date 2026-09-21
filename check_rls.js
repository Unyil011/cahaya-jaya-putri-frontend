import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const envFile = fs.readFileSync('.env', 'utf8');
const url = envFile.match(/VITE_SUPABASE_URL=(.*)/)[1].trim();
const key = envFile.match(/VITE_SUPABASE_ANON_KEY=(.*)/)[1].trim();

const supabase = createClient(url, key);

async function check() {
  const { data, error } = await supabase
    .from('orders')
    .select('id, user_id, payment_proof_url')
    .limit(1);
    
  console.log("Order fetch:", error || "Success");
  
  if (data && data.length > 0) {
    const testId = data[0].id;
    const { error: updateError } = await supabase
      .from('orders')
      .update({ payment_proof_url: 'test' })
      .eq('id', testId);
    console.log("Order update without auth:", updateError || "Success");
  }
}
check();
