import React from 'react';
import { useGroupStore } from '../store/groupStore';
import { Users, ReceiptText, Plus, ChevronRight, CheckCircle2, Circle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import './GroupSplit.css';

const GroupSplit: React.FC = () => {
  const { groups, activeTab, setActiveTab } = useGroupStore();

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
                <div key={group.id} className="group-card glass-panel">
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
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default GroupSplit;
