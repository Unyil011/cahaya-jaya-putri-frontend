import fs from 'fs';

let code = fs.readFileSync('src/pages/ClientDashboard.jsx', 'utf8');

// The lines in the file are exactly:
//   let rawClientName = user.name ? user.name : (user.email ? user.email.split('@')[0] : 'Client');
//   const clientName = rawClientName.charAt(0).toUpperCase() + rawClientName.slice(1).toLowerCase();

code = code.replace("let rawClientName = user.name ? user.name : (user.email ? user.email.split('@')[0] : 'Client');\n  const clientName = rawClientName.charAt(0).toUpperCase() + rawClientName.slice(1).toLowerCase();", "const sppgName = user.name ? user.name.charAt(0).toUpperCase() + user.name.slice(1) : 'Klien';\n  const emailPrefix = user.email ? user.email.split('@')[0] : 'Profil';\n  const profileName = emailPrefix.charAt(0).toUpperCase() + emailPrefix.slice(1).toLowerCase();");

// Check if it worked
if (code.includes("const sppgName")) {
  fs.writeFileSync('src/pages/ClientDashboard.jsx', code);
  console.log("REPLACED SUCCESSFULLY!");
} else {
  // Try another way. Split by "const [isLoading"
  const parts = code.split("const [isLoading");
  
  // Clean up the first part to remove rawClientName and clientName
  let firstPart = parts[0];
  firstPart = firstPart.replace(/let rawClientName.*/g, "");
  firstPart = firstPart.replace(/const clientName.*/g, "");
  
  const inject = `  const sppgName = user.name ? user.name.charAt(0).toUpperCase() + user.name.slice(1) : 'Klien';\n  const emailPrefix = user.email ? user.email.split('@')[0] : 'Profil';\n  const profileName = emailPrefix.charAt(0).toUpperCase() + emailPrefix.slice(1).toLowerCase();\n  `;
  
  code = firstPart + inject + "const [isLoading" + parts[1];
  fs.writeFileSync('src/pages/ClientDashboard.jsx', code);
  console.log("REPLACED VIA SPLIT!");
}
