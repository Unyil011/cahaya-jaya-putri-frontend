import fs from 'fs';

function replaceInFile(filePath) {
  let code = fs.readFileSync(filePath, 'utf8');
  if (!code.includes('import formatIndonesianDate')) {
    if (code.includes('import {')) {
      code = code.replace(/import {/, "import formatIndonesianDate from '../../utils/dateFormatter';\nimport {");
    } else if (code.includes("import '")) {
      code = code.replace(/import '/, "import formatIndonesianDate from '../../utils/dateFormatter';\nimport '");
    } else {
      code = "import formatIndonesianDate from '../../utils/dateFormatter';\n" + code;
    }
  }

  // Handle AdminDashboard which is in pages/
  if (filePath === 'src/pages/AdminDashboard.jsx') {
    code = code.replace("import formatIndonesianDate from '../../utils/dateFormatter'", "import formatIndonesianDate from '../utils/dateFormatter'");
  }

  const oldDate = `date: (o.custom_order_date ? new Date(o.custom_order_date) : new Date(o.created_at)).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) + ' WIB',`;
  const newDate = `date: formatIndonesianDate(o.custom_order_date || o.created_at, true),`;

  code = code.replace(oldDate, newDate);
  fs.writeFileSync(filePath, code);
}

replaceInFile('src/pages/AdminDashboard.jsx');
replaceInFile('src/components/client/ClientHistory.jsx');
replaceInFile('src/components/client/ClientActiveOrders.jsx');

// pdfGenerator
let pdfCode = fs.readFileSync('src/utils/pdfGenerator.js', 'utf8');
if (!pdfCode.includes('import formatIndonesianDate')) {
  pdfCode = "import formatIndonesianDate from './dateFormatter';\n" + pdfCode;
}
pdfCode = pdfCode.replace(/let dateStr = order\.created_at \? new Date\(order\.created_at\)\.toLocaleDateString\('id-ID', \{day: 'numeric', month: 'long', year: 'numeric'\}\) : '14 September 2026';/g, "let dateStr = order.created_at ? formatIndonesianDate(order.created_at, false) : '14 September 2026';");
fs.writeFileSync('src/utils/pdfGenerator.js', pdfCode);

console.log("Applied dateFormatter to all files");
