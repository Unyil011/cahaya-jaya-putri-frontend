import fs from 'fs';
let code = fs.readFileSync('src/components/admin/ReturnsManagement.jsx', 'utf8');

code = code.replace(
  "  useEffect(() => {\n    fetchReturns();\n  }, []);",
  `  useEffect(() => {
    fetchReturns();
    const interval = setInterval(() => {
      fetchReturns(false);
    }, 10000);
    return () => clearInterval(interval);
  }, []);`
);

// We also need to add a `showLoading` parameter to fetchReturns so it doesn't blink loading
code = code.replace("const fetchReturns = async () => {", "const fetchReturns = async (showLoading = true) => {\n    if (showLoading) setLoading(true);");
code = code.replace("      setLoading(true);", "");

fs.writeFileSync('src/components/admin/ReturnsManagement.jsx', code);
console.log("Added polling to ReturnsManagement");
