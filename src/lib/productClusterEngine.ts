import { ExtractedProductItem } from './deepProductHarvester';

export interface UnderlyingManufacturer {
  companyName: string;
  companyUrl?: string;
  productUrl?: string;
  originalSku: string;
  price?: string;
  location?: string;
}

export interface UnifiedGroupProduct {
  id: string;                    // The unique group serial code, e.g. "NX-KAP-SIL-0050-T260-G841"
  serialCode: string;            // The unique group serial code
  name: string;                  // Unified professional specification title
  companyName: string;           // "Verified Manufacturing Network" or Origin cluster
  companyUrl?: string;
  productUrl?: string;
  industry: string;
  market: string;
  application: string;
  price: string;                 // Benchmark catalog procurement price
  specs: Record<string, string>; // Unified technical specification matrix
  imageUrl?: string;
  createdAt: string;
  classification?: any;
  underlyingManufacturers?: UnderlyingManufacturer[]; // Kept for backend RFQ routing only
}

/**
 * Normalizes category code (3-4 uppercase characters)
 */
function extractCategoryCode(name: string, backing: string, app: string): { code: string; title: string } {
  const combined = `${name} ${backing} ${app}`.toLowerCase();

  if (combined.includes('kapton') || combined.includes('polyimide')) {
    return { code: 'KAP', title: 'Ultra-High Temperature Polyimide (Kapton) Tape' };
  }
  if (combined.includes('mica')) {
    return { code: 'MIC', title: 'High Voltage Calcined Mica Insulation Tape' };
  }
  if (combined.includes('fiberglass') || combined.includes('glass cloth')) {
    return { code: 'GLS', title: 'Woven E-Glass Fiberglass Electrical Binding Tape' };
  }
  if (combined.includes('acrylic foam') || combined.includes('vhb') || combined.includes('structural foam')) {
    return { code: 'VHB', title: 'High Strength Structural Acrylic Foam Tape' };
  }
  if (combined.includes('crepe') || combined.includes('masking') || combined.includes('washi')) {
    return { code: 'MSK', title: 'High-Bake Precision Masking Tape' };
  }
  if (combined.includes('pvc') || combined.includes('vinyl') || combined.includes('insulation tape')) {
    return { code: 'PVC', title: 'Flame Retardant Heavy Duty PVC Electrical Tape' };
  }
  if (combined.includes('aluminum foil') || combined.includes('foil tape') || combined.includes('copper foil')) {
    return { code: 'ALU', title: 'Reinforced Aluminum Foil Radiant Barrier Tape' };
  }
  if (combined.includes('filament') || combined.includes('cross weave') || combined.includes('strapping')) {
    return { code: 'FIL', title: 'Cross Weave Bi-Directional High Tensile Filament Tape' };
  }
  if (combined.includes('tissue') || combined.includes('non-woven') || combined.includes('double sided tissue')) {
    return { code: 'DST', title: 'Double Sided Non-Woven Pure Acrylic Tissue Tape' };
  }
  if (combined.includes('pe foam') || combined.includes('ixpe') || combined.includes('eva')) {
    return { code: 'PEF', title: 'Double Sided Closed-Cell PE Foam Mounting Tape' };
  }
  if (combined.includes('graphite') || combined.includes('thermal interface') || combined.includes('conductive')) {
    return { code: 'THM', title: 'High Thermal Conductivity Interface Tape' };
  }
  if (combined.includes('cloth duct') || combined.includes('gaffer') || combined.includes('duct tape')) {
    return { code: 'DCT', title: 'Heavy Duty Poly-Coated Cloth Duct Tape' };
  }
  if (combined.includes('bopp') || combined.includes('carton sealing') || combined.includes('packaging tape')) {
    return { code: 'BOP', title: 'Industrial Grade High Tack BOPP Packaging Tape' };
  }
  if (combined.includes('nomex') || combined.includes('aramid')) {
    return { code: 'NOM', title: 'Nomex Aramid Electrical Insulation Tape' };
  }
  if (combined.includes('transfer') || combined.includes('free film') || combined.includes('adhesive transfer')) {
    return { code: 'TRF', title: 'Free Film Unsupported Adhesive Transfer Tape' };
  }
  if (combined.includes('anti-slip') || combined.includes('glow') || combined.includes('egress')) {
    return { code: 'SAF', title: 'Industrial Heavy Duty Anti-Slip Safety Tape' };
  }
  if (combined.includes('optically clear') || combined.includes('oca') || combined.includes('acf')) {
    return { code: 'OPT', title: 'Optically Clear Display Grade Adhesive Film' };
  }

  return { code: 'IND', title: 'Specialty High Performance Industrial Tape' };
}

/**
 * Normalizes adhesive chemistry code (3 uppercase characters)
 */
function extractAdhesiveCode(adhesive: string, specs: Record<string, string>): string {
  const combined = `${adhesive} ${JSON.stringify(specs)}`.toLowerCase();

  if (combined.includes('silicone') || combined.includes('polysiloxane')) return 'SIL';
  if (combined.includes('solvent acrylic') || combined.includes('pure acrylic') || combined.includes('acrylic')) return 'ACR';
  if (combined.includes('hot melt') || combined.includes('synthetic rubber')) return 'HMR';
  if (combined.includes('natural rubber') || combined.includes('rubber')) return 'RUB';
  if (combined.includes('epoxy')) return 'EPO';
  if (combined.includes('self-fusing') || combined.includes('amalgamating') || combined.includes('epr')) return 'EPR';
  if (combined.includes('water-based') || combined.includes('emulsion')) return 'EML';

  return 'GEN';
}

/**
 * Normalizes thickness into 4-digit micron string (e.g. 0.05 mm -> "0050", 1.1 mm -> "1100")
 */
function extractThicknessMicrons(thicknessStr: string, name: string): string {
  const match = (thicknessStr || name).match(/(\d+(?:\.\d+)?)\s*(?:mm|µm|um|micron|mil)/i);
  if (!match) return '0100';

  const val = parseFloat(match[1]);
  const isMicron = /µm|um|micron/i.test(match[0]);
  const isMil = /mil/i.test(match[0]);

  let microns = 100;
  if (isMicron) {
    microns = Math.round(val);
  } else if (isMil) {
    microns = Math.round(val * 25.4);
  } else {
    // mm
    microns = Math.round(val * 1000);
  }

  // Normalize into standard industrial bins (e.g. 35, 50, 60, 80, 100, 130, 150, 200, 500, 800, 1100, 1500, 2000, 3000)
  const bins = [15, 20, 25, 35, 50, 60, 75, 80, 90, 100, 120, 130, 140, 150, 180, 200, 220, 250, 280, 300, 500, 640, 800, 1000, 1100, 1500, 2000, 3000];
  let closest = bins[0];
  let minDiff = Math.abs(microns - bins[0]);
  for (const b of bins) {
    const diff = Math.abs(microns - b);
    if (diff < minDiff) {
      minDiff = diff;
      closest = b;
    }
  }

  return String(closest).padStart(4, '0');
}

/**
 * Normalizes temperature code (e.g. 260°C -> "T260", 150°C -> "T150", 80°C -> "T080")
 */
function extractTempCode(tempStr: string, name: string): string {
  const match = (tempStr || name).match(/(\d+)\s*°C/i);
  if (!match) return 'T100';

  const t = parseInt(match[1], 10);
  if (t >= 250) return 'T260';
  if (t >= 180) return 'T200';
  if (t >= 140) return 'T150';
  if (t >= 100) return 'T110';
  if (t >= 75) return 'T080';
  return 'T060';
}

/**
 * Computes deterministic 3-character group hash
 */
function computeGroupHash(key: string): string {
  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    hash = (hash << 5) - hash + key.charCodeAt(i);
    hash |= 0;
  }
  const abs = Math.abs(hash);
  const num = (abs % 900) + 100; // 3-digit number between 100 and 999
  return `G${num}`;
}

/**
 * Groups an array of products into unified specification clusters.
 * Each cluster receives a unique Group Serial Code generated with a strict pattern.
 * The user sees ONLY 1 unified product per specification group.
 */
export function clusterProducts(products: any[]): UnifiedGroupProduct[] {
  const clusterMap = new Map<string, {
    catInfo: { code: string; title: string };
    adhCode: string;
    thickCode: string;
    tempCode: string;
    representativeProduct: any;
    allProducts: any[];
    backingName: string;
    adhesiveName: string;
    thicknessName: string;
    tempName: string;
  }>();

  for (const p of products) {
    const specs = (p.specs && typeof p.specs === 'object') ? p.specs : {};
    const name = p.name || '';
    const backing = specs['Backing material'] || specs['Carrier'] || specs['Composition'] || '';
    const adhesive = specs['Adhesive type'] || specs['Adhesive'] || specs['Binder'] || '';
    const thickness = specs['Total thickness'] || specs['Thickness'] || '';
    const temp = specs['Temperature resistance'] || specs['Temperature'] || '';
    const app = p.application || '';

    const catInfo = extractCategoryCode(name, backing, app);
    const adhCode = extractAdhesiveCode(adhesive, specs);
    const thickCode = extractThicknessMicrons(thickness, name);
    const tempCode = extractTempCode(temp, name);

    // Grouping Key (Same physical spec profile)
    const clusterKey = `${catInfo.code}-${adhCode}-${thickCode}-${tempCode}`;

    if (!clusterMap.has(clusterKey)) {
      clusterMap.set(clusterKey, {
        catInfo,
        adhCode,
        thickCode,
        tempCode,
        representativeProduct: p,
        allProducts: [p],
        backingName: backing || 'Standard Industrial Grade Carrier',
        adhesiveName: adhesive || 'High Performance Pressure-Sensitive Adhesive',
        thicknessName: `${(parseInt(thickCode, 10) / 1000).toFixed(2)} mm (${parseInt(thickCode, 10)} µm)`,
        tempName: temp || `${tempCode.replace('T', '')}°C Rated`
      });
    } else {
      const existing = clusterMap.get(clusterKey)!;
      existing.allProducts.push(p);
    }
  }

  // Convert clusters into single unified product offerings
  const unifiedProducts: UnifiedGroupProduct[] = [];

  for (const [clusterKey, data] of clusterMap.entries()) {
    const groupHash = computeGroupHash(clusterKey);
    // Unique Pattern-based Group Serial Code: TAR-[Category]-[Adhesive]-[ThicknessMicrons]-[TempCode]-[GroupHash]
    const groupSerialCode = `TAR-${data.catInfo.code}-${data.adhCode}-${data.thickCode}-${data.tempCode}-${groupHash}`;
    const rep = data.representativeProduct;

    // Pick best/benchmark indicative price
    let bestPriceStr = rep.price || rep.specs?.['Indicative Price'] || rep.specs?.['Price'] || '';
    if (!bestPriceStr) {
      for (const prod of data.allProducts) {
        if (prod.price) {
          bestPriceStr = prod.price;
          break;
        }
      }
    }
    if (!bestPriceStr) {
      bestPriceStr = '₹120.00 / roll ($1.50)';
    }

    // Consolidated unified specifications
    const unifiedSpecs: Record<string, string> = {
      "Group Serial Code": groupSerialCode,
      "Backing material": data.backingName,
      "Adhesive type": data.adhesiveName,
      "Total thickness": data.thicknessName,
      "Temperature resistance": data.tempName,
      "Catalog Price": bestPriceStr,
      "Adhesion to Steel": rep.specs?.['Adhesion to Steel'] || '28.0 N/25mm',
      "Tensile Strength": rep.specs?.['Tensile Strength'] || '55.0 N/cm',
      "Quality Standard": 'ISO 9001 / IATF 16949 / RoHS Compliant'
    };

    // Underlying manufacturer metadata (for background RFQ dispatch only)
    const underlyingManufacturers: UnderlyingManufacturer[] = data.allProducts.map(p => ({
      companyName: p.companyName || 'Verified Manufacturer',
      companyUrl: p.companyUrl,
      productUrl: p.productUrl,
      originalSku: p.name,
      price: p.price || p.specs?.['Indicative Price'],
      location: p.classification?.location || (p.companyName?.includes('China') || p.companyName?.includes('Co., Ltd') ? 'China' : 'India')
    }));

    const formattedThickness = (parseInt(data.thickCode, 10) / 1000).toFixed(2);
    const unifiedTitle = `${data.catInfo.title} (${formattedThickness} mm / ${data.adhCode === 'SIL' ? 'Silicone' : data.adhCode === 'ACR' ? 'Acrylic' : data.adhCode === 'RUB' ? 'Natural Rubber' : 'High Tack'} / ${data.tempCode.replace('T', '')}°C)`;

    unifiedProducts.push({
      id: groupSerialCode,
      serialCode: groupSerialCode,
      name: unifiedTitle,
      companyName: "Nexus Direct Procurement Consortium",
      companyUrl: rep.companyUrl,
      productUrl: rep.productUrl,
      industry: rep.industry || "Specialty Adhesive Tapes & Industrial Solutions",
      market: rep.market || "Automotive, Electronics & Industrial Manufacturing",
      application: rep.application || `Engineered for demanding industrial applications requiring precision ${data.backingName} and ${data.adhesiveName}.`,
      price: bestPriceStr,
      specs: unifiedSpecs,
      imageUrl: rep.imageUrl,
      createdAt: rep.createdAt || new Date().toISOString(),
      classification: rep.classification,
      underlyingManufacturers
    });
  }

  // Sort deterministically by serial code
  unifiedProducts.sort((a, b) => a.serialCode.localeCompare(b.serialCode));

  return unifiedProducts;
}