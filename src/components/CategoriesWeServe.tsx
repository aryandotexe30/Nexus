"use client";

import Link from "next/link";
import { ArrowRight, ChevronRight, Layers, Factory, ShieldCheck, Truck, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

interface SubItem {
  id: string;
  name: string;
  image: string;
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
    title: "Technical Tapes",
    subtitle: "Pressure-Sensitive & High-Temp Dielectrics",
    bgImage: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80",
    categoryLink: "/products?category=Technical+Tapes",
    stat1: "2,400+ Vetted Converters, 12 Primary Resin Brands",
    stat2: "18 Slitting & Coating Hubs, ASTM D3330 Verified",
    statLinkText: "View Converting Hubs",
    statLink: "/products?category=Technical+Tapes",
    items: [
      {
        id: "polyimide",
        name: "Polyimide SMT Tape",
        image: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=260&q=80",
        link: "/products/polyimide-smt-tape"
      },
      {
        id: "vhb-foam",
        name: "Acrylic Foam VHB",
        image: "https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=260&q=80",
        link: "/products/acrylic-foam-vhb"
      },
      {
        id: "pet-tape",
        name: "Polyester PET Tape",
        image: "https://images.unsplash.com/photo-1563770660941-20978e870e26?auto=format&fit=crop&w=260&q=80",
        link: "/products/pet-polyester-tape"
      },
      {
        id: "filament",
        name: "Fiberglass Tape",
        image: "https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?auto=format&fit=crop&w=260&q=80",
        link: "/products/fiberglass-tape"
      },
      {
        id: "copper-foil",
        name: "Copper Foil EMI",
        image: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=260&q=80",
        link: "/products/copper-foil-emi"
      },
      {
        id: "cloth-tape",
        name: "Wire Harness Tape",
        image: "https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&w=260&q=80",
        link: "/products/wire-harness-tape"
      }
    ]
  },
  {
    id: "thermal-materials",
    title: "Thermal Management",
    subtitle: "EV Battery Barriers & Heat Dissipation",
    bgImage: "https://images.unsplash.com/photo-1558441719-8b449c6ff673?auto=format&fit=crop&w=600&q=80",
    categoryLink: "/products?category=Thermal+Management",
    stat1: "380+ Automotive Tier-1 OEMs Contracted",
    stat2: "IATF 16949 & UL 94 V-0 Certified Cleanrooms",
    statLinkText: "View EV Solutions",
    statLink: "/products?category=Thermal+Management",
    items: [
      {
        id: "gap-filler",
        name: "Thermal Gap Pads",
        image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=260&q=80",
        link: "/products/thermal-gap-pads"
      },
      {
        id: "graphite",
        name: "Graphite Sheets",
        image: "https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=260&q=80",
        link: "/products/graphite-sheets"
      },
      {
        id: "aerogel",
        name: "Aerogel Blankets",
        image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=260&q=80",
        link: "/products/aerogel-blankets"
      },
      {
        id: "phase-change",
        name: "Phase Change TIM",
        image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=260&q=80",
        link: "/products/phase-change-tim"
      },
      {
        id: "die-cut-gaskets",
        name: "Die-Cut Cell Seals",
        image: "https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?auto=format&fit=crop&w=260&q=80",
        link: "/products/die-cut-cell-seals"
      },
      {
        id: "mica-sheet",
        name: "Mica Barrier 1000°C",
        image: "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=260&q=80",
        link: "/products/mica-barrier"
      }
    ]
  },
  {
    id: "chemical-resins",
    title: "Polymers & Resins",
    subtitle: "Chemical Precursors & Bulk Monomers",
    bgImage: "https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?auto=format&fit=crop&w=600&q=80",
    categoryLink: "/products?category=Polymers+and+Resins",
    stat1: "85,000 MT Annual Bulk Chemical Throughput",
    stat2: "Direct Alliances with Momentive, Dow, Reliance & Henkel",
    statLinkText: "View Chemical Hubs",
    statLink: "/products?category=Polymers+and+Resins",
    items: [
      {
        id: "silicone-psa",
        name: "Silicone PSA Resin",
        image: "https://images.unsplash.com/photo-1603555501671-8f96b3fce8e4?auto=format&fit=crop&w=260&q=80",
        link: "/products/silicone-psa-resin"
      },
      {
        id: "acrylic-monomer",
        name: "Acrylic Monomer",
        image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=260&q=80",
        link: "/products/acrylic-monomer"
      },
      {
        id: "fluorosilicone",
        name: "Release Emulsion",
        image: "https://images.unsplash.com/photo-1527661591475-527312dd65f5?auto=format&fit=crop&w=260&q=80",
        link: "/products/release-emulsion"
      },
      {
        id: "primers",
        name: "Adhesion Primers",
        image: "https://images.unsplash.com/photo-1581092795360-fd1ca04f0952?auto=format&fit=crop&w=260&q=80",
        link: "/products/adhesion-primers"
      },
      {
        id: "release-liners",
        name: "Differential Liners",
        image: "https://images.unsplash.com/photo-1581092162384-8987c1d64718?auto=format&fit=crop&w=260&q=80",
        link: "/products/differential-liners"
      },
      {
        id: "abs-cores",
        name: "ABS Slitting Cores",
        image: "https://images.unsplash.com/photo-1581092582845-9856f6c26880?auto=format&fit=crop&w=260&q=80",
        link: "/products/abs-slitting-cores"
      }
    ]
  }
];

export default function CategoriesWeServe() {
  return (
    <section className="py-12 sm:py-16 bg-slate-900/60 border-y border-slate-800">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Section Heading with Italic Gradient Shimmer */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white">
              <span className="italic bg-gradient-to-r from-blue-400 via-cyan-400 to-indigo-400 bg-clip-text text-transparent mr-2 font-black">
                Categories
              </span>
              We Serve
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1.5 font-sans">
              Explore raw materials, precision converting clusters, and finished OEM contracts across India&apos;s key industrial corridors.
            </p>
          </div>
          <Link
            href="/products"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-400 hover:text-blue-300 transition-colors uppercase tracking-wider self-start sm:self-auto"
          >
            <span>View Full Directory</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Group Cards Stack */}
        <div className="space-y-6">
          {CATEGORY_GROUPS.map((group) => (
            <div
              key={group.id}
              className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg hover:border-slate-700 transition-all duration-300 grid grid-cols-1 lg:grid-cols-12"
            >
              {/* Left Category Banner (3 cols on lg) */}
              <Link
                href={group.categoryLink}
                className="lg:col-span-3 relative p-6 flex flex-col justify-between overflow-hidden group min-h-[160px] lg:min-h-full"
              >
                {/* Background Image with Dark Scrim Gradient */}
                <div 
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                  style={{ backgroundImage: `url('${group.bgImage}')` }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/70 to-slate-950/50 lg:bg-gradient-to-r lg:from-slate-950/80 lg:to-slate-950/95" />

                {/* Content Overlay */}
                <div className="relative z-10 space-y-1">
                  <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight group-hover:text-blue-400 transition-colors">
                    {group.title}
                  </h3>
                  <p className="text-xs text-slate-300 font-sans">
                    {group.subtitle}
                  </p>
                </div>

                {/* Arrow Circle Badge */}
                <div className="relative z-10 self-end mt-4">
                  <div className="w-8 h-8 rounded-full bg-white/10 group-hover:bg-blue-600 flex items-center justify-center text-white transition-all shadow-md group-hover:scale-110">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </Link>

              {/* Right Content Area (9 cols on lg) */}
              <div className="lg:col-span-9 p-5 sm:p-6 flex flex-col justify-between space-y-5 bg-slate-950/40">
                {/* 6-Item Thumbnail Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
                  {group.items.map((item) => (
                    <Link
                      key={item.id}
                      href={item.link}
                      className="group/item flex flex-col items-center text-center space-y-2 cursor-pointer"
                    >
                      <div className="w-full aspect-[4/3] rounded-xl overflow-hidden bg-slate-900 border border-slate-800 relative shadow-sm group-hover/item:border-blue-500/50 transition-colors">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover group-hover/item:scale-110 transition-transform duration-300"
                        />
                      </div>
                      <span className="text-[11px] sm:text-xs font-semibold text-slate-300 group-hover/item:text-blue-400 transition-colors line-clamp-2 leading-tight">
                        {item.name}
                      </span>
                    </Link>
                  ))}
                </div>

                {/* Bottom Stats & Trust Strip */}
                <div className="p-3 sm:px-4 sm:py-2.5 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs">
                  <div className="flex flex-wrap items-center gap-4 text-slate-400 text-[11px]">
                    <div className="flex items-center gap-1.5 font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                      <span>{group.stat1}</span>
                    </div>
                    <div className="hidden md:flex items-center gap-1.5 font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      <span>{group.stat2}</span>
                    </div>
                  </div>

                  <Link
                    href={group.statLink}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-400 hover:text-blue-300 transition-colors whitespace-nowrap self-end sm:self-auto group/link"
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
