/**
 * TarasAI White-Label Technical Datasheet (TDS) & Certificate of Conformance (CoC) Engine
 */

export interface TarasTDSData {
  documentId: string;
  sku: string;
  productName: string;
  productDescription: string;
  category: string;
  issueDate: string;
  revision: string;
  properties: Array<{
    testProperty: string;
    testMethod: string;
    typicalValue: string;
    unit: string;
  }>;
  storageAndHandling: {
    shelfLife: string;
    storageTemp: string;
    surfacePrep: string;
    applicationPressure: string;
  };
  complianceStatements: string[];
  authorizedSignatory: {
    name: string;
    title: string;
    company: string;
    sealText: string;
  };
}

export function generateTarasTDS(skuOrName: string): TarasTDSData {
  const currentDate = new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
  
  if (skuOrName.includes("5413") || skuOrName.toLowerCase().includes("polyimide") || skuOrName.toLowerCase().includes("kapton")) {
    return {
      documentId: "TDS-TARAS-PI-5413-REV4",
      sku: "TARAS-PI-5413",
      productName: "TarasAI ThermoShield High-Dielectric Polyimide Film Tape (260°C)",
      productDescription: "TarasAI ThermoShield PI-5413 is a high-grade 25-micron polyimide film backed with a specially formulated crosslinked silicone pressure-sensitive adhesive. Engineered for SMT wave solder masking, PCB gold finger protection, and high-voltage motor/transformer coil wrapping.",
      category: "High-Heat Dielectric Insulation & Masking",
      issueDate: currentDate,
      revision: "Revision 4.2 (2026)",
      properties: [
        { testProperty: "Backing / Carrier Substrate", testMethod: "Internal", typicalValue: "25 µm (1.0 mil) Pure Polyimide", unit: "µm" },
        { testProperty: "Adhesive System", testMethod: "Internal", typicalValue: "High-Temperature Silicone", unit: "Chemistry" },
        { testProperty: "Total Caliper / Thickness", testMethod: "ASTM D3652", typicalValue: "0.065 ± 0.003 (2.6 mil)", unit: "mm" },
        { testProperty: "180° Peel Adhesion to Stainless Steel", testMethod: "ASTM D3330", typicalValue: "6.5 ± 0.5", unit: "N / 25mm" },
        { testProperty: "Tensile Strength at Break", testMethod: "ASTM D3759", typicalValue: "125 ± 10", unit: "N / 25mm" },
        { testProperty: "Elongation at Break", testMethod: "ASTM D3759", typicalValue: "65", unit: "%" },
        { testProperty: "Dielectric Breakdown Voltage", testMethod: "ASTM D149", typicalValue: "6,800", unit: "Volts (6.8 kV)" },
        { testProperty: "Insulation Resistance", testMethod: "ASTM D257", typicalValue: "> 1 x 10^6", unit: "Mega-Ohms" },
        { testProperty: "Continuous Operating Temperature", testMethod: "UL 746B", typicalValue: "-73 to +260", unit: "°C" },
        { testProperty: "Peak Short-Term Temperature (30 min)", testMethod: "Internal", typicalValue: "+300", unit: "°C" },
        { testProperty: "Flammability Rating", testMethod: "UL 94", typicalValue: "V-0 (Self-Extinguishing)", unit: "Classification" }
      ],
      storageAndHandling: {
        shelfLife: "24 Months from manufacturing date when stored in original carton packaging.",
        storageTemp: "21°C (70°F) and 50% Relative Humidity. Keep away from direct sunlight.",
        surfacePrep: "Clean application surface with 50/50 Isopropanol (IPA) and water mixture. Ensure surface is oil-free and dry.",
        applicationPressure: "Apply minimum 15 psi (100 kPa) roller pressure to achieve 100% wet-out."
      },
      complianceStatements: [
        "RoHS Directive 2011/65/EU and Amendment (EU) 2015/863 Compliant (Lead, Cadmium, Mercury Free)",
        "REACH Regulation (EC) No 1907/2006 Substances of Very High Concern (SVHC) Free",
        "Halogen-Free according to IEC 61249-2-21 standard",
        "UL 94 V-0 Flammability Standard Certified"
      ],
      authorizedSignatory: {
        name: "Dr. A. Verma, Ph.D. (Polymer Engineering)",
        title: "Head of Materials Standards & Quality Assurance",
        company: "TarasAI Materials Intelligence Consortium",
        sealText: "TARASAI VERIFIED QUALITY SEAL • DIRECT FACTORY CONFORMANCE"
      }
    };
  }

  // Default: Viscoelastic Acrylic Foam VAF-1000
  return {
    documentId: "TDS-TARAS-VAF-1000-REV3",
    sku: "TARAS-VAF-1000",
    productName: "TarasAI Ultra-Bond Viscoelastic Acrylic Foam Tape (1.0 mm)",
    productDescription: "TarasAI Ultra-Bond VAF-1000 is an engineered 1.0 mm thick high-performance viscoelastic solid acrylic foam tape with modified pure acrylic adhesive on both sides. Formulated to replace mechanical fasteners (screws, rivets, welds) in high-stress automotive body panels, EV battery casings, and architectural curtain walls.",
    category: "High-Strength Structural Bonding & Vibration Damping",
    issueDate: currentDate,
    revision: "Revision 3.8 (2026)",
    properties: [
      { testProperty: "Core Substrate Material", testMethod: "Internal", typicalValue: "100% Solid Closed-Cell Viscoelastic Acrylic", unit: "Polymer" },
      { testProperty: "Adhesive Chemistry (Both Sides)", testMethod: "Internal", typicalValue: "Crosslinked High-Shear Pure Acrylic", unit: "Chemistry" },
      { testProperty: "Total Thickness", testMethod: "ASTM D3652", typicalValue: "1.00 ± 0.05", unit: "mm" },
      { testProperty: "Density", testMethod: "ASTM D3574", typicalValue: "800 ± 50", unit: "kg / m³" },
      { testProperty: "180° Peel Adhesion to Stainless Steel (72h)", testMethod: "ASTM D3330", typicalValue: "28 ± 2", unit: "N / 25mm" },
      { testProperty: "Dynamic Tensile Adhesion (T-Block)", testMethod: "ASTM D897", typicalValue: "1.25", unit: "MPa (180 psi)" },
      { testProperty: "Static Shear Resistance (1000g @ 80°C)", testMethod: "ASTM D3654", typicalValue: "> 10,000 (No slippage)", unit: "Minutes" },
      { testProperty: "Dielectric Breakdown Strength", testMethod: "ASTM D149", typicalValue: "25", unit: "kV / mm" },
      { testProperty: "Continuous Operating Temperature", testMethod: "Internal", typicalValue: "-40 to +150", unit: "°C" },
      { testProperty: "Short-Term Temperature Tolerance", testMethod: "Internal", typicalValue: "+200 (4 Hours)", unit: "°C" },
      { testProperty: "UV & Plasticizer Resistance", testMethod: "ASTM G154", typicalValue: "Excellent (Zero Degradation)", unit: "Rating" }
    ],
    storageAndHandling: {
      shelfLife: "24 Months from date of dispatch in unopened original packaging.",
      storageTemp: "Store between 15°C and 25°C at 50% relative humidity.",
      surfacePrep: "Surfaces must be unified, clean, and dry. Wipe with a 50:50 IPA/water solution. For powder-coated metals, use TarasAI AP-100 adhesion promoter.",
      applicationPressure: "Firm application pressure produces better adhesive contact. Recommended pressure: 15 psi (100 kPa)."
    },
    complianceStatements: [
      "IATF 16949 Automotive Manufacturing Standard Aligned",
      "RoHS 3 (EU Directive 2015/863) & REACH SVHC Compliant",
      "UL 94 V-2 Flammability Rated",
      "Zero Solvent Outgassing (Low-VOC Interior Automotive Approved)"
    ],
    authorizedSignatory: {
      name: "Dr. A. Verma, Ph.D. (Polymer Engineering)",
      title: "Head of Materials Standards & Quality Assurance",
      company: "TarasAI Materials Intelligence Consortium",
      sealText: "TARASAI VERIFIED QUALITY SEAL • DIRECT FACTORY CONFORMANCE"
    }
  };
}
