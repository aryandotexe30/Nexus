export interface ProductAttributes {
  productType: 'Tape' | 'Adhesive & Sealant' | 'Cable & Wire' | 'Laminate & Insulation' | 'Label & Marking' | 'Surface Protection' | 'Other';
  sideType: 'Double-Sided' | 'Single-Sided' | 'Transfer (Unsupported)' | 'Self-Amalgamating / Non-Adhesive' | 'N/A';
  backingType: string;
  adhesionType: string;
  thicknessCategory: 'Ultra-Thin (< 0.1 mm)' | 'Standard (0.1 - 0.5 mm)' | 'Heavy / Foam (0.5 - 1.0 mm)' | 'Thick (> 1.0 mm)' | 'Unspecified';
  tempRange: 'Ultra-High Temp (≥ 200°C)' | 'High Temp (150 - 199°C)' | 'Medium Temp (80 - 149°C)' | 'Standard (< 80°C)' | 'Unspecified';
  attributesList: string[];
}

export function classifyProduct(product: {
  name: string;
  specs?: Record<string, string> | null;
  application?: string | null;
  market?: string | null;
  industry?: string | null;
}): ProductAttributes {
  const specs = product.specs || {};
  const nameLower = (product.name || '').toLowerCase();
  const appLower = (product.application || '').toLowerCase();
  const specsStr = Object.entries(specs).map(([k, v]) => `${k}: ${v}`).join(' ').toLowerCase();
  const combined = `${nameLower} ${appLower} ${specsStr} ${(product.market || '').toLowerCase()} ${(product.industry || '').toLowerCase()}`;

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
    nameLower.includes('cg324') || combined.includes('differential acrylic') ||
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
    nameLower.includes('7501') || nameLower.includes('scotch 23') || 
    nameLower.includes('scotch 130c')
  ) {
    sideType = 'Self-Amalgamating / Non-Adhesive';
  }

  // 3. Backing Material
  let backingType = 'Specialty Film / Base';
  const backingSpec = (specs['Backing material'] || specs['Backing'] || specs['Composition'] || specs['Conductor'] || '').toLowerCase();
  const searchBacking = `${backingSpec} ${combined}`;

  if (searchBacking.includes('kapton') || searchBacking.includes('polyimide')) {
    backingType = 'Polyimide / Kapton';
  } else if (searchBacking.includes('ptfe') || searchBacking.includes('teflon') || searchBacking.includes('nitoflon') || searchBacking.includes('fluoropolymer')) {
    backingType = 'PTFE / Fluoropolymer';
  } else if (searchBacking.includes('glass cloth') || searchBacking.includes('fiberglass') || searchBacking.includes('glass fabric') || searchBacking.includes('woven glass')) {
    backingType = 'Fiberglass / Glass Cloth';
  } else if (searchBacking.includes('aluminium') || searchBacking.includes('aluminum') || searchBacking.includes('copper foil') || searchBacking.includes('metal foil')) {
    backingType = 'Aluminum / Copper Foil';
  } else if (searchBacking.includes('acrylic foam') || searchBacking.includes('pe foam') || searchBacking.includes('polyurethane foam') || searchBacking.includes('pvc foam') || searchBacking.includes('foam')) {
    backingType = 'Foam (Acrylic / PE / PU)';
  } else if (searchBacking.includes('pet') || searchBacking.includes('polyester film') || searchBacking.includes('mylar')) {
    backingType = 'PET / Polyester Film';
  } else if (searchBacking.includes('pvc') || searchBacking.includes('vinyl') || searchBacking.includes('polyvinyl')) {
    backingType = 'PVC / Vinyl';
  } else if (searchBacking.includes('tissue') || searchBacking.includes('non-woven tissue') || searchBacking.includes('nonwoven')) {
    backingType = 'Tissue / Non-Woven';
  } else if (searchBacking.includes('cotton') || searchBacking.includes('rayon') || searchBacking.includes('acetate') || searchBacking.includes('fleece') || searchBacking.includes('cloth scrim')) {
    backingType = 'Cloth / Cotton / Rayon';
  } else if (searchBacking.includes('crepe') || searchBacking.includes('washi') || searchBacking.includes('paper')) {
    backingType = 'Paper / Crepe / Washi';
  } else if (searchBacking.includes('epdm') || searchBacking.includes('silicone rubber') || searchBacking.includes('epr')) {
    backingType = 'EPDM / Silicone Elastomer';
  } else if (sideType === 'Transfer (Unsupported)') {
    backingType = 'Unsupported (Adhesive Transfer)';
  } else if (productType === 'Adhesive & Sealant') {
    backingType = 'Liquid / Gel / Paste (No Backing)';
  } else if (productType === 'Cable & Wire') {
    backingType = 'Copper / Aluminium Conductor';
  }

  // 4. Adhesion Chemistry
  let adhesionType = 'Specialty Adhesive';
  const adhesiveSpec = (specs['Adhesive type'] || specs['Adhesive'] || specs['Chemical Type'] || '').toLowerCase();
  const searchAdhesive = `${adhesiveSpec} ${combined}`;

  if (searchAdhesive.includes('silicone') || searchAdhesive.includes('polysiloxane')) {
    adhesionType = 'Silicone / Polysiloxane';
  } else if (searchAdhesive.includes('anaerobic') || searchAdhesive.includes('dimethacrylate')) {
    adhesionType = 'Anaerobic (Dimethacrylate)';
  } else if (searchAdhesive.includes('cyanoacrylate') || searchAdhesive.includes('instant adhesive')) {
    adhesionType = 'Cyanoacrylate (Instant)';
  } else if (searchAdhesive.includes('acrylic') || searchAdhesive.includes('300lse') || searchAdhesive.includes('200mp') || searchAdhesive.includes('vhb')) {
    adhesionType = 'Acrylic (Solvent / Pure)';
  } else if (searchAdhesive.includes('rubber') || searchAdhesive.includes('hot melt') || searchAdhesive.includes('resin')) {
    adhesionType = 'Rubber / Synthetic Resin';
  } else if (searchAdhesive.includes('non-adhesive') || searchAdhesive.includes('self-fusing') || searchAdhesive.includes('self-amalgamating')) {
    adhesionType = 'Self-Fusing / Non-Adhesive';
  }

  // 5. Thickness / Size Category
  let thicknessCategory: ProductAttributes['thicknessCategory'] = 'Unspecified';
  const thickSpec = (specs['Total thickness'] || specs['Thickness'] || '').toLowerCase();
  const numMatch = thickSpec.match(/([0-9.]+)\s*(mm|mil|micron|µm)/i) || combined.match(/([0-9.]+)\s*(mm|mil|micron|µm)/i);

  if (numMatch) {
    let mm = parseFloat(numMatch[1]);
    const unit = numMatch[2].toLowerCase();
    if (unit === 'mil') mm = mm * 0.0254;
    else if (unit === 'micron' || unit === 'µm') mm = mm / 1000;

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

  const tempMatch = searchTemp.match(/(?:up to|to|-)?\s*([0-9]{2,3})\s*°\s*c/i) || searchTemp.match(/class\s*([a-z0-9]+)/i);

  if (searchTemp.includes('260°c') || searchTemp.includes('250°c') || searchTemp.includes('240°c') || searchTemp.includes('230°c') || searchTemp.includes('220°c') || searchTemp.includes('204°c') || searchTemp.includes('200°c') || searchTemp.includes('class c') || searchTemp.includes('class n') || searchTemp.includes('class 200')) {
    tempRange = 'Ultra-High Temp (≥ 200°C)';
  } else if (searchTemp.includes('180°c') || searchTemp.includes('160°c') || searchTemp.includes('150°c') || searchTemp.includes('155°c') || searchTemp.includes('class h') || searchTemp.includes('class f')) {
    tempRange = 'High Temp (150 - 199°C)';
  } else if (searchTemp.includes('149°c') || searchTemp.includes('140°c') || searchTemp.includes('130°c') || searchTemp.includes('120°c') || searchTemp.includes('110°c') || searchTemp.includes('105°c') || searchTemp.includes('100°c') || searchTemp.includes('90°c') || searchTemp.includes('80°c') || searchTemp.includes('class b')) {
    tempRange = 'Medium Temp (80 - 149°C)';
  } else if (searchTemp.includes('70°c') || searchTemp.includes('65°c') || searchTemp.includes('60°c') || searchTemp.includes('class y') || searchTemp.includes('class a')) {
    tempRange = 'Standard (< 80°C)';
  }

  const attributesList: string[] = [
    productType,
    sideType !== 'N/A' ? sideType : '',
    backingType,
    adhesionType,
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
    attributesList
  };
}

export const KNOWN_FILTER_OPTIONS = {
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
