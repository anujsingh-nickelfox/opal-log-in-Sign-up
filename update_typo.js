const fs = require('fs');
let code = fs.readFileSync('opal-auth/app/page.js', 'utf8');

// Update Google Fonts import
code = code.replace(/@import url\('https:\/\/fonts.googleapis.com\/css2\?family=Inter:wght@300;400;600;700&display=swap'\);/, 
`@import url('https://fonts.googleapis.com/css2?family=Baumans&family=Exo+2:wght@300;400;500;600;700&family=Saira+Stencil+One&display=swap');`);

// Update font families
// Saira Stencil One for brand name
code = code.replace(/font-family: 'Inter', sans-serif; font-weight: 700;\n\s*font-size: 1.6rem; letter-spacing: 0.2em;\n\s*color: #000000;/g, 
`font-family: 'Saira Stencil One', cursive; font-weight: 400;
          font-size: 2.2rem; letter-spacing: 0.1em;
          color: #000000;`);

// Baumans for primary headings
code = code.replace(/font-family: 'Inter', sans-serif;\n\s*font-size: 1.65rem; color: #000; font-weight: 700;/g, 
`font-family: 'Baumans', cursive;
          font-size: 2.5rem; color: #000; font-weight: 400;`);
code = code.replace(/font-family: 'Inter', sans-serif; font-weight: 700;\n\s*font-size: 1.25rem;/g, 
`font-family: 'Baumans', cursive; font-weight: 400;
          font-size: 1.8rem;`);

// Exo 2 for everything else
code = code.replace(/font-family: 'Inter', sans-serif;/g, "font-family: 'Exo 2', sans-serif;");
code = code.replace(/'Inter', sans-serif/g, "'Exo 2', sans-serif");

// Increase Typography and Spacing
code = code.replace(/padding: 1.8rem 1.8rem;/g, "padding: 3rem 2.5rem; display: flex; flex-direction: column; justify-content: center;");
code = code.replace(/\.form-head \{ margin-bottom: 1.4rem; \}/g, ".form-head { margin-bottom: 2.5rem; }");
code = code.replace(/\.fgroup \{ margin-bottom: 0.95rem; \}/g, ".fgroup { margin-bottom: 1.8rem; }");

// Form head sub
code = code.replace(/font-weight: 300; font-size: 0.9rem;/g, "font-weight: 400; font-size: 1.1rem;");

// Labels
code = code.replace(/font-size: 0.75rem; letter-spacing: 0.1em; font-weight: 700;\n\s*color: #000000; margin-bottom: 0.38rem;/g, 
`font-size: 0.9rem; letter-spacing: 0.1em; font-weight: 700;
          color: #000000; margin-bottom: 0.6rem;`);

// Inputs
code = code.replace(/padding: 0.72rem 0.9rem;/g, "padding: 1rem 1.2rem;");
code = code.replace(/font-size: 1rem; font-weight: 600;/g, "font-size: 1.15rem; font-weight: 600;");
code = code.replace(/font-size: 0.95rem; \}/g, "font-size: 1.05rem; }");

// Submit Button
code = code.replace(/padding: 0.82rem;/g, "padding: 1.2rem;");
code = code.replace(/font-size: 0.95rem;/g, "font-size: 1.2rem;");
code = code.replace(/margin-top: 0.4rem;/g, "margin-top: 1rem;");

// Switch Link
code = code.replace(/margin-top: 1rem;/g, "margin-top: 2rem;");
code = code.replace(/font-size: 0.78rem;/g, "font-size: 1rem;");

// Tabs
code = code.replace(/padding: 1.1rem;/g, "padding: 1.4rem;");
code = code.replace(/font-size: 0.85rem;/g, "font-size: 1.1rem;");

fs.writeFileSync('opal-auth/app/page.js', code);
console.log('Update typography script executed.');
