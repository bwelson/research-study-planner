"use client";
import { useEffect, useState } from "react";
import TopicKeywordSearch from "./TopicKeywordSearch";
import SubscriptionButton from "./SubscriptionButton";

export default function Dashboard() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  useEffect(() => {
    checkLimit();
  }, []);

  const checkLimit = async () => {
    try {
      const response = await fetch('/api/check-limit');
      const data = await response.json();
      setUser(data);
    } catch (error) {
      console.error('Error checking limit:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    document.cookie = 'token=; Max-Age=0; path=/;';
    window.location.href = '/';
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
      {/* Header */}
      <div style={{ 
        background: '#ffffff', 
        borderBottom: '1px solid #e5e7eb',
        padding: '16px 32px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#1e293b' }}>Research Study Planner</h1>
          {user && (
            <p style={{ fontSize: 14, color: '#64748b', marginTop: 4 }}>
              {user.isPremium ? (
                <span style={{ color: '#10b981', fontWeight: 600 }}>✨ Premium User</span>
              ) : (
                <span>
                  Searches: {user.searchesUsed}/{user.searchesLimit} 
                  {user.searchesUsed >= user.searchesLimit && (
                    <span style={{ color: '#dc2626', marginLeft: 8, fontWeight: 600 }}>
                      Limit reached!
                    </span>
                  )}
                </span>
              )}
            </p>
          )}
        </div>
        
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          {!user?.isPremium && (
            <button
              onClick={() => setShowUpgradeModal(true)}
              style={{
                padding: '10px 20px',
                borderRadius: 8,
                border: 'none',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: '#ffffff',
                fontWeight: 600,
                fontSize: 14,
                cursor: 'pointer',
              }}
            >
              ⭐ Upgrade to Premium
            </button>
          )}
          <button
            onClick={handleLogout}
            style={{
              padding: '10px 20px',
              borderRadius: 8,
              border: '1px solid #d1d5db',
              background: '#ffffff',
              color: '#374151',
              fontWeight: 500,
              fontSize: 14,
              cursor: 'pointer',
            }}
          >
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <TopicKeywordSearch 
        canSearch={user?.canSearch || false}
        onSearchLimitReached={() => setShowUpgradeModal(true)}
        isPremium={user?.isPremium || false}
      />

      {/* Upgrade Modal */}
      {showUpgradeModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
          onClick={() => setShowUpgradeModal(false)}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: 16,
              padding: 32,
              maxWidth: 500,
              width: '90%',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 16 }}>
              Upgrade to Premium
            </h2>
            <p style={{ fontSize: 16, color: '#64748b', marginBottom: 24 }}>
              Get unlimited paper searches and access to all premium features for just $10/month!
            </p>
            
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 14, color: '#374151', marginBottom: 12 }}>
                Unlimited paper searches<br />
                Advanced AI-powered filtering<br />
                Literature review generation<br />
                Export to LaTeX & Word<br />
                Priority support
              </div>
            </div>

            {user?.user?.email && (
              <SubscriptionButton 
                userEmail={user.user.email} 
                onSuccess={() => {
                  setShowUpgradeModal(false);
                  checkLimit();
                }}
              />
            )}

            <button
              onClick={() => setShowUpgradeModal(false)}
              style={{
                marginTop: 16,
                width: '100%',
                padding: 12,
                background: 'none',
                border: 'none',
                color: '#64748b',
                cursor: 'pointer',
              }}
            >
              Maybe later
            </button>
          </div>
        </div>
      )}
    </div>
  );
}