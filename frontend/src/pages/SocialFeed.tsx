import React, { useRef, useState, useEffect } from 'react';
import { useFeedStore, type FeedPost } from '../store/feedStore';
import { Heart, MessageCircle, Share2, Bookmark, MapPin } from 'lucide-react';
import './SocialFeed.css';

const FeedItem: React.FC<{ post: FeedPost }> = ({ post }) => {
  const { toggleLike, toggleSave } = useFeedStore();
  const [showHeartAnim, setShowHeartAnim] = useState(false);
  const clickTimeout = useRef<number | null>(null);

  const handleInteraction = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    if (clickTimeout.current) {
      // Double tap detected
      clearTimeout(clickTimeout.current);
      clickTimeout.current = null;
      if (!post.isLikedByMe) toggleLike(post.id);
      
      // Show animation
      setShowHeartAnim(true);
      setTimeout(() => setShowHeartAnim(false), 1000);
    } else {
      // Single tap
      clickTimeout.current = setTimeout(() => {
        clickTimeout.current = null;
        // Pause/play video logic would go here
      }, 300);
    }
  };

  return (
    <div className="feed-item" onClick={handleInteraction}>
      <div 
        className="feed-media"
        style={{ backgroundImage: `url(${post.imageUrl})` }}
      ></div>
      
      {/* Dark overlay for readability */}
      <div className="feed-overlay-gradient"></div>

      {showHeartAnim && (
        <div className="heart-animation">
          <Heart fill="#FF5F6D" color="#FF5F6D" size={100} />
        </div>
      )}

      <div className="feed-content">
        {/* Left Side: Info */}
        <div className="feed-info">
          <div className="reviewer-info">
            <img src={post.avatarUrl} alt="Avatar" className="avatar" />
            <span className="reviewer-name">{post.reviewerName}</span>
          </div>
          <p className="feed-caption">{post.caption}</p>
          <div className="restaurant-tag glass-panel hover-scale">
            <MapPin size={14} />
            <span>{post.restaurantName}</span>
          </div>
        </div>

        {/* Right Side: Actions */}
        <div className="feed-actions">
          <button className="action-btn" onClick={(e) => { e.stopPropagation(); toggleLike(post.id); }}>
            <div className="icon-wrapper">
              <Heart fill={post.isLikedByMe ? "#FF5F6D" : "transparent"} color={post.isLikedByMe ? "#FF5F6D" : "white"} size={28} />
            </div>
            <span className="action-text">{post.likes}</span>
          </button>
          
          <button className="action-btn" onClick={(e) => e.stopPropagation()}>
            <div className="icon-wrapper">
              <MessageCircle color="white" size={28} />
            </div>
            <span className="action-text">{post.comments}</span>
          </button>
          
          <button className="action-btn" onClick={(e) => { e.stopPropagation(); toggleSave(post.id); }}>
            <div className="icon-wrapper">
              <Bookmark fill={post.isSaved ? "#FFC371" : "transparent"} color={post.isSaved ? "#FFC371" : "white"} size={28} />
            </div>
            <span className="action-text">Save</span>
          </button>
          
          <button className="action-btn" onClick={(e) => e.stopPropagation()}>
            <div className="icon-wrapper">
              <Share2 color="white" size={28} />
            </div>
            <span className="action-text">Share</span>
          </button>
        </div>
      </div>
    </div>
  );
};

const SocialFeed: React.FC = () => {
  const posts = useFeedStore((state) => state.posts);
  
  // Hide global scrollbar logic when in feed
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  return (
    <div className="feed-container">
      {posts.map((post) => (
        <FeedItem key={post.id} post={post} />
      ))}
    </div>
  );
};

export default SocialFeed;
