import fs from 'fs';
let code = fs.readFileSync('src/components/admin/IncomingOrders.jsx', 'utf8');

// Replace the <select> with a searchable input
const oldSelect = `<select
                                  value={item.inventoryId || ''}
                                  onChange={(e) => {
                                    const invId = e.target.value;
                                    handlePriceChange(order.id, item.id, 'inventoryId', invId);
                                    if (invId) {
                                      const inv = inventories.find(i => i.id == invId);
                                      if (inv && inv.hpp) {
                                        handlePriceChange(order.id, item.id, 'hpp', inv.hpp);
                                      }
                                    }
                                  }}
                                  disabled={order.status !== 'pending'}
                                  className="w-32 md:w-40 py-1.5 px-2 rounded-lg bg-gray-50 dark:bg-slate-900 border border-gray-300 dark:border-slate-600 focus:ring-2 focus:ring-pink-500 text-gray-900 dark:text-white text-sm"
                                >
                                  <option value="">- Non Stok -</option>
                                  {inventories.map(inv => (
                                    <option key={inv.id} value={inv.id}>
                                      {inv.item_name} (Sisa: {inv.stock})
                                    </option>
                                  ))}
                                </select>`;

const newAutocomplete = `<div className="relative">
                                  <input
                                    type="text"
                                    disabled={order.status !== 'pending'}
                                    placeholder="- Ketik nama stok -"
                                    value={item.searchName !== undefined ? item.searchName : (inventories.find(i => i.id == item.inventoryId)?.item_name || '')}
                                    onChange={(e) => {
                                      handlePriceChange(order.id, item.id, 'searchName', e.target.value);
                                      if (e.target.value === '') {
                                        handlePriceChange(order.id, item.id, 'inventoryId', '');
                                      }
                                    }}
                                    onFocus={() => handlePriceChange(order.id, item.id, 'isSearchFocused', true)}
                                    onBlur={() => setTimeout(() => handlePriceChange(order.id, item.id, 'isSearchFocused', false), 200)}
                                    className="w-32 md:w-48 py-1.5 px-2 rounded-lg bg-gray-50 dark:bg-slate-900 border border-gray-300 dark:border-slate-600 focus:ring-2 focus:ring-pink-500 text-gray-900 dark:text-white text-sm"
                                  />
                                  {item.isSearchFocused && (
                                    <div className="absolute z-50 w-full mt-1 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg shadow-xl max-h-48 overflow-y-auto">
                                      <button
                                        type="button"
                                        onMouseDown={() => {
                                          handlePriceChange(order.id, item.id, 'inventoryId', '');
                                          handlePriceChange(order.id, item.id, 'searchName', '');
                                          handlePriceChange(order.id, item.id, 'isSearchFocused', false);
                                        }}
                                        className="w-full text-left px-3 py-2 text-sm text-gray-500 hover:bg-gray-50 dark:hover:bg-slate-700 border-b border-gray-100 dark:border-slate-700"
                                      >
                                        - Non Stok -
                                      </button>
                                      {inventories
                                        .filter(inv => (inv.item_name || '').toLowerCase().includes((item.searchName !== undefined ? item.searchName : '').toLowerCase()))
                                        .map(inv => (
                                          <button
                                            key={inv.id}
                                            type="button"
                                            onMouseDown={() => {
                                              handlePriceChange(order.id, item.id, 'inventoryId', inv.id);
                                              handlePriceChange(order.id, item.id, 'searchName', inv.item_name);
                                              handlePriceChange(order.id, item.id, 'isSearchFocused', false);
                                              if (inv.hpp) {
                                                handlePriceChange(order.id, item.id, 'hpp', inv.hpp);
                                              }
                                            }}
                                            className="w-full text-left px-3 py-2 hover:bg-gray-50 dark:hover:bg-slate-700 text-gray-900 dark:text-white border-b border-gray-100 dark:border-slate-700 last:border-0"
                                          >
                                            <div className="font-medium text-sm">{inv.item_name}</div>
                                            <div className="text-[10px] text-gray-500">Sisa Stok: {inv.stock} {inv.unit}</div>
                                          </button>
                                        ))
                                      }
                                      {inventories.filter(inv => (inv.item_name || '').toLowerCase().includes((item.searchName !== undefined ? item.searchName : '').toLowerCase())).length === 0 && (
                                        <div className="px-3 py-2 text-xs text-gray-500 text-center">Barang tidak ditemukan</div>
                                      )}
                                    </div>
                                  )}
                                </div>`;

code = code.replace(oldSelect, newAutocomplete);

fs.writeFileSync('src/components/admin/IncomingOrders.jsx', code);
console.log("Replaced native select with Autocomplete component in IncomingOrders");
