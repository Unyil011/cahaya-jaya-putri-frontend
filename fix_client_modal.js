import fs from 'fs';
let code = fs.readFileSync('src/components/client/ClientHistory.jsx', 'utf8');

const returnJSX = `                  
                  {selectedOrderDetails.returns && selectedOrderDetails.returns.length > 0 && (
                    <div className="mt-8 border-t border-gray-100 dark:border-slate-800 pt-6">
                      <h4 className="text-md font-bold text-gray-900 dark:text-white mb-4">Informasi Retur / Komplain</h4>
                      <div className="space-y-4">
                        {selectedOrderDetails.returns.map(ret => (
                          <div key={ret.id} className="bg-orange-50 dark:bg-orange-900/10 border border-orange-100 dark:border-orange-900/30 rounded-xl p-4">
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <p className="font-semibold text-gray-900 dark:text-white text-sm">Alasan: {ret.reason}</p>
                                <p className="text-xs text-gray-500 mt-1">Jumlah: {parseFloat(ret.quantity)} {ret.unit || 'pcs'}</p>
                              </div>
                              <span className={\`px-2 py-1 rounded-md text-[10px] font-bold \${
                                ret.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                ret.status === 'replaced' ? 'bg-blue-100 text-blue-700' :
                                ret.status === 'refunded' ? 'bg-purple-100 text-purple-700' :
                                'bg-red-100 text-red-700'
                              }\`}>
                                {ret.status === 'pending' ? 'Menunggu Keputusan' :
                                 ret.status === 'replaced' ? 'Disetujui (Kirim Ulang)' :
                                 ret.status === 'refunded' ? 'Disetujui (Potong Tagihan)' : 'Ditolak'}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
`;

code = code.replace(/<\/table>[\s\S]*?<\/div>[\s\S]*?<\/div>[\s\S]*?<\/div>[\s\S]*?<\/div>[\s\S]*?<\/motion\.div>/, match => {
  return match.replace(/<\/div>\s*<\/div>\s*<\/motion\.div>/, `</div>${returnJSX}</div></motion.div>`);
});

fs.writeFileSync('src/components/client/ClientHistory.jsx', code);
console.log("Added returns info to modal");
