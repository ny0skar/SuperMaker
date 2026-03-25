import React from 'react';

export function Dashboard() {
  return (
    <div className="pt-24 px-6 max-w-5xl mx-auto space-y-12 pb-32">
      <section>
        <p className="font-label text-xs font-bold tracking-widest text-on-surface-variant uppercase mb-2">OVERVIEW</p>
        <h2 className="text-5xl md:text-6xl font-extrabold tracking-tighter text-on-surface leading-none font-headline">
          Freshly <span className="text-primary italic">Tracked.</span>
        </h2>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <div className="md:col-span-8 bg-surface-container-lowest rounded-xl p-8 shadow-sm border border-outline-variant/10">
          <div className="flex justify-between items-end mb-8">
            <div>
              <p className="text-on-surface-variant text-sm font-medium">Monthly Spending</p>
              <h3 className="text-3xl font-bold font-headline">$1,248.50</h3>
            </div>
            <div className="flex items-center gap-1 text-primary font-bold">
              <span className="material-symbols-outlined text-sm">trending_up</span>
              <span className="text-sm">4.2%</span>
            </div>
          </div>
          
          <div className="flex items-end justify-between h-48 gap-2 px-2">
            <div className="flex flex-col items-center gap-3 w-full group">
              <div className="w-full bg-surface-container-highest rounded-full h-24 group-hover:bg-surface-variant transition-colors"></div>
              <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-tighter">Apr</span>
            </div>
            <div className="flex flex-col items-center gap-3 w-full group">
              <div className="w-full bg-surface-container-highest rounded-full h-32 group-hover:bg-surface-variant transition-colors"></div>
              <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-tighter">May</span>
            </div>
            <div className="flex flex-col items-center gap-3 w-full group">
              <div className="w-full bg-surface-container-highest rounded-full h-28 group-hover:bg-surface-variant transition-colors"></div>
              <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-tighter">Jun</span>
            </div>
            <div className="flex flex-col items-center gap-3 w-full group">
              <div className="w-full bg-surface-container-highest rounded-full h-40 group-hover:bg-surface-variant transition-colors"></div>
              <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-tighter">Jul</span>
            </div>
            <div className="flex flex-col items-center gap-3 w-full group">
              <div className="w-full primary-gradient rounded-full h-48 shadow-lg shadow-primary/20"></div>
              <span className="text-[10px] font-bold text-primary uppercase tracking-tighter">Aug</span>
            </div>
          </div>
        </div>

        <div className="md:col-span-4 bg-secondary-container text-on-secondary-container rounded-xl p-8 flex flex-col justify-between overflow-hidden relative">
          <div className="relative z-10">
            <p className="text-xs font-bold tracking-widest uppercase opacity-80 mb-4 font-label">Last Visit</p>
            <h3 className="text-2xl font-bold leading-tight font-headline">Whole Foods Market</h3>
            <p className="text-sm opacity-90 mt-1">Yesterday, 4:20 PM</p>
          </div>
          <div className="mt-8 relative z-10">
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-black font-headline">$84</span>
              <span className="text-xl font-medium font-headline">.21</span>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="bg-on-secondary-container/10 px-3 py-1 rounded-full text-[10px] font-bold">12 ITEMS</span>
              <span className="bg-on-secondary-container/10 px-3 py-1 rounded-full text-[10px] font-bold">ORGANIC</span>
            </div>
          </div>
          <div className="absolute -right-4 -bottom-4 w-32 h-32 bg-white/10 rounded-full blur-3xl"></div>
        </div>

        <div className="md:col-span-12 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-bold tracking-tight font-headline">Recent Journeys</h3>
            <button className="text-primary font-bold text-sm flex items-center gap-1">
              View All
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-surface-container-low hover:bg-surface-container transition-colors p-6 rounded-xl flex items-center gap-5">
              <div className="w-14 h-14 bg-surface-container-highest rounded-xl flex items-center justify-center">
                <span className="material-symbols-outlined text-primary text-2xl">local_mall</span>
              </div>
              <div className="flex-grow">
                <h4 className="font-bold text-on-surface font-headline">Trader Joe's</h4>
                <p className="text-on-surface-variant text-sm">Aug 12 • 8 Items</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-on-surface font-headline">$42.30</p>
                <span className="text-[10px] bg-tertiary-container/20 text-tertiary font-bold px-2 py-0.5 rounded-full uppercase">Budget Alert</span>
              </div>
            </div>

            <div className="bg-surface-container-low hover:bg-surface-container transition-colors p-6 rounded-xl flex items-center gap-5">
              <div className="w-14 h-14 bg-surface-container-highest rounded-xl flex items-center justify-center">
                <span className="material-symbols-outlined text-primary text-2xl">egg</span>
              </div>
              <div className="flex-grow">
                <h4 className="font-bold text-on-surface font-headline">Farmer's Market</h4>
                <p className="text-on-surface-variant text-sm">Aug 10 • 5 Items</p>
              </div>
              <div className="text-right text-on-surface">
                <p className="font-bold font-headline">$28.00</p>
                <p className="text-[10px] font-bold uppercase opacity-40 tracking-widest">SAVED $4</p>
              </div>
            </div>

            <div className="bg-surface-container-low hover:bg-surface-container transition-colors p-6 rounded-xl flex items-center gap-5">
              <div className="w-14 h-14 bg-surface-container-highest rounded-xl flex items-center justify-center">
                <span className="material-symbols-outlined text-primary text-2xl">local_shipping</span>
              </div>
              <div className="flex-grow">
                <h4 className="font-bold text-on-surface font-headline">Safeway Delivery</h4>
                <p className="text-on-surface-variant text-sm">Aug 08 • 24 Items</p>
              </div>
              <div className="text-right text-on-surface">
                <p className="font-bold font-headline">$156.12</p>
                <p className="text-[10px] font-bold uppercase opacity-40 tracking-widest">RECURRING</p>
              </div>
            </div>

            <div className="bg-surface-container-low hover:bg-surface-container transition-colors p-6 rounded-xl flex items-center gap-5">
              <div className="w-14 h-14 bg-surface-container-highest rounded-xl flex items-center justify-center">
                <span className="material-symbols-outlined text-primary text-2xl">bakery_dining</span>
              </div>
              <div className="flex-grow">
                <h4 className="font-bold text-on-surface font-headline">Artisan Bakery</h4>
                <p className="text-on-surface-variant text-sm">Aug 05 • 2 Items</p>
              </div>
              <div className="text-right text-on-surface">
                <p className="font-bold font-headline">$12.50</p>
                <p className="text-[10px] font-bold uppercase opacity-40 tracking-widest">TREAT</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
