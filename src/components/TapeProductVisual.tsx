"use client";

interface TapeProductVisualProps {
  type: 
    | "polyimide" 
    | "vhb-red" 
    | "vhb-clear"
    | "vhb-black"
    | "green-masking" 
    | "copper-foil" 
    | "glass-cloth" 
    | "cloth-fleece" 
    | "pvc-blue" 
    | "pvc-black" 
    | "tim-pad" 
    | "aluminum-foil"
    | "pet-clear"
    | "filament";
  className?: string;
  badge?: string;
  coreText?: string;
}

export default function TapeProductVisual({
  type,
  className = "",
  badge,
  coreText = "33M CORE"
}: TapeProductVisualProps) {
  // Theme color definitions for each genuine tape roll type
  const configs: Record<string, {
    outerRing: string;
    innerGlow: string;
    coreBorder: string;
    coreBg: string;
    textColor: string;
    tapeLip: string;
    specBadge: string;
    specBadgeBg: string;
  }> = {
    polyimide: {
      outerRing: "from-amber-600 via-amber-500 to-yellow-500 border-amber-600/40 shadow-amber-500/20",
      innerGlow: "bg-amber-400/20",
      coreBorder: "border-amber-200",
      coreBg: "bg-amber-50/90",
      textColor: "text-amber-900",
      tapeLip: "bg-amber-500/90 border-amber-300",
      specBadge: "Class H (260°C) Kapton",
      specBadgeBg: "bg-amber-50 text-amber-800 border-amber-300"
    },
    "vhb-red": {
      outerRing: "from-red-600 via-rose-500 to-red-700 border-red-600/40 shadow-red-500/20",
      innerGlow: "bg-red-400/20",
      coreBorder: "border-slate-300",
      coreBg: "bg-white",
      textColor: "text-red-900",
      tapeLip: "bg-red-600 border-red-300",
      specBadge: "Viscoelastic 1.0mm VHB",
      specBadgeBg: "bg-red-50 text-red-800 border-red-300"
    },
    "vhb-clear": {
      outerRing: "from-slate-300 via-slate-100 to-slate-200 border-slate-300 shadow-slate-400/20",
      innerGlow: "bg-slate-300/30",
      coreBorder: "border-slate-300",
      coreBg: "bg-white",
      textColor: "text-slate-800",
      tapeLip: "bg-white/80 border-slate-400",
      specBadge: "Optical Solid Acrylic",
      specBadgeBg: "bg-slate-100 text-slate-800 border-slate-300"
    },
    "vhb-black": {
      outerRing: "from-slate-900 via-slate-800 to-slate-950 border-slate-700 shadow-slate-900/30",
      innerGlow: "bg-slate-700/20",
      coreBorder: "border-slate-400",
      coreBg: "bg-slate-100",
      textColor: "text-slate-900",
      tapeLip: "bg-slate-800 border-slate-600",
      specBadge: "High-Shear Automotive Foam",
      specBadgeBg: "bg-slate-100 text-slate-800 border-slate-300"
    },
    "green-masking": {
      outerRing: "from-emerald-600 via-green-500 to-emerald-700 border-emerald-600/40 shadow-emerald-500/20",
      innerGlow: "bg-emerald-400/20",
      coreBorder: "border-emerald-200",
      coreBg: "bg-emerald-50",
      textColor: "text-emerald-900",
      tapeLip: "bg-emerald-500 border-emerald-300",
      specBadge: "Powder Coat 220°C Bake",
      specBadgeBg: "bg-emerald-50 text-emerald-800 border-emerald-300"
    },
    "copper-foil": {
      outerRing: "from-[#B87333] via-orange-500 to-amber-700 border-orange-600/40 shadow-orange-500/20",
      innerGlow: "bg-orange-400/20",
      coreBorder: "border-orange-300",
      coreBg: "bg-orange-50",
      textColor: "text-orange-950",
      tapeLip: "bg-[#B87333] border-orange-300",
      specBadge: "Conductive EMI Foil",
      specBadgeBg: "bg-orange-50 text-orange-900 border-orange-300"
    },
    "glass-cloth": {
      outerRing: "from-stone-300 via-stone-200 to-stone-400 border-stone-400/40 shadow-stone-400/20",
      innerGlow: "bg-stone-200/40",
      coreBorder: "border-stone-300",
      coreBg: "bg-stone-50",
      textColor: "text-stone-800",
      tapeLip: "bg-stone-200 border-stone-400",
      specBadge: "Woven Fiber Class H",
      specBadgeBg: "bg-stone-100 text-stone-800 border-stone-300"
    },
    "cloth-fleece": {
      outerRing: "from-neutral-900 via-neutral-800 to-neutral-950 border-neutral-700 shadow-neutral-900/30",
      innerGlow: "bg-neutral-700/20",
      coreBorder: "border-neutral-400",
      coreBg: "bg-neutral-100",
      textColor: "text-neutral-900",
      tapeLip: "bg-neutral-800 border-neutral-600",
      specBadge: "Noise Dampening Fleece",
      specBadgeBg: "bg-neutral-100 text-neutral-800 border-neutral-300"
    },
    "pvc-blue": {
      outerRing: "from-blue-600 via-blue-500 to-indigo-600 border-blue-600/40 shadow-blue-500/20",
      innerGlow: "bg-blue-400/20",
      coreBorder: "border-blue-200",
      coreBg: "bg-blue-50",
      textColor: "text-blue-900",
      tapeLip: "bg-blue-500 border-blue-300",
      specBadge: "IS 7809 FR Electrical",
      specBadgeBg: "bg-blue-50 text-blue-800 border-blue-300"
    },
    "pvc-black": {
      outerRing: "from-slate-900 via-slate-800 to-slate-950 border-slate-700 shadow-slate-900/30",
      innerGlow: "bg-slate-700/20",
      coreBorder: "border-slate-300",
      coreBg: "bg-slate-100",
      textColor: "text-slate-900",
      tapeLip: "bg-slate-800 border-slate-600",
      specBadge: "FR Vinyl Electrical",
      specBadgeBg: "bg-slate-100 text-slate-800 border-slate-300"
    },
    "pet-clear": {
      outerRing: "from-red-600 via-rose-500 to-red-700 border-red-500/40 shadow-red-500/20",
      innerGlow: "bg-red-400/20",
      coreBorder: "border-slate-200",
      coreBg: "bg-white",
      textColor: "text-red-900",
      tapeLip: "bg-red-500 border-red-300",
      specBadge: "Double-Sided Red Liner",
      specBadgeBg: "bg-red-50 text-red-800 border-red-300"
    },
    "aluminum-foil": {
      outerRing: "from-slate-400 via-slate-300 to-slate-500 border-slate-400/40 shadow-slate-400/20",
      innerGlow: "bg-slate-300/30",
      coreBorder: "border-slate-300",
      coreBg: "bg-white",
      textColor: "text-slate-800",
      tapeLip: "bg-slate-300 border-slate-400",
      specBadge: "Dead-Soft Pure Aluminum",
      specBadgeBg: "bg-slate-100 text-slate-800 border-slate-300"
    },
    filament: {
      outerRing: "from-amber-200 via-yellow-100 to-stone-300 border-amber-300 shadow-amber-300/20",
      innerGlow: "bg-amber-100/40",
      coreBorder: "border-stone-300",
      coreBg: "bg-white",
      textColor: "text-stone-800",
      tapeLip: "bg-amber-100 border-stone-300",
      specBadge: "Cross-Filament Strapping",
      specBadgeBg: "bg-amber-50 text-amber-900 border-amber-300"
    },
    "tim-pad": {
      outerRing: "from-blue-400 via-cyan-400 to-teal-500 border-blue-400/40 shadow-blue-400/20",
      innerGlow: "bg-blue-300/30",
      coreBorder: "border-blue-200",
      coreBg: "bg-blue-50",
      textColor: "text-blue-900",
      tapeLip: "bg-cyan-400 border-cyan-200",
      specBadge: "6.0 W/m-K Thermal Pad",
      specBadgeBg: "bg-cyan-50 text-cyan-900 border-cyan-300"
    }
  };

  const cfg = configs[type] || configs.polyimide;

  // Render a thermal pad if requested
  if (type === "tim-pad") {
    return (
      <div className={`relative aspect-[4/3] rounded-xl overflow-hidden bg-gradient-to-br from-slate-50 to-blue-50/60 border border-slate-200 flex items-center justify-center p-4 group ${className}`}>
        {/* Soft Grid Background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#0B4FDF08_1px,transparent_1px),linear-gradient(to_bottom,#0B4FDF08_1px,transparent_1px)] bg-[size:16px_16px]" />
        
        {/* Pad Geometry Stack */}
        <div className="relative z-10 w-28 h-24 rounded-lg bg-gradient-to-tr from-cyan-400 via-blue-400 to-teal-400 shadow-xl shadow-cyan-500/20 border-2 border-white/80 p-2 flex flex-col justify-between group-hover:scale-105 transition-transform duration-300">
          <div className="grid grid-cols-3 gap-1">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-2 rounded bg-white/40" />
            ))}
          </div>
          <div className="text-center">
            <span className="text-[9px] font-mono font-black text-blue-950 uppercase tracking-wider bg-white/90 px-1.5 py-0.5 rounded shadow-2xs">
              6.0 W/m-K
            </span>
          </div>
        </div>

        {/* Technical Spec Badge */}
        <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between z-10">
          <span className={`text-[10px] font-mono px-2 py-0.5 rounded border font-bold ${cfg.specBadgeBg}`}>
            {badge || cfg.specBadge}
          </span>
        </div>
      </div>
    );
  }

  // Render authentic industrial tape roll
  return (
    <div className={`relative aspect-[4/3] rounded-xl overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100/70 border border-slate-200 flex items-center justify-center p-4 group ${className}`}>
      {/* Background Radial Tint */}
      <div className="absolute inset-0 bg-radial from-white via-transparent to-slate-100/40" />

      {/* Industrial Tape Roll Geometric Construction */}
      <div className="relative z-10 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
        
        {/* Outer Tape Winding Body */}
        <div className={`w-28 h-28 sm:w-32 sm:h-32 rounded-full p-2.5 bg-gradient-to-tr ${cfg.outerRing} shadow-xl border-4 relative flex items-center justify-center`}>
          
          {/* Subtle Concentric Layer Rings */}
          <div className="absolute inset-1 rounded-full border border-white/20 pointer-events-none" />
          <div className="absolute inset-2 rounded-full border border-black/10 pointer-events-none" />
          
          {/* Peeling Tape Edge Lip */}
          <div className={`absolute -top-1 -right-1 w-6 h-4 rounded-tr-md ${cfg.tapeLip} shadow-md border-t transform rotate-12`} />

          {/* Inner Core Tube (Rigid Plastic / High-Impact ABS Core) */}
          <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full border-4 ${cfg.coreBorder} ${cfg.coreBg} shadow-inner flex flex-col items-center justify-center p-1 text-center`}>
            <span className={`text-[8px] sm:text-[9px] font-mono font-black ${cfg.textColor} tracking-tight leading-none`}>
              {coreText}
            </span>
            <span className="text-[7px] font-sans font-bold text-slate-500 uppercase mt-0.5">
              TarasAI
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Specification Badge */}
      <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between z-10">
        <span className={`text-[10px] font-mono px-2 py-0.5 rounded border font-bold truncate max-w-[85%] ${cfg.specBadgeBg}`}>
          {badge || cfg.specBadge}
        </span>
        <span className="text-[9px] font-mono font-bold text-slate-500 bg-white/80 px-1 py-0.5 rounded border border-slate-200">
          ROLL
        </span>
      </div>
    </div>
  );
}
