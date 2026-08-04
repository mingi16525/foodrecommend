import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, HandPlatter, Megaphone, LogIn } from 'lucide-react';
import './MerchantDashboard.css';

const MerchantDashboard: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [email, setEmail] = useState('admin@merchant.com');
  const [password, setPassword] = useState('123456');
  
  const [analytics, setAnalytics] = useState<any>(null);
  const [menu, setMenu] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [promoteStatus, setPromoteStatus] = useState<{ id: string, message: string } | null>(null);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (email === 'admin@merchant.com' && password === '123456') {
      setIsLoggedIn(true);
    } else {
      alert('Invalid credentials');
    }
  };

  useEffect(() => {
    if (isLoggedIn) {
      // Mock fetching from /api/merchant/m-100/analytics
      setIsLoading(true);
      setTimeout(() => {
        setAnalytics({
          views: 12543,
          likes: 3421,
          orderClicks: 890,
          recentTrend: '+12%',
          popularDish: 'Bún Chả Hà Nội'
        });
        setMenu([
          { id: 'm1', name: 'Bún Chả Hà Nội', price: 55000, isPromoted: true },
          { id: 'm2', name: 'Nem Rán', price: 15000, isPromoted: false },
          { id: 'm3', name: 'Trà Đá', price: 5000, isPromoted: false }
        ]);
        setIsLoading(false);
      }, 800);
    }
  }, [isLoggedIn]);

  const handlePromote = (dishId: string) => {
    const budget = prompt('Enter daily budget for promotion (VND):', '100000');
    if (budget) {
      // Mock promoting call
      setPromoteStatus({ id: dishId, message: `Promoting with budget ${budget} VND` });
      setTimeout(() => setPromoteStatus(null), 3000);
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="merchant-container login-container">
        <div className="glass-panel login-panel">
          <h2 style={{ textAlign: 'center', marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            <LogIn size={24} /> B2B Merchant Login
          </h2>
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <input 
              type="email" 
              value={email} 
              onChange={e => setEmail(e.target.value)}
              placeholder="Email" 
              className="merchant-input" 
            />
            <input 
              type="password" 
              value={password} 
              onChange={e => setPassword(e.target.value)}
              placeholder="Password" 
              className="merchant-input" 
            />
            <button type="submit" className="primary-action-btn">Log In</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="merchant-container">
      <div className="merchant-header">
        <h1 className="gradient-text-primary">Merchant Dashboard</h1>
        <div style={{ color: 'var(--text-secondary)' }}>Welcome, Admin</div>
      </div>

      {isLoading ? (
        <div style={{ textAlign: 'center', marginTop: '50px' }}>Loading analytics...</div>
      ) : (
        <>
          <div className="analytics-grid">
            <div className="glass-panel stat-card">
              <div className="stat-icon"><BarChart3 color="#3b82f6" /></div>
              <div className="stat-content">
                <h3>Total Views</h3>
                <div className="stat-value">{analytics?.views?.toLocaleString()}</div>
                <div className="stat-trend trend-up">{analytics?.recentTrend} this week</div>
              </div>
            </div>
            
            <div className="glass-panel stat-card">
              <div className="stat-icon"><HandPlatter color="#ffc371" /></div>
              <div className="stat-content">
                <h3>Order Clicks</h3>
                <div className="stat-value">{analytics?.orderClicks?.toLocaleString()}</div>
                <div className="stat-subtitle">Popular: {analytics?.popularDish}</div>
              </div>
            </div>

            <div className="glass-panel stat-card">
              <div className="stat-icon"><TrendingUp color="#10b981" /></div>
              <div className="stat-content">
                <h3>Total Likes</h3>
                <div className="stat-value">{analytics?.likes?.toLocaleString()}</div>
              </div>
            </div>
          </div>

          <div className="glass-panel menu-section">
            <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <Megaphone size={20} /> Menu & Promotions
            </h2>
            
            <div className="menu-list">
              {menu.map(item => (
                <div key={item.id} className="menu-item">
                  <div className="menu-info">
                    <h4>{item.name}</h4>
                    <span className="menu-price">{item.price.toLocaleString()} VND</span>
                    {item.isPromoted && <span className="promoted-badge">Promoted</span>}
                    {promoteStatus?.id === item.id && <span className="status-msg">{promoteStatus.message}</span>}
                  </div>
                  <button 
                    className="primary-action-btn small-btn" 
                    onClick={() => handlePromote(item.id)}
                    style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
                  >
                    <TrendingUp size={14} /> Promote
                  </button>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default MerchantDashboard;
