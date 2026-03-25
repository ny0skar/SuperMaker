import React, { useState, useEffect } from 'react';
import { Login } from './screens/Login';
import { Dashboard } from './screens/Dashboard';
import { Stores } from './screens/Stores';
import { Cart } from './screens/Cart';
import { Profile } from './screens/Profile';
import { TopBar } from './components/TopBar';
import { BottomNav, Tab } from './components/BottomNav';
import { FAB } from './components/FAB';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentTab, setCurrentTab] = useState<Tab>('dashboard');
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  if (!isAuthenticated) {
    return <Login onLogin={() => setIsAuthenticated(true)} />;
  }

  return (
    <div className="bg-surface text-on-surface min-h-screen font-body transition-colors duration-300">
      <TopBar onProfileClick={() => setCurrentTab('profile')} />
      
      {currentTab === 'dashboard' && <Dashboard />}
      {currentTab === 'stores' && <Stores />}
      {currentTab === 'cart' && <Cart />}
      {currentTab === 'history' && (
        <div className="pt-24 px-6 max-w-5xl mx-auto flex items-center justify-center h-[60vh]">
          <p className="text-on-surface-variant">History coming soon...</p>
        </div>
      )}
      {currentTab === 'profile' && <Profile onLogout={() => setIsAuthenticated(false)} isDarkMode={isDarkMode} onToggleDarkMode={() => setIsDarkMode(!isDarkMode)} />}
      
      {currentTab !== 'profile' && <FAB icon={currentTab === 'cart' ? 'shopping_basket' : 'photo_camera'} />}
      
      <BottomNav currentTab={currentTab} onTabChange={setCurrentTab} />
    </div>
  );
}
