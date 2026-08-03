
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import BottomNavigation from './components/BottomNavigation';
import SocialFeed from './pages/SocialFeed';
import AiSwipe from './pages/AiSwipe';
import ExploreMap from './pages/ExploreMap';
import GroupSplit from './pages/GroupSplit';
import UserProfile from './pages/UserProfile';
import './App.css';

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
