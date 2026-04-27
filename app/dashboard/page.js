'use client';

import { useEffect, useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/');
    }
  }, [status, router]);

  if (!mounted || status === 'loading') {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#050508',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: "'Share Tech', monospace",
      }}>
        <div style={{ color: '#0ea5e9', fontSize: '1.2rem', letterSpacing: '0.2em' }}>
          INITIALIZING...
        </div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return null;
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #050508 0%, #0a0a18 50%, #050508 100%)',
      fontFamily: "'Share Tech', monospace",
      color: '#ffffff',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Share+Tech&family=Titillium+Web:wght@300;400;600&display=swap');
        
        .dashboard-card {
          background: rgba(14, 165, 233, 0.05);
          border: 1px solid rgba(14, 165, 233, 0.2);
          border-radius: 16px;
          padding: 3rem;
          max-width: 700px;
          width: 100%;
          text-align: center;
          backdrop-filter: blur(20px);
          box-shadow: 0 0 60px rgba(14, 165, 233, 0.1), inset 0 1px 0 rgba(255,255,255,0.05);
        }

        .stat-box {
          background: rgba(14, 165, 233, 0.08);
          border: 1px solid rgba(14, 165, 233, 0.15);
          border-radius: 10px;
          padding: 1.2rem;
          flex: 1;
          min-width: 140px;
        }

        .logout-btn {
          background: linear-gradient(135deg, #0284c7, #0ea5e9);
          border: none;
          color: white;
          padding: 0.8rem 2.5rem;
          border-radius: 8px;
          font-family: 'Share Tech', monospace;
          font-size: 1rem;
          letter-spacing: 0.1em;
          cursor: pointer;
          transition: all 0.3s ease;
          margin-top: 2rem;
        }

        .logout-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 30px rgba(14, 165, 233, 0.4);
        }

        .glow-text {
          color: #0ea5e9;
          text-shadow: 0 0 20px rgba(14, 165, 233, 0.6);
        }
      `}</style>

      <div className="dashboard-card">
        <div style={{ fontSize: '0.75rem', color: '#0ea5e9', letterSpacing: '0.3em', marginBottom: '1rem' }}>
          ◆ OPAL SYSTEM — AUTHORIZED ACCESS ◆
        </div>

        <h1 style={{
          fontSize: '2.5rem',
          fontWeight: '400',
          marginBottom: '0.5rem',
          background: 'linear-gradient(135deg, #ffffff, #0ea5e9)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          letterSpacing: '0.05em',
        }}>
          Welcome Back
        </h1>

        <h2 className="glow-text" style={{
          fontSize: '1.8rem',
          marginBottom: '2rem',
          fontFamily: "'Titillium Web', sans-serif",
          fontWeight: '300',
        }}>
          {session?.user?.name}
        </h2>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '2rem' }}>
          <div className="stat-box">
            <div style={{ color: '#64748b', fontSize: '0.7rem', letterSpacing: '0.2em', marginBottom: '0.5rem' }}>EMAIL</div>
            <div style={{ color: '#e2e8f0', fontFamily: "'Titillium Web', sans-serif", fontSize: '0.9rem' }}>
              {session?.user?.email}
            </div>
          </div>
          <div className="stat-box">
            <div style={{ color: '#64748b', fontSize: '0.7rem', letterSpacing: '0.2em', marginBottom: '0.5rem' }}>TOTAL LOGINS</div>
            <div className="glow-text" style={{ fontSize: '2rem', fontWeight: '400' }}>
              {session?.user?.loginCount || '—'}
            </div>
          </div>
          <div className="stat-box">
            <div style={{ color: '#64748b', fontSize: '0.7rem', letterSpacing: '0.2em', marginBottom: '0.5rem' }}>STATUS</div>
            <div style={{ color: '#22c55e', fontSize: '0.9rem' }}>● ACTIVE</div>
          </div>
        </div>

        <div style={{
          padding: '1rem',
          background: 'rgba(34, 197, 94, 0.05)',
          border: '1px solid rgba(34, 197, 94, 0.2)',
          borderRadius: '8px',
          color: '#86efac',
          fontSize: '0.8rem',
          letterSpacing: '0.05em',
          fontFamily: "'Titillium Web', sans-serif",
        }}>
          ✓ Authentication Verified · JWT Token Active · MongoDB Session Tracked
        </div>

        <button
          className="logout-btn"
          onClick={() => signOut({ callbackUrl: '/' })}
        >
          SIGN OUT
        </button>
      </div>
    </div>
  );
}
