/**
 * TarasAI Materials Application Reasoning Engine
 * Deterministic, multi-turn B2B technical engineering expert system for industrial adhesives & tapes.
 */

export interface EngineeringResponse {
  type: 'recommendation' | 'inquiry';
  text: string;
  options: string[];
  recommendations: any[];
}

interface ParsedQueryCriteria {
  categoryCode?: string;
  colorCode?: string;
  adhCode?: string;
  thickMicrons?: number;
  tempRating?: number;
  applicationTerms: string[];
  isRfq: boolean;
  isSample: boolean;
  isSlitting: boolean;
  isCompare: boolean;
  isTechnicalInquiry: boolean;
  isSpecificProductChosen: boolean;
}

/**
 * Parses user input and context to extract all engineering variables
 */
function parseUserCriteria(latestText: string, allUserText: string): ParsedQueryCriteria {
  const latest = latestText.toLowerCase();
  const all = (allUserText + ' ' + latest).toLowerCase();

  // Intent classification
  const isRfq = 
    latest.includes('rfq') || 
    latest.includes('quote') || 
    latest.includes('quotation') || 
    latest.includes('price') || 
    latest.includes('cost') || 
    latest.includes('how much') || 
    latest.includes('bulk') || 
    latest.includes('volume') || 
    latest.includes('order') || 
    latest.includes('moq') || 
    latest.includes('rolls') || 
    latest.includes('purchase') || 
    latest.includes('buy') || 
    latest.includes('rate');

  const isSample = 
    latest.includes('sample') || 
    latest.includes('test roll') || 
    latest.includes('trial') || 
    latest.includes('testing') || 
    latest.includes('1 roll') || 
    latest.includes('evaluation');

  const isSlitting = 
    latest.includes('slit') || 
    latest.includes('slitting') || 
    latest.includes('width') || 
    latest.includes('custom roll') || 
    latest.includes('die cut') || 
    latest.includes('die-cut') || 
    latest.includes('kiss cut') || 
    latest.includes('log roll') || 
    latest.includes('discs') || 
    latest.includes('12mm') || 
    latest.includes('19mm') || 
    latest.includes('24mm') || 
    latest.includes('25mm') || 
    latest.includes('48mm');

  const isCompare = 
    latest.includes('compare') || 
    latest.includes('difference') || 
    latest.includes('versus') || 
    latest.includes('vs') || 
    latest.includes('alternative') || 
    latest.includes('which is better');

  const isTechnicalInquiry = 
    latest.includes('temperature') || 
    latest.includes('temp') || 
    latest.includes('dielectric') || 
    latest.includes('peel') || 
    latest.includes('adhesion') || 
    latest.includes('tensile') || 
    latest.includes('thickness') || 
    latest.includes('datasheet') || 
    latest.includes('tds') || 
    latest.includes('specification') || 
    latest.includes('flame') || 
    latest.includes('ul94');

  // Category Detection
  let categoryCode: string | undefined;
  if (all.includes('kapton') || all.includes('polyimide') || all.includes('gold finger') || all.includes('wave solder') || all.includes('k104') || all.includes('5413')) {
    categoryCode = 'KAP';
  } else if (all.includes('vhb') || all.includes('acrylic foam') || all.includes('structural foam') || all.includes('4910') || all.includes('4950') || all.includes('5952') || all.includes('7055') || all.includes('7074') || all.includes('a7300') || all.includes('a7200')) {
    categoryCode = 'VHB';
  } else if (all.includes('pe foam') || all.includes('eva foam') || all.includes('ixpe') || all.includes('gasket foam')) {
    categoryCode = 'PEF';
  } else if (all.includes('masking') || all.includes('crepe') || all.includes('painter') || all.includes('washi') || all.includes('4334') || all.includes('2090') || all.includes('abro')) {
    categoryCode = 'MSK';
  } else if (all.includes('foil') || all.includes('aluminum') || all.includes('aluminium') || all.includes('copper') || all.includes('hvac duct') || all.includes('emi') || all.includes('shielding')) {
    categoryCode = all.includes('copper') ? 'COP' : 'ALU';
  } else if (all.includes('glass cloth') || all.includes('fiberglass') || all.includes('mica') || all.includes('transformer') || all.includes('g569') || all.includes('69 tape')) {
    categoryCode = all.includes('mica') ? 'MIC' : 'GLS';
  } else if (all.includes('ptfe') || all.includes('teflon') || all.includes('skived') || all.includes('heat seal')) {
    categoryCode = 'PTF';
  } else if (all.includes('pvc') || all.includes('wire harness') || all.includes('steelgrip') || all.includes('super 33')) {
    categoryCode = 'PVC';
  } else if (all.includes('tissue') || all.includes('transfer') || all.includes('468mp') || all.includes('467mp') || all.includes('9088') || all.includes('double sided') || all.includes('double-sided')) {
    categoryCode = all.includes('transfer') ? 'TRF' : (all.includes('foam') ? 'VHB' : 'DST');
  } else if (all.includes('filament') || all.includes('strapping') || all.includes('cross weave')) {
    categoryCode = 'FIL';
  }

  // Color Detection
  let colorCode: string | undefined;
  if (all.includes('clear') || all.includes('transparent') || all.includes('transparency') || all.includes('invisible') || all.includes('glass clear')) {
    colorCode = 'CLR';
  } else if (all.includes('black') || all.includes('dark black') || all.includes('matte black') || all.includes('anthracite')) {
    colorCode = 'BLK';
  } else if (all.includes('grey') || all.includes('gray') || all.includes('dark gray')) {
    colorCode = 'GRY';
  } else if (all.includes('white')) {
    colorCode = 'WHT';
  } else if (all.includes('amber') || all.includes('tawny') || all.includes('gold') || all.includes('brown')) {
    colorCode = 'AMB';
  } else if (all.includes('blue')) {
    colorCode = 'BLU';
  } else if (all.includes('green')) {
    colorCode = 'GRN';
  } else if (all.includes('red')) {
    colorCode = 'RED';
  } else if (all.includes('yellow')) {
    colorCode = 'YEL';
  }

  // Adhesive Chemistry Detection
  let adhCode: string | undefined;
  if (all.includes('silicone') || all.includes('polysiloxane')) {
    adhCode = 'SIL';
  } else if (all.includes('acrylic') || all.includes('pure acrylic') || all.includes('solvent acrylic')) {
    adhCode = 'ACR';
  } else if (all.includes('rubber') || all.includes('natural rubber') || all.includes('synthetic rubber')) {
    adhCode = 'RUB';
  } else if (all.includes('epoxy')) {
    adhCode = 'EPO';
  }

  // Thickness Detection
  let thickMicrons: number | undefined;
  const thickMatch = all.match(/(\d+(?:\.\d+)?)\s*(?:mm|µm|um|micron|mil)/i);
  if (thickMatch) {
    const val = parseFloat(thickMatch[1]);
    if (/µm|um|micron/i.test(thickMatch[0])) {
      thickMicrons = Math.round(val);
    } else if (/mil/i.test(thickMatch[0])) {
      thickMicrons = Math.round(val * 25.4);
    } else {
      thickMicrons = Math.round(val * 1000);
    }
  } else if (all.includes('0.05') || all.includes('50µm') || all.includes('2 mil')) {
    thickMicrons = 50;
  } else if (all.includes('0.07') || all.includes('70µm') || all.includes('3 mil')) {
    thickMicrons = 75;
  } else if (all.includes('0.10') || all.includes('100µm') || all.includes('4 mil')) {
    thickMicrons = 100;
  } else if (all.includes('1.0') || all.includes('1.1') || all.includes('1.1mm')) {
    thickMicrons = 1000;
  } else if (all.includes('0.5') || all.includes('0.5mm')) {
    thickMicrons = 500;
  } else if (all.includes('1.6') || all.includes('1.6mm')) {
    thickMicrons = 1500;
  }

  // Temperature Rating Detection
  let tempRating: number | undefined;
  const tempMatch = all.match(/(\d+)\s*°?c/i);
  if (tempMatch) {
    tempRating = parseInt(tempMatch[1], 10);
  } else if (all.includes('260') || all.includes('wave solder')) {
    tempRating = 260;
  } else if (all.includes('180') || all.includes('class h')) {
    tempRating = 180;
  } else if (all.includes('150') || all.includes('powder coating')) {
    tempRating = 150;
  } else if (all.includes('110') || all.includes('paint bake')) {
    tempRating = 110;
  } else if (all.includes('80')) {
    tempRating = 80;
  }

  // Application keywords
  const applicationTerms: string[] = [];
  ['pcb', 'solder', 'transformer', 'battery', 'powder coating', 'hvac', 'automotive', 'glazing', 'facade', 'emblem', 'mounting', 'clean removal', 'insulation'].forEach(t => {
    if (all.includes(t)) applicationTerms.push(t);
  });

  // Check if a specific product specification is established
  const isSpecificProductChosen = Boolean(
    categoryCode || colorCode || adhCode || thickMicrons || tempRating || applicationTerms.length > 0
  );

  return {
    categoryCode,
    colorCode,
    adhCode,
    thickMicrons,
    tempRating,
    applicationTerms,
    isRfq,
    isSample,
    isSlitting,
    isCompare,
    isTechnicalInquiry,
    isSpecificProductChosen
  };
}

/**
 * Searches and ranks clustered standards based on parsed criteria
 */
function findMatchingStandards(criteria: ParsedQueryCriteria, clusteredStandards: any[]): any[] {
  if (!clusteredStandards || clusteredStandards.length === 0) return [];

  const scored = clusteredStandards.map(std => {
    let score = 0;
    const serial = (std.serialCode || '').toUpperCase();
    const name = (std.name || '').toLowerCase();
    const specs = std.specs || {};
    const specsStr = JSON.stringify(specs).toLowerCase();

    // 1. Category match
    if (criteria.categoryCode) {
      if (serial.includes(criteria.categoryCode)) score += 80;
    }

    // 2. Color match
    if (criteria.colorCode) {
      if (serial.includes(`-${criteria.colorCode}-`)) score += 60;
      if (specs['Color / Appearance']?.toLowerCase().includes(criteria.colorCode.toLowerCase())) score += 40;
    }

    // 3. Adhesive match
    if (criteria.adhCode) {
      if (serial.includes(`-${criteria.adhCode}-`)) score += 40;
      if (specs['Adhesive type']?.toLowerCase().includes(criteria.adhCode.toLowerCase())) score += 30;
    }

    // 4. Thickness match
    if (criteria.thickMicrons) {
      const targetStr = String(criteria.thickMicrons).padStart(4, '0');
      if (serial.includes(`-${targetStr}-`)) score += 50;
      const thickMm = (criteria.thickMicrons / 1000).toFixed(2);
      if (name.includes(thickMm) || specsStr.includes(thickMm)) score += 30;
    }

    // 5. Temperature match
    if (criteria.tempRating) {
      if (criteria.tempRating >= 250 && serial.includes('T260')) score += 40;
      else if (criteria.tempRating >= 180 && serial.includes('T200')) score += 40;
      else if (criteria.tempRating >= 140 && serial.includes('T150')) score += 40;
      else if (criteria.tempRating >= 100 && serial.includes('T110')) score += 40;
      else if (criteria.tempRating >= 75 && serial.includes('T080')) score += 40;
      else if (serial.includes('T060')) score += 20;
    }

    // 6. Application terms match
    for (const app of criteria.applicationTerms) {
      if (name.includes(app) || specsStr.includes(app) || (std.application || '').toLowerCase().includes(app)) {
        score += 25;
      }
    }

    return { std, score };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored.filter(s => s.score > 0).map(s => s.std);
}

export function evaluateMaterialsConversation(
  messages: Array<{ role: string; text: string }>,
  userCompany: string = 'Industrial Enterprise',
  userIndustry: string = 'Industrial Manufacturing',
  clusteredStandards: any[] = []
): EngineeringResponse {
  const latestMessage = messages[messages.length - 1]?.text || '';
  const allUserText = messages
    .filter(m => m.role === 'user')
    .map(m => m.text)
    .join(' ');

  const criteria = parseUserCriteria(latestMessage, allUserText);
  const matchedStandards = findMatchingStandards(criteria, clusteredStandards);
  const primaryStandard = matchedStandards[0] || clusteredStandards[0] || {
    serialCode: 'TAR-KAP-AMB-SIL-0050-T260-G841',
    name: 'High-Temperature Amber Polyimide (Kapton) Tape (0.05 mm / Amber / Silicone / 260°C)',
    companyName: 'Tarasai Verified Consortium',
    price: '₹340.00 / roll ($4.20)',
    application: 'PCB wave solder masking & gold finger protection',
    specs: {
      'Backing material': 'Polyimide (Kapton) Film',
      'Color / Appearance': 'Amber / Tawny',
      'Adhesive type': 'High-Temp Cross-Linked Silicone',
      'Total thickness': '0.05 mm (50 µm)',
      'Temperature resistance': '-73°C to 260°C',
      'Dielectric Breakdown': '6.5 kV',
      'Adhesion to Steel': '28.0 N/25mm'
    },
    pros: ['Zero adhesive residue post 260°C wave solder bath', 'UL-94 V-0 flame retardancy', 'Class H electrical insulation'],
    cons: ['Requires clean, degreased substrate for maximum initial tack'],
    verdict: 'Industry standard benchmark specification for electronics wave soldering and high-temperature masking.'
  };

  // ==========================================
  // SCENARIO 1: COMPARISON REQUEST
  // ==========================================
  if (criteria.isCompare && matchedStandards.length >= 2) {
    const stdA = matchedStandards[0];
    const stdB = matchedStandards[1];

    return {
      type: 'recommendation',
      text: `### ⚖️ Engineering Technical Specification Comparison\n\n` +
        `Here is the side-by-side technical evaluation for **${userCompany}** between our standard specifications:\n\n` +
        `| Engineering Parameter | **${stdA.serialCode}** | **${stdB.serialCode}** |\n` +
        `| :--- | :--- | :--- |\n` +
        `| **Specification Title** | ${stdA.name} | ${stdB.name} |\n` +
        `| **Carrier / Backing** | ${stdA.specs?.['Backing material'] || 'Specialty Carrier'} | ${stdB.specs?.['Backing material'] || 'Specialty Carrier'} |\n` +
        `| **Adhesive Chemistry** | ${stdA.specs?.['Adhesive type'] || 'Pressure Sensitive'} | ${stdB.specs?.['Adhesive type'] || 'Pressure Sensitive'} |\n` +
        `| **Color / Appearance** | ${stdA.specs?.['Color / Appearance'] || 'Standard'} | ${stdB.specs?.['Color / Appearance'] || 'Standard'} |\n` +
        `| **Total Caliper** | ${stdA.specs?.['Total thickness'] || 'Standard'} | ${stdB.specs?.['Total thickness'] || 'Standard'} |\n` +
        `| **Thermal Limit** | ${stdA.specs?.['Temperature resistance'] || 'Industrial Grade'} | ${stdB.specs?.['Temperature resistance'] || 'Industrial Grade'} |\n` +
        `| **Wholesale Benchmark** | ${stdA.price || 'Market Rate'} | ${stdB.price || 'Market Rate'} |\n\n` +
        `#### 💡 Engineering Verdict\n` +
        `* **Choose ${stdA.serialCode}** if your process demands primary focus on ${stdA.specs?.['Color / Appearance'] || 'standard'} optical profile and high initial tack.\n` +
        `* **Choose ${stdB.serialCode}** if your priority is high thermal endurance and specialized substrate bonding.`,
      options: [
        `Select ${stdA.serialCode} (${stdA.specs?.['Color / Appearance'] || 'Standard'})`,
        `Select ${stdB.serialCode} (${stdB.specs?.['Color / Appearance'] || 'Standard'})`,
        'Request Confidential Volume RFQ',
        'Request 1-Roll Verification Sample Kit'
      ],
      recommendations: [stdA, stdB]
    };
  }

  // ==========================================
  // SCENARIO 2: RFQ / COMMERCIAL / PRICING REQUEST
  // ==========================================
  if (criteria.isRfq && primaryStandard) {
    return {
      type: 'recommendation',
      text: `### 📋 Confidential Volume RFQ & Wholesale Commercial Schedule\n\n` +
        `For **${userCompany}**'s procurement operations in **${userIndustry}**, here is the commercial breakdown for **${primaryStandard.name}** (\`${primaryStandard.serialCode}\`):\n\n` +
        `#### 📦 Master Packaging & Volume Discount Tiers\n` +
        `* **Master Packaging**: 36 Rolls / Master Carton (for 25mm / 1-inch width) | 72 Rolls / Carton (for 12mm width).\n` +
        `* **Standard MOQ**: 50 Rolls.\n` +
        `* **Volume Tier 1 (50 - 499 Rolls)**: ${primaryStandard.price || '₹340.00 / roll'} — Standard Wholesale.\n` +
        `* **Volume Tier 2 (500 - 1,999 Rolls)**: 12% Discount off catalog benchmark — Tier 2 Enterprise.\n` +
        `* **Volume Tier 3 (2,000+ Rolls)**: 22% Dedicated Master Log Conversion Contract.\n\n` +
        `#### 🛡️ Anonymous RFQ Dispatch\n` +
        `Click **"Quick RFQ"** on the specification card below to route your required quantity anonymously to all certified ISO 9001 consortium manufacturing partners simultaneously. You will receive certified bids within **4 business hours**.`,
      options: [
        'Request 1-Roll Verification Sample',
        'Inquire Custom Roll Width Slitting (3mm - 1000mm)',
        'Request Die-Cut Gaskets / Kiss-Cut Discs',
        'Explore Alternative Specification Standards'
      ],
      recommendations: [primaryStandard]
    };
  }

  // ==========================================
  // SCENARIO 3: SAMPLE REQUEST
  // ==========================================
  if (criteria.isSample && primaryStandard) {
    return {
      type: 'recommendation',
      text: `### 🧪 Material Verification Sample Program\n\n` +
        `We provide pre-production sample rolls for **${userCompany}**'s laboratory qualification and pilot line trials:\n\n` +
        `* **Sample Unit**: 1 Standard Test Roll (19mm or 25mm x 33m) of **${primaryStandard.name}** (\`${primaryStandard.serialCode}\`).\n` +
        `* **Included Documentation**: Full Factory **Certificate of Analysis (CoA)**, Dielectric Breakdown Test Report, RoHS 3 & REACH SVHC Compliance Statements, and TDS.\n` +
        `* **Dispatch Timeline**: Ships within **24 to 48 hours** via express courier.\n\n` +
        `To dispatch your test sample, click **"Quick RFQ"** below and specify "1-Roll Test Sample" in the requirement details.`,
      options: [
        'Request Confidential Volume RFQ',
        'Inquire Custom Roll Width Slitting',
        'Check Dielectric & Peel Adhesion Specs',
        'Compare with Alternative Specification'
      ],
      recommendations: [primaryStandard]
    };
  }

  // ==========================================
  // SCENARIO 4: CUSTOM SLITTING & DIE-CUTTING
  // ==========================================
  if (criteria.isSlitting && primaryStandard) {
    return {
      type: 'recommendation',
      text: `### ✂️ Precision Log Slitting & Custom Conversion Specifications\n\n` +
        `All Tarasai specification standards are converted from master log rolls with aerospace-grade slitting equipment for **${userCompany}**:\n\n` +
        `* **Available Slit Widths**: **3.0 mm to 1000.0 mm** (Custom slit to your exact tolerance of **±0.2 mm**).\n` +
        `* **Standard Master Log Lengths**: 33 meters, 66 meters, and 100 meters.\n` +
        `* **Core Configurations**: Standard 3-inch (76 mm) plastic/paper cores or 1-inch (25 mm) cores for automated SMT tape dispensers.\n` +
        `* **Rotary Die-Cutting**: Pre-cut circular discs (e.g., 6mm, 10mm, 15mm gold finger masking discs with extended pull-tabs) and custom stamped geometry gaskets.\n\n` +
        `Click **"Quick RFQ"** below to submit your required slit width, length, and monthly roll demand.`,
      options: [
        'Request Confidential Volume RFQ',
        'Request 1-Roll Sample in Custom Width',
        'Check Full Technical Matrix',
        'Explore Other Material Standards'
      ],
      recommendations: [primaryStandard]
    };
  }

  // ==========================================
  // SCENARIO 5: SPECIFIC PRODUCT OR PARAMETERS IDENTIFIED
  // ==========================================
  if (criteria.isSpecificProductChosen || matchedStandards.length > 0) {
    const std = primaryStandard;
    const colorLabel = std.specs?.['Color / Appearance'] || 'Standard';
    const adhLabel = std.specs?.['Adhesive type'] || 'Engineered Adhesive';
    const backingLabel = std.specs?.['Backing material'] || 'Specialty Carrier';
    const thickLabel = std.specs?.['Total thickness'] || 'Standard Caliper';
    const tempLabel = std.specs?.['Temperature resistance'] || 'Industrial Grade';

    return {
      type: 'recommendation',
      text: `### 🎯 Verified Specification Standard: \`${std.serialCode}\`\n\n` +
        `Based on your requirements for **${userCompany}** in **${userIndustry}** ("${latestMessage}"), we have matched the following Tarasai consortium standard:\n\n` +
        `#### 🔬 Technical Architecture & Materials Matrix\n` +
        `* **Carrier / Backing**: ${backingLabel}\n` +
        `* **Color / Optical Clarity**: **${colorLabel}**\n` +
        `* **Adhesive Chemistry**: ${adhLabel}\n` +
        `* **Total Caliper / Thickness**: ${thickLabel}\n` +
        `* **Thermal Endurance**: ${tempLabel}\n` +
        `* **Adhesion to Steel**: ${std.specs?.['Adhesion to Steel'] || '28.0 N/25mm'}\n` +
        `* **Wholesale Benchmark Price**: **${std.price || 'Market Rate'}**\n\n` +
        `#### 💡 Recommended Next Actions\n` +
        `Select an action below or click **"Quick RFQ"** on the card to broadcast an anonymous bid request to qualified consortium manufacturers.`,
      options: [
        'Request Confidential Volume RFQ',
        'Request 1-Roll Verification Sample',
        'Inquire Custom Roll Width Slitting (3mm - 1000mm)',
        'Compare with Alternative Specification'
      ],
      recommendations: matchedStandards.length > 0 ? matchedStandards.slice(0, 3) : [primaryStandard]
    };
  }

  // ==========================================
  // SCENARIO 6: INITIAL BROAD CATEGORY INQUIRY (GATHER PARAMETERS)
  // ==========================================
  const repStd = primaryStandard || clusteredStandards[0];
  return {
    type: 'inquiry',
    text: `### 🔬 Industrial Tape & Materials Selection Guide\n\n` +
      `Welcome **${userCompany}**. To assign the exact Tarasai specification standard and wholesale pricing for your operations in **${userIndustry}**, please select your target specification from our master catalog:`,
    options: [
      'High-Temp Polyimide Kapton (260°C Amber)',
      'Clear Acrylic Foam VHB (1.0mm Transparent)',
      'Black High-Resistance VHB Foam (1.0mm Black)',
      'Crepe Precision Masking (110°C Clean Removal)',
      'Aluminum Foil HVAC & EMI Shielding (65µm)'
    ],
    recommendations: [repStd]
  };
}
