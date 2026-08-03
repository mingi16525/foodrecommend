import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import BottomNavigation from './components/BottomNavigation';
import './App.css';

// Placeholder Pages
const SocialFeed = () => <div style={{ padding: '20px', paddingTop: '60px' }}><h1 className="gradient-text-primary">Social Feed</h1><p>Khám phá các món ăn hấp dẫn...</p></div>;
const AiSwipe = () => <div style={{ padding: '20px', paddingTop: '60px' }}><h1 className="gradient-text-secondary">AI Swipe</h1><p>Quẹt để chọn món ăn phù hợp với bạn.</p></div>;
const ExploreMap = () => <div style={{ padding: '20px', paddingTop: '60px' }}><h1 className="gradient-text-primary">Explore Map</h1><p>Bản đồ và các quán ăn gần đây.</p></div>;
const GroupSplit = () => <div style={{ padding: '20px', paddingTop: '60px' }}><h1 className="gradient-text-secondary">Group & Split Bill</h1><p>Tạo nhóm và chia tiền nhanh chóng.</p></div>;
const UserProfile = () => <div style={{ padding: '20px', paddingTop: '60px' }}><h1 className="gradient-text-primary">User Profile</h1><p>Thiết lập sở thích và lịch sử.</p></div>;

function App() {
  return (
    <BrowserRouter>
      <div className="app-container">
        <div className="page-content">
          <Routes>
            <Route path="/" element={<SocialFeed />} />
            <Route path="/swipe" element={<AiSwipe />} />
            <Route path="/explore" element={<ExploreMap />} />
            <Route path="/group" element={<GroupSplit />} />
            <Route path="/profile" element={<UserProfile />} />
          </Routes>
        </div>
        <BottomNavigation />
      </div>
    </BrowserRouter>
  );
}

export default App;
