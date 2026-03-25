import React from 'react';

export function TopBar({ onProfileClick }: { onProfileClick: () => void }) {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-surface/80 backdrop-blur-xl px-6 py-4 flex items-center justify-between border-b border-outline-variant/15 transition-colors duration-300">
      <div className="flex items-center gap-4">
        <span className="material-symbols-outlined text-on-surface cursor-pointer">menu</span>
        <h1 className="text-xl font-bold tracking-tight text-on-surface font-headline">SuperMaker</h1>
      </div>
      <div className="flex items-center gap-4 cursor-pointer" onClick={onProfileClick}>
        <span className="material-symbols-outlined text-on-surface text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>account_circle</span>
      </div>
    </header>
  );
}
