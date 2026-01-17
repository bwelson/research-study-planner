"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AuthPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [academicCode, setAcademicCode] = useState('');
  const [showAcademicCode, setShowAcademicCode] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Password validation for signup
    if (!isLogin) {
      if (password.length < 8) {
        setError('Password must be at least 8 characters long');
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match');
        return;
      }
    }

    setLoading(true);

    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/signup';
      const body: any = { email, password };
      
      if (!isLogin && academicCode) {
        body.academicCode = academicCode;
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (response.ok) {
        if (!isLogin) {
          // Show welcome modal after signup
          setShowWelcomeModal(true);
        } else {
          // Go directly to dashboard on login
          router.push('/dashboard');
        }
      } else {
        setError(data.message || 'Authentication failed');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleOAuthLogin = (provider: string) => {
    // Placeholder for OAuth - you'll implement this later
    alert(`${provider} login coming soon! Set up OAuth credentials first.`);
  };

  const continueToApp = () => {
    router.push('/dashboard');
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background with overlay */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundImage: 'url("https://images.unsplash.com/photo-1501504905252-473c47e087f8?q=80&w=2574")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        filter: 'brightness(0.4)'
      }} />
      
      {/* Gradient overlay */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.8) 0%, rgba(118, 75, 162, 0.8) 100%)'
      }} />

      {/* Main content */}
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 20px',
        position: 'relative',
        zIndex: 1
      }}>
        {/* Auth Card */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.98)',
          borderRadius: 24,
          padding: '48px 40px',
          maxWidth: 480,
          width: '100%',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
          backdropFilter: 'blur(10px)'
        }}>
          {/* Logo/Title */}
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <h1 style={{
              fontSize: 32,
              fontWeight: 700,
              margin: '0 0 8px 0',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
              ResearchNest
            </h1>
            <p style={{
              fontSize: 15,
              color: '#64748b',
              margin: 0
            }}>
              {isLogin ? 'Welcome back!' : 'Start your academic research journey'}
            </p>
          </div>

          {/* OAuth Buttons */}
          <div style={{ marginBottom: 24 }}>
            <button
              onClick={() => handleOAuthLogin('Google')}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: 10,
                border: '1px solid #e5e7eb',
                background: '#ffffff',
                color: '#1e293b',
                fontSize: 14,
                fontWeight: 500,
                cursor: 'pointer',
                marginBottom: 10,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 10,
                transition: 'all 0.2s'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = '#f8fafc';
                e.currentTarget.style.borderColor = '#cbd5e1';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = '#ffffff';
                e.currentTarget.style.borderColor = '#e5e7eb';
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </button>

            <button
              onClick={() => handleOAuthLogin('GitHub')}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: 10,
                border: '1px solid #e5e7eb',
                background: '#ffffff',
                color: '#1e293b',
                fontSize: 14,
                fontWeight: 500,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 10,
                transition: 'all 0.2s'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = '#f8fafc';
                e.currentTarget.style.borderColor = '#cbd5e1';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = '#ffffff';
                e.currentTarget.style.borderColor = '#e5e7eb';
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
              Continue with GitHub
            </button>
          </div>

          {/* Divider */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            marginBottom: 24
          }}>
            <div style={{ flex: 1, height: 1, background: '#e5e7eb' }} />
            <span style={{ color: '#94a3b8', fontSize: 13, fontWeight: 500 }}>OR</span>
            <div style={{ flex: 1, height: 1, background: '#e5e7eb' }} />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 16 }}>
              <label style={{
                display: 'block',
                fontSize: 14,
                fontWeight: 500,
                color: '#1e293b',
                marginBottom: 6
              }}>
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: 10,
                  border: '1px solid #e5e7eb',
                  fontSize: 14,
                  outline: 'none',
                  transition: 'all 0.2s'
                }}
                onFocus={(e) => e.currentTarget.style.borderColor = '#667eea'}
                onBlur={(e) => e.currentTarget.style.borderColor = '#e5e7eb'}
              />
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{
                display: 'block',
                fontSize: 14,
                fontWeight: 500,
                color: '#1e293b',
                marginBottom: 6
              }}>
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: 10,
                  border: '1px solid #e5e7eb',
                  fontSize: 14,
                  outline: 'none',
                  transition: 'all 0.2s'
                }}
                onFocus={(e) => e.currentTarget.style.borderColor = '#667eea'}
                onBlur={(e) => e.currentTarget.style.borderColor = '#e5e7eb'}
              />
            </div>

            {!isLogin && (
              <div style={{ marginBottom: 16 }}>
                <label style={{
                  display: 'block',
                  fontSize: 14,
                  fontWeight: 500,
                  color: '#1e293b',
                  marginBottom: 6
                }}>
                  Confirm Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: 10,
                    border: `1px solid ${password && confirmPassword && password !== confirmPassword ? '#ef4444' : '#e5e7eb'}`,
                    fontSize: 14,
                    outline: 'none',
                    transition: 'all 0.2s'
                  }}
                  onFocus={(e) => e.currentTarget.style.borderColor = '#667eea'}
                  onBlur={(e) => e.currentTarget.style.borderColor = password && confirmPassword && password !== confirmPassword ? '#ef4444' : '#e5e7eb'}
                />
                {password && confirmPassword && password !== confirmPassword && (
                  <p style={{ color: '#ef4444', fontSize: 12, marginTop: 4 }}>
                    Passwords do not match
                  </p>
                )}
              </div>
            )}

            {!isLogin && (
              <div style={{
                marginBottom: 20,
                padding: 16,
                background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(5, 150, 105, 0.1) 100%)',
                borderRadius: 12,
                border: '1px solid rgba(16, 185, 129, 0.2)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 18 }}>🎓</span>
                    <span style={{ fontSize: 14, fontWeight: 600, color: '#059669' }}>
                      Have an Academic Testing Code?
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowAcademicCode(!showAcademicCode)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: '#059669',
                      fontSize: 12,
                      cursor: 'pointer',
                      fontWeight: 600,
                      textDecoration: 'underline'
                    }}
                  >
                    {showAcademicCode ? 'Hide' : 'Show'}
                  </button>
                </div>
                <p style={{ fontSize: 12, color: '#059669', margin: '0 0 8px 0' }}>
                  Get full premium access for free
                </p>
                {showAcademicCode && (
                  <input
                    type="text"
                    value={academicCode}
                    onChange={(e) => setAcademicCode(e.target.value)}
                    placeholder="Enter your academic testing code"
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: 8,
                      border: '1px solid rgba(16, 185, 129, 0.3)',
                      fontSize: 13,
                      outline: 'none',
                      background: '#ffffff'
                    }}
                  />
                )}
              </div>
            )}

            {error && (
              <div style={{
                padding: 12,
                background: '#fee2e2',
                border: '1px solid #fecaca',
                borderRadius: 10,
                marginBottom: 16
              }}>
                <p style={{ color: '#dc2626', fontSize: 13, margin: 0 }}>
                  {error}
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: 12,
                border: 'none',
                background: loading ? '#94a3b8' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: '#ffffff',
                fontSize: 15,
                fontWeight: 600,
                cursor: loading ? 'not-allowed' : 'pointer',
                boxShadow: loading ? 'none' : '0 4px 14px rgba(102, 126, 234, 0.4)',
                transition: 'all 0.3s',
                marginBottom: 16
              }}
              onMouseOver={(e) => {
                if (!loading) {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.5)';
                }
              }}
              onMouseOut={(e) => {
                if (!loading) {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 14px rgba(102, 126, 234, 0.4)';
                }
              }}
            >
              {loading ? 'Processing...' : isLogin ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          <div style={{ textAlign: 'center' }}>
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
                setConfirmPassword('');
              }}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#667eea',
                fontSize: 14,
                cursor: 'pointer',
                fontWeight: 500,
                textDecoration: 'underline'
              }}
            >
              {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
            </button>
          </div>
        </div>
      </div>

      {/* Welcome Modal - Shows after signup */}
      {showWelcomeModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2000,
          backdropFilter: 'blur(8px)'
        }}>
          <div
            style={{
              background: '#ffffff',
              borderRadius: 24,
              padding: 40,
              maxWidth: 540,
              width: '90%',
              maxHeight: '85vh',
              overflow: 'auto',
              boxShadow: '0 25px 70px rgba(0,0,0,0.5)',
              position: 'relative'
            }}
          >
            <div style={{ textAlign: 'center', marginBottom: 28 }}>
              <div style={{
                width: 80,
                height: 80,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px',
                fontSize: 40
              }}>
                🎉
              </div>
              <h2 style={{
                fontSize: 30,
                fontWeight: 700,
                margin: '0 0 12px 0',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>
                Welcome to ResearchNest!
              </h2>
              <p style={{ fontSize: 16, color: '#64748b', margin: 0 }}>
                Your account has been created successfully
              </p>
            </div>

            <div style={{ marginBottom: 28 }}>
              <h3 style={{ fontSize: 18, fontWeight: 600, color: '#1e293b', marginBottom: 14 }}>
                Your Free Plan Includes:
              </h3>
              <div style={{ fontSize: 15, color: '#475569', lineHeight: 2 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                  <span style={{ color: '#3b82f6', fontSize: 20 }}>✓</span>
                  <span>1 search per account</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                  <span style={{ color: '#3b82f6', fontSize: 20 }}>✓</span>
                  <span>Up to 10 papers per search</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ color: '#3b82f6', fontSize: 20 }}>✓</span>
                  <span>Basic paper viewing</span>
                </div>
              </div>
            </div>

            <div style={{
              padding: 20,
              background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
              borderRadius: 16,
              border: '1px solid rgba(102, 126, 234, 0.2)',
              marginBottom: 28
            }}>
              <h3 style={{ fontSize: 18, fontWeight: 600, color: '#1e293b', marginBottom: 14 }}>
                Upgrade to Premium:
              </h3>
              <div style={{ fontSize: 14, color: '#475569', lineHeight: 1.9 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                  <span style={{ color: '#10b981', fontSize: 18 }}>✓</span>
                  <span>Unlimited searches</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                  <span style={{ color: '#10b981', fontSize: 18 }}>✓</span>
                  <span>Up to 100 papers per search</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                  <span style={{ color: '#10b981', fontSize: 18 }}>✓</span>
                  <span>AI-powered paper filtering</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                  <span style={{ color: '#10b981', fontSize: 18 }}>✓</span>
                  <span>Monthly study plan generation</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ color: '#10b981', fontSize: 18 }}>✓</span>
                  <span>Export to LaTeX & Word</span>
                </div>
              </div>

              <div style={{
                marginTop: 16,
                paddingTop: 16,
                borderTop: '1px solid rgba(102, 126, 234, 0.2)',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: 28, fontWeight: 700, color: '#1e293b' }}>
                  GH₵150
                  <span style={{ fontSize: 15, fontWeight: 500, color: '#64748b' }}>/month</span>
                </div>
              </div>
            </div>

            <button
              onClick={continueToApp}
              style={{
                width: '100%',
                padding: '16px',
                borderRadius: 12,
                border: 'none',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: '#ffffff',
                fontSize: 16,
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 6px 20px rgba(102, 126, 234, 0.4)',
                transition: 'all 0.3s',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 8px 25px rgba(102, 126, 234, 0.5)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.4)';
              }}
            >
              Continue on Free Basis
            </button>
          </div>
        </div>
      )}
    </div>
  );
}