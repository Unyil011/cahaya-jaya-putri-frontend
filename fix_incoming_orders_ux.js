import fs from 'fs';
let code = fs.readFileSync('src/components/admin/IncomingOrders.jsx', 'utf8');

// Replace the onMouseDown logic to use batch updates
const oldMouseDown = `                                            onMouseDown={() => {
                                              handlePriceChange(order.id, item.id, 'inventoryId', inv.id);
                                              handlePriceChange(order.id, item.id, 'searchName', inv.item_name);
                                              handlePriceChange(order.id, item.id, 'isSearchFocused', false);
                                              if (inv.hpp) {
                                                handlePriceChange(order.id, item.id, 'hpp', inv.hpp);
                                              }
                                            }}`;

const newMouseDown = `                                            onMouseDown={() => {
                                              const updates = {
                                                inventoryId: inv.id,
                                                searchName: inv.item_name,
                                                isSearchFocused: false
                                              };
                                              if (inv.hpp !== undefined && inv.hpp !== null) {
                                                updates.hpp = inv.hpp;
                                              }
                                              handlePriceChange(order.id, item.id, updates);
                                            }}`;

code = code.replace(oldMouseDown, newMouseDown);

// Make the input wider so the dropdown doesn't overflow horizontally
code = code.replace(`className="w-32 md:w-48 py-1.5 px-2 rounded-lg bg-gray-50 dark:bg-slate-900 border border-gray-300 dark:border-slate-600 focus:ring-2 focus:ring-pink-500 text-gray-900 dark:text-white text-sm"`, `className="w-48 md:w-64 py-1.5 px-2 rounded-lg bg-gray-50 dark:bg-slate-900 border border-gray-300 dark:border-slate-600 focus:ring-2 focus:ring-pink-500 text-gray-900 dark:text-white text-sm"`);

// Make sure the dropdown is styled properly to avoid truncation
code = code.replace(`className="absolute z-50 w-full mt-1 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg shadow-xl max-h-48 overflow-y-auto"`, `className="absolute z-50 min-w-[200px] w-full mt-1 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg shadow-xl max-h-48 overflow-y-auto"`);


fs.writeFileSync('src/components/admin/IncomingOrders.jsx', code);
console.log("Updated IncomingOrders to use batch handlePriceChange and wider input");
