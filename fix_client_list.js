import fs from 'fs';
let code = fs.readFileSync('src/components/admin/ClientManagement.jsx', 'utf8');

const replacement = `<td className="py-3 px-4 font-bold text-gray-900 dark:text-white">
                        {client.name ? client.name.charAt(0).toUpperCase() + client.name.slice(1).toLowerCase() : (client.email ? client.email.split('@')[0].charAt(0).toUpperCase() + client.email.split('@')[0].slice(1).toLowerCase() : 'Unknown')}
                      </td>
                      <td className="py-3 px-4 text-gray-600 dark:text-gray-300">
                        {client.email || '-'}
                      </td>`;

code = code.replace(/<td className="py-3 px-4 font-bold text-gray-900 dark:text-white">[\s\S]*?<\/td>\s*<td className="py-3 px-4 text-gray-600 dark:text-gray-300">[\s\S]*?<\/td>/, replacement);

fs.writeFileSync('src/components/admin/ClientManagement.jsx', code);
