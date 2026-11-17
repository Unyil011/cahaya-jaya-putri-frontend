import fs from 'fs';

let code = fs.readFileSync('src/index.css', 'utf8');

if (!code.includes('hide-scrollbar')) {
    code += `\n
@layer utilities {
  .hide-scrollbar::-webkit-scrollbar {
    display: none;
  }
  .hide-scrollbar {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
}\n`;
    fs.writeFileSync('src/index.css', code);
    console.log("Added hide-scrollbar");
}
