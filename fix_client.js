import fs from 'fs';
let code = fs.readFileSync('src/pages/ClientDashboard.jsx', 'utf8');
code = code.replace("import { ShoppingCart, useState, useRef, useEffect } from 'react';", "import { useState, useRef, useEffect } from 'react';");
fs.writeFileSync('src/pages/ClientDashboard.jsx', code);
console.log("Fixed duplicate ShoppingCart import");
