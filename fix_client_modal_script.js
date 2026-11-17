import fs from 'fs';
let code = fs.readFileSync('src/components/client/ClientEditOrderModal.jsx', 'utf8');

// Replace function name
code = code.replace(/export default function OrderModal/, 'export default function ClientEditOrderModal');

// Remove handlePrint
code = code.replace(/,\s*handlePrint/, '');

// Make it always edit mode by removing the read-only part
// Basically strip {isEditing ? ... : ...}
// But wait, the easiest way is just to write a cleaner script to replace the whole file content!
