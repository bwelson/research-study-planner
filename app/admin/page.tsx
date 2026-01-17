"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  email: string;
  isPremium: boolean;
  isAcademicTester: boolean;
  searchCount: number;
  createdAt: string;
  subscriptionExpiresAt: string | null;
}

interface AcademicCode {
  id: string;
  code: string;
  isUsed: boolean;
  usedBy: string | null;
  createdAt: string;
  usedAt: string | null;
}

interface SystemSettings {
  freeAccessEnabled: boolean;
  freeAccessUntil: string | null;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'users' | 'codes' | 'settings' | 'stats'>('users');
  
  // Users
  const [users, setUsers] = useState<User[]>([]);
  const [userSearch, setUserSearch] = useState('');
  
  // Academic Codes
  const [codes, setCodes] = useState<AcademicCode[]>([]);
  const [newCodeCount, setNewCodeCount] = useState(1);
  const [codePrefix, setCodePrefix] = useState('ACAD');
  
  // System Settings
  const [systemSettings, setSystemSettings] = useState<SystemSettings>({
    freeAccessEnabled: false,
    freeAccessUntil: null
  });
  const [freeAccessDate, setFreeAccessDate] = useState('');
  
  // Stats
  const [stats, setStats] = useState({
    totalUsers: 0,
    premiumUsers: 0,
    freeUsers: 0,
    academicTesters: 0,
    totalSearches: 0,
    codesGenerated: 0,
    codesUsed: 0
  });

  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

  useEffect(() => {
    checkAdminAuth();
  }, []);

  const checkAdminAuth = async () => {
    try {
      const response = await fetch('/api/admin/auth');
      if (!response.ok) {
        router.push('/');
        return;
      }
      loadData();
    } catch (error) {
      router.push('/');
    }
  };

  const loadData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadUsers(),
        loadCodes(),
        loadSystemSettings(),
        loadStats()
      ]);
    } catch (error) {
      showMessage('error', 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    const response = await fetch('/api/admin/users');
    const data = await response.json();
    setUsers(data.users || []);
  };

  const loadCodes = async () => {
    const response = await fetch('/api/admin/codes');
    const data = await response.json();
    setCodes(data.codes || []);
  };

  const loadSystemSettings = async () => {
    const response = await fetch('/api/admin/settings');
    const data = await response.json();
    setSystemSettings(data.settings || { freeAccessEnabled: false, freeAccessUntil: null });
    if (data.settings?.freeAccessUntil) {
      setFreeAccessDate(new Date(data.settings.freeAccessUntil).toISOString().split('T')[0]);
    }
  };

  const loadStats = async () => {
    const response = await fetch('/api/admin/stats');
    const data = await response.json();
    setStats(data.stats || stats);
  };

  const generateCodes = async () => {
    try {
      const response = await fetch('/api/admin/codes/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ count: newCodeCount, prefix: codePrefix })
      });
      
      if (response.ok) {
        showMessage('success', `Generated ${newCodeCount} codes successfully`);
        loadCodes();
        loadStats();
        setNewCodeCount(1);
      } else {
        showMessage('error', 'Failed to generate codes');
      }
    } catch (error) {
      showMessage('error', 'Error generating codes');
    }
  };

  const deleteCode = async (id: string) => {
    if (!confirm('Are you sure you want to delete this code?')) return;
    
    try {
      const response = await fetch(`/api/admin/codes/${id}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        showMessage('success', 'Code deleted successfully');
        loadCodes();
        loadStats();
      } else {
        showMessage('error', 'Failed to delete code');
      }
    } catch (error) {
      showMessage('error', 'Error deleting code');
    }
  };

  const toggleUserPremium = async (userId: string, currentStatus: boolean) => {
    try {
      const response = await fetch('/api/admin/users/toggle-premium', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, isPremium: !currentStatus })
      });
      
      if (response.ok) {
        showMessage('success', 'User premium status updated');
        loadUsers();
        loadStats();
      } else {
        showMessage('error', 'Failed to update user');
      }
    } catch (error) {
      showMessage('error', 'Error updating user');
    }
  };

  const updateSystemSettings = async () => {
    try {
      const response = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          freeAccessEnabled: systemSettings.freeAccessEnabled,
          freeAccessUntil: freeAccessDate ? new Date(freeAccessDate).toISOString() : null
        })
      });
      
      if (response.ok) {
        showMessage('success', 'System settings updated successfully');
        loadSystemSettings();
      } else {
        showMessage('error', 'Failed to update settings');
      }
    } catch (error) {
      showMessage('error', 'Error updating settings');
    }
  };

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  const filteredUsers = users.filter(user => 
    user.email.toLowerCase().includes(userSearch.toLowerCase())
  );

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f8fafc'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: 50,
            height: 50,
            border: '4px solid #e5e7eb',
            borderTopColor: '#667eea',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
          }} />
          <p style={{ color: '#64748b', fontSize: 14 }}>Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '24px 32px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
      }}>
        <div style={{ maxWidth: 1400, margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h1 style={{ color: '#ffffff', fontSize: 28, fontWeight: 700, margin: '0 0 4px 0' }}>
                Admin Dashboard
              </h1>
              <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: 14, margin: 0 }}>
                Manage users, subscriptions, and system settings
              </p>
            </div>
            <button
              onClick={() => router.push('/dashboard')}
              style={{
                padding: '10px 20px',
                background: 'rgba(255,255,255,0.2)',
                border: '1px solid rgba(255,255,255,0.3)',
                borderRadius: 8,
                color: '#ffffff',
                fontSize: 14,
                fontWeight: 500,
                cursor: 'pointer',
                backdropFilter: 'blur(10px)'
              }}
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>

      {/* Message Banner */}
      {message && (
        <div style={{
          padding: '12px 32px',
          background: message.type === 'success' ? '#d1fae5' : '#fee2e2',
          borderBottom: `2px solid ${message.type === 'success' ? '#10b981' : '#ef4444'}`
        }}>
          <div style={{ maxWidth: 1400, margin: '0 auto' }}>
            <p style={{
              color: message.type === 'success' ? '#065f46' : '#991b1b',
              fontSize: 14,
              fontWeight: 500,
              margin: 0
            }}>
              {message.text}
            </p>
          </div>
        </div>
      )}

      <div style={{ maxWidth: 1400, margin: '0 auto', padding: '32px' }}>
        {/* Stats Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 20,
          marginBottom: 32
        }}>
          <StatCard title="Total Users" value={stats.totalUsers} icon="👥" color="#3b82f6" />
          <StatCard title="Premium Users" value={stats.premiumUsers} icon="⭐" color="#10b981" />
          <StatCard title="Free Users" value={stats.freeUsers} icon="📊" color="#6366f1" />
          <StatCard title="Academic Testers" value={stats.academicTesters} icon="🎓" color="#8b5cf6" />
          <StatCard title="Total Searches" value={stats.totalSearches} icon="🔍" color="#f59e0b" />
          <StatCard title="Codes Generated" value={stats.codesGenerated} icon="🎟️" color="#ec4899" />
        </div>

        {/* Tabs */}
        <div style={{
          display: 'flex',
          gap: 8,
          marginBottom: 24,
          borderBottom: '2px solid #e5e7eb'
        }}>
          <TabButton
            active={activeTab === 'stats'}
            onClick={() => setActiveTab('stats')}
            label="📊 Statistics"
          />
          <TabButton
            active={activeTab === 'users'}
            onClick={() => setActiveTab('users')}
            label="👥 Users"
          />
          <TabButton
            active={activeTab === 'codes'}
            onClick={() => setActiveTab('codes')}
            label="🎟️ Academic Codes"
          />
          <TabButton
            active={activeTab === 'settings'}
            onClick={() => setActiveTab('settings')}
            label="⚙️ System Settings"
          />
        </div>

        {/* Tab Content */}
        {activeTab === 'stats' && (
          <div style={{
            background: '#ffffff',
            borderRadius: 12,
            padding: 32,
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}>
            <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 24, color: '#1e293b' }}>
              System Statistics
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 24 }}>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 600, color: '#475569', marginBottom: 12 }}>
                  User Distribution
                </h3>
                <div style={{ fontSize: 14, color: '#64748b', lineHeight: 2 }}>
                  <div>Total Users: <strong>{stats.totalUsers}</strong></div>
                  <div>Premium: <strong style={{ color: '#10b981' }}>{stats.premiumUsers}</strong></div>
                  <div>Free: <strong>{stats.freeUsers}</strong></div>
                  <div>Academic Testers: <strong style={{ color: '#8b5cf6' }}>{stats.academicTesters}</strong></div>
                </div>
              </div>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 600, color: '#475569', marginBottom: 12 }}>
                  Academic Codes
                </h3>
                <div style={{ fontSize: 14, color: '#64748b', lineHeight: 2 }}>
                  <div>Generated: <strong>{stats.codesGenerated}</strong></div>
                  <div>Used: <strong style={{ color: '#10b981' }}>{stats.codesUsed}</strong></div>
                  <div>Available: <strong>{stats.codesGenerated - stats.codesUsed}</strong></div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div style={{
            background: '#ffffff',
            borderRadius: 12,
            padding: 32,
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}>
            <div style={{ marginBottom: 24 }}>
              <input
                type="text"
                placeholder="Search users by email..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                style={{
                  width: '100%',
                  maxWidth: 400,
                  padding: '10px 16px',
                  border: '1px solid #e5e7eb',
                  borderRadius: 8,
                  fontSize: 14,
                  outline: 'none'
                }}
              />
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e5e7eb' }}>
                    <th style={tableHeaderStyle}>Email</th>
                    <th style={tableHeaderStyle}>Status</th>
                    <th style={tableHeaderStyle}>Searches</th>
                    <th style={tableHeaderStyle}>Joined</th>
                    <th style={tableHeaderStyle}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={tableCellStyle}>{user.email}</td>
                      <td style={tableCellStyle}>
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                          {user.isPremium && (
                            <span style={badgeStyle('#10b981')}>Premium</span>
                          )}
                          {user.isAcademicTester && (
                            <span style={badgeStyle('#8b5cf6')}>Academic</span>
                          )}
                          {!user.isPremium && !user.isAcademicTester && (
                            <span style={badgeStyle('#64748b')}>Free</span>
                          )}
                        </div>
                      </td>
                      <td style={tableCellStyle}>{user.searchCount}</td>
                      <td style={tableCellStyle}>
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      <td style={tableCellStyle}>
                        <button
                          onClick={() => toggleUserPremium(user.id, user.isPremium)}
                          style={{
                            padding: '6px 12px',
                            background: user.isPremium ? '#fee2e2' : '#d1fae5',
                            border: 'none',
                            borderRadius: 6,
                            color: user.isPremium ? '#991b1b' : '#065f46',
                            fontSize: 12,
                            fontWeight: 500,
                            cursor: 'pointer'
                          }}
                        >
                          {user.isPremium ? 'Remove Premium' : 'Make Premium'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'codes' && (
          <div style={{
            background: '#ffffff',
            borderRadius: 12,
            padding: 32,
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}>
            <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 24, color: '#1e293b' }}>
              Academic Testing Codes
            </h2>

            {/* Generate Codes */}
            <div style={{
              padding: 24,
              background: '#f8fafc',
              borderRadius: 8,
              marginBottom: 32
            }}>
              <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16, color: '#1e293b' }}>
                Generate New Codes
              </h3>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'end' }}>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#475569', marginBottom: 6 }}>
                    Prefix
                  </label>
                  <input
                    type="text"
                    value={codePrefix}
                    onChange={(e) => setCodePrefix(e.target.value.toUpperCase())}
                    placeholder="ACAD"
                    maxLength={6}
                    style={{
                      padding: '10px 14px',
                      border: '1px solid #e5e7eb',
                      borderRadius: 8,
                      fontSize: 14,
                      width: 120,
                      outline: 'none'
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#475569', marginBottom: 6 }}>
                    Number of Codes
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={newCodeCount}
                    onChange={(e) => setNewCodeCount(parseInt(e.target.value) || 1)}
                    style={{
                      padding: '10px 14px',
                      border: '1px solid #e5e7eb',
                      borderRadius: 8,
                      fontSize: 14,
                      width: 120,
                      outline: 'none'
                    }}
                  />
                </div>
                <button
                  onClick={generateCodes}
                  style={{
                    padding: '10px 24px',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    border: 'none',
                    borderRadius: 8,
                    color: '#ffffff',
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Generate Codes
                </button>
              </div>
            </div>

            {/* Codes List */}
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e5e7eb' }}>
                    <th style={tableHeaderStyle}>Code</th>
                    <th style={tableHeaderStyle}>Status</th>
                    <th style={tableHeaderStyle}>Used By</th>
                    <th style={tableHeaderStyle}>Created</th>
                    <th style={tableHeaderStyle}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {codes.map((code) => (
                    <tr key={code.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={tableCellStyle}>
                        <code style={{
                          background: '#f1f5f9',
                          padding: '4px 8px',
                          borderRadius: 4,
                          fontSize: 13,
                          fontWeight: 600
                        }}>
                          {code.code}
                        </code>
                      </td>
                      <td style={tableCellStyle}>
                        <span style={badgeStyle(code.isUsed ? '#ef4444' : '#10b981')}>
                          {code.isUsed ? 'Used' : 'Available'}
                        </span>
                      </td>
                      <td style={tableCellStyle}>
                        {code.usedBy || '-'}
                      </td>
                      <td style={tableCellStyle}>
                        {new Date(code.createdAt).toLocaleDateString()}
                      </td>
                      <td style={tableCellStyle}>
                        <button
                          onClick={() => deleteCode(code.id)}
                          disabled={code.isUsed}
                          style={{
                            padding: '6px 12px',
                            background: code.isUsed ? '#f1f5f9' : '#fee2e2',
                            border: 'none',
                            borderRadius: 6,
                            color: code.isUsed ? '#94a3b8' : '#991b1b',
                            fontSize: 12,
                            fontWeight: 500,
                            cursor: code.isUsed ? 'not-allowed' : 'pointer'
                          }}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div style={{
            background: '#ffffff',
            borderRadius: 12,
            padding: 32,
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}>
            <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 24, color: '#1e293b' }}>
              System Settings
            </h2>

            <div style={{
              padding: 24,
              background: '#fef3c7',
              border: '2px solid #fbbf24',
              borderRadius: 12,
              marginBottom: 24
            }}>
              <div style={{ display: 'flex', alignItems: 'start', gap: 12 }}>
                <span style={{ fontSize: 24 }}>⚠️</span>
                <div>
                  <h3 style={{ fontSize: 16, fontWeight: 600, color: '#92400e', margin: '0 0 8px 0' }}>
                    Temporary Free Access Mode
                  </h3>
                  <p style={{ fontSize: 14, color: '#78350f', margin: '0 0 16px 0', lineHeight: 1.6 }}>
                    Enable this to make all premium features free for ALL users until a specific date. 
                    This overrides individual subscriptions and is useful for promotions or testing.
                  </p>
                  
                  <div style={{ marginBottom: 16 }}>
                    <label style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      cursor: 'pointer',
                      fontSize: 14,
                      fontWeight: 600,
                      color: '#92400e'
                    }}>
                      <input
                        type="checkbox"
                        checked={systemSettings.freeAccessEnabled}
                        onChange={(e) => setSystemSettings({
                          ...systemSettings,
                          freeAccessEnabled: e.target.checked
                        })}
                        style={{ width: 18, height: 18, cursor: 'pointer' }}
                      />
                      Enable Free Access for All Users
                    </label>
                  </div>

                  {systemSettings.freeAccessEnabled && (
                    <div>
                      <label style={{
                        display: 'block',
                        fontSize: 13,
                        fontWeight: 600,
                        color: '#92400e',
                        marginBottom: 6
                      }}>
                        Free Access Until:
                      </label>
                      <input
                        type="date"
                        value={freeAccessDate}
                        onChange={(e) => setFreeAccessDate(e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                        style={{
                          padding: '10px 14px',
                          border: '2px solid #fbbf24',
                          borderRadius: 8,
                          fontSize: 14,
                          outline: 'none',
                          background: '#ffffff'
                        }}
                      />
                      {freeAccessDate && (
                        <p style={{ fontSize: 12, color: '#78350f', marginTop: 8 }}>
                          Premium features will be free until {new Date(freeAccessDate).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <button
              onClick={updateSystemSettings}
              style={{
                padding: '12px 32px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                border: 'none',
                borderRadius: 8,
                color: '#ffffff',
                fontSize: 14,
                fontWeight: 600,
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
              }}
            >
              Save Settings
            </button>

            {systemSettings.freeAccessEnabled && (
              <div style={{
                marginTop: 24,
                padding: 16,
                background: '#dbeafe',
                border: '1px solid #3b82f6',
                borderRadius: 8
              }}>
                <p style={{ fontSize: 13, color: '#1e40af', margin: 0 }}>
                  ✓ Free access mode is currently active. All users have premium features until{' '}
                  {systemSettings.freeAccessUntil 
                    ? new Date(systemSettings.freeAccessUntil).toLocaleDateString()
                    : 'date not set'
                  }
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

function StatCard({ title, value, icon, color }: { title: string; value: number; icon: string; color: string }) {
  return (
    <div style={{
      background: '#ffffff',
      padding: 24,
      borderRadius: 12,
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      border: `2px solid ${color}20`
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 12 }}>
        <div style={{ fontSize: 32 }}>{icon}</div>
        <div style={{
          fontSize: 28,
          fontWeight: 700,
          color: color
        }}>
          {value}
        </div>
      </div>
      <div style={{ fontSize: 13, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
        {title}
      </div>
    </div>
  );
}

function TabButton({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '12px 24px',
        background: 'transparent',
        border: 'none',
        borderBottom: active ? '3px solid #667eea' : '3px solid transparent',
        color: active ? '#667eea' : '#64748b',
        fontSize: 14,
        fontWeight: 600,
        cursor: 'pointer',
        transition: 'all 0.2s'
      }}
    >
      {label}
    </button>
  );
}

const tableHeaderStyle: React.CSSProperties = {
  padding: '12px 16px',
  textAlign: 'left',
  fontSize: 12,
  fontWeight: 600,
  color: '#475569',
  textTransform: 'uppercase',
  letterSpacing: '0.5px'
};

const tableCellStyle: React.CSSProperties = {
  padding: '16px',
  fontSize: 14,
  color: '#1e293b'
};

const badgeStyle = (color: string): React.CSSProperties => ({
  display: 'inline-block',
  padding: '4px 10px',
  background: `${color}20`,
  color: color,
  borderRadius: 12,
  fontSize: 11,
  fontWeight: 600,
  textTransform: 'uppercase',
  letterSpacing: '0.5px'
});