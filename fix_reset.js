import fs from 'fs';

let code = fs.readFileSync('src/pages/ResetPassword.jsx', 'utf8');

// Remove the aggressive checkSession that kicks the user out prematurely
const checkSessionRegex = /useEffect\(\(\) => \{\s*\/\/\s*Check if the user is actually in a recovery session\s*const checkSession = async \(\) => \{[\s\S]*?checkSession\(\);\s*\}, \[navigate\]\);/g;

code = code.replace(checkSessionRegex, `
  useEffect(() => {
    // Supabase automatically parses the URL hash (#access_token=...) and establishes a session.
    // We listen to the auth state change to ensure it is processed, but we don't aggressively redirect
    // because processing the hash can take a few milliseconds.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        console.log('Recovery mode active');
      }
    });
    return () => subscription.unsubscribe();
  }, []);
`);

fs.writeFileSync('src/pages/ResetPassword.jsx', code);
console.log("Fixed ResetPassword redirect issue");
