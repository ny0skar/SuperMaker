import React from 'react';

export function Login({ onLogin }: { onLogin: () => void }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-surface">
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        <div className="lg:col-span-7 flex flex-col space-y-8 pr-0 lg:pr-12">
          <div className="flex items-center space-y-4">
            <div className="bg-primary-container p-4 rounded-xl inline-flex shadow-sm">
              <span className="material-symbols-outlined text-on-primary-container text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
            </div>
          </div>
          <div className="space-y-4">
            <h1 className="text-on-background font-headline text-5xl lg:text-7xl font-bold tracking-tight">
              SuperMaker
            </h1>
            <p className="text-on-surface-variant font-body text-xl max-w-md leading-relaxed">
              A fresh, organic approach to managing your digital marketplace ledger.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-8">
            <div className="bg-surface-container-low p-6 rounded-xl space-y-2">
              <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>trending_up</span>
              <p className="font-headline font-semibold text-on-surface">Smart Analytics</p>
              <p className="text-sm text-on-surface-variant">Real-time tracking of your growth.</p>
            </div>
            <div className="bg-surface-container-low p-6 rounded-xl space-y-2">
              <span className="material-symbols-outlined text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>verified_user</span>
              <p className="font-headline font-semibold text-on-surface">Secure Vault</p>
              <p className="text-sm text-on-surface-variant">Banking-grade security for peace of mind.</p>
            </div>
          </div>
        </div>
        
        <div className="lg:col-span-5 relative">
          <div className="absolute -top-12 -right-12 w-64 h-64 bg-primary-fixed opacity-20 blur-3xl rounded-full"></div>
          <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-secondary-fixed opacity-30 blur-3xl rounded-full"></div>
          
          <div className="relative bg-surface-container-lowest p-8 lg:p-12 rounded-xl shadow-xl shadow-on-surface/5 border border-outline-variant/10">
            <div className="mb-10">
              <h2 className="font-headline text-3xl font-bold text-on-surface">Welcome back</h2>
              <p className="text-on-surface-variant mt-2">Enter your credentials to access your dashboard.</p>
            </div>
            
            <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); onLogin(); }}>
              <div className="space-y-1.5">
                <label className="font-label text-xs font-bold uppercase tracking-wider text-on-surface-variant ml-1" htmlFor="username">Username</label>
                <div className="relative group">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-secondary">person</span>
                  <input className="w-full bg-surface-container-highest border-none rounded-xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-secondary/20 transition-all text-on-surface placeholder-outline/50 outline-none" id="username" placeholder="e.g. green_curator" type="text" />
                </div>
              </div>
              
              <div className="space-y-1.5">
                <div className="flex justify-between items-center px-1">
                  <label className="font-label text-xs font-bold uppercase tracking-wider text-on-surface-variant" htmlFor="password">Password</label>
                  <a className="text-xs font-semibold text-secondary hover:text-primary transition-colors" href="#">Forgot Password?</a>
                </div>
                <div className="relative group">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-secondary">lock</span>
                  <input className="w-full bg-surface-container-highest border-none rounded-xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-secondary/20 transition-all text-on-surface placeholder-outline/50 outline-none" id="password" placeholder="••••••••" type="password" />
                </div>
              </div>
              
              <div className="flex items-center space-x-2 py-2">
                <input className="w-5 h-5 rounded-lg border-outline-variant bg-surface text-primary focus:ring-primary/20" id="remember" type="checkbox" />
                <label className="text-sm text-on-surface-variant cursor-pointer" htmlFor="remember">Remember me for 30 days</label>
              </div>
              
              <button type="submit" className="w-full primary-gradient text-on-primary font-headline font-bold py-4 rounded-xl shadow-lg shadow-primary/20 hover:scale-[1.01] active:scale-[0.98] transition-all flex items-center justify-center space-x-2">
                <span>Sign in</span>
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </button>
            </form>
            
            <div className="mt-10 pt-8 border-t border-outline-variant/10 text-center">
              <p className="text-on-surface-variant">Don't have an account? <a className="text-primary font-bold hover:underline underline-offset-4 decoration-2" href="#">Create one for free</a></p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="fixed bottom-8 flex space-x-6 text-on-surface-variant/40 font-label text-[10px] uppercase tracking-[0.2em]">
        <span className="hover:text-on-surface cursor-pointer transition-colors">Privacy Policy</span>
        <span className="hover:text-on-surface cursor-pointer transition-colors">Terms of Service</span>
        <span className="hover:text-on-surface cursor-pointer transition-colors">© 2024 SuperMaker</span>
      </div>
    </div>
  );
}
