import fs from 'fs';
let code = fs.readFileSync('src/components/client/ClientHistory.jsx', 'utf8');

const oldFetch = `        .select(\`
          id,
          order_number,
          status,
          payment_status,
          total_amount,
          created_at,
          order_items (*), returns (*)
        \`)
        .eq('client_id', userData.id)
        .in('status', ['completed']);`;

const newFetch = `        .select(\`
          id,
          order_number,
          status,
          payment_status,
          total_amount,
          created_at,
          order_items (*), returns (*)
        \`)
        .eq('client_id', userData.id)
        .in('status', ['completed'])
        .not('is_deleted_by_client', 'eq', true);`;

code = code.replace(oldFetch, newFetch);

const oldDeleteBulk = `const { error } = await supabase.from('orders').delete().in('id', selectedIds);`;
const newDeleteBulk = `const { error } = await supabase.from('orders').update({ is_deleted_by_client: true }).in('id', selectedIds);`;
code = code.replace(oldDeleteBulk, newDeleteBulk);

const oldDeleteSingle = `const { error } = await supabase.from('orders').delete().eq('id', id);`;
const newDeleteSingle = `const { error } = await supabase.from('orders').update({ is_deleted_by_client: true }).eq('id', id);`;
code = code.replace(oldDeleteSingle, newDeleteSingle);

fs.writeFileSync('src/components/client/ClientHistory.jsx', code);
console.log("Updated ClientHistory to use soft deletes");
