import type { Dictionary } from "@/dictionaries/en";

export default function Location({ dict }: { dict: Dictionary }) {
  return (
    <section id="contact" className="py-24 relative border-t border-white/5">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-12">
          <div className="flex-1 space-y-6">
            <h2 className="text-3xl md:text-5xl font-bold">{dict.contact.title}</h2>
            <p className="text-xl text-muted">{dict.contact.address}</p>
            <a 
              href="https://maps.app.goo.gl/HUPNMth1qHDbCF6H8" 
              target="_blank" 
              rel="noreferrer"
              className="inline-flex items-center gap-2 text-accent border-b border-accent pb-1 hover:text-white hover:border-white transition-colors uppercase tracking-widest text-sm"
            >
              {dict.contact.mapLabel}
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M7 17l9.2-9.2M17 17V7H7"/>
              </svg>
            </a>
          </div>
          <div className="flex-1 w-full h-[400px] bg-paper-strong border border-white/10 rounded-2xl overflow-hidden relative group">
             <a href="https://maps.app.goo.gl/HUPNMth1qHDbCF6H8" target="_blank" rel="noreferrer" className="absolute inset-0 flex flex-col items-center justify-center bg-black/20 group-hover:bg-black/60 transition-all z-10 duration-500">
                <div className="w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-500">
                   <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                     <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/>
                   </svg>
                </div>
                <span className="px-6 py-3 bg-accent text-background font-bold uppercase tracking-wider rounded-full transform scale-95 opacity-0 group-hover:scale-100 group-hover:opacity-100 transition-all duration-300">Open Map</span>
             </a>
             <div className="absolute inset-0 opacity-10 bg-[linear-gradient(rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:20px_20px]"></div>
          </div>
        </div>
      </div>
    </section>
  );
}
