import React, { useEffect } from 'react';
import { useProfileStore } from '../store/profileStore';
import { Settings, Edit3, Star, Clock, BadgeCheck } from 'lucide-react';
import './UserProfile.css';

const UserProfile: React.FC = () => {
  const { user, preferences, history, fetchProfile, requestVerification, isLoading, error } = useProfileStore();

  useEffect(() => {
    // Using mock user ID from our seed data: Alice Nguyen
    fetchProfile('11111111-1111-1111-1111-111111111111');
  }, [fetchProfile]);

  if (isLoading) {
    return <div className="profile-page-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <p className="gradient-text-primary">Loading Profile...</p>
    </div>;
  }

  if (error) {
    return <div className="profile-page-container" style={{ padding: '20px' }}>
      <p style={{ color: 'red' }}>Error: {error}</p>
    </div>;
  }

  return (
    <div className="profile-page-container">
      {/* Top Header */}
      <div className="profile-header">
        <h1 className="gradient-text-primary">Profile</h1>
        <button className="icon-btn-glass"><Settings size={22} color="var(--text-primary)" /></button>
      </div>

      {/* Profile Info Section */}
      <div className="profile-info-section">
        <div className="avatar-container">
          <img src={user.avatar} alt={user.name} className="profile-avatar" />
          <button className="edit-avatar-btn">
            <Edit3 size={16} />
          </button>
        </div>
        
        <div className="profile-details">
          <h2>
            {user.name}
            {user.isReviewer && <BadgeCheck size={20} color="#3b82f6" style={{ marginLeft: '8px', verticalAlign: 'text-bottom' }} />}
          </h2>
          <p className="profile-handle">{user.handle}</p>
          <p className="profile-bio">{user.bio}</p>
          {!user.isReviewer && (
            <button 
              className="action-btn-primary" 
              style={{ marginTop: '10px', fontSize: '0.85rem', padding: '6px 12px' }}
              onClick={() => requestVerification('11111111-1111-1111-1111-111111111111')}
            >
              Request Verified Status
            </button>
          )}
        </div>

        {/* Stats */}
        <div className="profile-stats glass-panel">
          <div className="stat-item">
            <span className="stat-value">{user.reviews}</span>
            <span className="stat-label">Reviews</span>
          </div>
          <div className="stat-divider"></div>
          <div className="stat-item">
            <span className="stat-value">{user.followers}</span>
            <span className="stat-label">Followers</span>
          </div>
          <div className="stat-divider"></div>
          <div className="stat-item">
            <span className="stat-value">{user.following}</span>
            <span className="stat-label">Following</span>
          </div>
        </div>
      </div>

      {/* Preferences Section */}
      <div className="profile-section">
        <div className="section-header">
          <h3>Taste Preferences</h3>
          <button className="text-btn">Edit</button>
        </div>
        <div className="preferences-tags">
          {preferences.map((pref, i) => (
            <span key={i} className="pref-tag">{pref}</span>
          ))}
          <span className="pref-tag add-tag">+ Add</span>
        </div>
      </div>

      {/* History Section */}
      <div className="profile-section">
        <div className="section-header">
          <h3>Recent Visits</h3>
          <button className="text-btn">View All</button>
        </div>
        
        <div className="history-list">
          {history.map(item => (
            <div key={item.id} className="history-card glass-panel">
              <img src={item.imageUrl} alt={item.restaurantName} className="history-img" />
              <div className="history-info">
                <h4>{item.restaurantName}</h4>
                <div className="history-meta">
                  <span className="history-date"><Clock size={14} /> {item.date}</span>
                  <span className="history-rating"><Star size={14} fill="#FFC371" color="#FFC371" /> {item.rating}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
