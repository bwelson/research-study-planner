"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import TopicKeywordSearch from '@/components/TopicKeywordSearch';
import SubscriptionButton from '@/components/SubscriptionButton';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [canSearch, setCanSearch] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  const [searchCount, setSearchCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/check-limit');
      const data = await response.json();

      if (!response.ok) {
        router.push('/');
        return;
      }

      setCanSearch(data.canSearch);
      setIsPremium(data.isPremium || data.isAcademicTester);
      setSearchCount(data.searchCount || 0);
      setUser(data.user);
    } catch (error) {
      console.error('Auth check failed:', error);
      router.push('/');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleSearchLimitReached = () => {
    setShowUpgradeModal(true);
  };

  if (loading) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      }}>
        <div style={{ 
          fontSize: 18, 
          color: '#ffffff',
          background: 'rgba(255, 255, 255, 0.1)',
          padding: '20px 40px',
          borderRadius: 12,
          backdropFilter: 'blur(10px)'
        }}>
          Loading...
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
      {/* Header */}
      <div style={{ 
        background: 'rgba(255, 255, 255, 0.95)', 
        borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
        padding: '20px 32px',
        backdropFilter: 'blur(10px)',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)'
      }}>
        <div style={{ 
          maxWidth: 1200, 
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <h2 style={{ 
              fontSize: 24, 
              fontWeight: 700, 
              margin: 0, 
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
              ResearchNest
            </h2>
            <p style={{ 
              fontSize: 13, 
              color: '#64748b', 
              margin: '4px 0 0 0',
              fontWeight: 500
            }}>
              AI-Powered Research Planning
            </p>
            {!isPremium && (
              <div style={{ 
                fontSize: 12, 
                color: '#f59e0b', 
                marginTop: 6,
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: 6
              }}>
                <span style={{ 
                  width: 8, 
                  height: 8, 
                  borderRadius: '50%', 
                  background: '#f59e0b',
                  display: 'inline-block'
                }}></span>
                Free Plan: {searchCount}/1 searches used
              </div>
            )}
            {isPremium && (
              <div style={{ 
                fontSize: 12, 
                color: '#10b981', 
                marginTop: 6,
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: 6
              }}>
                <span style={{ 
                  width: 8, 
                  height: 8, 
                  borderRadius: '50%', 
                  background: '#10b981',
                  display: 'inline-block'
                }}></span>
                Premium Active - Unlimited Access
              </div>
            )}
          </div>
          
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            {!isPremium && (
              <div style={{ minWidth: 200 }}>
                <SubscriptionButton 
                  userEmail={user?.email}
                  onSuccess={() => window.location.reload()}
                />
              </div>
            )}
            <button
              onClick={handleLogout}
              style={{
                padding: '10px 24px',
                borderRadius: 10,
                border: 'none',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: '#ffffff',
                fontSize: 14,
                cursor: 'pointer',
                fontWeight: 600,
                boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)',
                transition: 'all 0.3s ease'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.5)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.4)';
              }}
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      <TopicKeywordSearch 
        canSearch={canSearch}
        onSearchLimitReached={handleSearchLimitReached}
        isPremium={isPremium}
      />

      {showUpgradeModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          backdropFilter: 'blur(4px)'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: 20,
            padding: 40,
            maxWidth: 520,
            width: '90%',
            boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
            position: 'relative'
          }}>
            <button
              onClick={() => setShowUpgradeModal(false)}
              style={{
                position: 'absolute',
                top: 16,
                right: 16,
                background: 'transparent',
                border: 'none',
                fontSize: 24,
                color: '#94a3b8',
                cursor: 'pointer',
                width: 32,
                height: 32,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 8,
                transition: 'all 0.2s'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = '#f1f5f9';
                e.currentTarget.style.color = '#1e293b';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = '#94a3b8';
              }}
            >
              ×
            </button>

            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <div style={{
                width: 64,
                height: 64,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
                fontSize: 32
              }}>
                🚀
              </div>
              <h2 style={{ 
                fontSize: 28, 
                fontWeight: 700, 
                marginBottom: 12, 
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>
                Upgrade to Premium
              </h2>
              <p style={{ fontSize: 15, color: '#64748b', margin: 0 }}>
                You've used your 1 free search. Unlock unlimited potential!
              </p>
            </div>
            
            <div style={{ 
              background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)', 
              padding: 24, 
              borderRadius: 16, 
              marginBottom: 28,
              border: '1px solid rgba(102, 126, 234, 0.2)'
            }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#1e293b', marginBottom: 16 }}>
                Premium Features:
              </div>
              <div style={{ fontSize: 14, color: '#475569', lineHeight: 1.8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                  <span style={{ color: '#10b981', fontSize: 18 }}>✓</span>
                  <span>Unlimited searches</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                  <span style={{ color: '#10b981', fontSize: 18 }}>✓</span>
                  <span>Up to 100 papers per search</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                  <span style={{ color: '#10b981', fontSize: 18 }}>✓</span>
                  <span>AI-powered paper filtering</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                  <span style={{ color: '#10b981', fontSize: 18 }}>✓</span>
                  <span>Monthly study plan generation</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ color: '#10b981', fontSize: 18 }}>✓</span>
                  <span>Export to LaTeX & Word</span>
                </div>
              </div>
              
              <div style={{ 
                marginTop: 20, 
                paddingTop: 20, 
                borderTop: '1px solid rgba(102, 126, 234, 0.2)',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: 32, fontWeight: 700, color: '#1e293b' }}>
                  GH₵150
                  <span style={{ fontSize: 16, fontWeight: 500, color: '#64748b' }}>/month</span>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              <button
                onClick={() => setShowUpgradeModal(false)}
                style={{
                  flex: 1,
                  padding: 14,
                  borderRadius: 12,
                  border: '2px solid #e5e7eb',
                  background: '#ffffff',
                  color: '#64748b',
                  fontSize: 15,
                  cursor: 'pointer',
                  fontWeight: 600,
                  transition: 'all 0.2s'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.borderColor = '#cbd5e1';
                  e.currentTarget.style.background = '#f8fafc';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.borderColor = '#e5e7eb';
                  e.currentTarget.style.background = '#ffffff';
                }}
              >
                Maybe Later
              </button>
              <div style={{ flex: 1 }}>
                <SubscriptionButton 
                  userEmail={user?.email}
                  onSuccess={() => {
                    setShowUpgradeModal(false);
                    window.location.reload();
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}