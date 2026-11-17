import fs from 'fs';
let code = fs.readFileSync('src/components/admin/OrderModal.jsx', 'utf8');

const regex = /\{editedItems\.map\(\(item, index\) => \([\s\S]*?\}\)\}/;

const newBlock = `
                    <div className="overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0">
                      <div className="min-w-[650px] space-y-2">
                        {editedItems.map((item, index) => (
                          <div key={item.id} className="grid grid-cols-12 gap-3 items-center p-3 bg-white dark:bg-slate-800 rounded-xl border border-blue-200 dark:border-blue-900/50 relative">
                            <div className="col-span-1 text-center font-bold text-gray-400">{index + 1}</div>
                            <div className="col-span-4">
                              <input type="text" value={item.itemName} onChange={e => handleEditChange(item.id, 'itemName', e.target.value)} placeholder="Nama Barang" className="w-full px-3 py-1.5 border border-gray-200 dark:border-slate-600 rounded-lg text-sm bg-gray-50 dark:bg-slate-700 dark:text-white" />
                            </div>
                            <div className="col-span-2 flex gap-1">
                              <input type="number" min="0" value={item.quantity} onChange={e => handleEditChange(item.id, 'quantity', e.target.value)} placeholder="Qty" className="w-full px-2 py-1.5 border border-gray-200 dark:border-slate-600 rounded-lg text-sm bg-gray-50 dark:bg-slate-700 dark:text-white text-center" />
                              <input type="text" value={item.unit} onChange={e => handleEditChange(item.id, 'unit', e.target.value)} placeholder="Satuan" className="w-full px-2 py-1.5 border border-gray-200 dark:border-slate-600 rounded-lg text-sm bg-gray-50 dark:bg-slate-700 dark:text-white text-center" />
                            </div>
                            <div className="col-span-4">
                              <div className="flex items-center">
                                <span className="text-gray-500 mr-2 text-sm">Rp</span>
                                <input type="number" min="0" value={item.sellingPrice} onChange={e => handleEditChange(item.id, 'sellingPrice', e.target.value)} placeholder="Harga Satuan" className="w-full px-3 py-1.5 border border-gray-200 dark:border-slate-600 rounded-lg text-sm bg-gray-50 dark:bg-slate-700 dark:text-white" />
                              </div>
                            </div>
                            <div className="col-span-1 text-right">
                              <button onClick={() => handleRemoveItem(item.id)} className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>`;

const match = code.match(regex);
if (match) {
  code = code.replace(regex, newBlock);
  fs.writeFileSync('src/components/admin/OrderModal.jsx', code);
  console.log("Updated OrderModal layout to horizontal scroll");
} else {
  console.log("Regex didn't match!");
}
