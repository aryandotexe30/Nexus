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
    .join(' ')
    .toLowerCase();

  const latestLower = latestMessage.toLowerCase().trim();

  // 1. Detect Intent / Stage
  const isRfqIntent = 
    latestLower.includes('rfq') || 
    latestLower.includes('volume') || 
    latestLower.includes('quotation') || 
    latestLower.includes('quote') || 
    latestLower.includes('bulk') || 
    latestLower.includes('price') || 
    latestLower.includes('cost') || 
    latestLower.includes('moq');

  const isSampleIntent = 
    latestLower.includes('sample') || 
    latestLower.includes('test roll') || 
    latestLower.includes('1 roll') || 
    latestLower.includes('trial') || 
    latestLower.includes('testing');

  const isSlittingIntent = 
    latestLower.includes('slitting') || 
    latestLower.includes('slit') || 
    latestLower.includes('width') || 
    latestLower.includes('die cut') || 
    latestLower.includes('die-cut') || 
    latestLower.includes('custom roll') || 
    latestLower.includes('cut to size') || 
    latestLower.includes('kiss cut');

  // 2. Detect Specific Parameters in thread or latest message
  const hasThicknessParam = 
    allUserText.includes('0.05') || 
    allUserText.includes('50') || 
    allUserText.includes('2 mil') || 
    allUserText.includes('0.06') || 
    allUserText.includes('0.07') || 
    allUserText.includes('3 mil') || 
    allUserText.includes('0.09') || 
    allUserText.includes('0.10') || 
    allUserText.includes('0.12') || 
    allUserText.includes('0.14') || 
    allUserText.includes('0.5mm') || 
    allUserText.includes('0.8mm') || 
    allUserText.includes('1.1mm') || 
    allUserText.includes('1.2mm') || 
    allUserText.includes('1.6mm');

  const hasTempParam = 
    allUserText.includes('260') || 
    allUserText.includes('180') || 
    allUserText.includes('300') || 
    allUserText.includes('150') || 
    allUserText.includes('120') || 
    allUserText.includes('110') || 
    allUserText.includes('80°') || 
    allUserText.includes('wave solder') || 
    allUserText.includes('class h');

  const hasApplicationParam = 
    allUserText.includes('pcb') || 
    allUserText.includes('solder') || 
    allUserText.includes('transformer') || 
    allUserText.includes('battery') || 
    allUserText.includes('powder coating') || 
    allUserText.includes('emblem') || 
    allUserText.includes('hvac') || 
    allUserText.includes('clean removal') || 
    allUserText.includes('automotive') || 
    allUserText.includes('mounting') || 
    allUserText.includes('insulation');

  // Detect Material Domain
  let materialDomain = 'kapton';
  if (allUserText.includes('vhb') || allUserText.includes('acrylic foam') || allUserText.includes('foam')) {
    materialDomain = 'vhb';
  } else if (allUserText.includes('masking') || allUserText.includes('crepe') || allUserText.includes('painter')) {
    materialDomain = 'masking';
  } else if (allUserText.includes('foil') || allUserText.includes('aluminum') || allUserText.includes('aluminium') || allUserText.includes('copper')) {
    materialDomain = 'foil';
  } else if (allUserText.includes('glass cloth') || allUserText.includes('fiberglass') || allUserText.includes('mica')) {
    materialDomain = 'glass_cloth';
  } else if (allUserText.includes('ptfe') || allUserText.includes('teflon')) {
    materialDomain = 'ptfe';
  } else if (allUserText.includes('pvc') || allUserText.includes('wire harness')) {
    materialDomain = 'pvc';
  } else if (allUserText.includes('tissue') || allUserText.includes('transfer') || (allUserText.includes('double') && !allUserText.includes('foam'))) {
    materialDomain = 'double_sided';
  } else if (allUserText.includes('filament') || allUserText.includes('strapping')) {
    materialDomain = 'filament';
  }

  // Helper to find standard from clustered list
  const findStandard = (matcher: (s: any) => boolean, fallbackPrefix: string) => {
    return clusteredStandards.find(matcher) || clusteredStandards.find(s => (s.serialCode || '').includes(fallbackPrefix)) || clusteredStandards[0] || {
      serialCode: 'TAR-KAP-SIL-0050-T260-G841',
      name: 'High-Temperature Polyimide (Kapton) Tape (0.05 mm / Silicone / 260°C)',
      companyName: 'Tarasai Verified Consortium',
      price: '₹340.00 / roll ($4.20)',
      application: 'PCB wave solder masking & gold finger protection',
      specs: {
        'Backing material': 'Polyimide (Kapton) Film',
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
  };

  // ==========================================
  // STAGE: RFQ / PRICING / PROCUREMENT INTENT
  // ==========================================
  if (isRfqIntent) {
    const activeStd = findStandard(
      s => (s.serialCode || '').toLowerCase().includes(materialDomain.substring(0, 3)),
      'TAR-'
    );

    return {
      type: 'recommendation',
      text: `### 📋 Confidential Volume RFQ & Wholesale Procurement Protocol\n\n` +
        `For **${userCompany}**'s procurement operations in **${userIndustry}**, here is our standardized volume supply schedule for **${activeStd.name}** (\`${activeStd.serialCode}\`):\n\n` +
        `#### 📦 Standard Packaging & Tiered Commercials\n` +
        `* **Master Packaging**: 36 Rolls / Master Carton (for 25mm / 1-inch width) | 72 Rolls / Carton (for 12mm width).\n` +
        `* **Standard Minimum Order Quantity (MOQ)**: 50 Rolls.\n` +
        `* **Volume Tier 1 (100 - 499 Rolls)**: ₹340.00 / roll ($4.20 USD) — Standard Wholesale.\n` +
        `* **Volume Tier 2 (500 - 1,999 Rolls)**: ₹295.00 / roll ($3.65 USD) — **13% Tier Discount**.\n` +
        `* **Enterprise Tier 3 (2,000+ Rolls)**: ₹260.00 / roll ($3.20 USD) — Dedicated Master Log Conversion Contract.\n\n` +
        `#### 🛡️ Confidential RFQ Routing\n` +
        `Clicking **"Quick RFQ"** below routes your inquiry anonymously to our certified ISO 9001 / IATF 16949 consortium manufacturing partners simultaneously. You will receive certified bids within **4 business hours** without exposing your sourcing identity.`,
      options: [
        'Request 1-Roll Verification Sample',
        'Inquire Custom Roll Width Slitting (3mm - 1000mm)',
        'Request Die-Cut Gaskets / Kiss-Cut Discs',
        'Explore Alternative Temperature Standards'
      ],
      recommendations: [activeStd]
    };
  }

  // ==========================================
  // STAGE: SAMPLE REQUEST INTENT
  // ==========================================
  if (isSampleIntent) {
    const activeStd = findStandard(
      s => (s.serialCode || '').toLowerCase().includes(materialDomain.substring(0, 3)),
      'TAR-'
    );

    return {
      type: 'recommendation',
      text: `### 🧪 Material Verification Sample Program\n\n` +
        `We provide pre-production sample rolls for **${userCompany}**'s laboratory qualification and pilot production line trials:\n\n` +
        `* **Sample Unit**: 1 Standard Test Roll (19mm or 25mm x 33m) of **${activeStd.name}** (\`${activeStd.serialCode}\`).\n` +
        `* **Documentation Included**: Full Factory **Certificate of Analysis (CoA)**, Dielectric Breakdown Test Report, RoHS 3 & REACH SVHC Compliance Statements, and TDS.\n` +
        `* **Dispatch Timeline**: Ships within **24 to 48 hours** via express courier.\n` +
        `* **Pilot Line Support**: Zero adhesive residue guarantee at peak thermal exposure.\n\n` +
        `To dispatch your test sample, click **"Quick RFQ"** below and specify "1-Roll Test Sample" in the requirement details.`,
      options: [
        'Request Confidential Volume RFQ',
        'Inquire Custom Roll Width Slitting',
        'Check Dielectric Breakdown & Peel Specs',
        'Compare with Class H 180°C Alternative'
      ],
      recommendations: [activeStd]
    };
  }

  // ==========================================
  // STAGE: SLITTING & CUSTOM SIZING INTENT
  // ==========================================
  if (isSlittingIntent) {
    const activeStd = findStandard(
      s => (s.serialCode || '').toLowerCase().includes(materialDomain.substring(0, 3)),
      'TAR-'
    );

    return {
      type: 'recommendation',
      text: `### ✂️ Precision Log Slitting & Custom Conversion Specifications\n\n` +
        `All Tarasai specification standards are converted from master log rolls with aerospace-grade slitting equipment:\n\n` +
        `* **Available Slit Widths**: **3.0 mm to 1000.0 mm** (Custom slit to your exact tolerance of **±0.2 mm**).\n` +
        `* **Standard Master Log Lengths**: 33 meters, 66 meters, and 100 meters.\n` +
        `* **Core Configurations**: Standard 3-inch (76 mm) plastic/paper cores or 1-inch (25 mm) cores for automated SMT tape dispensers.\n` +
        `* **Rotary Die-Cutting**: Pre-cut circular discs (e.g., 6mm, 10mm, 15mm gold finger masking discs with extended release liners / pull-tabs) and custom stamped geometry gaskets.\n\n` +
        `Click **"Quick RFQ"** below to submit your required slit width, length, and monthly roll demand.`,
      options: [
        'Request Confidential Volume RFQ',
        'Request 1-Roll Sample in Custom Width',
        'Check Dielectric Breakdown Specs',
        'Explore Other Material Standards'
      ],
      recommendations: [activeStd]
    };
  }

  // ==========================================
  // STAGE: SPECIFICATION SELECTED / DETAILED REQUIREMENTS PROVIDED
  // ==========================================
  const isDirectOptionSelection = 
    messages.length > 1 || 
    hasThicknessParam || 
    hasTempParam || 
    hasApplicationParam;

  if (isDirectOptionSelection) {
    if (materialDomain === 'kapton') {
      const isClassH = allUserText.includes('180') || allUserText.includes('transformer');
      const isHighBake = allUserText.includes('300') || allUserText.includes('0.09') || allUserText.includes('powder coating');
      const isBattery = allUserText.includes('battery') || allUserText.includes('0.06') || allUserText.includes('flame');

      let selectedStd: any;
      if (isClassH) {
        selectedStd = findStandard(s => (s.serialCode || '').includes('KAP') && (s.serialCode || '').includes('T180'), 'TAR-KAP');
      } else if (isHighBake) {
        selectedStd = findStandard(s => (s.serialCode || '').includes('KAP') && (s.serialCode || '').includes('0070'), 'TAR-KAP');
      } else {
        selectedStd = findStandard(s => (s.serialCode || '').includes('KAP') && (s.serialCode || '').includes('0050'), 'TAR-KAP');
      }

      return {
        type: 'recommendation',
        text: `### 🎯 Technical Specification Standard: \`${selectedStd.serialCode}\`\n\n` +
          `Based on your requirements for **${userCompany}** (${latestMessage}), we have assigned the matching Tarasai specification standard:\n\n` +
          `#### 🔬 Materials & Engineering Architecture\n` +
          `* **Film Carrier**: 25 µm (1.0 mil) DuPont-grade Polyimide (Kapton) Film.\n` +
          `* **Adhesive System**: 25 µm High-Temperature Cross-Linked Polysiloxane (Silicone) Adhesive (Total Caliper: **0.05 mm / 50 µm**).\n` +
          `* **Thermal Endurance**: Continuous rating of **-73°C to +260°C** with intermittent peak survival up to **300°C** for wave solder immersion.\n` +
          `* **Dielectric Breakdown**: **6.5 kV (6,500 Volts)** — Exceeds IPC-TM-650 Class 3 dielectric standards.\n` +
          `* **Adhesion & Clean Removal**: 180° Peel Adhesion of **28.0 N/25mm** to polished copper/FR4; **100% zero ghosting / silicone residue** post wave soldering wash.\n` +
          `* **Flame Retardancy**: Meets UL-94 V-0 and Class H electrical insulation parameters.\n\n` +
          `#### 💡 Recommended Next Actions\n` +
          `Use the action buttons below or click **"Quick RFQ"** on the specification card to broadcast your demand anonymously to certified consortium suppliers.`,
        options: [
          'Request Confidential Volume RFQ',
          'Request 1-Roll Verification Sample',
          'Inquire Custom Roll Width Slitting (3mm - 1000mm)',
          'Compare with 0.07mm Class H 180°C Standard'
        ],
        recommendations: [selectedStd]
      };
    }

    if (materialDomain === 'vhb') {
      const selectedStd = findStandard(s => (s.serialCode || '').includes('VHB') || (s.serialCode || '').includes('PEF'), 'TAR-VHB');
      return {
        type: 'recommendation',
        text: `### 🎯 Technical Specification Standard: \`${selectedStd.serialCode}\`\n\n` +
          `Based on your mounting & structural bonding requirements for **${userCompany}** (${latestMessage}), we have assigned the following standard:\n\n` +
          `#### 🔬 Materials & Viscoelastic Architecture\n` +
          `* **Core Carrier**: 1.1 mm (43 mil) 100% Solid Closed-Cell Viscoelastic Acrylic Polymer Foam.\n` +
          `* **Adhesive System**: High-performance pure acrylic adhesive on both sides with red PE film release liner.\n` +
          `* **Dynamic Shear Strength**: **550 kPa** (80 psi) — Replaces rivets, screws, spot welds, and liquid adhesives.\n` +
          `* **Thermal & Weathering Endurance**: Continuous **-40°C to +90°C**, short-term peak up to **150°C**. Fully resistant to UV radiation, thermal expansion cycles, moisture, and plasticizer migration.\n` +
          `* **Stress Distribution**: 100% closed-cell foam absorbs shock, vibration, and dampens mechanical noise.\n\n` +
          `#### 💡 Recommended Next Actions`,
        options: [
          'Request Confidential Volume RFQ',
          'Request 1-Roll Verification Sample',
          'Inquire Custom Slit Widths / Die-Cut Shapes',
          'Compare with Thin Double-Sided PET'
        ],
        recommendations: [selectedStd]
      };
    }

    if (materialDomain === 'masking') {
      const selectedStd = findStandard(s => (s.serialCode || '').includes('MSK'), 'TAR-MSK');
      return {
        type: 'recommendation',
        text: `### 🎯 Technical Specification Standard: \`${selectedStd.serialCode}\`\n\n` +
          `Based on your industrial masking requirements for **${userCompany}** (${latestMessage}), here is the verified standard:\n\n` +
          `#### 🔬 Materials & Processing Architecture\n` +
          `* **Paper Carrier**: Saturated, high-conformability crepe paper backing (0.14 mm total thickness).\n` +
          `* **Adhesive System**: Cross-linked natural rubber / synthetic resin with balanced high initial tack.\n` +
          `* **Thermal Rating**: **110°C Continuous** (Bake cycles up to 45 minutes in industrial powder coating / paint baking ovens).\n` +
          `* **Peel Characteristics**: Clean single-piece removal without tearing, splintering, or adhesive ghosting on automotive clearcoats, metal, and plastic.\n\n` +
          `#### 💡 Recommended Next Actions`,
        options: [
          'Request Confidential Volume RFQ',
          'Request 1-Roll Verification Sample',
          'Inquire Custom Width Slitting (12mm, 18mm, 24mm, 48mm)',
          'Explore Ultra-High Temp 150°C Crepe Standard'
        ],
        recommendations: [selectedStd]
      };
    }

    if (materialDomain === 'foil') {
      const selectedStd = findStandard(s => (s.serialCode || '').includes('ALU') || (s.serialCode || '').includes('COP'), 'TAR-ALU');
      return {
        type: 'recommendation',
        text: `### 🎯 Technical Specification Standard: \`${selectedStd.serialCode}\`\n\n` +
          `Based on your HVAC / EMI shielding requirements for **${userCompany}** (${latestMessage}), here is the verified standard:\n\n` +
          `#### 🔬 Materials & Barrier Architecture\n` +
          `* **Foil Carrier**: 30 µm Dead-soft pure aluminum foil backing (Total thickness: **0.065 mm / 65 µm**).\n` +
          `* **Adhesive System**: Cold-weather solvent acrylic adhesive with siliconized paper liner.\n` +
          `* **Thermal Rating**: **-30°C to +120°C** continuous.\n` +
          `* **Vapor & EMI Barrier**: Class 0 fire rating, zero moisture vapor transmission, high thermal conductivity for HVAC duct sealing and electrical reflection.\n\n` +
          `#### 💡 Recommended Next Actions`,
        options: [
          'Request Confidential Volume RFQ',
          'Request 1-Roll Verification Sample',
          'Inquire Custom Widths (48mm / 72mm / 96mm)',
          'Compare with Conductive Copper Foil'
        ],
        recommendations: [selectedStd]
      };
    }

    // Default general fallback for other specified criteria
    const topStd = clusteredStandards[0] || findStandard(() => true, 'TAR-');
    return {
      type: 'recommendation',
      text: `### 🎯 Technical Specification Standard: \`${topStd.serialCode}\`\n\n` +
        `Based on your technical criteria for **${userCompany}** (${latestMessage}), we have matched the following consortium standard:\n\n` +
        `* **Standard Name**: ${topStd.name}\n` +
        `* **Benchmark Wholesale Price**: ${topStd.price}\n` +
        `* **Application**: ${topStd.application || 'Industrial Engineering'}\n` +
        `* **Carrier / Adhesive**: ${topStd.specs?.['Backing material'] || 'Specialty Film'} with ${topStd.specs?.['Adhesive type'] || 'Engineered Adhesive'}.\n` +
        `* **Caliper & Thermal Limit**: ${topStd.specs?.['Total thickness'] || 'Standard'} | ${topStd.specs?.['Temperature resistance'] || 'Industrial Grade'}.\n\n` +
        `#### 💡 Recommended Next Actions`,
      options: [
        'Request Confidential Volume RFQ',
        'Request 1-Roll Verification Sample',
        'Inquire Custom Roll Width Slitting',
        'Explore Alternative Specifications'
      ],
      recommendations: [topStd]
    };
  }

  // ==========================================
  // STAGE 1: INITIAL / BROAD INQUIRY (GATHER REQUIREMENTS)
  // ==========================================
  if (materialDomain === 'kapton') {
    const repStd = findStandard(s => (s.serialCode || '').includes('KAP'), 'TAR-KAP');
    return {
      type: 'inquiry',
      text: `### 🔬 High-Temperature Polyimide (Kapton) Tape Selection Guide\n\n` +
        `Welcome **${userCompany}**. Polyimide tapes operate across extreme thermal environments (-73°C to +300°C) and provide superior Class H dielectric isolation. To assign the exact Tarasai specification standard for your application in **${userIndustry}**, please select your engineering parameters below:\n\n` +
        `#### 📐 Critical Governing Parameters:\n` +
        `1. **Caliper / Film Thickness**: Standard 0.05 mm (1.0 mil film + 1.0 mil silicone) for PCB wave solder masking vs 0.07 mm (2.0 mil film) for high-voltage dielectric isolation.\n` +
        `2. **Thermal Process**: 260°C Wave Solder Bath vs 180°C Continuous Class H Motor/Transformer Insulation vs 300°C High-Bake Reflow.\n` +
        `3. **Adhesive Chemistry**: Cross-linked Silicone (zero residue on hot peel) vs Solvent Acrylic (higher chemical/solvent resistance).\n` +
        `4. **Application**: PCB Gold Finger Masking, EV Lithium Battery Tab Insulation, or Powder Coating Masking.`,
      options: [
        '0.05mm Silicone 260°C (PCB Wave Solder)',
        '0.07mm Class H 180°C (Transformer Insulation)',
        '0.06mm Flame-Retardant (Battery Tab Wrap)',
        '0.09mm High-Bake 300°C (Powder Coating)'
      ],
      recommendations: [repStd]
    };
  }

  if (materialDomain === 'vhb') {
    const repStd = findStandard(s => (s.serialCode || '').includes('VHB'), 'TAR-VHB');
    return {
      type: 'inquiry',
      text: `### 🔬 Double-Sided Acrylic Foam (VHB) Tape Selection Guide\n\n` +
        `Welcome **${userCompany}**. Closed-cell viscoelastic acrylic foam tapes replace mechanical fasteners (rivets, screws, spot welds) by providing permanent structural bonding and dynamic stress dissipation. Please select your required thickness and bonding substrate:\n\n` +
        `#### 📐 Critical Governing Parameters:\n` +
        `1. **Foam Thickness / Caliper**: 0.5 mm (Thin Metal-to-Metal), 1.1 mm (Standard Structural Assembly), or 1.6 mm (Rough / Uneven Substrates).\n` +
        `2. **Core Chemistry**: All-Acrylic Viscoelastic Foam (150°C high-temp resistance) vs PE Foam (General Mounting).\n` +
        `3. **Substrate Energy**: High Surface Energy (HSE metals/glass) vs Low Surface Energy (LSE plastics/powder coats).`,
      options: [
        '1.1mm Clear Acrylic Foam 150°C (Glass/Metal)',
        '1.1mm Grey Structural VHB (Automotive Panels)',
        '0.5mm Ultra-Thin Foam (Electronics Enclosures)',
        '1.6mm Conformable Foam (Powder-Coated Surfaces)'
      ],
      recommendations: [repStd]
    };
  }

  if (materialDomain === 'masking') {
    const repStd = findStandard(s => (s.serialCode || '').includes('MSK'), 'TAR-MSK');
    return {
      type: 'inquiry',
      text: `### 🔬 Industrial Crepe & High-Temperature Masking Tape Guide\n\n` +
        `Welcome **${userCompany}**. Industrial masking performance is defined by adhesive heat resistance, sharp paint line definition, and 100% clean single-piece removal without ghosting. Please select your process parameters below:\n\n` +
        `#### 📐 Critical Governing Parameters:\n` +
        `1. **Oven Temperature**: 80°C General Industrial Paint vs 110°C Automotive Bake vs 150°C Powder Coating.\n` +
        `2. **Substrate Compatibility**: Clean removal from metal, plastics, rubber trim, and anodized aluminum.\n` +
        `3. **Adhesion System**: High initial tack natural rubber for instant hold vs synthetic acrylic.`,
      options: [
        '0.14mm Rubber 110°C (Automotive Paint Bake)',
        '0.16mm High-Bake 150°C (Powder Coating Masking)',
        '0.12mm General Industrial 80°C (Assembly & Bundling)',
        '0.13mm Washi Precision Edge (Clean Removal)'
      ],
      recommendations: [repStd]
    };
  }

  // Generic Initial Inquiry
  const repStd = clusteredStandards[0] || findStandard(() => true, 'TAR-');
  return {
    type: 'inquiry',
    text: `### 🔬 TarasAI Materials Specification Engineering\n\n` +
      `Welcome **${userCompany}**. Our database contains 750+ unified industrial tape and adhesive standards. To deliver the exact specification and benchmark pricing for **${userIndustry}**, please select your target category below:`,
    options: [
      'Class H High Temp Polyimide (260°C)',
      'Double-Sided Acrylic Foam VHB (1.1mm)',
      'Crepe Masking Tape (110°C Clean Removal)',
      'Aluminum Foil HVAC & EMI Shielding (65µm)'
    ],
    recommendations: [repStd]
  };
}
