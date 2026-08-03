
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import BottomNavigation from './components/BottomNavigation';
import SocialFeed from './pages/SocialFeed';
import AiSwipe from './pages/AiSwipe';
import ExploreMap from './pages/ExploreMap';
import GroupSplit from './pages/GroupSplit';
import './App.css';

// Placeholder Pages
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
