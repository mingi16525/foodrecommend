import React, { useEffect } from 'react';
import { useGroupStore } from '../store/groupStore';
import { motion } from 'framer-motion';
import { Utensils } from 'lucide-react';
import './Voting.css';

interface VotingProps {
  groupId: string;
  currentUserId: string;
}

const Voting: React.FC<VotingProps> = ({ groupId, currentUserId }) => {
  const { activeVotes, joinGroupVoting, castVote, startVote } = useGroupStore();

  useEffect(() => {
    joinGroupVoting(groupId);
  }, [groupId, joinGroupVoting]);

  const voteState = activeVotes[groupId];

  const handleStartVote = () => {
    // For MVP, we provide some default mock options to start voting
    const defaultOptions = ['Pizza 4P\'s', 'Haidilao', 'Bún Chả Hương Liên', 'Sushi Hokkaido'];
    startVote(groupId, defaultOptions);
  };

  if (!voteState) {
    return (
      <div className="voting-container glass-panel">
        <div className="voting-header">
          <h3><Utensils size={18} style={{ marginRight: '8px' }}/> No Active Vote</h3>
          <p>Can't decide where to eat? Start a voting session!</p>
          <button className="primary-action-btn small-btn mt-16" onClick={handleStartVote}>
            Start Voting
          </button>
        </div>
      </div>
    );
  }

  const totalVotes = Object.values(voteState.options).reduce((a, b) => a + b, 0);

  return (
    <div className="voting-container glass-panel">
      <div className="voting-header">
        <h3><Utensils size={18} style={{ marginRight: '8px' }}/> Active Voting Session</h3>
        <p>Tap on a restaurant to cast your vote!</p>
      </div>

      <div className="voting-options">
        {Object.entries(voteState.options).map(([restaurantId, count]) => {
          const percentage = totalVotes === 0 ? 0 : Math.round((count / totalVotes) * 100);
          const isMyVote = voteState.userVotes[currentUserId] === restaurantId;

          return (
            <motion.div 
              key={restaurantId} 
              className={`vote-option ${isMyVote ? 'selected' : ''}`}
              onClick={() => castVote(groupId, currentUserId, restaurantId)}
              whileTap={{ scale: 0.98 }}
            >
              <div className="vote-option-info">
                <span className="restaurant-name">{restaurantId}</span>
                <span className="vote-count">{count} votes ({percentage}%)</span>
              </div>
              <div className="vote-progress-bar">
                <motion.div 
                  className="vote-progress-fill"
                  initial={{ width: 0 }}
                  animate={{ width: `${percentage}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default Voting;
