/**
 * Intelligent Industrial Product Image Resolver
 * 
 * Maps industrial catalog items, raw materials, electrical equipment,
 * precision die-cuts, and technical adhesives to authentic studio photography.
 * Prevents non-tape industrial goods from ever defaulting to tape rolls.
 */

export interface ProductImageInput {
  name?: string;
  imageUrl?: string;
  industry?: string;
  market?: string;
  application?: string;
  specs?: Record<string, any>;
  classification?: {
    productType?: string;
    backingType?: string;
    adhesionType?: string;
    attributesList?: string[];
  };
}

export function getGeneralProductImage(product?: ProductImageInput | null): string {
  if (!product) {
    return "/images/products/general-industrial.jpg";
  }

  // 1. If product has a genuine image URL, check if it's an authentic photo rather than a logo
  if (product.imageUrl && typeof product.imageUrl === "string") {
    const url = product.imageUrl.trim();
    const urlLower = url.toLowerCase();

    // Direct local images
    if (url.startsWith("/images/products/")) {
      return url;
    }

    // Filter out corporate logos, icons, placeholders, and favicons
    const isLogoOrPlaceholder = 
      urlLower.includes("logo") ||
      urlLower.includes("icon") ||
      urlLower.includes("favicon") ||
      urlLower.includes("placeholder") ||
      urlLower.includes("cropped-") ||
      urlLower.includes("default");

    if (!isLogoOrPlaceholder && (url.startsWith("http://") || url.startsWith("https://"))) {
      return url;
    }
  }

  // 2. Synthesize comprehensive search text across all technical attributes
  const name = (product.name || "").toLowerCase();
  const industry = (product.industry || "").toLowerCase();
  const market = (product.market || "").toLowerCase();
  const app = (product.application || "").toLowerCase();
  const backing = (product.classification?.backingType || "").toLowerCase();
  const productType = (product.classification?.productType || "").toLowerCase();
  const specsStr = product.specs ? JSON.stringify(product.specs).toLowerCase() : "";

  const text = `${name} ${industry} ${market} ${app} ${backing} ${productType} ${specsStr}`;

  // 3. Raw Resins & Chemical Precursors
  if (
    text.includes("resin") ||
    text.includes("chemical") ||
    text.includes("silicone psa") ||
    text.includes("monomer") ||
    text.includes("polymer") ||
    text.includes("precursor") ||
    text.includes("fluorosilicone") ||
    text.includes("primer") ||
    text.includes("liquid") ||
    text.includes("fluid") ||
    text.includes("adhesive compound") ||
    text.includes("dispersion") ||
    text.includes("polyurethane resin") ||
    text.includes("epoxy resin") ||
    text.includes("hardener") ||
    text.includes("solventless") ||
    text.includes("catalyst") ||
    text.includes("raw material")
  ) {
    return "/images/products/industrial-resin.jpg";
  }

  // 4. Precision Die-Cuts, Gaskets, Seals & Converted Parts
  if (
    text.includes("die-cut") ||
    text.includes("diecut") ||
    text.includes("gasket") ||
    text.includes("seal") ||
    text.includes("o-ring") ||
    text.includes("oring") ||
    text.includes("washer") ||
    text.includes("spacer") ||
    text.includes("shim") ||
    text.includes("stamping") ||
    text.includes("converted") ||
    text.includes("epdm") ||
    text.includes("rubber") ||
    text.includes("poron") ||
    text.includes("neoprene") ||
    text.includes("kiss-cut") ||
    text.includes("flange gasket") ||
    text.includes("stamped")
  ) {
    return "/images/products/diecut-gaskets.jpg";
  }

  // 5. Thermal Interface Materials (TIM), Heat Spreaders & Gap Pads
  if (
    text.includes("thermal pad") ||
    text.includes("gap pad") ||
    text.includes("tim") ||
    text.includes("thermal interface") ||
    text.includes("heat sink") ||
    text.includes("heatsink") ||
    text.includes("graphite sheet") ||
    text.includes("thermal conductivity") ||
    text.includes("thermal conductive") ||
    text.includes("gap filler") ||
    text.includes("heat spreader")
  ) {
    return "/images/products/thermal-pad.jpg";
  }

  // 6. Electrical Machinery, Power Equipment, Switchgear & Instruments
  if (
    text.includes("transformer") ||
    text.includes("switchgear") ||
    text.includes("breaker") ||
    text.includes("substation") ||
    text.includes("switchboard") ||
    text.includes("panel") ||
    text.includes("relay") ||
    text.includes("inverter") ||
    text.includes("rectifier") ||
    text.includes("ups") ||
    text.includes("generator") ||
    text.includes("motor") ||
    text.includes("contactor") ||
    text.includes("isolator") ||
    text.includes("monitoring system") ||
    text.includes("gas analyzer") ||
    text.includes("earth fault") ||
    text.includes("arrester") ||
    text.includes("bushing") ||
    text.includes("cable joint") ||
    text.includes("termination") ||
    text.includes("busbar") ||
    text.includes("cpri") ||
    text.includes("high voltage") ||
    text.includes("distribution") ||
    text.includes("power equipment") ||
    text.includes("transducer") ||
    text.includes("feeder") ||
    text.includes("meter")
  ) {
    return "/images/products/electrical-equipment.jpg";
  }

  // 7. Technical Adhesive Tapes (Categorized by backing/chemistry)
  const isTapeItem = 
    text.includes("tape") || 
    text.includes("film") || 
    text.includes("foil") || 
    text.includes("roll") || 
    text.includes("masking") || 
    text.includes("kapton") || 
    text.includes("vhb") || 
    text.includes("adhesive sheet");

  if (isTapeItem) {
    if (text.includes("polyimide") || text.includes("kapton")) {
      return "/images/products/polyimide-tape.jpg";
    }
    if (text.includes("foam") || text.includes("vhb") || text.includes("acrylic foam") || text.includes("mounting")) {
      return "/images/products/vhb-foam-tape.jpg";
    }
    if (text.includes("green") || text.includes("powder coating") || text.includes("anodizing")) {
      return "/images/products/green-masking-tape.jpg";
    }
    if (text.includes("copper") || text.includes("aluminum") || text.includes("aluminium") || text.includes("emi") || text.includes("shielding")) {
      return "/images/products/copper-foil-tape.jpg";
    }
    if (text.includes("harness") || text.includes("fleece") || text.includes("felt") || text.includes("coroplast")) {
      return "/images/products/wire-harness-tape.jpg";
    }
    if (text.includes("crepe") || text.includes("paper masking") || text.includes("painter") || text.includes("abro")) {
      return "/images/products/crepe-masking-tape.jpg";
    }
    if (text.includes("fiberglass") || text.includes("glass cloth") || text.includes("mica")) {
      return "/images/products/fiberglass-tape.jpg";
    }
    if (text.includes("pvc") || text.includes("vinyl") || text.includes("steelgrip")) {
      return "/images/products/electrical-pvc-tape.jpg";
    }
    // Generic tape fallback
    return "/images/products/polyimide-tape.jpg";
  }

  // 8. General Industrial Components Fallback (Hardware, parts, machinery, tooling, fasteners)
  return "/images/products/general-industrial.jpg";
}
