import React from 'react';

export function Cart() {
  return (
    <div className="max-w-3xl mx-auto px-4 pt-24 pb-32">
      <header className="mb-10">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 bg-surface-container-lowest p-6 rounded-xl flex flex-col items-start shadow-sm transition-all border border-outline-variant/10">
            <span className="text-xs font-semibold uppercase tracking-widest text-on-surface-variant mb-1 font-label">Articles</span>
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-extrabold text-primary tracking-tighter font-headline">12</span>
              <span className="text-on-surface-variant font-medium text-sm">items in cart</span>
            </div>
          </div>
          <div className="flex-1 bg-surface-container-lowest p-6 rounded-xl flex flex-col items-start shadow-sm border border-outline-variant/10">
            <span className="text-xs font-semibold uppercase tracking-widest text-on-surface-variant mb-1 font-label">Total Spend</span>
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-extrabold text-secondary tracking-tighter font-headline">$42.85</span>
              <span className="text-on-surface-variant font-medium text-sm">estimated</span>
            </div>
          </div>
        </div>
      </header>

      <section className="mb-12">
        <h2 className="text-sm font-bold uppercase tracking-widest text-on-surface-variant mb-4 px-2 font-label">Add New Item</h2>
        <div className="bg-surface-container p-6 rounded-xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-on-surface px-1 font-label">Item Name</label>
              <input className="w-full bg-surface-container-highest border-none rounded-lg px-4 py-3 focus:ring-2 focus:ring-secondary text-on-surface placeholder-on-surface-variant/50 outline-none" placeholder="e.g. Organic Avocados" type="text" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-on-surface px-1 font-label">Entry Mode</label>
              <div className="flex bg-surface-container-highest p-1 rounded-lg">
                <button className="flex-1 py-2 text-sm font-semibold rounded-md bg-surface-container-lowest text-primary shadow-sm">Quantity</button>
                <button className="flex-1 py-2 text-sm font-semibold text-on-surface-variant">Weight (g)</button>
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-on-surface px-1 font-label">Price per kg</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm">$</span>
                <input className="w-full bg-surface-container-highest border-none rounded-lg pl-8 pr-4 py-3 focus:ring-2 focus:ring-secondary text-on-surface outline-none" placeholder="0.00" step="0.01" type="number" />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-on-surface px-1 font-label">Grams</label>
              <input className="w-full bg-surface-container-highest border-none rounded-lg px-4 py-3 focus:ring-2 focus:ring-secondary text-on-surface outline-none" placeholder="0" type="number" />
            </div>
          </div>
          <button className="w-full mt-6 py-4 primary-gradient text-on-primary font-bold rounded-xl flex items-center justify-center gap-2 hover:opacity-90 transition-opacity">
            <span className="material-symbols-outlined">add</span>
            Add to Basket
          </button>
        </div>
      </section>

      <section className="mb-24">
        <h2 className="text-sm font-bold uppercase tracking-widest text-on-surface-variant mb-6 px-2 font-label">Current Basket</h2>
        <div className="space-y-4">
          <div className="group bg-surface-container-lowest p-5 rounded-xl flex items-center gap-4 transition-all hover:translate-x-1 border border-transparent hover:border-outline-variant/30">
            <div className="w-14 h-14 rounded-lg bg-surface-container flex items-center justify-center text-primary overflow-hidden">
              <img alt="Tomatoes" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuA8QLfgGv86MTEJtupwqtd7UL32V1oo00T3yxkzNqbVgZA21USyb2_sFkIAiSfrmEUachfg1E83b8icL5JZBCzUHDudC8nl5GRKiTwDwnyhnErQE4Pka99NA0kkodp_Gb3LteDhKiwfIpDmY4kRrYB6vN9_EdUMgIvK0IXlnwI9bEe86QXT8RBhFBrVLo4a_uGdsQccryZuRoY8CUBgwwQQvG-cy5SorzrMPf1P7JXc1rvdVmwguITsvQxk8kzEsCkIqLOfmxo" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-on-surface text-lg truncate">Vine-ripened Tomatoes</h3>
              <p className="text-sm text-on-surface-variant font-medium">2 units × $1.50/ea</p>
            </div>
            <div className="text-right">
              <span className="block text-xl font-extrabold text-on-surface font-headline">$3.00</span>
              <div className="flex items-center gap-2 mt-1">
                <button className="w-6 h-6 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant hover:bg-secondary-container transition-colors">
                  <span className="material-symbols-outlined text-sm">remove</span>
                </button>
                <span className="text-sm font-bold px-1">2</span>
                <button className="w-6 h-6 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant hover:bg-secondary-container transition-colors">
                  <span className="material-symbols-outlined text-sm">add</span>
                </button>
              </div>
            </div>
          </div>

          <div className="group bg-surface-container-lowest p-5 rounded-xl flex items-center gap-4 transition-all hover:translate-x-1 border border-transparent hover:border-outline-variant/30">
            <div className="w-14 h-14 rounded-lg bg-surface-container flex items-center justify-center text-primary overflow-hidden">
              <img alt="Avocado" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCsXuc5UjULXTJnp7jwSl75hB-K6bec4ehBy5kyAeocCZvsQ-GLxfspMW8EqpaiShEjxssj2FaJvxa0rGVjY7fjXfjXEbuGI35PXxpn_d3eRjXCrGirwGul3xFwPHBv3PZM32W6F7DzP2TYZF9ymDQk4pn6inSSvIVCmM10oW4mn758K6Pz96zkQtntf9cUbnn8IaZo8rRt2mY7XuRaEXaseNTMDe4vbYR7Dfz3gIMHut1RcVpLvAbMjLV7jCAHkXkBRWveYjw" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-on-surface text-lg truncate">Haas Avocado</h3>
                <span className="px-2 py-0.5 bg-tertiary-container/20 text-tertiary text-[10px] font-bold uppercase rounded-full tracking-wider">On Sale</span>
              </div>
              <p className="text-sm text-on-surface-variant font-medium">850g × $4.20/kg</p>
            </div>
            <div className="text-right">
              <span className="block text-xl font-extrabold text-on-surface font-headline">$3.57</span>
              <button className="mt-1 text-on-surface-variant/40 hover:text-error transition-colors">
                <span className="material-symbols-outlined">delete</span>
              </button>
            </div>
          </div>

          <div className="group bg-surface-container-lowest p-5 rounded-xl flex items-center gap-4 transition-all hover:translate-x-1 border border-transparent hover:border-outline-variant/30">
            <div className="w-14 h-14 rounded-lg bg-surface-container flex items-center justify-center text-primary overflow-hidden">
              <img alt="Milk" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuD5M619BjUd9CVECBVPNNr4AH8Ec2_xHXBWLYrey6krthLOiUMdUKHLBlupChtp6iD2XoMAc80RN3aXt0XPcDhgUhlOMDpqxF-VPtcHBFo_o7Fwkuwx14IOqGaiXeUigRAfXPMxCDIrGqTyUYVbkhgJnrxa-vUxojbvXoD8LMdMuYGHBGTuYnseDGV4hN1Znmpl9bUcRMLbCQKYdqRZOphpFVEePJmB4KVGQwd9my_vFhZXTUOt7KdMe2zs-9ywEo-58006HVU" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-on-surface text-lg truncate">Whole Milk 1L</h3>
              <p className="text-sm text-on-surface-variant font-medium">1 unit × $2.10/ea</p>
            </div>
            <div className="text-right">
              <span className="block text-xl font-extrabold text-on-surface font-headline">$2.10</span>
              <div className="flex items-center gap-2 mt-1">
                <button className="w-6 h-6 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant hover:bg-secondary-container transition-colors">
                  <span className="material-symbols-outlined text-sm">remove</span>
                </button>
                <span className="text-sm font-bold px-1">1</span>
                <button className="w-6 h-6 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant hover:bg-secondary-container transition-colors">
                  <span className="material-symbols-outlined text-sm">add</span>
                </button>
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-dashed border-outline-variant/50">
            <div className="flex justify-between items-center px-4">
              <span className="text-on-surface-variant font-semibold">Subtotal (3 items)</span>
              <span className="text-lg font-bold text-on-surface">$8.67</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
