import fs from 'fs';

let code = fs.readFileSync('src/pages/ClientDashboard.jsx', 'utf8');

// Replace the clientName logic
code = code.replace(
  /let rawClientName = user\.name \? user\.name : \(user\.email \? user\.email\.split\('@'\)\[0\] : 'Client'\);\n\s*const clientName = rawClientName\.charAt\(0\)\.toUpperCase\(\) \+ rawClientName\.slice\(1\)\.toLowerCase\(\);/g,
  `const sppgName = user.name ? user.name.charAt(0).toUpperCase() + user.name.slice(1) : 'Klien';
  const emailPrefix = user.email ? user.email.split('@')[0] : 'Profil';
  const profileName = emailPrefix.charAt(0).toUpperCase() + emailPrefix.slice(1).toLowerCase();`
);

// Update Sidebar to use sppgName
code = code.replace(
  /<h2 className="text-xl font-bold truncate">SPPG \{clientName\}<\/h2>/g,
  '<h2 className="text-xl font-bold truncate">SPPG {sppgName}</h2>'
);

// Update Profile Button to use profileName
code = code.replace(
  /<p className="text-xs font-bold text-gray-700 dark:text-gray-200 truncate max-w-\[100px\]">Hi, \{clientName\}<\/p>/g,
  '<p className="text-xs font-bold text-gray-700 dark:text-gray-200 truncate max-w-[100px]">Hi, {profileName}</p>'
);

fs.writeFileSync('src/pages/ClientDashboard.jsx', code);
console.log("Updated ClientDashboard names");
