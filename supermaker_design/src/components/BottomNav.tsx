import React from 'react';

export type Tab = 'dashboard' | 'stores' | 'cart' | 'history' | 'profile';

export function BottomNav({ currentTab, onTabChange }: { currentTab: Tab, onTabChange: (tab: Tab) => void }) {
  const getTabClass = (tab: Tab) => {
    const isActive = currentTab === tab;
    return `flex flex-col items-center gap-1 group transition-colors ${isActive ? 'text-primary' : 'text-on-surface-variant opacity-70 hover:opacity-100'}`;
  };

  const getIconContainerClass = (tab: Tab) => {
    const isActive = currentTab === tab;
    return isActive ? 'bg-primary/20 text-primary rounded-full px-5 py-1.5 mb-1 transition-colors' : 'mb-1 px-5 py-1.5 transition-colors';
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-surface/80 backdrop-blur-xl border-t border-outline-variant/10 px-2 py-3 z-50 transition-colors duration-300">
      <div className="max-w-md mx-auto flex items-center justify-between px-4">
        <button onClick={() => onTabChange('dashboard')} className={getTabClass('dashboard')}>
          <div className={getIconContainerClass('dashboard')}>
            <span className="material-symbols-outlined" style={{ fontVariationSettings: currentTab === 'dashboard' ? "'FILL' 1" : "'FILL' 0" }}>dashboard</span>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-tighter">Dashboard</span>
        </button>

        <button onClick={() => onTabChange('stores')} className={getTabClass('stores')}>
          <div className={getIconContainerClass('stores')}>
            <span className="material-symbols-outlined" style={{ fontVariationSettings: currentTab === 'stores' ? "'FILL' 1" : "'FILL' 0" }}>storefront</span>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-tighter">Stores</span>
        </button>

        <button onClick={() => onTabChange('cart')} className={getTabClass('cart')}>
          <div className={getIconContainerClass('cart')}>
            <span className="material-symbols-outlined" style={{ fontVariationSettings: currentTab === 'cart' ? "'FILL' 1" : "'FILL' 0" }}>shopping_cart</span>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-tighter">List</span>
        </button>

        <button onClick={() => onTabChange('history')} className={getTabClass('history')}>
          <div className={getIconContainerClass('history')}>
            <span className="material-symbols-outlined" style={{ fontVariationSettings: currentTab === 'history' ? "'FILL' 1" : "'FILL' 0" }}>history</span>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-tighter">History</span>
        </button>

        <button onClick={() => onTabChange('profile')} className={getTabClass('profile')}>
          <div className={getIconContainerClass('profile')}>
            <span className="material-symbols-outlined" style={{ fontVariationSettings: currentTab === 'profile' ? "'FILL' 1" : "'FILL' 0" }}>settings</span>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-tighter">Settings</span>
        </button>
      </div>
    </nav>
  );
}
