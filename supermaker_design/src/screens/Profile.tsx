import React from 'react';

export function Profile({ onLogout, isDarkMode, onToggleDarkMode }: { onLogout: () => void, isDarkMode: boolean, onToggleDarkMode: () => void }) {
  return (
    <div className="max-w-4xl mx-auto px-6 pt-24 pb-32">
      <section className="mb-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <span className="font-label text-xs font-bold tracking-widest text-on-surface-variant uppercase mb-2 block">Account Settings</span>
            <h2 className="font-headline text-5xl font-extrabold text-on-surface tracking-tight">Your Profile</h2>
          </div>
          <div className="relative group">
            <div className="w-32 h-32 rounded-full overflow-hidden bg-surface-container-highest border-4 border-surface-container-lowest shadow-xl">
              <img alt="Profile" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAJBTgZk4_EMqZlBoS1X7Duze8NLqZQgVIdTzr-OQWFXpmdkWzwpG0dFN771islqJWkpGF9mB9aLcZtRaqkWPXC9FtnI6mbuWdaJyIG3MJ4TvTB6c2gJBk_ejPhiVlSU-mRvF3Y8-ljNPLNtQnD48dW029RD-yltu31YKizcUTl1rGO0SRxtl-5Tsee2gD7ZoTztwIAfd6gW-C2Y7vmuwDfO7Zd5eC-xmbxhfvv8mOiiV-NQ_cJYMkAmllFecQ0L3Z9SAz0SqM" />
            </div>
            <button className="absolute bottom-0 right-0 p-2 bg-primary rounded-full text-on-primary shadow-lg hover:scale-105 transition-transform">
              <span className="material-symbols-outlined text-sm">photo_camera</span>
            </button>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <div className="md:col-span-8 bg-surface-container-lowest rounded-xl p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-8">
            <span className="material-symbols-outlined text-primary">person</span>
            <h3 className="font-headline text-xl font-bold">Personal Information</h3>
          </div>
          <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
            <div className="space-y-1.5">
              <label className="font-label text-xs font-semibold text-on-surface-variant px-1">Display Name</label>
              <input className="w-full h-14 px-4 bg-surface-container-highest rounded-xl border-none focus:ring-2 focus:ring-secondary transition-all font-body text-on-surface outline-none" placeholder="Full Name" type="text" defaultValue="Alex Maker" />
            </div>
            <div className="space-y-1.5">
              <label className="font-label text-xs font-semibold text-on-surface-variant px-1">Email Address</label>
              <input className="w-full h-14 px-4 bg-surface-container-highest rounded-xl border-none focus:ring-2 focus:ring-secondary transition-all font-body text-on-surface outline-none" placeholder="Email Address" type="email" defaultValue="alex@supermaker.io" />
            </div>
            <div className="pt-4">
              <button className="primary-gradient h-14 px-8 rounded-xl text-on-primary font-headline font-bold text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-opacity">
                Update Details
              </button>
            </div>
          </form>
        </div>

        <div className="md:col-span-4 bg-secondary-container/30 rounded-xl p-8 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <span className="material-symbols-outlined text-secondary">palette</span>
              <h3 className="font-headline text-xl font-bold">Theme</h3>
            </div>
            <p className="text-on-surface-variant text-sm leading-relaxed mb-8">Customize your interface appearance for better visibility.</p>
          </div>
          <div className="bg-surface-container-lowest p-6 rounded-xl flex items-center justify-between shadow-sm">
            <div className="flex flex-col">
              <span className="font-bold text-sm">Dark Mode</span>
              <span className="text-xs text-on-surface-variant">Switch theme</span>
            </div>
            <button 
              onClick={onToggleDarkMode}
              className={`w-14 h-8 rounded-full p-1 relative transition-colors ${isDarkMode ? 'bg-primary' : 'bg-surface-container-highest'}`}
            >
              <div className={`w-6 h-6 rounded-full transition-all ${isDarkMode ? 'translate-x-6 bg-on-primary' : 'bg-primary translate-x-0'}`}></div>
            </button>
          </div>
        </div>

        <div className="md:col-span-7 bg-surface-container rounded-xl p-8">
          <div className="flex items-center gap-3 mb-8">
            <span className="material-symbols-outlined text-tertiary">security</span>
            <h3 className="font-headline text-xl font-bold text-on-surface">Security</h3>
          </div>
          <div className="space-y-6">
            <div className="space-y-1.5">
              <label className="font-label text-xs font-semibold text-on-surface-variant px-1">Current Password</label>
              <input className="w-full h-14 px-4 bg-surface-container-lowest rounded-xl border-none focus:ring-2 focus:ring-secondary transition-all font-body text-on-surface outline-none" type="password" defaultValue="••••••••••••" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="font-label text-xs font-semibold text-on-surface-variant px-1">New Password</label>
                <input className="w-full h-14 px-4 bg-surface-container-lowest rounded-xl border-none focus:ring-2 focus:ring-secondary transition-all font-body text-on-surface outline-none" type="password" />
              </div>
              <div className="space-y-1.5">
                <label className="font-label text-xs font-semibold text-on-surface-variant px-1">Confirm New Password</label>
                <input className="w-full h-14 px-4 bg-surface-container-lowest rounded-xl border-none focus:ring-2 focus:ring-secondary transition-all font-body text-on-surface outline-none" type="password" />
              </div>
            </div>
            <button className="h-12 px-6 border border-outline-variant text-on-surface-variant rounded-xl font-bold text-xs hover:bg-surface-container-highest transition-colors">
              Change Password
            </button>
          </div>
        </div>

        <div className="md:col-span-5 flex flex-col gap-6">
          <div className="bg-tertiary-container text-on-tertiary-container p-8 rounded-xl flex-grow">
            <div className="flex items-center gap-3 mb-4">
              <span className="material-symbols-outlined">verified_user</span>
              <h3 className="font-headline text-xl font-bold">Pro Account</h3>
            </div>
            <p className="text-sm opacity-90 mb-6">Your subscription is active until Dec 2024. Enjoy all premium features.</p>
            <button className="w-full py-3 bg-on-tertiary-container text-tertiary-container rounded-lg font-bold text-xs">Manage Subscription</button>
          </div>
          <div className="bg-surface-container-low p-4 rounded-xl flex gap-2">
            <button onClick={onLogout} className="flex-1 flex items-center justify-center gap-2 h-14 bg-error-container text-on-error-container rounded-xl font-bold text-sm hover:brightness-95 transition-all">
              <span className="material-symbols-outlined text-xl">logout</span>
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
