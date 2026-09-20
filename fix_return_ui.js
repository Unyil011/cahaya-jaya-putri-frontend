import fs from 'fs';
let code = fs.readFileSync('src/components/client/ClientActiveOrders.jsx', 'utf8');

// Change modal width
code = code.replace(/max-w-2xl bg-white dark:bg-slate-900 rounded-3xl/, 'max-w-4xl bg-white dark:bg-slate-900 rounded-3xl');

// Change table min width and column widths
code = code.replace(/min-w-\[700px\]/, 'min-w-[800px] table-fixed');
code = code.replace(/<th className="py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-300">Nama Barang<\/th>/, '<th className="py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-300 w-[35%]">Nama Barang</th>');
code = code.replace(/<th className="py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-300">Jml Pesan<\/th>/, '<th className="py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-300 w-[15%]">Jml Pesan</th>');
code = code.replace(/<th className="py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-300 text-center">Ajukan Retur\?<\/th>/, '<th className="py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-300 text-center w-[15%]">Ajukan Retur?</th>');
code = code.replace(/<th className="py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-300">Detail Retur<\/th>/, '<th className="py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-300 w-[35%]">Detail Retur</th>');

fs.writeFileSync('src/components/client/ClientActiveOrders.jsx', code);
console.log('Fixed Return UI');
