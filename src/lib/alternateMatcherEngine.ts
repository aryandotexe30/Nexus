/**
 * TarasAI Alternate Matcher & Parametric Reasoning Engine
 * Maps competitor/imported part numbers (3M, Nitto, Tesa, Kapton, Bergquist, Loctite, Nomex, DuPont)
 * to TarasAI Private-Label domestic manufacturing specifications.
 */

export interface TarasAlternateMatch {
  tarasSku: string;
  tarasName: string;
  category: string;
  competitorBrand: string;
  competitorPartNumber: string;
  compatibilityScore: number; // e.g. 98.5%
  costSavingsPercent: number; // e.g. 34%
  substrate: string;
  adhesiveSystem: string;
  totalThickness: string;
  operatingTemp: string;
  peelAdhesion: string;
  tensileStrength: string;
  dielectricBreakdown: string;
  thermalConductivity?: string;
  flammabilityRating: string;
  certifications: string[];
  standardSizes: string[];
  moq: string;
  estimatedTarasPrice: string;
  estimatedCompetitorPrice: string;
  domesticPlantDispatchTime: string;
  technicalSummary: string;
}

// Master Index of Pre-Calibrated TarasAI Drop-in Equivalents
export const TARAS_ALTERNATE_DATABASE: TarasAlternateMatch[] = [
  // 1. Viscoelastic Acrylic Foam Tapes (VHB Alternatives)
  {
    tarasSku: "TARAS-VAF-1000",
    tarasName: "TarasAI Ultra-Bond Viscoelastic Acrylic Foam Tape (1.0 mm)",
    category: "High-Strength Structural Bonding",
    competitorBrand: "3M",
    competitorPartNumber: "3M 4910 / 4950 VHB Series",
    compatibilityScore: 99.2,
    costSavingsPercent: 36,
    substrate: "Closed-Cell Viscoelastic Solid Acrylic Core",
    adhesiveSystem: "High-Shear Modified Pure Acrylic",
    totalThickness: "1.0 mm (1000 µm) ± 0.05 mm",
    operatingTemp: "-40°C to 150°C (Short term 200°C)",
    peelAdhesion: "28 N / 25mm (ASTM D3330 to SS)",
    tensileStrength: "1.25 MPa Dynamic Tensile",
    dielectricBreakdown: "25 kV / mm (High Electrical Isolation)",
    flammabilityRating: "UL 94 V-2 Compliant",
    certifications: ["IATF 16949 Aligned", "RoHS 3 (2015/863)", "REACH SVHC", "ISO 9001:2015"],
    standardSizes: ["12mm x 33m", "19mm x 33m", "24mm x 33m", "48mm x 33m", "Custom Rotary Die-Cut"],
    moq: "24 Rolls or 1 Master Log Roll",
    estimatedTarasPrice: "₹420 / roll ($5.05)",
    estimatedCompetitorPrice: "₹660 / roll ($7.95)",
    domesticPlantDispatchTime: "24-48 Hours from Gujarat / Pune Plant",
    technicalSummary: "100% solid viscoelastic acrylic core absorbs dynamic shear, thermal contraction differences, and dampens mechanical vibration. Direct drop-in replacement for 3M 4910 and Tesa 4965 in automotive body panels and architectural facades."
  },
  {
    tarasSku: "TARAS-VAF-0500",
    tarasName: "TarasAI Ultra-Bond Thin Acrylic Foam Tape (0.5 mm)",
    category: "High-Strength Structural Bonding",
    competitorBrand: "3M",
    competitorPartNumber: "3M 4920 / 4930 VHB",
    compatibilityScore: 98.8,
    costSavingsPercent: 32,
    substrate: "Closed-Cell Viscoelastic Acrylic Core",
    adhesiveSystem: "High-Cohesion Pure Acrylic",
    totalThickness: "0.5 mm (500 µm)",
    operatingTemp: "-40°C to 140°C",
    peelAdhesion: "24 N / 25mm",
    tensileStrength: "1.4 MPa",
    dielectricBreakdown: "22 kV / mm",
    flammabilityRating: "UL 94 HB",
    certifications: ["RoHS", "REACH", "ISO 9001"],
    standardSizes: ["12mm x 33m", "19mm x 33m", "25mm x 33m", "Custom Die-Cut"],
    moq: "30 Rolls",
    estimatedTarasPrice: "₹310 / roll ($3.75)",
    estimatedCompetitorPrice: "₹460 / roll ($5.55)",
    domesticPlantDispatchTime: "24-48 Hours",
    technicalSummary: "Thin-gauge high-strength acrylic foam for electronic enclosures, bezel mounting, and metal nameplates."
  },

  // 2. High-Temperature Polyimide Films (Kapton Alternatives)
  {
    tarasSku: "TARAS-PI-5413",
    tarasName: "TarasAI ThermoShield High-Dielectric Polyimide Film Tape",
    category: "High-Heat Dielectric & SMT Masking",
    competitorBrand: "DuPont / 3M",
    competitorPartNumber: "Kapton 5413 / K104 / K500",
    compatibilityScore: 99.6,
    costSavingsPercent: 42,
    substrate: "25 µm (1.0 mil) Pure Polyimide Film (HN-Type Equivalent)",
    adhesiveSystem: "High-Performance Cross-Linked Silicone Adhesive",
    totalThickness: "0.065 mm (65 µm) ± 0.003 mm",
    operatingTemp: "-73°C to 260°C (Intermittent to 300°C)",
    peelAdhesion: "6.5 N / 25mm (Clean Peel Zero Residue)",
    tensileStrength: "120 N / 25mm (High Elongation)",
    dielectricBreakdown: "6.8 kV Breakdown Voltage (ASTM D149)",
    flammabilityRating: "UL 94 V-0 Self-Extinguishing",
    certifications: ["UL 94 V-0 Listed", "RoHS 3 Compliant", "REACH Compliant", "Halogen Free"],
    standardSizes: ["6mm x 33m", "12mm x 33m", "19mm x 33m", "24mm x 33m", "50mm x 33m", "500mm Log Rolls"],
    moq: "50 Rolls or Custom Width Slitting",
    estimatedTarasPrice: "₹185 / roll ($2.22)",
    estimatedCompetitorPrice: "₹320 / roll ($3.85)",
    domesticPlantDispatchTime: "Same Day Dispatch",
    technicalSummary: "High-purity polyimide film coated with heat-resistant silicone adhesive. Leaves zero residue after wave soldering, hot air leveling (HASL), and powder coating cure ovens. Direct replacement for 3M 5413 and DuPont Kapton."
  },
  {
    tarasSku: "TARAS-PI-ESD",
    tarasName: "TarasAI Anti-Static Cleanroom Polyimide Tape (ESD Shielded)",
    category: "ESD Cleanroom & Semiconductor Masking",
    competitorBrand: "3M / Nitto",
    competitorPartNumber: "3M 5419 / Nitto P-221 ESD",
    compatibilityScore: 98.9,
    costSavingsPercent: 44,
    substrate: "Anti-Static Treated Polyimide Film (Surface Resistivity 10^6 - 10^9 Ω/sq)",
    adhesiveSystem: "Low-Static Acrylic / Silicone Matrix (< 50 Volts unwinding)",
    totalThickness: "0.065 mm (65 µm)",
    operatingTemp: "-40°C to 260°C",
    peelAdhesion: "6.0 N / 25mm",
    tensileStrength: "115 N / 25mm",
    dielectricBreakdown: "7.0 kV",
    flammabilityRating: "UL 94 V-0",
    certifications: ["ANSI/ESD S20.20", "ISO Class 6 Cleanroom Compatible", "RoHS", "REACH"],
    standardSizes: ["12mm x 33m", "19mm x 33m", "24mm x 33m", "Custom Discs"],
    moq: "25 Rolls",
    estimatedTarasPrice: "₹240 / roll ($2.88)",
    estimatedCompetitorPrice: "₹430 / roll ($5.18)",
    domesticPlantDispatchTime: "24 Hours",
    technicalSummary: "Zero triboelectric charging during unwind and peel. Prevents ESD damage to sensitive CMOS ICs, semiconductor wafers, and dense PCB components."
  },

  // 3. EV Battery & Microelectronics Thermal Interface Materials (TIM Gap Pads)
  {
    tarasSku: "TARAS-TIM-6000",
    tarasName: "TarasAI Ultra-Therm High-Conductivity Silicone Gap Filler Pad (6.0 W/m-K)",
    category: "EV Battery & Inverter Thermal Management",
    competitorBrand: "Henkel Bergquist / 3M",
    competitorPartNumber: "Bergquist Gap Pad 5000S35 / 3M 5590H",
    compatibilityScore: 99.4,
    costSavingsPercent: 38,
    substrate: "Ceramic-Filled Highly Compressible Silicone Elastomer",
    adhesiveSystem: "Naturally Tacky / Fiberglass Carrier Option",
    totalThickness: "0.5 mm to 5.0 mm (Available in 0.5mm increments)",
    operatingTemp: "-60°C to 200°C",
    peelAdhesion: "Naturally Tacky Surface (Non-Adhesive Release)",
    tensileStrength: "0.4 MPa (High Conformability)",
    dielectricBreakdown: "> 10 kV / mm",
    thermalConductivity: "6.0 W/m-K (ASTM D5470)",
    flammabilityRating: "UL 94 V-0 Certified",
    certifications: ["IATF 16949 Aligned", "UL 94 V-0", "RoHS 3", "REACH SVHC", "Low Outgassing ASTM E595"],
    standardSizes: ["200mm x 400mm Sheets", "300mm x 300mm Sheets", "Custom Kiss-Cut Pads"],
    moq: "50 Sheets or 5,000 Kiss-Cut Pads",
    estimatedTarasPrice: "₹1,450 / sheet ($17.40)",
    estimatedCompetitorPrice: "₹2,350 / sheet ($28.20)",
    domesticPlantDispatchTime: "48 Hours",
    technicalSummary: "Fills microscopic air gaps between EV prismatic/cylindrical cell modules and liquid cooling cold plates. Delivers ultra-low thermal resistance under low assembly pressure."
  },
  {
    tarasSku: "TARAS-TIM-3000",
    tarasName: "TarasAI Ultra-Therm Standard Thermal Interface Pad (3.2 W/m-K)",
    category: "Power Supply & LED Heat Dissipation",
    competitorBrand: "Laird / 3M",
    competitorPartNumber: "Laird Tflex 600 / 3M 5519",
    compatibilityScore: 98.7,
    costSavingsPercent: 35,
    substrate: "Thermally Conductive Silicone Polymer",
    adhesiveSystem: "Single / Double Sided Inherent Tack",
    totalThickness: "1.0 mm to 3.0 mm",
    operatingTemp: "-40°C to 180°C",
    peelAdhesion: "Tacky",
    tensileStrength: "0.3 MPa",
    dielectricBreakdown: "8 kV / mm",
    thermalConductivity: "3.2 W/m-K",
    flammabilityRating: "UL 94 V-0",
    certifications: ["RoHS", "REACH", "UL 94 V-0"],
    standardSizes: ["200mm x 200mm", "Custom Shapes"],
    moq: "50 Sheets",
    estimatedTarasPrice: "₹680 / sheet ($8.15)",
    estimatedCompetitorPrice: "₹1,050 / sheet ($12.60)",
    domesticPlantDispatchTime: "24 Hours",
    technicalSummary: "Cost-effective thermal gap pad for telecom hardware, LED drivers, SMPS power supplies, and industrial motor drives."
  },

  // 4. Power & Transformer High-Voltage Dielectrics (Nomex & Mica Alternates)
  {
    tarasSku: "TARAS-MICA-800",
    tarasName: "TarasAI ElectraShield High-Voltage Mica Glass Cloth Tape",
    category: "Transformer, Motor & Generator Insulation",
    competitorBrand: "DuPont / Von Roll",
    competitorPartNumber: "Von Roll Samicapor / DuPont Nomex Mica",
    compatibilityScore: 99.1,
    costSavingsPercent: 30,
    substrate: "Phlogopite / Muscovite Mica Paper bonded to Electrical Glass Cloth",
    adhesiveSystem: "High-Temperature Epoxy / B-Stage Resin Compatible",
    totalThickness: "0.14 mm (140 µm) ± 0.01 mm",
    operatingTemp: "Class H (180°C) to Class C (220°C+)",
    peelAdhesion: "Resin Impregnation Compatible",
    tensileStrength: "180 N / cm (High Machine Winding Tension)",
    dielectricBreakdown: "18 kV / mm (ASTM D149)",
    flammabilityRating: "IEC 60331 Fire Resistant (950°C 3 Hours)",
    certifications: ["CPRI Tested & Approved", "IS 13357 / IEC 60371", "RoHS", "REACH"],
    standardSizes: ["20mm x 50m", "25mm x 50m", "30mm x 50m", "1000mm Master Rolls"],
    moq: "100 Rolls or 500 Meters",
    estimatedTarasPrice: "₹540 / roll ($6.50)",
    estimatedCompetitorPrice: "₹780 / roll ($9.40)",
    domesticPlantDispatchTime: "Direct Manufacturer Plant Dispatch (48h)",
    technicalSummary: "High-voltage coil wrapping and busbar insulation for distribution transformers, traction motors, and wind turbine generators. Tested by CPRI for zero void discharge."
  },
  {
    tarasSku: "TARAS-CRGO-027",
    tarasName: "TarasAI CoreMax Prime 0.27mm CRGO Electrical Steel Laminations",
    category: "Electrical Transformer Core Material",
    competitorBrand: "Nippon Steel / JFE / POSCO",
    competitorPartNumber: "27ZDKH90 / 27M4 / 27ZH100",
    compatibilityScore: 99.5,
    costSavingsPercent: 24,
    substrate: "Cold-Rolled Grain-Oriented Silicon Steel (Hi-B Grade)",
    adhesiveSystem: "Inorganic Carlite Phosphate Insulation Coating (C-5 Class)",
    totalThickness: "0.27 mm ± 0.02 mm",
    operatingTemp: "Continuous 150°C",
    peelAdhesion: "N/A (Interlaminar Resistance > 100 Ω-cm²)",
    tensileStrength: "340 MPa Yield Strength",
    dielectricBreakdown: "Interlayer Insulation Class 5",
    flammabilityRating: "Non-Flammable Metallic",
    certifications: ["BIS IS 3024 / IEC 60404-8-7", "CPRI Core Loss Verified", "BEE Star Label Ready"],
    standardSizes: ["Cut-to-Length Toroidal / Step-Lap Mitred Cores / Slit Coils (50mm to 1000mm)"],
    moq: "5 Metric Tonnes",
    estimatedTarasPrice: "₹245,000 / MT ($2,940)",
    estimatedCompetitorPrice: "₹320,000 / MT ($3,840)",
    domesticPlantDispatchTime: "CNC Mitred Slit within 5 Days",
    technicalSummary: "Ultra-low watt-loss CRGO transformer core laminations engineered for BEE 5-Star distribution transformers and power grid step-up transformers up to 765 kV."
  },

  // 5. Industrial Masking & Double-Sided Film Tapes
  {
    tarasSku: "TARAS-DS-4965",
    tarasName: "TarasAI Ultra-Hold Clear Polyester Double-Sided Tape",
    category: "Precision Plastic & Rubber Extrusion Mounting",
    competitorBrand: "Tesa / 3M",
    competitorPartNumber: "Tesa 4965 / 3M 9080A / 3M 9495LE",
    compatibilityScore: 99.0,
    costSavingsPercent: 38,
    substrate: "12 µm Transparent Polyester (PET) Carrier Film",
    adhesiveSystem: "Modified Tackified High-Temperature Acrylic (Both Sides)",
    totalThickness: "0.205 mm (205 µm) with Red MOPP Release Liner",
    operatingTemp: "-40°C to 160°C (Short term 200°C)",
    peelAdhesion: "22 N / 25mm to Stainless Steel; 18 N / 25mm to ABS",
    tensileStrength: "40 N / 25mm",
    dielectricBreakdown: "5.0 kV",
    flammabilityRating: "UL 94 HB",
    certifications: ["RoHS 3", "REACH", "ISO 9001"],
    standardSizes: ["9mm x 50m", "12mm x 50m", "19mm x 50m", "24mm x 50m", "50mm x 50m", "1240mm Log Rolls"],
    moq: "50 Rolls or 1 Master Log",
    estimatedTarasPrice: "₹165 / roll ($1.98)",
    estimatedCompetitorPrice: "₹270 / roll ($3.25)",
    domesticPlantDispatchTime: "Same Day Dispatch",
    technicalSummary: "High tack and immediate shear strength on metals, ABS, polycarbonate, and rubber trims. High resistance to plasticizers and outdoor humidity. Direct equivalent to Tesa 4965."
  },
  {
    tarasSku: "TARAS-MASK-220",
    tarasName: "TarasAI DuraMask Green High-Temp Powder Coating Masking Tape",
    category: "Powder Coating, Anodizing & E-Coat Masking",
    competitorBrand: "3M / Tesa",
    competitorPartNumber: "3M 8992 / Tesa 50600",
    compatibilityScore: 98.9,
    costSavingsPercent: 40,
    substrate: "50 µm (2.0 mil) High-Tensile Green Polyester Film",
    adhesiveSystem: "Pressure-Sensitive Crosslinked Silicone Adhesive",
    totalThickness: "0.085 mm (85 µm)",
    operatingTemp: "-50°C to 220°C (30 min bake cycles)",
    peelAdhesion: "8.5 N / 25mm (Clean One-Piece Removal Zero Tear)",
    tensileStrength: "110 N / 25mm",
    dielectricBreakdown: "6.0 kV",
    flammabilityRating: "Self-Extinguishing",
    certifications: ["RoHS 3", "REACH SVHC", "ISO 9001"],
    standardSizes: ["12mm x 66m", "25mm x 66m", "50mm x 66m", "Custom Slit / Discs"],
    moq: "36 Rolls",
    estimatedTarasPrice: "₹210 / roll ($2.52)",
    estimatedCompetitorPrice: "₹350 / roll ($4.20)",
    domesticPlantDispatchTime: "24 Hours",
    technicalSummary: "Withstands aggressive sandblasting, chemical anodizing baths, and 220°C powder coating curing ovens. Removes cleanly in one piece without slivering or adhesive residue."
  }
];

/**
 * Searches the TarasAI Private-Label Alternate Database
 * Supports brand name, part number, or generic parameter matching.
 */
export function findTarasAlternate(query: string): TarasAlternateMatch[] {
  const q = query.trim().toLowerCase();
  if (!q) return TARAS_ALTERNATE_DATABASE.slice(0, 4);

  return TARAS_ALTERNATE_DATABASE.filter(item => {
    return (
      item.competitorPartNumber.toLowerCase().includes(q) ||
      item.competitorBrand.toLowerCase().includes(q) ||
      item.tarasSku.toLowerCase().includes(q) ||
      item.tarasName.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q) ||
      item.substrate.toLowerCase().includes(q) ||
      item.adhesiveSystem.toLowerCase().includes(q) ||
      item.technicalSummary.toLowerCase().includes(q)
    );
  });
}
