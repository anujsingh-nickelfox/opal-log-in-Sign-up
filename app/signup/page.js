'use client';

import { useState, useEffect, useRef } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';

const SIGNUP_SLIDES = [
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
];

function SlideScene({ scene }) {
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0, backgroundImage: `url(${scene})`, backgroundSize: 'cover', backgroundPosition: 'center', filter: 'brightness(0.9)' }} />
    </div>
  );
}

export default function SignupPage() {
  const router = useRouter();
  const canvasRef = useRef(null);
  const animRef = useRef(null);

  const [mounted, setMounted] = useState(false);
  const [slideIndex, setSlideIndex] = useState(0);
  const [prevSlide, setPrevSlide] = useState(null);
  const [transitioning, setTransitioning] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [signupForm, setSignupForm] = useState({ name: '', email: '', password: '', confirm: '' });

  useEffect(() => { setMounted(true); }, []);

  const currentSlide = SIGNUP_SLIDES[slideIndex];

  useEffect(() => {
    const interval = setInterval(() => {
      goToSlide((slideIndex + 1) % SIGNUP_SLIDES.length);
    }, 2000);
    return () => clearInterval(interval);
  }, [slideIndex]);

  function goToSlide(idx) {
    if (transitioning) return;
    setPrevSlide(slideIndex);
    setTransitioning(true);
    setTimeout(() => {
      setSlideIndex(idx);
      setPrevSlide(null);
      setTransitioning(false);
    }, 500);
  }

  useEffect(() => {
    if (!mounted) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let w = (canvas.width = window.innerWidth);
    let h = (canvas.height = window.innerHeight);

    const resize = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resize);

    const PARTICLE_COUNT = 110;
    const CONNECT_DIST = 150;
    const particles = Array.from({ length: PARTICLE_COUNT }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.35,
      vy: (Math.random() - 0.5) * 0.35,
      r: Math.random() * 1.4 + 0.4,
      alpha: Math.random() * 0.45 + 0.15,
    }));

    let mx = w / 2, my = h / 2;
    const onMove = (e) => { mx = e.clientX; my = e.clientY; };
    window.addEventListener('mousemove', onMove);

    function draw() {
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = '#050508';
      ctx.fillRect(0, 0, w, h);

      const gs = 55;
      for (let x = 0; x < w; x += gs) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h);
        ctx.strokeStyle = 'rgba(14,165,233,0.025)'; ctx.stroke();
      }
      for (let y = 0; y < h; y += gs) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y);
        ctx.strokeStyle = 'rgba(14,165,233,0.025)'; ctx.stroke();
      }

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx; p.y += p.vy;
        const mdx = p.x - mx, mdy = p.y - my;
        const md = Math.sqrt(mdx * mdx + mdy * mdy);
        if (md < 90) { p.x += (mdx / md) * 0.4; p.y += (mdy / md) * 0.4; }
        if (p.x < 0) p.x = w; if (p.x > w) p.x = 0;
        if (p.y < 0) p.y = h; if (p.y > h) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(14,165,233,${p.alpha})`;
        ctx.fill();
      }

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < CONNECT_DIST) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(14,165,233,${(1 - dist / CONNECT_DIST) * 0.12})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      const sy = ((Date.now() / 8000) % 1) * h;
      const sg = ctx.createLinearGradient(0, sy - 50, 0, sy + 50);
      sg.addColorStop(0, 'transparent');
      sg.addColorStop(0.5, 'rgba(14,165,233,0.035)');
      sg.addColorStop(1, 'transparent');
      ctx.fillStyle = sg;
      ctx.fillRect(0, sy - 50, w, 100);

      animRef.current = requestAnimationFrame(draw);
    }

    draw();
    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMove);
    };
  }, [mounted]);

  const handleSignup = async (e) => {
    e.preventDefault();
    setError(''); setSuccess(''); setLoading(true);
    const { name, email, password, confirm } = signupForm;
    
    console.log('[SIGNUP PAGE] Starting signup with:', { 
      name: name?.trim(), 
      email: email?.toLowerCase()?.trim(), 
      passwordLength: password?.length,
      hasConfirm: !!confirm 
    });
    
    if (!name || !email || !password || !confirm) { setError('All fields are required.'); setLoading(false); return; }
    if (name.trim().length < 2) { setError('Name must be at least 2 characters.'); setLoading(false); return; }
    if (!/^\S+@\S+\.\S+$/.test(email)) { setError('Please enter a valid email address.'); setLoading(false); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters.'); setLoading(false); return; }
    if (password !== confirm) { setError('Passwords do not match.'); setLoading(false); return; }
    
    try {
      console.log('[SIGNUP PAGE] Calling /api/register...');
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), email: email.toLowerCase().trim(), password }),
      });
      const data = await res.json();
      console.log('[SIGNUP PAGE] API response:', { status: res.status, success: data.success, message: data.message });
      
      if (!res.ok || !data.success) {
        setError(data.message || 'Registration failed.');
        setLoading(false);
        return;
      }
      
      // Automatically log the user in after successful registration
      console.log('[SIGNUP PAGE] Registration successful, attempting auto-login...');
      setSuccess('Account created! Logging you in...');
      const loginResult = await signIn('credentials', { 
        email: email.toLowerCase().trim(), 
        password, 
        redirect: false 
      });
      console.log('[SIGNUP PAGE] Auto-login result:', loginResult);
      
      if (loginResult?.error) {
        console.error('[SIGNUP PAGE] Auto-login failed:', loginResult.error);
        setError('Account created but auto-login failed. Please login manually.');
        setTimeout(() => router.push('/login'), 2000);
      } else if (loginResult?.ok) {
        console.log('[SIGNUP PAGE] Auto-login successful, redirecting to dashboard');
        setSuccess('Account created successfully! Redirecting to dashboard...');
        setTimeout(() => router.replace('/dashboard'), 800);
      } else {
        console.error('[SIGNUP PAGE] Auto-login returned unexpected result');
        setError('Account created. Please login manually.');
        setTimeout(() => router.push('/login'), 2000);
      }
    } catch (err) {
      console.error('[SIGNUP PAGE] Exception during signup:', err);
      setError('Network error. Please try again.');
      setLoading(false);
    }
  };

  if (!mounted) {
    return (
      <div suppressHydrationWarning style={{
        minHeight: '100vh', background: '#ffffff',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: "'Exo 2', sans-serif",
      }}>
        <div suppressHydrationWarning style={{ color: '#000000', fontSize: '1.25rem', fontWeight: 600, letterSpacing: '0.3em' }}>
          INITIALIZING...
        </div>
      </div>
    );
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Baumans&family=Exo+2:wght@300;400;500;600;700&family=Saira+Stencil+One&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #ffffff; overflow: hidden; font-family: 'Exo 2', sans-serif; }

        .auth-wrap {
          position: fixed; inset: 0;
          display: flex; align-items: center; justify-content: center; z-index: 1;
        }

        .auth-box {
          display: flex;
          width: min(1000px, 96vw);
          height: min(640px, 92vh);
          border-radius: 20px; overflow: hidden;
          box-shadow: 0 0 0 1px #e5e5e5, 0 10px 40px rgba(0,0,0,0.08);
        }

        .left-panel {
          flex: 1; position: relative; overflow: hidden;
          background: #f5f5f5;
        }

        .slide-layer {
          position: absolute; inset: 0;
          transition: opacity 0.5s ease;
        }

        .slide-layer.entering { opacity: 1; }
        .slide-layer.exiting  { opacity: 0; }

        .slide-info {
          position: absolute; bottom: 0; left: 0; right: 0; z-index: 4;
          padding: 0 1.6rem 1.4rem;
        }

        .slide-logo-row {
          display: flex; align-items: center; gap: 0.8rem;
          margin-bottom: 1rem;
        }

        .opal-mark {
          font-family: 'Saira Stencil One', cursive; font-weight: 400;
          font-size: 2.6rem; letter-spacing: 0.1em;
          color: #000000;
        }

        .opal-ver {
          font-family: 'Exo 2', sans-serif;
          font-size: 0.6rem; font-weight: 600; letter-spacing: 0.2em;
          color: #666666;
        }

        .slide-title-text {
          font-family: 'Baumans', cursive; font-weight: 400;
          font-size: 1.9rem; letter-spacing: 0.1em;
          margin-bottom: 0.25rem;
          color: #000000 !important;
          transition: color 0.5s;
        }

        .slide-sub-text {
          font-family: 'Exo 2', sans-serif;
          font-weight: 400; font-size: 1.1rem;
          color: #444444; letter-spacing: 0.05em;
          margin-bottom: 1rem;
        }

        .slide-dots {
          display: flex; gap: 0.4rem; align-items: center;
        }

        .sdot {
          height: 2px; border-radius: 2px;
          cursor: pointer; transition: all 0.4s;
          background: #cccccc;
          width: 20px;
        }
        .sdot.active { width: 36px; background: #000000 !important; }

        .left-panel::after {
          content: '';
          position: absolute; bottom: 0; left: 0; right: 0; height: 50%;
          background: linear-gradient(to bottom, transparent, rgba(255,255,255,0.92));
          z-index: 3; pointer-events: none;
        }

        .right-panel {
          width: 390px; background: #ffffff;
          display: flex; flex-direction: column;
          border-left: 1px solid #e5e5e5;
          overflow: hidden;
        }

        .tab-bar {
          display: flex; border-bottom: 1px solid #e5e5e5;
          flex-shrink: 0;
        }

        .tab-btn {
          flex: 1; padding: 1.4rem; background: none; border: none;
          color: #888888;
          font-family: 'Exo 2', sans-serif;
          font-size: 1.5rem; letter-spacing: 0.22em;
          cursor: pointer; transition: all 0.25s; position: relative;
        }
        .tab-btn.active {
          color: #000000; font-weight: 700;
          background: #fdfdfd;
        }
        .tab-btn.active::after {
          content: '';
          position: absolute; bottom: 0; left: 0; right: 0; height: 2px;
          background: #000000;
        }
        .tab-btn:hover:not(.active) {
          color: #444444;
          background: #f9f9f9;
        }

        .form-body {
          flex: 1; overflow-y: auto; overflow-x: hidden;
          padding: 3rem 2.5rem; display: flex; flex-direction: column; justify-content: center; scrollbar-width: none;
        }
        .form-body::-webkit-scrollbar { display: none; }

        .form-head { margin-bottom: 2.5rem; }

        .form-head-title {
          font-family: 'Baumans', cursive;
          font-size: 2.5rem; color: #000; font-weight: 400;
          letter-spacing: 0.04em; margin-bottom: 0.25rem;
        }

        .form-head-sub {
          font-family: 'Exo 2', sans-serif;
          font-weight: 400; font-size: 1.1rem;
          color: #666; letter-spacing: 0.04em;
        }

        .fgroup { margin-bottom: 1.8rem; }

        .flabel {
          display: block;
          font-family: 'Exo 2', sans-serif;
          font-size: 0.9rem; letter-spacing: 0.1em; font-weight: 700;
          color: #000000; margin-bottom: 0.6rem;
        }

        .finput {
          width: 100%;
          background: #ffffff;
          border: 1px solid #cccccc;
          border-radius: 7px;
          padding: 1rem 1.2rem;
          color: #000;
          font-family: 'Exo 2', sans-serif; font-size: 1.25rem; font-weight: 600;
          transition: all 0.25s; outline: none;
        }
        .finput::placeholder { color: #aaaaaa; font-size: 1.22rem; }
        .finput:focus {
          border-color: #000000;
          background: #ffffff;
          box-shadow: 0 0 0 2px rgba(0,0,0,0.1);
        }

        .sbtn {
          width: 100%; padding: 1.2rem;
          background: #000000;
          border: none; border-radius: 7px; color: #ffffff; font-weight: 700;
          font-family: 'Exo 2', sans-serif;
          font-size: 1.2rem; letter-spacing: 0.2em;
          cursor: pointer; transition: all 0.3s; margin-top: 2rem;
          position: relative; overflow: hidden;
        }
        .sbtn::before {
          content: ''; position: absolute; top: 0; left: -100%;
          width: 100%; height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.12), transparent);
          transition: left 0.5s;
        }
        .sbtn:hover::before { left: 100%; }
        .sbtn:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(0,0,0,0.2);
        }
        .sbtn:disabled { opacity: 0.55; cursor: not-allowed; }

        .alert {
          padding: 0.7rem 0.9rem; border-radius: 7px;
          font-family: 'Exo 2', sans-serif; font-size: 0.8rem;
          margin-bottom: 0.9rem; line-height: 1.4;
        }
        .alert-err { background: rgba(239,68,68,0.08); border: 1px solid rgba(239,68,68,0.18); color: #fca5a5; }
        .alert-ok  { background: rgba(34,197,94,0.08);  border: 1px solid rgba(34,197,94,0.18);  color: #86efac; }

        .switch-link {
          margin-top: 2rem; text-align: center;
          font-family: 'Exo 2', sans-serif;
          font-size: 1rem; color: #666666; font-weight: 500;
        }
        .switch-link a {
          color: #000000; font-weight: 700; margin-left: 4px;
          text-decoration: none;
        }
        .switch-link a:hover { text-decoration: underline; }

        .spin {
          display: inline-block; width: 13px; height: 13px;
          border: 2px solid rgba(255,255,255,0.3); border-top-color: #fff;
          border-radius: 50%; margin-right: 6px; vertical-align: middle;
          animation: rot 0.6s linear infinite;
        }
        @keyframes rot { to { transform: rotate(360deg); } }

        @media (max-width: 680px) {
          .auth-box { flex-direction: column; height: auto; min-height: 90vh; }
          .left-panel { min-height: 240px; }
          .right-panel { width: 100%; }
        }
      `}</style>

      <div className="auth-wrap">
        <div className="auth-box">
          <div className="left-panel">
            {transitioning && prevSlide !== null && (
              <div className="slide-layer exiting">
                <SlideScene scene={SIGNUP_SLIDES[prevSlide].scene} />
              </div>
            )}
            <div className="slide-layer entering">
              <SlideScene scene={currentSlide.scene} />
            </div>
            <div className="slide-info" style={{ zIndex: 5 }}>
              <div className="slide-logo-row">
                <div className="opal-mark">OPAL</div>
                <div className="opal-ver">SECURE ACCESS PROTOCOL v2.0</div>
              </div>
              <div className="slide-title-text" style={{ color: currentSlide.accent }}>
                {currentSlide.label}
              </div>
              <div className="slide-sub-text">{currentSlide.subtitle}</div>
              <div className="slide-dots">
                {SIGNUP_SLIDES.map((_, i) => (
                  <div
                    key={i}
                    className={`sdot ${i === slideIndex ? 'active' : ''}`}
                    style={i === slideIndex ? { background: currentSlide.accent, color: currentSlide.accent } : {}}
                    onClick={() => goToSlide(i)}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="right-panel">
            <div className="tab-bar">
              <button className="tab-btn" onClick={() => router.push('/login')}>LOG IN</button>
              <button className="tab-btn active">SIGN UP</button>
            </div>

            <div className="form-body">
              <div className="form-head">
                <div className="form-head-title">Create Account</div>
                <div className="form-head-sub">Register to join the Opal network</div>
              </div>

              {error && <div className="alert alert-err">⚠ {error}</div>}
              {success && <div className="alert alert-ok">✓ {success}</div>}

              <form onSubmit={handleSignup}>
                <div className="fgroup">
                  <label className="flabel">FULL NAME</label>
                  <input
                    className="finput" type="text"
                    placeholder="Your full name"
                    value={signupForm.name}
                    onChange={e => setSignupForm({ ...signupForm, name: e.target.value })}
                    autoComplete="name" required
                  />
                </div>

                <div className="fgroup">
                  <label className="flabel">EMAIL ADDRESS</label>
                  <input
                    className="finput" type="email"
                    placeholder="you@example.com"
                    value={signupForm.email}
                    onChange={e => setSignupForm({ ...signupForm, email: e.target.value })}
                    autoComplete="email" required
                  />
                </div>

                <div className="fgroup">
                  <label className="flabel">PASSWORD</label>
                  <input
                    className="finput" type="password"
                    placeholder="Min. 6 characters"
                    value={signupForm.password}
                    onChange={e => setSignupForm({ ...signupForm, password: e.target.value })}
                    autoComplete="new-password" required
                  />
                </div>

                <div className="fgroup">
                  <label className="flabel">CONFIRM PASSWORD</label>
                  <input
                    className="finput" type="password"
                    placeholder="Re-enter password"
                    value={signupForm.confirm}
                    onChange={e => setSignupForm({ ...signupForm, confirm: e.target.value })}
                    autoComplete="new-password" required
                  />
                </div>

                <button className="sbtn" type="submit" disabled={loading}>
                  {loading && <span className="spin" />}
                  {loading ? 'CREATING ACCOUNT...' : 'REGISTER'}
                </button>
              </form>

              <div className="switch-link">
                Already registered?<a href="/login">Log in →</a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style={{
        position: 'fixed', bottom: '0.85rem', left: '50%',
        transform: 'translateX(-50%)',
        fontFamily: "'Share Tech', monospace",
        fontSize: '0.55rem', letterSpacing: '0.2em',
        color: '#999999', zIndex: 2, whiteSpace: 'nowrap',
      }}>
        OPAL AUTH · NEXTAUTH · MONGODB ATLAS · JWT · BCRYPT
      </div>
    </>
  );
}
