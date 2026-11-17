import fs from 'fs';
let code = fs.readFileSync('src/components/admin/StockHistory.jsx', 'utf8');

// For the main table header
code = code.replace(/<th className="py-4 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">/g, '<th className="py-4 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">');
code = code.replace(/<th className="py-4 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">/g, '<th className="py-4 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right whitespace-nowrap">');

// For the main table body rows
code = code.replace(/<td className="py-3 px-4">/g, '<td className="py-3 px-4 whitespace-nowrap">');
code = code.replace(/<td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-300">/g, '<td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-300 whitespace-nowrap">');
code = code.replace(/<td className="py-3 px-4 text-sm font-bold text-gray-900 dark:text-white text-right">/g, '<td className="py-3 px-4 text-sm font-bold text-gray-900 dark:text-white text-right whitespace-nowrap">');

// Also do it for the Details Modal table, just in case
code = code.replace(/<th className="py-3 px-6 text-xs font-semibold text-gray-500 uppercase">/g, '<th className="py-3 px-6 text-xs font-semibold text-gray-500 uppercase whitespace-nowrap">');
code = code.replace(/<th className="py-3 px-6 text-xs font-semibold text-gray-500 uppercase text-center">/g, '<th className="py-3 px-6 text-xs font-semibold text-gray-500 uppercase text-center whitespace-nowrap">');
code = code.replace(/<th className="py-3 px-6 text-xs font-semibold text-gray-500 uppercase text-right">/g, '<th className="py-3 px-6 text-xs font-semibold text-gray-500 uppercase text-right whitespace-nowrap">');

code = code.replace(/<td className="py-3 px-6 text-sm font-medium text-gray-900 dark:text-white">/g, '<td className="py-3 px-6 text-sm font-medium text-gray-900 dark:text-white whitespace-nowrap">');
code = code.replace(/<td className="py-3 px-6 text-sm text-gray-600 dark:text-gray-300 text-center">/g, '<td className="py-3 px-6 text-sm text-gray-600 dark:text-gray-300 text-center whitespace-nowrap">');
code = code.replace(/<td className="py-3 px-6 text-sm text-gray-600 dark:text-gray-300 text-right">/g, '<td className="py-3 px-6 text-sm text-gray-600 dark:text-gray-300 text-right whitespace-nowrap">');
code = code.replace(/<td className="py-3 px-6 text-sm font-bold text-gray-900 dark:text-white text-right">/g, '<td className="py-3 px-6 text-sm font-bold text-gray-900 dark:text-white text-right whitespace-nowrap">');


fs.writeFileSync('src/components/admin/StockHistory.jsx', code);
console.log("Added whitespace-nowrap to StockHistory tables");
