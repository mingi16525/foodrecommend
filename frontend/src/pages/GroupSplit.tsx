import React, { useEffect } from 'react';
import { useGroupStore } from '../store/groupStore';
import { Users, ReceiptText, Plus, ChevronRight, CheckCircle2, Circle, Compass, MapPin, Trash2, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Voting from '../components/Voting';
import './GroupSplit.css';

const GroupSplit: React.FC = () => {
  const { groups, activeTab, setActiveTab, fetchGroups, isLoading, error, connectSocket, tripPlan, isTripLoading, generateTripPlan } = useGroupStore();
  const [tripTitle, setTripTitle] = React.useState('Food Tour Hải Phòng');
  const [stops, setStops] = React.useState<string[]>(['Ga Hải Phòng', 'Khách sạn Imperial', 'Chợ Cát Bi']);

  useEffect(() => {
    fetchGroups();
    connectSocket();
  }, [fetchGroups, connectSocket]);

  // Extract all bills for the "BILLS" tab
  const allBills = groups.flatMap(g => g.activeBills.map(b => ({ ...b, groupName: g.name })));

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  return (
    <div className="group-page-container">
      {/* Header */}
      <div className="group-header">
        <h1 className="gradient-text-primary">Social & Split</h1>
        <button className="icon-btn-glass"><Plus size={24} color="var(--text-primary)" /></button>
      </div>

      {isLoading && <div style={{ padding: '0 20px', color: 'var(--text-secondary)' }}>Loading groups...</div>}
      {error && <div style={{ padding: '0 20px', color: '#ff5f6d' }}>{error}</div>}

      {/* Segmented Control */}
      <div className="segmented-control">
        <div 
          className={`segment ${activeTab === 'GROUPS' ? 'active' : ''}`}
          onClick={() => setActiveTab('GROUPS')}
        >
          <Users size={18} /> Groups
        </div>
        <div 
          className={`segment ${activeTab === 'BILLS' ? 'active' : ''}`}
          onClick={() => setActiveTab('BILLS')}
        >
          <ReceiptText size={18} /> Bills
        </div>
        <div 
          className={`segment ${activeTab === 'TRIPS' ? 'active' : ''}`}
          onClick={() => setActiveTab('TRIPS')}
        >
          <Compass size={18} /> Trip Planner
        </div>
      </div>

      {/* Content Area */}
      <div className="group-content">
        <AnimatePresence mode="wait">
          {activeTab === 'GROUPS' ? (
            <motion.div 
              key="groups"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="list-container"
            >
              {groups.map(group => (
                <div key={group.id} className="group-card glass-panel" style={{ display: 'flex', flexDirection: 'column' }}>
                  <div className="group-card-header">
                    <h3>{group.name}</h3>
                    <ChevronRight size={20} color="var(--text-secondary)" />
                  </div>
                  <div className="group-card-members">
                    {group.members.map((m, i) => (
                      <img 
                        key={m.id} 
                        src={m.avatar} 
                        alt={m.name} 
                        className="member-avatar" 
                        style={{ zIndex: group.members.length - i }}
                      />
                    ))}
                    <div className="member-avatar add-member-btn">
                      <Plus size={16} />
                    </div>
                  </div>
                  {group.activeBills.filter(b => b.status === 'PENDING').length > 0 && (
                    <div className="pending-badge">
                      {group.activeBills.filter(b => b.status === 'PENDING').length} Pending Bills
                    </div>
                  )}
                  
                  {/* Realtime Voting Component */}
                  <Voting groupId={group.id} currentUserId="u0-1" />
                </div>
              ))}
            </motion.div>
          ) : (
            <motion.div 
              key="bills"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="list-container"
            >
              {allBills.map(bill => (
                <div key={bill.id} className="bill-card glass-panel">
                  <div className="bill-header">
                    <div className="bill-info">
                      <h4>{bill.restaurantName}</h4>
                      <span className="bill-group-name">{bill.groupName} • {bill.date}</span>
                    </div>
                    <div className="bill-status">
                      {bill.paid ? (
                        <CheckCircle2 size={24} color="var(--accent-primary-start)" />
                      ) : (
                        <Circle size={24} color="var(--text-secondary)" />
                      )}
                    </div>
                  </div>
                  
                  <div className="bill-divider"></div>
                  
                  <div className="bill-amounts">
                    <div className="amount-col">
                      <span className="amount-label">Total Bill</span>
                      <span className="amount-value">{formatCurrency(bill.totalAmount)}</span>
                    </div>
                    <div className="amount-col highlight-col">
                      <span className="amount-label">Your Share</span>
                      <span className="amount-value highlight">{formatCurrency(bill.myShare)}</span>
                    </div>
                  </div>
                  
                  {!bill.paid && (
                    <button className="primary-action-btn small-btn mt-16">
                      Pay {formatCurrency(bill.myShare)}
                    </button>
                  )}
                </div>
              ))}
            </motion.div>
          ) : (
            <motion.div 
              key="trips"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="list-container"
            >
              {/* Form Input */}
              <div className="glass-panel" style={{ padding: '16px', borderRadius: '16px', marginBottom: '20px' }}>
                <h3 style={{ marginBottom: '12px', fontSize: '1.1rem', color: 'var(--text-primary)' }}>🧭 Lên Kế Hoạch Food Tour</h3>
                
                <input 
                  type="text" 
                  value={tripTitle} 
                  onChange={(e) => setTripTitle(e.target.value)}
                  placeholder="Tên chuyến đi..."
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.2)', color: 'white', marginBottom: '12px' }}
                />

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '12px' }}>
                  {stops.map((stop, idx) => (
                    <div key={idx} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.85rem', opacity: 0.7, width: '60px' }}>Stop {idx + 1}:</span>
                      <input 
                        type="text" 
                        value={stop} 
                        onChange={(e) => {
                          const newStops = [...stops];
                          newStops[idx] = e.target.value;
                          setStops(newStops);
                        }}
                        style={{ flex: 1, padding: '8px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.2)', color: 'white' }}
                      />
                      {stops.length > 1 && (
                        <button 
                          onClick={() => setStops(stops.filter((_, i) => i !== idx))}
                          style={{ background: 'none', border: 'none', color: '#ff5f6d', cursor: 'pointer' }}
                        >
                          <Trash2 size={18} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button 
                    onClick={() => setStops([...stops, `Điểm dừng ${stops.length + 1}`])}
                    style={{ flex: 1, padding: '8px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.2)', background: 'transparent', color: 'white', cursor: 'pointer' }}
                  >
                    + Thêm Trạm
                  </button>
                  <button 
                    onClick={() => generateTripPlan(tripTitle, stops)}
                    disabled={isTripLoading}
                    className="primary-action-btn"
                    style={{ flex: 2 }}
                  >
                    {isTripLoading ? 'AI Planning...' : '🚀 Tạo Lịch Trình AI'}
                  </button>
                </div>
              </div>

              {/* Trip Result */}
              {tripPlan && (
                <div className="glass-panel" style={{ padding: '16px', borderRadius: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <h2>{tripPlan.tripTitle}</h2>
                    <span style={{ fontSize: '0.85rem', background: 'rgba(255,195,113,0.2)', color: '#ffc371', padding: '4px 8px', borderRadius: '6px' }}>⏱️ {tripPlan.totalEstimatedTime}</span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '16px' }}>
                    {tripPlan.stops.map((stop) => (
                      <div key={stop.stopOrder} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', background: 'rgba(255,255,255,0.03)', padding: '10px', borderRadius: '10px' }}>
                        <div style={{ background: '#3b82f6', color: 'white', borderRadius: '50%', width: '28px', height: '28px', display: 'flex', justifyContent: 'center', alignItems: 'center', fontWeight: 'bold', fontSize: '0.85rem', flexShrink: 0 }}>
                          {stop.stopOrder}
                        </div>
                        <div style={{ flex: 1 }}>
                          <h4 style={{ color: 'white', margin: '0 0 4px 0' }}>{stop.stopName}</h4>
                          <p style={{ fontSize: '0.85rem', opacity: 0.8, margin: '0 0 4px 0' }}><MapPin size={14} /> {stop.recommendedPlace}</p>
                          <p style={{ fontSize: '0.8rem', color: '#ffc371', margin: 0 }}>🍜 <strong>Món nên thử:</strong> {stop.recommendedDish} ({stop.estimatedTime})</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <a 
                    href={tripPlan.googleMapsUrl} 
                    target="_blank" 
                    rel="noreferrer"
                    style={{ textDecoration: 'none' }}
                  >
                    <button className="primary-action-btn" style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
                      <ExternalLink size={18} /> Open Route in Google Maps
                    </button>
                  </a>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default GroupSplit;
