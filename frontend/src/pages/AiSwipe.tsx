import React, { useState } from 'react';
import { motion, useMotionValue, useTransform, AnimatePresence } from 'framer-motion';
import { useSwipeStore, SwipeCardData } from '../store/swipeStore';
import { X, Heart, Star, MapPin } from 'lucide-react';
import './AiSwipe.css';

const SwipeCard: React.FC<{
  card: SwipeCardData;
  active: boolean;
  onSwipe: (card: SwipeCardData, dir: 'left' | 'right') => void;
}> = ({ card, active, onSwipe }) => {
  const [exitX, setExitX] = useState<number | string>(0);
  
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-15, 15]);
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0, 1, 1, 1, 0]);

  // Overlay opacity for LIKE (green/red tint)
  const likeOpacity = useTransform(x, [0, 100], [0, 1]);
  const nopeOpacity = useTransform(x, [0, -100], [0, 1]);

  const handleDragEnd = (event: any, info: any) => {
    if (info.offset.x > 100) {
      setExitX('100vw');
      onSwipe(card, 'right');
    } else if (info.offset.x < -100) {
      setExitX('-100vw');
      onSwipe(card, 'left');
    }
  };

  return (
    <motion.div
      className={`swipe-card ${active ? 'active-card' : 'bg-card'}`}
      style={{
        x,
        rotate,
        opacity: active ? 1 : opacity, // inactive cards stay hidden underneath
      }}
      drag={active ? 'x' : false}
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      onDragEnd={handleDragEnd}
      exit={{ x: exitX, opacity: 0, transition: { duration: 0.3 } }}
      whileTap={active ? { scale: 0.98 } : {}}
    >
      <div 
        className="card-media" 
        style={{ backgroundImage: `url(${card.imageUrl})` }}
      >
        <div className="card-overlay">
          <motion.div className="action-stamp stamp-like" style={{ opacity: likeOpacity }}>
            LIKE
          </motion.div>
          <motion.div className="action-stamp stamp-nope" style={{ opacity: nopeOpacity }}>
            NOPE
          </motion.div>
        </div>
      </div>
      
      <div className="card-info glass-panel">
        <div className="card-header">
          <h2 className="card-title">{card.name}</h2>
          <span className="card-price">{card.price}</span>
        </div>
        
        <div className="card-meta">
          <div className="meta-item">
            <Star size={16} fill="#FFC371" color="#FFC371" />
            <span>{card.rating}</span>
          </div>
          <div className="meta-item">
            <MapPin size={16} />
            <span>{card.distance}</span>
          </div>
        </div>

        <div className="card-tags">
          {card.aiTags.map((tag, idx) => (
            <span key={idx} className="tag">{tag}</span>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

const AiSwipe: React.FC = () => {
  const { cards, swipeRight, swipeLeft, resetCards } = useSwipeStore();

  const handleManualSwipe = (dir: 'left' | 'right') => {
    if (cards.length === 0) return;
    const currentCard = cards[cards.length - 1]; // Top card
    if (dir === 'right') {
      swipeRight(currentCard);
    } else {
      swipeLeft(currentCard);
    }
  };

  return (
    <div className="swipe-container">
      <div className="swipe-header">
        <h1 className="gradient-text-secondary">AI Discovery</h1>
        <p>Swipe right if it looks tasty!</p>
      </div>

      <div className="cards-stack">
        <AnimatePresence>
          {cards.length > 0 ? (
            cards.map((card, index) => (
              <SwipeCard 
                key={card.id} 
                card={card} 
                active={index === cards.length - 1}
                onSwipe={(c, dir) => dir === 'right' ? swipeRight(c) : swipeLeft(c)}
              />
            ))
          ) : (
            <motion.div 
              className="empty-state glass-panel"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <h2>You're all caught up!</h2>
              <p>We're looking for more delicious matches.</p>
              <button className="reset-btn" onClick={resetCards}>
                Find more food
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="swipe-controls">
        <button 
          className="control-btn nope-btn" 
          onClick={() => handleManualSwipe('left')}
          disabled={cards.length === 0}
        >
          <X size={32} strokeWidth={3} />
        </button>
        <button 
          className="control-btn like-btn" 
          onClick={() => handleManualSwipe('right')}
          disabled={cards.length === 0}
        >
          <Heart size={32} strokeWidth={3} />
        </button>
      </div>
    </div>
  );
};

export default AiSwipe;
