const fs = require('fs');
let code = fs.readFileSync('opal-auth/app/page.js', 'utf8');

// 1. Replace LOGIN_SLIDES
code = code.replace(/const LOGIN_SLIDES = \[\s*\{[\s\S]*?\];/m, `const LOGIN_SLIDES = [
  {
    id: 'l1',
    label: 'SECURE ACCESS',
    subtitle: 'Military-grade JWT Authentication',
    scene: 'https://www.nirandfar.com/wp-content/uploads/2020/10/endless-todo-list.png',
    accent: '#000000',
  },
  {
    id: 'l2',
    label: 'ENCRYPTED VAULT',
    subtitle: 'BCrypt 12-round Password Hashing',
    scene: 'https://static0.makeuseofimages.com/wordpress/wp-content/uploads/2024/09/a-phone-with-a-to-do-list-next-to-a-notebook-with-a-handwritten-to-do-list-a-pen-and-some-sticky-notes-around.jpg',
    accent: '#000000',
  },
  {
    id: 'l3',
    label: 'SESSION GUARD',
    subtitle: 'NextAuth Cookie Management',
    scene: 'https://static.vecteezy.com/system/resources/previews/072/142/793/non_2x/hand-holding-smartphone-with-task-list-app-illustration-in-black-and-white-free-vector.jpg',
    accent: '#000000',
  },
];`);

// 2. Replace SlideScene to remove HUD lines
code = code.replace(/function SlideScene\(\{ scene, accent \}\) \{[\s\S]*?return \([\s\S]*?\);\n\}/m, `function SlideScene({ scene }) {
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0, backgroundImage: \`url(\${scene})\`, backgroundSize: 'cover', backgroundPosition: 'center', filter: 'brightness(0.9)' }} />
    </div>
  );
}`);

// 3. Fix Hydration Error div & text color
code = code.replace(/<div style=\{\{\n\s*minHeight: '100vh', background: '#050508',\n\s*display: 'flex', alignItems: 'center', justifyContent: 'center',\n\s*fontFamily: 'monospace',\n\s*\}\}>\n\s*<div style=\{\{ color: '#0ea5e9', fontSize: '1rem', letterSpacing: '0.3em' \}\}>\n\s*INITIALIZING\.\.\.\n\s*<\/div>\n\s*<\/div>/m, 
`<div suppressHydrationWarning style={{
        minHeight: '100vh', background: '#ffffff',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: "'Inter', sans-serif",
      }}>
        <div suppressHydrationWarning style={{ color: '#000000', fontSize: '1.25rem', fontWeight: 600, letterSpacing: '0.3em' }}>
          INITIALIZING...
        </div>
      </div>`);

// 4. Update Interval from 4500 to 2000
code = code.replace(/4500/g, '2000');

// 5. Change Fonts
code = code.replace(/@import url\('https:\/\/fonts.googleapis.com\/css2\?family=Share\+Tech&family=Titillium\+Web:ital,wght@0,300;0,400;0,600;0,700;1,300&display=swap'\);/, 
`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700&display=swap');`);

// Change font-families
code = code.replace(/font-family: 'Share Tech', monospace;/g, "font-family: 'Inter', sans-serif;");
code = code.replace(/font-family: 'Titillium Web', sans-serif;/g, "font-family: 'Inter', sans-serif;");
code = code.replace(/font-family: "'Share Tech', monospace"/g, "'Inter', sans-serif");
code = code.replace(/font-family: 'monospace'/g, "font-family: 'Inter', sans-serif");

// 6. Update Theme Colors
code = code.replace(/body \{ background: #050508;/g, "body { background: #ffffff;");
code = code.replace(/box-shadow: 0 0 0 1px rgba\(14,165,233,0\.14\),[\s\S]*?0 40px 120px rgba\(0,0,0,0\.85\);/m, 
`box-shadow: 0 0 0 1px #e5e5e5, 0 10px 40px rgba(0,0,0,0.08);`);
code = code.replace(/\.left-panel \{[\s\S]*?background: #06080f;/m, `.left-panel {\n          flex: 1; position: relative; overflow: hidden;\n          background: #f5f5f5;`);
code = code.replace(/background: linear-gradient\(to bottom, transparent, rgba\(6,8,15,0\.92\)\);/g, `background: linear-gradient(to bottom, transparent, rgba(255,255,255,0.92));`);
code = code.replace(/\.right-panel \{[\s\S]*?width: 390px; background: #080b13;[\s\S]*?border-left: 1px solid rgba\(14,165,233,0\.09\);/m, 
`.right-panel {\n          width: 390px; background: #ffffff;\n          display: flex; flex-direction: column;\n          border-left: 1px solid #e5e5e5;`);

// Opal Mark (Brand Name)
code = code.replace(/\.opal-mark \{[\s\S]*?filter: drop-shadow\(0 0 16px rgba\(14,165,233,0\.4\)\);\n\s*\}/m, 
`.opal-mark {\n          font-family: 'Inter', sans-serif; font-weight: 700;\n          font-size: 1.6rem; letter-spacing: 0.2em;\n          color: #000000;\n        }`);
code = code.replace(/\.opal-ver \{[\s\S]*?color: rgba\(148,163,184,0\.4\);\n\s*\}/m, 
`.opal-ver {\n          font-family: 'Inter', sans-serif;\n          font-size: 0.6rem; font-weight: 600; letter-spacing: 0.2em;\n          color: #666666;\n        }`);

// Slide Text
code = code.replace(/\.slide-title-text \{[\s\S]*?transition: color 0\.5s;\n\s*\}/m, 
`.slide-title-text {\n          font-family: 'Inter', sans-serif; font-weight: 700;\n          font-size: 1.25rem; letter-spacing: 0.1em;\n          margin-bottom: 0.25rem;\n          color: #000000 !important;\n          transition: color 0.5s;\n        }`);
code = code.replace(/\.slide-sub-text \{[\s\S]*?margin-bottom: 1rem;\n\s*\}/m, 
`.slide-sub-text {\n          font-family: 'Inter', sans-serif;\n          font-weight: 400; font-size: 0.85rem;\n          color: #444444; letter-spacing: 0.05em;\n          margin-bottom: 1rem;\n        }`);
code = code.replace(/background: rgba\(255,255,255,0\.12\);/g, "background: #cccccc;");
code = code.replace(/\.sdot\.active \{ width: 36px; box-shadow: 0 0 8px currentColor; \}/g, ".sdot.active { width: 36px; background: #000000 !important; }");

// Tabs
code = code.replace(/\.tab-bar \{[\s\S]*?border-bottom: 1px solid rgba\(14,165,233,0\.09\);/m, `.tab-bar {\n          display: flex; border-bottom: 1px solid #e5e5e5;`);
code = code.replace(/\.tab-btn \{[\s\S]*?color: rgba\(148,163,184,0\.45\);/m, `.tab-btn {\n          flex: 1; padding: 1.1rem; background: none; border: none;\n          color: #888888;`);
code = code.replace(/\.tab-btn\.active \{[\s\S]*?background: rgba\(14,165,233,0\.05\);\n\s*\}/m, `.tab-btn.active {\n          color: #000000; font-weight: 700;\n          background: #fdfdfd;\n        }`);
code = code.replace(/\.tab-btn\.active::after \{[\s\S]*?box-shadow: 0 0 10px rgba\(14,165,233,0\.5\);\n\s*\}/m, `.tab-btn.active::after {\n          content: '';\n          position: absolute; bottom: 0; left: 0; right: 0; height: 2px;\n          background: #000000;\n        }`);
code = code.replace(/\.tab-btn:hover:not\(\.active\) \{[\s\S]*?background: rgba\(14,165,233,0\.02\);\n\s*\}/m, `.tab-btn:hover:not(.active) {\n          color: #444444;\n          background: #f9f9f9;\n        }`);

// Forms
code = code.replace(/font-size: 1.65rem; color: #fff;/g, "font-size: 1.65rem; color: #000; font-weight: 700;");
code = code.replace(/color: rgba\(148,163,184,0\.45\);/g, "color: #666;");
code = code.replace(/\.flabel \{[\s\S]*?color: rgba\(14,165,233,0\.65\);/m, `.flabel {\n          display: block;\n          font-family: 'Inter', sans-serif;\n          font-size: 0.75rem; letter-spacing: 0.1em; font-weight: 700;\n          color: #000000;`);
code = code.replace(/\.finput \{[\s\S]*?background: rgba\(14,165,233,0\.04\);\n\s*border: 1px solid rgba\(14,165,233,0\.11\);/m, `.finput {\n          width: 100%;\n          background: #ffffff;\n          border: 1px solid #cccccc;`);
code = code.replace(/color: #fff;\n\s*font-family: 'Inter', sans-serif; font-size: 1rem;/g, "color: #000;\n          font-family: 'Inter', sans-serif; font-size: 1rem; font-weight: 600;");
code = code.replace(/color: rgba\(148,163,184,0\.22\);/g, "color: #aaaaaa;");
code = code.replace(/\.finput:focus \{[\s\S]*?box-shadow: 0 0 0 3px rgba\(14,165,233,0\.07\);\n\s*\}/m, `.finput:focus {\n          border-color: #000000;\n          background: #ffffff;\n          box-shadow: 0 0 0 2px rgba(0,0,0,0.1);\n        }`);

// Button
code = code.replace(/\.sbtn \{[\s\S]*?background: linear-gradient\(135deg, #0284c7 0%, #0ea5e9 100%\);\n\s*border: none; border-radius: 7px; color: #fff;/m, `.sbtn {\n          width: 100%; padding: 0.82rem;\n          background: #000000;\n          border: none; border-radius: 7px; color: #ffffff; font-weight: 700;`);
code = code.replace(/box-shadow: 0 6px 20px rgba\(14,165,233,0\.35\);/g, "box-shadow: 0 6px 20px rgba(0,0,0,0.2);");

// Switch Link
code = code.replace(/color: rgba\(148,163,184,0\.38\);/g, "color: #666666; font-weight: 500;");
code = code.replace(/\.switch-link span \{[\s\S]*?color: #0ea5e9; cursor: pointer; margin-left: 2px;\n\s*\}/m, `.switch-link span {\n          color: #000000; font-weight: 700; cursor: pointer; margin-left: 4px;\n        }`);

// Bottom bar
code = code.replace(/color: 'rgba\(14,165,233,0\.2\)'/g, "color: '#999999'");

// Top accent line & canvas removal
code = code.replace(/\{\/\* Particle canvas \*\/\}\n\s*<canvas ref=\{canvasRef\} style=\{\{ position: 'fixed', inset: 0, zIndex: 0 \}\} \/>\n\n\s*\{\/\* Top accent line \*\/\}\n\s*<div style=\{\{\n\s*position: 'fixed', top: 0, left: 0, right: 0, height: '2px',\n\s*background: 'linear-gradient\(90deg, transparent, #0ea5e9, transparent\)',\n\s*zIndex: 2, opacity: 0\.5,\n\s*\}\} \/>/m, "");

fs.writeFileSync('opal-auth/app/page.js', code);
console.log('Update theme script executed.');
