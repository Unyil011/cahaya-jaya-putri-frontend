import fs from 'fs';

let code = fs.readFileSync('src/pages/ClientDashboard.jsx', 'utf8');

// The original lines were:
// let rawClientName = user.name ? user.name : (user.email ? user.email.split('@')[0] : 'Client');
// const clientName = rawClientName.charAt(0).toUpperCase() + rawClientName.slice(1).toLowerCase();

// We will use a simpler regex or simple string replacement
const searchStr = `  let rawClientName = user.name ? user.name : (user.email ? user.email.split('@')[0] : 'Client');
  const clientName = rawClientName.charAt(0).toUpperCase() + rawClientName.slice(1).toLowerCase();`;

const replaceStr = `  const sppgName = user.name ? user.name.charAt(0).toUpperCase() + user.name.slice(1) : 'Klien';
  const emailPrefix = user.email ? user.email.split('@')[0] : 'Profil';
  const profileName = emailPrefix.charAt(0).toUpperCase() + emailPrefix.slice(1).toLowerCase();`;

if (code.includes(searchStr)) {
  code = code.replace(searchStr, replaceStr);
  console.log("Replaced successfully via exact match.");
} else {
  console.log("Could not find the exact string. Using fallback replace.");
  code = code.replace(/let rawClientName =.*?\n.*?(?=const \[isLoading)/g, replaceStr + '\n  ');
}

fs.writeFileSync('src/pages/ClientDashboard.jsx', code);
console.log("Fixed ClientDashboard.jsx crash");
