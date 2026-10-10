"use client";

import Link from "next/link";
import { ArrowRight, ChevronRight, Layers, Factory, ShieldCheck, Truck, Sparkles } from "lucide-react";

interface SubItem {
  id: string;
  name: string;
  image: string;
  badge: string;
  link: string;
}

interface CategoryGroup {
  id: string;
  title: string;
  subtitle: string;
  bgImage: string;
  categoryLink: string;
  stat1: string;
  stat2: string;
  statLinkText: string;
  statLink: string;
  items: SubItem[];
}

const CATEGORY_GROUPS: CategoryGroup[] = [
  {
    id: "technical-tapes",
    title: "Technical & High-Temp Tapes",
    subtitle: "Dielectric Polyimide, Kapton & SMT Masking",
    bgImage: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80",
    categoryLink: "/catalog?cat=high-temp-smt",
    stat1: "2,400+ Vetted Converters, ASTM D3330 Verified",
    stat2: "Class H (260°C) Insulation & Clean Peel Silicones",
    statLinkText: "View High-Temp Catalog",
    statLink: "/catalog?cat=high-temp-smt",
    items: [
      {
        id: "polyimide",
        name: "Polyimide SMT Tape",
        image: "/images/products/polyimide-tape.jpg",
        badge: "260°C Kapton",
        link: "/products/polyimide-smt-tape"
      },
      {
        id: "esd-tape",
        name: "ESD Anti-Static Tape",
        image: "/images/products/polyimide-tape.jpg",
        badge: "<50V Low Charge",
        link: "/products/esd-dissipative-tape"
      },
      {
        id: "glass-cloth",
        name: "Fiberglass Cloth Tape",
        image: "/images/products/fiberglass-tape.jpg",
        badge: "Class H 200°C",
        link: "/products/glass-cloth-tape"
      },
      {
        id: "copper-foil",
        name: "Copper Foil EMI Tape",
        image: "/images/products/copper-foil-tape.jpg",
        badge: "Conductive Foil",
        link: "/products/copper-foil-emi"
      },
      {
        id: "green-masking",
        name: "Powder Coating Tape",
        image: "/images/products/green-masking-tape.jpg",
        badge: "220°C Bake",
        link: "/products/green-masking-tape"
      },
      {
        id: "amber-splicing",
        name: "Silicone Splicing Tape",
        image: "/images/products/polyimide-tape.jpg",
        badge: "25µm Ultra-Thin",
        link: "/products/silicone-splicing-tape"
      }
    ]
  },
  {
    id: "structural-bonding",
    title: "Structural & Double-Sided Tapes",
    subtitle: "Viscoelastic Acrylic Foam VHB & Clear PET",
    bgImage: "https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=600&q=80",
    categoryLink: "/catalog?cat=structural-vhb",
    stat1: "Replaces Rivets, Screws & Mechanical Fasteners",
    stat2: "Automotive IATF 16949 & Solar Module Tested",
    statLinkText: "View Structural Foam",
    statLink: "/catalog?cat=structural-vhb",
    items: [
      {
        id: "vhb-foam",
        name: "Acrylic Foam VHB 1.0mm",
        image: "/images/products/vhb-foam-tape.jpg",
        badge: "Solid Core VHB",
        link: "/products/acrylic-foam-vhb"
      },
      {
        id: "vhb-thin",
        name: "Thin Acrylic Foam 0.5mm",
        image: "/images/products/vhb-foam-tape.jpg",
        badge: "0.5mm High Shear",
        link: "/products/thin-acrylic-foam"
      },
      {
        id: "vhb-clear",
        name: "Optical Clear Bonding",
        image: "/images/products/vhb-foam-tape.jpg",
        badge: "Transparent 4910",
        link: "/products/clear-acrylic-tape"
      },
      {
        id: "automotive-black",
        name: "Automotive Black Foam",
        image: "/images/products/wire-harness-tape.jpg",
        badge: "Trim & Emblems",
        link: "/products/automotive-black-foam"
      },
      {
        id: "pet-double-sided",
        name: "Clear PET Double-Sided",
        image: "/images/products/crepe-masking-tape.jpg",
        badge: "Tesa 4965 Type",
        link: "/products/double-sided-pet"
      },
      {
        id: "filament-tape",
        name: "Reinforced Strapping",
        image: "/images/products/fiberglass-tape.jpg",
        badge: "Glass Filament",
        link: "/products/reinforced-strapping"
      }
    ]
  },
  {
    id: "electrical-thermal",
    title: "Electrical & Thermal Management",
    subtitle: "Transformer Dielectrics, Wire Harness & TIM Pads",
    bgImage: "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&w=600&q=80",
    categoryLink: "/catalog?cat=electrical-machinery",
    stat1: "CPRI Tested Transformer & Motor Insulation",
    stat2: "EV Battery Pack Thermal Protection Aligned",
    statLinkText: "View Electrical Catalog",
    statLink: "/catalog?cat=electrical-machinery",
    items: [
      {
        id: "mica-tape",
        name: "Mica Glass Cloth Tape",
        image: "/images/products/fiberglass-tape.jpg",
        badge: "18 kV/mm CPRI",
        link: "/products/mica-glass-tape"
      },
      {
        id: "wire-harness",
        name: "Wire Harness Fleece Tape",
        image: "/images/products/wire-harness-tape.jpg",
        badge: "Noise Dampening",
        link: "/products/wire-harness-tape"
      },
      {
        id: "pvc-blue",
        name: "PVC Electrical Tape (Blue)",
        image: "/images/products/electrical-pvc-tape.jpg",
        badge: "IS 7809 FR Vinyl",
        link: "/products/pvc-electrical-blue"
      },
      {
        id: "pvc-black",
        name: "PVC Electrical Tape (Black)",
        image: "/images/products/electrical-pvc-tape.jpg",
        badge: "Flame Retardant",
        link: "/products/pvc-electrical-black"
      },
      {
        id: "tim-pad",
        name: "Thermal Silicone Gap Pad",
        image: "/images/products/copper-foil-tape.jpg",
        badge: "6.0 W/m-K TIM",
        link: "/products/thermal-gap-pads"
      },
      {
        id: "aluminum-foil",
        name: "Aluminum Foil Tape",
        image: "/images/products/copper-foil-tape.jpg",
        badge: "Dead Soft HVAC",
        link: "/products/aluminum-foil-tape"
      }
    ]
  }
];

export default function CategoriesWeServe() {
  return (
    <section className="py-12 sm:py-16 bg-[#F5F5F7] border-y border-slate-200">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Section Heading with Italic Gradient Shimmer */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
              <span className="italic bg-gradient-to-r from-[#0B4FDF] via-blue-600 to-indigo-600 bg-clip-text text-transparent mr-2 font-black">
                Categories
              </span>
              We Serve
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1.5 font-sans">
              Precision engineered technical tapes, structural acrylic foam, and electrical dielectrics manufactured across India&apos;s leading converter hubs.
            </p>
          </div>
          <Link
            href="/catalog"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0B4FDF] hover:text-blue-700 transition-colors uppercase tracking-wider self-start sm:self-auto"
          >
            <span>View Full Industrial Catalog</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Group Cards Stack */}
        <div className="space-y-6">
          {CATEGORY_GROUPS.map((group) => (
            <div
              key={group.id}
              className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs hover:shadow-xl hover:border-[#0B4FDF]/40 transition-all duration-300 grid grid-cols-1 lg:grid-cols-12"
            >
              {/* Left Category Banner (3 cols on lg) */}
              <Link
                href={group.categoryLink}
                className="lg:col-span-3 relative p-6 flex flex-col justify-between overflow-hidden group min-h-[160px] lg:min-h-full"
              >
                {/* Background Image with Electric Cobalt Brand Overlay */}
                <div 
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                  style={{ backgroundImage: `url('${group.bgImage}')` }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0B4FDF]/95 via-[#0B4FDF]/80 to-blue-900/60 lg:bg-gradient-to-r lg:from-[#0B4FDF]/95 lg:to-blue-800/80" />

                {/* Content Overlay */}
                <div className="relative z-10 space-y-1">
                  <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight group-hover:text-blue-200 transition-colors">
                    {group.title}
                  </h3>
                  <p className="text-xs text-blue-100 font-sans">
                    {group.subtitle}
                  </p>
                </div>

                {/* Arrow Circle Badge */}
                <div className="relative z-10 self-end mt-4">
                  <div className="w-8 h-8 rounded-full bg-white/20 group-hover:bg-[#FF5500] flex items-center justify-center text-white transition-all shadow-md group-hover:scale-110">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </Link>

              {/* Right Content Area (9 cols on lg) */}
              <div className="lg:col-span-9 p-5 sm:p-6 flex flex-col justify-between space-y-5 bg-white">
                {/* 6-Item Genuine Tape Product Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
                  {group.items.map((item) => (
                    <Link
                      key={item.id}
                      href={item.link}
                      className="group/item flex flex-col items-center text-center space-y-2 cursor-pointer"
                    >
                      <div className="w-full aspect-[4/3] rounded-xl overflow-hidden bg-white border border-slate-200 relative shadow-2xs group-hover/item:border-[#0B4FDF] transition-colors">
                        <img 
                          src={item.image} 
                          alt={item.name}
                          className="w-full h-full object-cover group-hover/item:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute top-1.5 left-1.5 bg-white/95 backdrop-blur-xs px-1.5 py-0.5 rounded text-[9px] font-mono font-bold text-slate-800 border border-slate-200 shadow-2xs">
                          {item.badge}
                        </div>
                      </div>
                      <span className="text-[11px] sm:text-xs font-bold text-slate-800 group-hover/item:text-[#0B4FDF] transition-colors line-clamp-2 leading-tight">
                        {item.name}
                      </span>
                    </Link>
                  ))}
                </div>

                {/* Bottom Stats & Trust Strip */}
                <div className="p-3 sm:px-4 sm:py-2.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs">
                  <div className="flex flex-wrap items-center gap-4 text-slate-600 text-[11px]">
                    <div className="flex items-center gap-1.5 font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#0B4FDF]" />
                      <span>{group.stat1}</span>
                    </div>
                    <div className="hidden md:flex items-center gap-1.5 font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                      <span>{group.stat2}</span>
                    </div>
                  </div>

                  <Link
                    href={group.statLink}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-[#0B4FDF] hover:text-blue-700 transition-colors whitespace-nowrap self-end sm:self-auto group/link"
                  >
                    <span>{group.statLinkText}</span>
                    <ChevronRight className="w-3.5 h-3.5 group-hover/link:translate-x-0.5 transition-transform" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
