import fs from 'fs';
const content = `{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}`;
fs.writeFileSync('vercel.json', content, 'utf8');
console.log("Written vercel.json without BOM");
