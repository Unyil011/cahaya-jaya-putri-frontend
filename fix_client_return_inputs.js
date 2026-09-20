import fs from 'fs';
let code = fs.readFileSync('src/components/client/ClientActiveOrders.jsx', 'utf8');

const regex = /<input\s*type="number"\s*min="1"\s*max=\{item\.quantity\}\s*value=\{returnItems\[item\.id\]\?\.qty \|\| ''\}\s*onChange=\{\(e\) => handleReturnChange\(item\.id, 'qty', e\.target\.value\)\}\s*className="w-20 px-2 py-1 text-sm border border-gray-300 dark:border-slate-600 rounded focus:ring-1 focus:ring-red-500 outline-none bg-white dark:bg-slate-800 text-gray-900 dark:text-white"\s*placeholder="Qty \(kg\)"\s*\/>/;

const replacement = `<input 
                                  type="number" 
                                  min="0.1" 
                                  step="any"
                                  value={returnItems[item.id]?.qty || ''}
                                  onChange={(e) => handleReturnChange(item.id, 'qty', e.target.value)}
                                  className="w-16 px-2 py-1 text-sm border border-gray-300 dark:border-slate-600 rounded focus:ring-1 focus:ring-red-500 outline-none bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
                                  placeholder="Jml"
                                />
                                <input 
                                  type="text" 
                                  value={returnItems[item.id]?.unit || ''}
                                  onChange={(e) => handleReturnChange(item.id, 'unit', e.target.value)}
                                  className="w-16 px-2 py-1 text-sm border border-gray-300 dark:border-slate-600 rounded focus:ring-1 focus:ring-red-500 outline-none bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
                                  placeholder="Satuan"
                                />`;

code = code.replace(regex, replacement);

fs.writeFileSync('src/components/client/ClientActiveOrders.jsx', code);
console.log('Fixed ClientActiveOrders Return Inputs');
