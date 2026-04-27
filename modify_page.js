const fs = require('fs');
let code = fs.readFileSync('opal-auth/app/page.js', 'utf8');

// Replace LOGIN_SLIDES
code = code.replace(/const LOGIN_SLIDES = \[\s*\{[\s\S]*?\];/m, `const LOGIN_SLIDES = [
  {
    id: 'l1',
    label: 'SECURE ACCESS',
    subtitle: 'Military-grade JWT Authentication',
    scene: 'https://www.papersmiths.co.uk/cdn/shop/articles/To_Do_List_Pad.jpg?v=1715699759',
    accent: '#0ea5e9',
  },
  {
    id: 'l2',
    label: 'ENCRYPTED VAULT',
    subtitle: 'BCrypt 12-round Password Hashing',
    scene: 'https://www.yopandtom.com/cdn/shop/articles/Exercise_routine_to_do_list_600x.jpg?v=1672765140',
    accent: '#22d3ee',
  },
  {
    id: 'l3',
    label: 'SESSION GUARD',
    subtitle: 'NextAuth Cookie Management',
    scene: 'https://thesavvysparrow.com/wp-content/uploads/2021/07/monthly-to-do-list-3-1024x768.jpg',
    accent: '#818cf8',
  },
];`);

// Replace SIGNUP_SLIDES
code = code.replace(/const SIGNUP_SLIDES = \[\s*\{[\s\S]*?\];/m, `const SIGNUP_SLIDES = [
  {
    id: 's1',
    label: 'JOIN THE NETWORK',
    subtitle: 'Create Your Secure Identity',
    scene: 'https://cdn.prod.website-files.com/64786b619e5c33d650d5499e/681de2399355b0e36bb25f85_todo-list-priority-view.webp',
    accent: '#f472b6',
  },
  {
    id: 's2',
    label: 'DATA SOVEREIGNTY',
    subtitle: 'MongoDB Atlas Cloud Storage',
    scene: 'https://sloboda-studio.com/wp-content/uploads/2020/10/image22.jpeg',
    accent: '#fb923c',
  },
  {
    id: 's3',
    label: 'IDENTITY FORGE',
    subtitle: 'Your Unique Digital Fingerprint',
    scene: 'https://cdn.dribbble.com/userupload/11597515/file/original-2685b92ea022b8b53047980760cbd396.png?resize=752x&vertical=center',
    accent: '#a78bfa',
  },
];`);

// Replace SlideScene
code = code.replace(/function SlideScene\(\{ scene, accent \}\) \{[\s\S]*?return scenes\[scene\] \|\| null;\n\}/m, `function SlideScene({ scene, accent }) {
  const a = accent;
  const ar = parseInt(a.slice(1, 3), 16);
  const ag = parseInt(a.slice(3, 5), 16);
  const ab = parseInt(a.slice(5, 7), 16);
  const rgb = \`\${ar},\${ag},\${ab}\`;

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0, backgroundImage: \`url(\${scene})\`, backgroundSize: 'cover', backgroundPosition: 'center', filter: 'brightness(0.6)' }} />
      <div style={{ position: 'absolute', inset: 0, background: \`radial-gradient(ellipse 70% 60% at 50% 40%, rgba(\${rgb},0.18) 0%, transparent 70%)\` }} />
      {[
        { top: 16, left: 16, bt: '2px solid', bl: '2px solid', br: 'none', bb: 'none' },
        { top: 16, right: 16, bt: '2px solid', br: '2px solid', bl: 'none', bb: 'none' },
        { bottom: 16, left: 16, bb: '2px solid', bl: '2px solid', bt: 'none', br: 'none' },
        { bottom: 16, right: 16, bb: '2px solid', br: '2px solid', bt: 'none', bl: 'none' },
      ].map((s, i) => (
        <div key={i} style={{
          position: 'absolute', width: 24, height: 24,
          ...s,
          borderColor: \`rgba(\${rgb},0.4)\`,
        }} />
      ))}
    </div>
  );
}`);

// Increase Typography
code = code.replace(/font-size: 1rem; letter-spacing: 0.22em;/g, "font-size: 1.25rem; letter-spacing: 0.22em;");
code = code.replace(/font-weight: 300; font-size: 0.72rem;/g, "font-weight: 300; font-size: 0.85rem;");
code = code.replace(/font-size: 0.72rem; letter-spacing: 0.22em;/g, "font-size: 0.85rem; letter-spacing: 0.22em;");
code = code.replace(/font-size: 1.35rem; color: #fff;/g, "font-size: 1.65rem; color: #fff;");
code = code.replace(/font-weight: 300; font-size: 0.78rem;/g, "font-weight: 300; font-size: 0.9rem;");
code = code.replace(/font-size: 0.62rem; letter-spacing: 0.2em;/g, "font-size: 0.75rem; letter-spacing: 0.2em;");
code = code.replace(/font-family: 'Titillium Web', sans-serif; font-size: 0.88rem;/g, "font-family: 'Titillium Web', sans-serif; font-size: 1rem;");
code = code.replace(/font-size: 0.84rem; }/g, "font-size: 0.95rem; }");
code = code.replace(/font-size: 0.82rem; letter-spacing: 0.2em;/g, "font-size: 0.95rem; letter-spacing: 0.2em;");

fs.writeFileSync('opal-auth/app/page.js', code);
console.log('Modifications completed.');
