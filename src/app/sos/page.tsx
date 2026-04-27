import { GuestSosForm } from "@/features/incidents/components/guest-sos-form";

export default function SosPage() {
  return (
    <main className="relative min-h-screen w-full flex flex-col items-center justify-center overflow-hidden">
      {/* Background with Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-1000 scale-105"
        style={{ backgroundImage: "url('/sos-bg.png')" }}
      />
      <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]" />
      
      {/* Decorative Glows */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-accent/20 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px]" />

      <div className="relative z-10 w-full max-w-4xl mx-auto px-6 py-12">
        <GuestSosForm />
      </div>

      {/* Footer Hint */}
      <div className="relative z-10 pb-8 text-white/30 text-sm font-medium tracking-widest uppercase">
        Secure Emergency Link • Respondr
      </div>
    </main>
  );
}

