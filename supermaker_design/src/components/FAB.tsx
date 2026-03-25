import React from 'react';

export function FAB({ onClick, icon = 'photo_camera' }: { onClick?: () => void, icon?: string }) {
  return (
    <div className="fixed bottom-28 right-6 z-40">
      <button onClick={onClick} className="primary-gradient w-14 h-14 rounded-xl shadow-2xl flex items-center justify-center text-on-primary group hover:scale-105 transition-transform duration-200">
        <span className="material-symbols-outlined text-2xl">{icon}</span>
      </button>
    </div>
  );
}
