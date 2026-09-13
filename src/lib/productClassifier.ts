export interface ProductAttributes {
  productType: 'Tape' | 'Adhesive & Sealant' | 'Cable & Wire' | 'Laminate & Insulation' | 'Label & Marking' | 'Surface Protection' | 'Other';
  sideType: 'Double-Sided' | 'Single-Sided' | 'Transfer (Unsupported)' | 'Self-Amalgamating / Non-Adhesive' | 'N/A';
  backingType: string;
  adhesionType: string;
  thicknessCategory: 'Ultra-Thin (< 0.1 mm)' | 'Standard (0.1 - 0.5 mm)' | 'Heavy / Foam (0.5 - 1.0 mm)' | 'Thick (> 1.0 mm)' | 'Unspecified';
  tempRange: 'Ultra-High Temp (≥ 200°C)' | 'High Temp (150 - 199°C)' | 'Medium Temp (80 - 149°C)' | 'Standard (< 80°C)' | 'Unspecified';
  location: string;
  attributesList: string[];
}

export function classifyProduct(product: {
  name: string;
  companyName?: string | null;
  specs?: Record<string, string> | null;
  application?: string | null;
  market?: string | null;
  industry?: string | null;
}): ProductAttributes {
  const specs = product.specs || {};
  const nameLower = (product.name || '').toLowerCase();
  const compLower = (product.companyName || '').toLowerCase();
  const appLower = (product.application || '').toLowerCase();
  const specsStr = Object.entries(specs).map(([k, v]) => `${k}: ${v}`).join(' ').toLowerCase();
  const combined = `${nameLower} ${compLower} ${appLower} ${specsStr} ${(product.market || '').toLowerCase()} ${(product.industry || '').toLowerCase()}`;

  // 1. Product Type
  let productType: ProductAttributes['productType'] = 'Tape';
  if (nameLower.includes('loctite') || nameLower.includes('threadlocker') || nameLower.includes('retaining compound') || nameLower.includes('flange sealant') || nameLower.includes('cyanoacrylate') || nameLower.includes('instant adhesive') || nameLower.includes('pipe sealant')) {
    productType = 'Adhesive & Sealant';
  } else if (nameLower.includes('cable') || nameLower.includes('wire') || nameLower.includes('conductor') || nameLower.includes('utp') || nameLower.includes('ehv')) {
    productType = 'Cable & Wire';
  } else if (nameLower.includes('laminate') || nameLower.includes('cg therm') || nameLower.includes('cg lam') || nameLower.includes('mica tape') || nameLower.includes('mica')) {
    productType = 'Laminate & Insulation';
  } else if (nameLower.includes('label') || nameLower.includes('decal') || nameLower.includes('dome label') || nameLower.includes('marking')) {
    productType = 'Label & Marking';
  } else if (nameLower.includes('surface protection') || nameLower.includes('protection film') || nameLower.includes('spv ') || nameLower.includes('spv-')) {
    productType = 'Surface Protection';
  }

  // 2. Side Format (Double, Single, Transfer, Self-Amalgamating)
  let sideType: ProductAttributes['sideType'] = 'Single-Sided';
  if (productType === 'Adhesive & Sealant' || productType === 'Cable & Wire') {
    sideType = 'N/A';
  } else if (
    nameLower.includes('double sided') || nameLower.includes('double-sided') || 
    nameLower.includes('double coated') || nameLower.includes('double-coated') || 
    nameLower.includes('vhb') || nameLower.includes('acxplus') || 
    nameLower.includes('norbond') || nameLower.includes('fastape') || 
    nameLower.includes('df 65') || nameLower.includes('5000ns') || 
    nameLower.includes('500') || nameLower.includes('p-637') || 
    nameLower.includes('sv-202') || nameLower.includes('sv-201') || 
    nameLower.includes('cg324') || nameLower.includes('8820') ||
    combined.includes('differential acrylic') ||
    combined.includes('dual sided')
  ) {
    sideType = 'Double-Sided';
  } else if (
    nameLower.includes('transfer tape') || nameLower.includes('adhesive transfer') || 
    nameLower.includes('467mp') || nameLower.includes('468mp') || 
    nameLower.includes('9471le') || nameLower.includes('9472le') || 
    nameLower.includes('uha 1185') || nameLower.includes('ft 1126') || 
    combined.includes('unsupported transfer') || combined.includes('unsupported adhesive')
  ) {
    sideType = 'Transfer (Unsupported)';
  } else if (
    nameLower.includes('self-amalgamating') || nameLower.includes('self fusing') || 
    nameLower.includes('self-fusing') || nameLower.includes('7500') || 
    nameLower.includes('7501') || nameLower.includes('ct-500') ||
    nameLower.includes('ct-600') || nameLower.includes('scotch 23') || 
    nameLower.includes('scotch 130c')
  ) {
    sideType = 'Self-Amalgamating / Non-Adhesive';
  }

  // 3. Backing Material / Substrate
  let backingType = 'Other / Unspecified';
  const backingSpec = (specs['Backing material'] || specs['Carrier'] || specs['Substrate'] || specs['Backing'] || '').toLowerCase();
  const searchBacking = `${backingSpec} ${combined}`;

  if (searchBacking.includes('kapton') || searchBacking.includes('polyimide') || searchBacking.includes('pi film') || searchBacking.includes('7011') || searchBacking.includes('7020') || searchBacking.includes('5413') || searchBacking.includes('nks-101') || searchBacking.includes('pi260')) {
    backingType = 'Polyimide / Kapton';
  } else if (searchBacking.includes('glass cloth') || searchBacking.includes('fiberglass') || searchBacking.includes('woven glass') || searchBacking.includes('glass fabric') || searchBacking.includes('8415') || searchBacking.includes('8410') || searchBacking.includes('8411') || searchBacking.includes('8420') || searchBacking.includes('188ul') || searchBacking.includes('nks-gc')) {
    backingType = 'Fiberglass / Glass Cloth';
  } else if (searchBacking.includes('polyester') || searchBacking.includes('pet') || searchBacking.includes('mylar') || searchBacking.includes('2026') || searchBacking.includes('1042t') || searchBacking.includes('1045') || searchBacking.includes('4965') || searchBacking.includes('8820')) {
    backingType = 'PET / Polyester Film';
  } else if (searchBacking.includes('aluminium') || searchBacking.includes('aluminum') || searchBacking.includes('copper') || searchBacking.includes('foil') || searchBacking.includes('metal foil') || searchBacking.includes('et900') || searchBacking.includes('et9110') || searchBacking.includes('al50') || searchBacking.includes('nks-cu')) {
    backingType = 'Aluminum / Copper Foil';
  } else if (searchBacking.includes('foam') || searchBacking.includes('acrylic foam') || searchBacking.includes('pe foam') || searchBacking.includes('pu foam') || searchBacking.includes('eva') || searchBacking.includes('vhb') || searchBacking.includes('acxplus') || searchBacking.includes('norbond') || searchBacking.includes('nks-vhb')) {
    backingType = 'Foam (Acrylic / PE / PU)';
  } else if (searchBacking.includes('pvc') || searchBacking.includes('vinyl') || searchBacking.includes('polyvinyl chloride') || searchBacking.includes('5010') || searchBacking.includes('yg-pvc')) {
    backingType = 'PVC / Vinyl';
  } else if (searchBacking.includes('crepe') || searchBacking.includes('paper') || searchBacking.includes('washi') || searchBacking.includes('masking paper') || searchBacking.includes('kraft') || searchBacking.includes('9050') || searchBacking.includes('9080') || searchBacking.includes('yg-600') || searchBacking.includes('5005')) {
    backingType = 'Paper / Crepe / Washi';
  } else if (searchBacking.includes('tissue') || searchBacking.includes('non-woven') || searchBacking.includes('nonwoven') || searchBacking.includes('3002') || searchBacking.includes('9448')) {
    backingType = 'Tissue / Non-Woven';
  } else if (searchBacking.includes('cloth') || searchBacking.includes('cotton') || searchBacking.includes('rayon') || searchBacking.includes('duct') || searchBacking.includes('3010') || searchBacking.includes('51608') || searchBacking.includes('801')) {
    backingType = 'Cloth / Cotton / Rayon';
  } else if (searchBacking.includes('ptfe') || searchBacking.includes('teflon') || searchBacking.includes('fluoropolymer') || searchBacking.includes('nks-ptfe')) {
    backingType = 'PTFE / Fluoropolymer';
  } else if (searchBacking.includes('epdm') || searchBacking.includes('silicone rubber') || searchBacking.includes('silicone elastomer') || searchBacking.includes('7500') || searchBacking.includes('7501') || searchBacking.includes('ct-500') || searchBacking.includes('ct-600')) {
    backingType = 'EPDM / Silicone Elastomer';
  } else if (searchBacking.includes('nomex') || searchBacking.includes('polyamide') || searchBacking.includes('aramid') || searchBacking.includes('6512')) {
    backingType = 'Nomex / Aramid Paper';
  } else if (sideType === 'Transfer (Unsupported)') {
    backingType = 'Unsupported (Adhesive Transfer)';
  }

  // 4. Adhesion Chemistry
  let adhesionType = 'Other / Unspecified';
  const adhSpec = (specs['Adhesive type'] || specs['Adhesive'] || specs['Adhesive Type'] || specs['Binder'] || '').toLowerCase();
  const searchAdh = `${adhSpec} ${combined}`;

  if (searchAdh.includes('silicone') || searchAdh.includes('polysiloxane') || searchAdh.includes('cross-linked silicone') || searchBacking.includes('kapton') || searchBacking.includes('7011') || searchBacking.includes('8415') || searchBacking.includes('nks-101') || searchBacking.includes('nks-gc') || searchBacking.includes('pi260')) {
    adhesionType = 'Silicone / Polysiloxane';
  } else if (searchAdh.includes('acrylic') || searchAdh.includes('modified acrylic') || searchAdh.includes('pure acrylic') || searchAdh.includes('solvent acrylic') || searchAdh.includes('water-based') || searchAdh.includes('4965') || searchAdh.includes('vhb') || searchAdh.includes('8820') || searchAdh.includes('1001') || searchAdh.includes('3002')) {
    adhesionType = 'Acrylic (Solvent / Pure)';
  } else if (searchAdh.includes('natural rubber') || searchAdh.includes('synthetic rubber') || searchAdh.includes('rubber') || searchAdh.includes('synthetic resin') || searchAdh.includes('hot melt') || searchAdh.includes('8410') || searchAdh.includes('8411') || searchAdh.includes('6512') || searchAdh.includes('801') || searchAdh.includes('600') || searchAdh.includes('7008')) {
    adhesionType = 'Rubber / Synthetic Resin';
  } else if (searchAdh.includes('anaerobic') || searchAdh.includes('dimethacrylate') || searchAdh.includes('methacrylate') || searchAdh.includes('loctite')) {
    adhesionType = 'Anaerobic (Dimethacrylate)';
  } else if (searchAdh.includes('cyanoacrylate') || searchAdh.includes('instant adhesive') || searchAdh.includes('super glue')) {
    adhesionType = 'Cyanoacrylate (Instant)';
  } else if (sideType === 'Self-Amalgamating / Non-Adhesive' || searchAdh.includes('non-adhesive') || searchAdh.includes('self-amalgamating') || searchAdh.includes('self-fusing')) {
    adhesionType = 'Self-Fusing / Non-Adhesive';
  }

  // 5. Thickness Category
  let thicknessCategory: ProductAttributes['thicknessCategory'] = 'Unspecified';
  const thickSpec = (specs['Total thickness'] || specs['Thickness'] || specs['Caliper'] || '').toLowerCase();
  const thickMatch = thickSpec.match(/([0-9.]+)\s*(mm|micron|µm|mil)/i) || combined.match(/([0-9.]+)\s*(mm|micron|µm|mil)/i);

  if (thickMatch) {
    const val = parseFloat(thickMatch[1]);
    const unit = thickMatch[2].toLowerCase();
    let mm = val;
    if (unit === 'micron' || unit === 'µm') mm = val / 1000;
    else if (unit === 'mil') mm = val * 0.0254;

    if (!isNaN(mm)) {
      if (mm < 0.1) thicknessCategory = 'Ultra-Thin (< 0.1 mm)';
      else if (mm <= 0.5) thicknessCategory = 'Standard (0.1 - 0.5 mm)';
      else if (mm <= 1.0) thicknessCategory = 'Heavy / Foam (0.5 - 1.0 mm)';
      else thicknessCategory = 'Thick (> 1.0 mm)';
    }
  }

  // 6. Temperature Range
  let tempRange: ProductAttributes['tempRange'] = 'Unspecified';
  const tempSpec = (specs['Temperature resistance'] || specs['Temperature range'] || specs['Temperature rating'] || '').toLowerCase();
  const searchTemp = `${tempSpec} ${combined}`;

  if (searchTemp.includes('260°c') || searchTemp.includes('250°c') || searchTemp.includes('240°c') || searchTemp.includes('230°c') || searchTemp.includes('220°c') || searchTemp.includes('204°c') || searchTemp.includes('200°c') || searchTemp.includes('class c') || searchTemp.includes('class n') || searchTemp.includes('class 200')) {
    tempRange = 'Ultra-High Temp (≥ 200°C)';
  } else if (searchTemp.includes('180°c') || searchTemp.includes('160°c') || searchTemp.includes('150°c') || searchTemp.includes('155°c') || searchTemp.includes('class h') || searchTemp.includes('class f')) {
    tempRange = 'High Temp (150 - 199°C)';
  } else if (searchTemp.includes('149°c') || searchTemp.includes('140°c') || searchTemp.includes('130°c') || searchTemp.includes('120°c') || searchTemp.includes('110°c') || searchTemp.includes('105°c') || searchTemp.includes('100°c') || searchTemp.includes('90°c') || searchTemp.includes('80°c') || searchTemp.includes('class b')) {
    tempRange = 'Medium Temp (80 - 149°C)';
  } else if (searchTemp.includes('70°c') || searchTemp.includes('65°c') || searchTemp.includes('60°c') || searchTemp.includes('class y') || searchTemp.includes('class a')) {
    tempRange = 'Standard (< 80°C)';
  }

  // 7. Geographic Location / Country of Origin
  let location = 'Global / Other';
  if (compLower.includes('cgapl') || compLower.includes('cg adhesive') || compLower.includes('ajit') || compLower.includes('aipl') || compLower.includes('vasavi') || compLower.includes('satl') || compLower.includes('havell') || compLower.includes('polycab') || compLower.includes('bagla') || compLower.includes('pidilite') || compLower.includes('cosmos') || compLower.includes('india')) {
    location = 'India';
  } else if (compLower.includes('yongguan') || compLower.includes('ygtape') || compLower.includes('naikos') || compLower.includes('yousan') || compLower.includes('cyg') || compLower.includes('changtong') || compLower.includes('camat') || compLower.includes('wanghao') || compLower.includes('china')) {
    location = 'China';
  } else if (compLower.includes('tesa') || compLower.includes('henkel') || compLower.includes('loctite') || compLower.includes('lohmann') || compLower.includes('advance') || compLower.includes('germany')) {
    location = 'Germany';
  } else if (compLower.includes('3m') || compLower.includes('shurtape') || compLower.includes('avery') || compLower.includes('intertape') || compLower.includes('ipg') || compLower.includes('scapa') || compLower.includes('united states') || compLower.includes('usa')) {
    location = 'United States';
  } else if (compLower.includes('nitto') || compLower.includes('japan')) {
    location = 'Japan';
  } else if (compLower.includes('saint-gobain') || compLower.includes('saint gobain') || compLower.includes('france')) {
    location = 'France';
  }

  const attributesList: string[] = [
    productType,
    sideType !== 'N/A' ? sideType : '',
    backingType,
    adhesionType,
    location,
    thicknessCategory !== 'Unspecified' ? thicknessCategory : '',
    tempRange !== 'Unspecified' ? tempRange : ''
  ].filter(Boolean);

  return {
    productType,
    sideType,
    backingType,
    adhesionType,
    thicknessCategory,
    tempRange,
    location,
    attributesList
  };
}

export const KNOWN_FILTER_OPTIONS = {
  locations: [
    'India',
    'China',
    'Germany',
    'United States',
    'Japan',
    'France',
    'Global / Other'
  ],
  productTypes: [
    'Tape',
    'Adhesive & Sealant',
    'Cable & Wire',
    'Laminate & Insulation',
    'Label & Marking',
    'Surface Protection'
  ],
  sideTypes: [
    'Double-Sided',
    'Single-Sided',
    'Transfer (Unsupported)',
    'Self-Amalgamating / Non-Adhesive'
  ],
  backingTypes: [
    'Polyimide / Kapton',
    'PET / Polyester Film',
    'Fiberglass / Glass Cloth',
    'Aluminum / Copper Foil',
    'Foam (Acrylic / PE / PU)',
    'PVC / Vinyl',
    'Paper / Crepe / Washi',
    'Tissue / Non-Woven',
    'Cloth / Cotton / Rayon',
    'PTFE / Fluoropolymer',
    'EPDM / Silicone Elastomer',
    'Nomex / Aramid Paper',
    'Unsupported (Adhesive Transfer)'
  ],
  adhesionTypes: [
    'Acrylic (Solvent / Pure)',
    'Silicone / Polysiloxane',
    'Rubber / Synthetic Resin',
    'Anaerobic (Dimethacrylate)',
    'Cyanoacrylate (Instant)',
    'Self-Fusing / Non-Adhesive'
  ],
  thicknessCategories: [
    'Ultra-Thin (< 0.1 mm)',
    'Standard (0.1 - 0.5 mm)',
    'Heavy / Foam (0.5 - 1.0 mm)',
    'Thick (> 1.0 mm)'
  ],
  tempRanges: [
    'Ultra-High Temp (≥ 200°C)',
    'High Temp (150 - 199°C)',
    'Medium Temp (80 - 149°C)',
    'Standard (< 80°C)'
  ]
};
