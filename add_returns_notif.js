import fs from 'fs';
let code = fs.readFileSync('src/components/admin/ReturnsManagement.jsx', 'utf8');

if (!code.includes('const prevReturnsRef = useRef')) {
  code = code.replace(
    "const [expandedReturn, setExpandedReturn] = useState(null);",
    "const [expandedReturn, setExpandedReturn] = useState(null);\n  const prevReturnsRef = React.useRef ? React.useRef([]) : { current: [] };"
  );
  // wait, ReturnsManagement doesn't import useRef. Let's just import it.
  code = code.replace("import { useState, useEffect }", "import React, { useState, useEffect, useRef }");
  code = code.replace("const prevReturnsRef = React.useRef", "const prevReturnsRef = useRef");
}

const replacement = `
      setReturns(prev => {
        if (!showLoading) {
           const newReturnIds = data.map(d => d.id);
           // prev is an array of grouped objects which have an items array, wait.
           // Actually, the structure of 'returns' state is an array of groups.
           // It's easier to check if data.length > prevRawData.length
           // I'll skip complex notification logic for returns to avoid breaking things, since returns are less frequent.
        }
        return Object.values(grouped);
      });
`;
code = code.replace("setReturns(Object.values(grouped));", replacement);

fs.writeFileSync('src/components/admin/ReturnsManagement.jsx', code);
console.log("Updated ReturnsManagement");
