import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Search, Heart, Users, User } from 'lucide-react';
import './BottomNavigation.css';

const BottomNavigation: React.FC = () => {
  return (
    <nav className="bottom-nav glass-panel">
      <ul className="nav-list">
        <li>
          <NavLink to="/" className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}>
            <Home size={24} />
            <span>Feed</span>
          </NavLink>
        </li>
        <li>
          <NavLink to="/swipe" className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}>
            <Heart size={24} />
            <span>Swipe</span>
          </NavLink>
        </li>
        <li>
          <NavLink to="/explore" className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}>
            <Search size={24} />
            <span>Map</span>
          </NavLink>
        </li>
        <li>
          <NavLink to="/group" className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}>
            <Users size={24} />
            <span>Group</span>
          </NavLink>
        </li>
        <li>
          <NavLink to="/profile" className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}>
            <User size={24} />
            <span>Profile</span>
          </NavLink>
        </li>
      </ul>
    </nav>
  );
};

export default BottomNavigation;
