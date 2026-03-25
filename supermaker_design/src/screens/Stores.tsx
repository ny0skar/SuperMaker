import React from 'react';

export function Stores() {
  return (
    <div className="max-w-5xl mx-auto px-6 pt-24 pb-32">
      <section className="mb-12">
        <h2 className="text-5xl font-extrabold tracking-tighter text-on-surface mb-2 font-headline">Where are you<br/>shopping today?</h2>
        <p className="text-on-surface-variant text-lg max-w-md">Select a store to start your new purchase ledger and track your items.</p>
      </section>

      <section className="mb-12">
        <div className="relative group">
          <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none">
            <span className="material-symbols-outlined text-outline">search</span>
          </div>
          <input className="w-full bg-surface-container-highest border-none rounded-xl py-5 pl-16 pr-6 text-on-surface placeholder:text-outline focus:ring-2 focus:ring-secondary transition-all text-lg outline-none" placeholder="Search for a store (Walmart, Target...)" type="text" />
        </div>
      </section>

      <section className="mb-16">
        <div className="flex items-end justify-between mb-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-outline mb-1 block font-label">Quick Start</span>
            <h3 className="text-2xl font-bold font-headline">Frequently Visited</h3>
          </div>
          <button className="text-primary font-semibold flex items-center gap-1 hover:underline">
            View all
            <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2 group relative overflow-hidden rounded-xl bg-surface-container-lowest p-8 shadow-sm hover:shadow-md transition-shadow cursor-pointer flex flex-col justify-between min-h-[240px]">
            <div className="absolute top-0 right-0 p-8">
              <span className="material-symbols-outlined text-4xl text-primary opacity-20 group-hover:opacity-40 transition-opacity">storefront</span>
            </div>
            <div>
              <span className="inline-block px-3 py-1 rounded-full bg-secondary-container text-on-secondary-container text-xs font-bold mb-4">MOST VISITED</span>
              <h4 className="text-3xl font-bold text-on-surface font-headline">Whole Foods Market</h4>
              <p className="text-on-surface-variant mt-2">2.4 miles away • Last visited yesterday</p>
            </div>
            <div className="flex gap-2 mt-6">
              <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
              <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
              <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
              <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
            </div>
          </div>

          <div className="rounded-xl bg-surface-container-low p-6 flex flex-col justify-between hover:bg-surface-container-high transition-colors cursor-pointer border border-outline-variant/10">
            <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-secondary">shopping_basket</span>
            </div>
            <div>
              <h4 className="text-xl font-bold text-on-surface font-headline">Trader Joe's</h4>
              <p className="text-on-surface-variant text-sm">4.1 miles away</p>
            </div>
          </div>

          <div className="rounded-xl bg-surface-container-lowest p-6 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow cursor-pointer border border-outline-variant/5">
            <div className="w-12 h-12 rounded-full bg-tertiary-container/20 flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-tertiary">local_mall</span>
            </div>
            <div>
              <h4 className="text-xl font-bold text-on-surface font-headline">Walmart</h4>
              <p className="text-on-surface-variant text-sm">0.8 miles away</p>
            </div>
          </div>

          <div className="rounded-xl bg-surface-container-low p-6 flex flex-col justify-between hover:bg-surface-container-high transition-colors cursor-pointer border border-outline-variant/10">
            <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-primary">bakery_dining</span>
            </div>
            <div>
              <h4 className="text-xl font-bold text-on-surface font-headline">Target</h4>
              <p className="text-on-surface-variant text-sm">3.2 miles away</p>
            </div>
          </div>

          <div className="rounded-xl border-2 border-dashed border-outline-variant p-6 flex flex-col items-center justify-center text-center hover:bg-surface-container transition-colors cursor-pointer">
            <div className="w-12 h-12 rounded-full bg-surface-container-highest flex items-center justify-center mb-3">
              <span className="material-symbols-outlined text-on-surface-variant">add</span>
            </div>
            <span className="font-bold text-on-surface">Add New Store</span>
          </div>
        </div>
      </section>

      <section className="mb-12 relative rounded-3xl overflow-hidden h-64 shadow-xl">
        <img alt="Map view of nearby stores" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAwnupUkTM7HzE6Nt2e9xCiyHUgvDKnlXyiXWEr8m3CqX4mhdewYupCG5lgoOCuEnMYlNHfT17DhpUShrSrjbF8QEYdSUwOE74iv_qaO9ch3SeVhBWT5SKlmg8L_T6w6M8mBsd8yURUBN36xrrB43FSXbBZCB_i3suiYnmQDBK4Lrc7oY8CY_3iiBB_lRejbyKrUsx2AVmmlvombtQX2fldOs7J4Ot_JXudYxPO4QGh7ZK_NNeHYMQie4bWwS5OZ67mFU_3nlg" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-8">
          <div className="flex items-center justify-between w-full">
            <div>
              <h4 className="text-white text-xl font-bold font-headline">Nearby Locations</h4>
              <p className="text-white/80 text-sm">8 stores found in your current area</p>
            </div>
            <button className="bg-white text-on-surface px-6 py-2 rounded-full font-bold text-sm hover:bg-surface-bright transition-colors">
              Open Map
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
