import fs from 'fs';
let code = fs.readFileSync('src/components/admin/IncomingOrders.jsx', 'utf8');

const oldDropdown = `{item.isSearchFocused && (
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
                                  )}`;

const newDropdown = `{item.isSearchFocused && item.searchName && item.searchName.length > 0 && (
                                    <div className="absolute z-50 w-full mt-1 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg shadow-xl max-h-48 overflow-y-auto">
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
                                  )}`;

code = code.replace(oldDropdown, newDropdown);

fs.writeFileSync('src/components/admin/IncomingOrders.jsx', code);
console.log("Fixed dropdown visibility to match Update Stok");
