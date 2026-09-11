import { ExtractedProductItem } from './deepProductHarvester';

export const ENTERPRISE_CATALOGS: Record<string, ExtractedProductItem[]> = {
  'Tesa': [
    {
      name: 'tesa 4965 Original Double-Sided Film Tape',
      industry: 'Specialty Adhesive Tapes & Industrial Solutions',
      market: 'Automotive & Electronics',
      application: 'Mounting of ABS Plastic Parts, Rubber Profiles & Touch Panels',
      specs: {
        'Backing material': 'PET Film (Polyester)',
        'Adhesive type': 'Tackified Acrylic',
        'Total thickness': '0.205 mm (205 micron)',
        'Temperature resistance': '-40°C to 100°C (Short Term 200°C)',
        'Adhesion to Steel': '11.5 N/cm',
        'Tensile strength': '20 N/cm',
        'Color': 'Transparent with Red MOPP Liner'
      },
      imageUrl: 'https://www.tesa.com/images/4965.jpg',
      productUrl: 'https://www.tesa.com/en/industry/tesa-4965.html'
    },
    {
      name: 'tesa ACXplus 7055 High Transparency Acrylic Foam Tape',
      industry: 'Specialty Adhesive Tapes & Industrial Solutions',
      market: 'Building Components & Electronics',
      application: 'Invisible Structural Bonding of Glass, Acrylic & Polycarbonate',
      specs: {
        'Backing material': 'Solid Pure Acrylic Core',
        'Adhesive type': 'Pure Acrylic',
        'Total thickness': '1.0 mm (1000 micron)',
        'Temperature resistance': '-40°C to 100°C (Short Term 200°C)',
        'Adhesion to Steel': '32 N/cm',
        'Tensile strength': '750 kPa',
        'Color': 'High Transparency (Glass Clear)'
      },
      imageUrl: 'https://www.tesa.com/images/7055.jpg',
      productUrl: 'https://www.tesa.com/en/industry/tesa-acxplus-7055.html'
    },
    {
      name: 'tesa 51608 PET Fleece Wire Harness Tape',
      industry: 'Specialty Adhesive Tapes & Industrial Solutions',
      market: 'Automotive & Wire Harness',
      application: 'Automotive Passenger Compartment Cable Bundling & Noise Damping',
      specs: {
        'Backing material': 'PET Fleece',
        'Adhesive type': 'Rubber Based Adhesive',
        'Total thickness': '0.28 mm (280 micron)',
        'Temperature resistance': '-40°C to 105°C (Class B)',
        'Noise Damping (LV312)': 'Class C (Damping > 5 dB)',
        'Abrasion Resistance': 'Class B',
        'Color': 'Black'
      },
      imageUrl: 'https://www.tesa.com/images/51608.jpg',
      productUrl: 'https://www.tesa.com/en/industry/tesa-51608.html'
    },
    {
      name: 'tesa 4334 Precision Masking Tape',
      industry: 'Specialty Adhesive Tapes & Industrial Solutions',
      market: 'Industrial Surface Processing & Painting',
      application: 'Razor-Sharp Paint Edges on Sensitive Surfaces up to 5 Months Outdoor UV',
      specs: {
        'Backing material': 'Washi Paper (Extra Thin Japanese Rice Paper)',
        'Adhesive type': 'Acrylic Adhesive',
        'Total thickness': '0.09 mm (90 micron)',
        'Temperature resistance': 'Up to 120°C for 30 min (150°C Short Term)',
        'Adhesion to Steel': '1.85 N/cm',
        'Clean Removal': 'Up to 5 months outdoor UV resistance',
        'Color': 'Yellow'
      },
      imageUrl: 'https://www.tesa.com/images/4334.jpg',
      productUrl: 'https://www.tesa.com/en/industry/tesa-4334.html'
    },
    {
      name: 'tesa 4651 Premium Acrylic Coated Cloth Tape',
      industry: 'Specialty Adhesive Tapes & Industrial Solutions',
      market: 'Industrial Logistics & Aerospace',
      application: 'High Tensile Bundling, Masking Sandblasting & Pipe Sealing',
      specs: {
        'Backing material': 'Acrylic Coated Woven Rayon Cloth (148 mesh)',
        'Adhesive type': 'Natural Rubber Adhesive',
        'Total thickness': '0.31 mm (310 micron)',
        'Temperature resistance': 'Up to 130°C for 30 min',
        'Adhesion to Steel': '3.3 N/cm',
        'Tensile strength': '100 N/cm',
        'Color': 'Black / White / Yellow / Blue / Red / Green / Silver'
      },
      imageUrl: 'https://www.tesa.com/images/4651.jpg',
      productUrl: 'https://www.tesa.com/en/industry/tesa-4651.html'
    },
    {
      name: 'tesa 60650 Heavy Duty Aluminum Foil Tape',
      industry: 'Specialty Adhesive Tapes & Industrial Solutions',
      market: 'HVAC & Appliance Thermal Sealing',
      application: 'Thermal Insulation, Moisture Barrier & Refrigerator Pipe Attachment',
      specs: {
        'Backing material': 'Pure Aluminum Foil (50 micron)',
        'Adhesive type': 'Transparent Acrylic Adhesive',
        'Total thickness': '0.09 mm (90 micron)',
        'Temperature resistance': '-40°C to 160°C',
        'Flame Retardancy': 'DIN 4102-B1 & UL 510A',
        'Adhesion to Steel': '6.0 N/cm',
        'Color': 'Silver'
      },
      imageUrl: 'https://www.tesa.com/images/60650.jpg',
      productUrl: 'https://www.tesa.com/en/industry/tesa-60650.html'
    }
  ],
  'Sri Vasavi Tapes': [
    {
      name: 'Sri Vasavi Kapton Polyimide High Temp Tape (SV-301)',
      industry: 'Specialty Adhesive Tapes & Industrial Solutions',
      market: 'Electronics & High-Tech',
      application: 'PCB Wave Soldering Masking & Transformer Coil High Temp Insulation',
      specs: {
        'Backing material': 'Kapton Polyimide Film (1.0 mil / 25 micron)',
        'Adhesive type': 'Crosslinked Silicone Adhesive',
        'Total thickness': '0.06 mm (60 micron)',
        'Temperature resistance': '-73°C to 260°C (Class H)',
        'Dielectric Breakdown Voltage': '6500 Volts (6.5 kV)',
        'Adhesion to Steel': '6.0 N/25mm',
        'Color': 'Amber'
      },
      imageUrl: 'https://www.srivasavitapes.com/images/sv301.jpg',
      productUrl: 'https://www.srivasavitapes.com/polyimide-tape/'
    },
    {
      name: 'Sri Vasavi Double Sided Polyester Film Tape (SV-202)',
      industry: 'Specialty Adhesive Tapes & Industrial Solutions',
      market: 'Electronics & Converters',
      application: 'Membrane Switch Attachment, Nameplate Fixation & Touch Panel Lamination',
      specs: {
        'Backing material': 'Polyester (PET) Carrier',
        'Adhesive type': 'Modified Solvent Acrylic Adhesive',
        'Total thickness': '0.12 mm (120 micron)',
        'Temperature resistance': '-40°C to 150°C',
        'Adhesion to Steel': '18 N/25mm',
        'Color': 'Transparent with Red PE Liner'
      },
      imageUrl: 'https://www.srivasavitapes.com/images/sv202.jpg',
      productUrl: 'https://www.srivasavitapes.com/double-sided-tape/'
    },
    {
      name: 'Sri Vasavi Glass Cloth High Temp Electrical Tape (SV-401)',
      industry: 'Specialty Adhesive Tapes & Industrial Solutions',
      market: 'Electrical & Industrial Utilities',
      application: 'Transformer Motor Lead Insulation & Plasma Spray Masking',
      specs: {
        'Backing material': 'Woven Electrical Grade Fiberglass Cloth',
        'Adhesive type': 'Thermosetting Silicone Adhesive',
        'Total thickness': '0.18 mm (180 micron)',
        'Temperature resistance': 'Up to 200°C (Class N)',
        'Dielectric Breakdown Voltage': '4000 Volts',
        'Tensile strength': '350 N/25mm',
        'Color': 'White'
      },
      imageUrl: 'https://www.srivasavitapes.com/images/sv401.jpg',
      productUrl: 'https://www.srivasavitapes.com/glass-cloth-tape/'
    }
  ],
  '3M': [
    {
      name: '3M VHB Tape 4910',
      industry: 'Specialty Adhesive Tapes & Industrial Solutions',
      market: 'Automotive & Electronics',
      application: 'High Strength Transparent Structural Bonding',
      specs: {
        'Backing material': 'Solid Acrylic Foam (Clear)',
        'Adhesive type': 'General Purpose Acrylic',
        'Total thickness': '1.0 mm (40 mil)',
        'Temperature resistance': '-40°C to 149°C',
        'Adhesion to Steel': '26 N/cm',
        'Tensile strength': '690 kPa',
        'Elongation at break': '300%',
        'Color': 'Clear / Transparent'
      },
      imageUrl: 'https://multimedia.3m.com/mws/media/66418P/3mtm-vhbtm-tape-4910.jpg',
      productUrl: 'https://www.3m.com/3M/en_US/p/d/b40065688/'
    },
    {
      name: '3M VHB Tape 4950',
      industry: 'Specialty Adhesive Tapes & Industrial Solutions',
      market: 'Building Components & Industrial Solutions',
      application: 'High Strength Permanent Fastening & Body Panel Attachment',
      specs: {
        'Backing material': 'Closed-cell Acrylic Foam',
        'Adhesive type': 'Firm Acrylic',
        'Total thickness': '1.1 mm (45 mil)',
        'Temperature resistance': '-40°C to 150°C',
        'Adhesion to Steel': '44 N/cm',
        'Tensile strength': '970 kPa',
        'Color': 'White'
      },
      imageUrl: 'https://multimedia.3m.com/mws/media/66420P/3mtm-vhbtm-tape-4950.jpg',
      productUrl: 'https://www.3m.com/3M/en_US/p/d/b40065691/'
    },
    {
      name: '3M VHB Tape 5952',
      industry: 'Specialty Adhesive Tapes & Industrial Solutions',
      market: 'Automotive & Industrial Solutions',
      application: 'Powder-Coated Surfaces & Medium-to-Low Surface Energy Plastics',
      specs: {
        'Backing material': 'Conformable Acrylic Foam',
        'Adhesive type': 'Modified Acrylic',
        'Total thickness': '1.1 mm (45 mil)',
        'Temperature resistance': '-40°C to 121°C',
        'Adhesion to Steel': '35 N/cm',
        'Tensile strength': '620 kPa',
        'Color': 'Black'
      },
      imageUrl: 'https://multimedia.3m.com/mws/media/66422P/3mtm-vhbtm-tape-5952.jpg',
      productUrl: 'https://www.3m.com/3M/en_US/p/d/b40065695/'
    },
    {
      name: '3M 467MP Adhesive Transfer Tape',
      industry: 'Specialty Adhesive Tapes & Industrial Solutions',
      market: 'Electronics & High-Tech',
      application: 'Graphic Overlay & Membrane Switch Attachment',
      specs: {
        'Backing material': 'Unsupported Adhesive Film',
        'Adhesive type': 'High Performance 200MP Acrylic',
        'Total thickness': '0.05 mm (2.0 mil)',
        'Temperature resistance': '-40°C to 204°C',
        'Adhesion to Steel': '15 N/cm',
        'Tensile strength': 'High Shear Strength',
        'Color': 'Clear'
      },
      imageUrl: 'https://multimedia.3m.com/mws/media/66424P/3mtm-adhesive-transfer-tape-467mp.jpg',
      productUrl: 'https://www.3m.com/3M/en_US/p/d/b40065700/'
    },
    {
      name: '3M 468MP Adhesive Transfer Tape',
      industry: 'Specialty Adhesive Tapes & Industrial Solutions',
      market: 'Electronics & High-Tech',
      application: 'Rough Surface Graphic Attachment & Industrial Nameplates',
      specs: {
        'Backing material': 'Unsupported Adhesive Film',
        'Adhesive type': 'High Performance 200MP Acrylic',
        'Total thickness': '0.13 mm (5.0 mil)',
        'Temperature resistance': '-40°C to 204°C',
        'Adhesion to Steel': '20 N/cm',
        'Color': 'Clear'
      },
      imageUrl: 'https://multimedia.3m.com/mws/media/66426P/3mtm-adhesive-transfer-tape-468mp.jpg',
      productUrl: 'https://www.3m.com/3M/en_US/p/d/b40065702/'
    },
    {
      name: '3M 9472LE Adhesive Transfer Tape (300LSE)',
      industry: 'Specialty Adhesive Tapes & Industrial Solutions',
      market: 'Electronics & Automotive',
      application: 'Low Surface Energy (LSE) Plastics & Polypropylene Bonding',
      specs: {
        'Backing material': 'High Strength Acrylic Transfer Film',
        'Adhesive type': '300LSE Low Surface Energy Acrylic',
        'Total thickness': '0.13 mm (5.0 mil)',
        'Temperature resistance': '-40°C to 149°C',
        'Adhesion to Steel': '32 N/cm',
        'Color': 'Clear'
      },
      imageUrl: 'https://multimedia.3m.com/mws/media/66428P/3mtm-300lse-tape-9472le.jpg',
      productUrl: 'https://www.3m.com/3M/en_US/p/d/b40065705/'
    },
    {
      name: '3M 9088 High Performance Double Coated Tape',
      industry: 'Specialty Adhesive Tapes & Industrial Solutions',
      market: 'Industrial Solutions',
      application: 'General Purpose Mounting, Plastic Extrusions & POS Displays',
      specs: {
        'Backing material': 'PET Film (Polyester)',
        'Adhesive type': 'Modified Acrylic',
        'Total thickness': '0.205 mm (8.1 mil)',
        'Temperature resistance': '-40°C to 150°C',
        'Adhesion to Steel': '28 N/cm',
        'Tensile strength': '50 N/cm',
        'Color': 'Transparent'
      },
      imageUrl: 'https://multimedia.3m.com/mws/media/66430P/3mtm-double-coated-tape-9088.jpg',
      productUrl: 'https://www.3m.com/3M/en_US/p/d/b40065710/'
    },
    {
      name: '3M 5413 Polyimide Film Tape (Kapton)',
      industry: 'Specialty Adhesive Tapes & Industrial Solutions',
      market: 'Electronics & High-Tech',
      application: 'High-Temperature Masking for Wave Soldering & PCB Assembly',
      specs: {
        'Backing material': 'Dupont Kapton Polyimide Film',
        'Adhesive type': 'High Temperature Silicone',
        'Total thickness': '0.07 mm (2.7 mil)',
        'Temperature resistance': '-73°C to 260°C',
        'Dielectric Breakdown Voltage': '7000 Volts',
        'Adhesion to Steel': '3.3 N/cm',
        'Tensile strength': '53 N/cm',
        'Color': 'Amber'
      },
      imageUrl: 'https://multimedia.3m.com/mws/media/66432P/3mtm-polyimide-tape-5413.jpg',
      productUrl: 'https://www.3m.com/3M/en_US/p/d/b40065715/'
    },
    {
      name: '3M 898 High Performance Filament Tape',
      industry: 'Specialty Adhesive Tapes & Industrial Solutions',
      market: 'Packaging & Logistics',
      application: 'Heavy Duty Metal Coil Tabbing & Bundling High Tensile Strength',
      specs: {
        'Backing material': 'Polypropylene Film Reinforced with Continuous Glass Filaments',
        'Adhesive type': 'Synthetic Rubber Resin',
        'Total thickness': '0.17 mm (6.6 mil)',
        'Temperature resistance': 'Up to 65°C',
        'Adhesion to Steel': '100 N/cm',
        'Tensile strength': '665 N/cm (380 lbs/in)',
        'Elongation at break': '5%',
        'Color': 'Clear with White Yarn'
      },
      imageUrl: 'https://multimedia.3m.com/mws/media/66434P/3mtm-filament-tape-898.jpg',
      productUrl: 'https://www.3m.com/3M/en_US/p/d/b40065720/'
    },
    {
      name: '3M 2090 ScotchBlue Multi-Surface Painter Tape',
      industry: 'Specialty Adhesive Tapes & Industrial Solutions',
      market: 'Building Components & Industrial Surface Processing',
      application: 'Clean Removal Painting Masking up to 14 Days UV Exposure',
      specs: {
        'Backing material': 'Crepe Paper',
        'Adhesive type': 'Synthetic Acrylic',
        'Total thickness': '0.13 mm (5.0 mil)',
        'Temperature resistance': 'Up to 93°C for 30 min',
        'Adhesion to Steel': '7.5 N/cm',
        'Tensile strength': '47 N/cm',
        'Color': 'Blue'
      },
      imageUrl: 'https://multimedia.3m.com/mws/media/66436P/3mtm-scotchblue-2090.jpg',
      productUrl: 'https://www.3m.com/3M/en_US/p/d/b40065725/'
    },
    {
      name: '3M Super 33+ Vinyl Electrical Tape',
      industry: 'Specialty Adhesive Tapes & Industrial Solutions',
      market: 'Electrical & Industrial Utilities',
      application: 'Primary Electrical Insulation up to 600V and Wire Jacketing',
      specs: {
        'Backing material': 'Polyvinyl Chloride (PVC)',
        'Adhesive type': 'Pressure Sensitive Rubber',
        'Total thickness': '0.177 mm (7.0 mil)',
        'Temperature resistance': '-18°C to 105°C',
        'Dielectric Breakdown Voltage': '8000 Volts (ASTM D1000)',
        'Adhesion to Steel': '3.0 N/cm',
        'Tensile strength': '26 N/cm',
        'Elongation at break': '250%',
        'Color': 'Black'
      },
      imageUrl: 'https://multimedia.3m.com/mws/media/66438P/3mtm-super-33plus-electrical-tape.jpg',
      productUrl: 'https://www.3m.com/3M/en_US/p/d/b40065730/'
    },
    {
      name: '3M 1181 Copper Foil Shielding Tape',
      industry: 'Specialty Adhesive Tapes & Industrial Solutions',
      market: 'Electronics & High-Tech',
      application: 'EMI/RFI Electromagnetic Shielding & Grounding',
      specs: {
        'Backing material': '1-Ounce Rolled Copper Foil',
        'Adhesive type': 'Electrically Conductive Acrylic',
        'Total thickness': '0.07 mm (2.6 mil)',
        'Temperature resistance': '-40°C to 130°C',
        'Electrical Resistance Through Adhesive': '0.005 Ohms',
        'Shielding Effectiveness': '>80 dB (100 MHz to 1 GHz)',
        'Color': 'Copper Metallic'
      },
      imageUrl: 'https://multimedia.3m.com/mws/media/66440P/3mtm-copper-foil-tape-1181.jpg',
      productUrl: 'https://www.3m.com/3M/en_US/p/d/b40065735/'
    },
    {
      name: '3M 8810 Thermally Conductive Adhesive Transfer Tape',
      industry: 'Specialty Adhesive Tapes & Industrial Solutions',
      market: 'Electronics & High-Tech',
      application: 'Heat Sink Thermal Dissipation for LED Lighting & IC Packaging',
      specs: {
        'Backing material': 'Ceramic-filled Adhesive Matrix',
        'Adhesive type': 'Thermally Conductive Acrylic',
        'Total thickness': '0.25 mm (10 mil)',
        'Thermal Conductivity': '0.60 W/m-K',
        'Dielectric Breakdown Voltage': '26 kV/mm',
        'Temperature resistance': '-40°C to 125°C',
        'Color': 'White'
      },
      imageUrl: 'https://multimedia.3m.com/mws/media/66442P/3mtm-thermally-conductive-tape-8810.jpg',
      productUrl: 'https://www.3m.com/3M/en_US/p/d/b40065740/'
    },
    {
      name: '3M Dual Lock Reclosable Fastener SJ3550',
      industry: 'Specialty Adhesive Tapes & Industrial Solutions',
      market: 'Automotive & Industrial Mounting',
      application: 'High Strength Reusable Blind Attachment (Type 250 Stems)',
      specs: {
        'Backing material': 'Polyolefin Mushroom Stem Matrix (250 stems/sq in)',
        'Adhesive type': 'White VHB Acrylic Foam Adhesive',
        'Total thickness': '5.7 mm (Engaged)',
        'Temperature resistance': '-29°C to 93°C',
        'Tensile Disengagement Strength': '220 kPa',
        'Color': 'Black'
      },
      imageUrl: 'https://multimedia.3m.com/mws/media/66444P/3mtm-dual-lock-sj3550.jpg',
      productUrl: 'https://www.3m.com/3M/en_US/p/d/b40065745/'
    },
    {
      name: '3M 3939 Heavy Duty Duct Tape',
      industry: 'Specialty Adhesive Tapes & Industrial Solutions',
      market: 'Industrial Solutions & Logistics',
      application: 'HVAC Sealing, Moisture Proofing & Industrial Splicing',
      specs: {
        'Backing material': 'Polyethylene Film over Cloth Scrim',
        'Adhesive type': 'High Tack Synthetic Rubber',
        'Total thickness': '0.22 mm (9.0 mil)',
        'Temperature resistance': 'Up to 93°C',
        'Adhesion to Steel': '60 N/100mm',
        'Tensile strength': '438 N/100mm',
        'Color': 'Silver'
      },
      imageUrl: 'https://multimedia.3m.com/mws/media/66446P/3mtm-duct-tape-3939.jpg',
      productUrl: 'https://www.3m.com/3M/en_US/p/d/b40065750/'
    },
    {
      name: '3M 471 Vinyl Floor and Safety Marking Tape',
      industry: 'Specialty Adhesive Tapes & Industrial Solutions',
      market: 'Industrial Surface Processing & Safety',
      application: 'Lane Marking, Hazard Warning & Chemical Resistant Protection',
      specs: {
        'Backing material': 'Conformable Pigmented Vinyl',
        'Adhesive type': 'Rubber Adhesive',
        'Total thickness': '0.13 mm (5.2 mil)',
        'Temperature resistance': '4°C to 77°C',
        'Adhesion to Steel': '2.5 N/cm',
        'Elongation at break': '130%',
        'Color': 'Yellow / Red / Blue / Green / White / Black'
      },
      imageUrl: 'https://multimedia.3m.com/mws/media/66448P/3mtm-vinyl-tape-471.jpg',
      productUrl: 'https://www.3m.com/3M/en_US/p/d/b40065755/'
    }
  ],

  'Nitto Denko': [
    {
      name: 'Nitto No. 500 Double-Coated Tape',
      industry: 'Specialty Adhesive Tapes & Industrial Solutions',
      market: 'Industrial Solutions & Appliances',
      application: 'Bonding of Metal Plates, Plastic Nameplates and Foam Materials',
      specs: {
        'Backing material': 'Non-Woven Fabric Tissue',
        'Adhesive type': 'Pressure Sensitive Acrylic',
        'Total thickness': '0.17 mm',
        'Temperature resistance': '-20°C to 100°C',
        'Adhesion to Steel': '15.5 N/20mm',
        'Color': 'Translucent'
      },
      imageUrl: 'https://www.nitto.com/us/en/Images/no500_img01.jpg',
      productUrl: 'https://www.nitto.com/us/en/products/double_coated/500/'
    },
    {
      name: 'Nitto No. 5000NS Re-peelable Non-Woven Tape',
      industry: 'Specialty Adhesive Tapes & Industrial Solutions',
      market: 'Electronics & Recycling Solutions',
      application: 'Recyclable Appliance Parts & Residue-Free Demounting',
      specs: {
        'Backing material': 'High Strength Non-Woven Matrix',
        'Adhesive type': 'Acrylic Adhesive (Zero Residue)',
        'Total thickness': '0.16 mm',
        'Temperature resistance': '-20°C to 90°C',
        'Adhesion to Steel': '14.0 N/20mm',
        'Color': 'White'
      },
      imageUrl: 'https://www.nitto.com/us/en/Images/5000ns_img01.jpg',
      productUrl: 'https://www.nitto.com/us/en/products/double_coated/5000ns/'
    },
    {
      name: 'Nitto 903UL Fluoroplastic PTFE Tape',
      industry: 'Specialty Adhesive Tapes & Industrial Solutions',
      market: 'Industrial Solutions & Heat Sealing',
      application: 'Heat Sealing Machine Packaging & Anti-Friction Sliding Guide',
      specs: {
        'Backing material': 'Teflon PTFE Film',
        'Adhesive type': 'Heat Resistant Silicone',
        'Total thickness': '0.08 mm',
        'Temperature resistance': '-60°C to 200°C',
        'Dielectric Breakdown Voltage': '9.0 kV',
        'Tensile strength': '58 N/19mm',
        'Color': 'Grayish Brown'
      },
      imageUrl: 'https://www.nitto.com/us/en/Images/903ul_img01.jpg',
      productUrl: 'https://www.nitto.com/us/en/products/fluoroplastic/903ul/'
    },
    {
      name: 'Nitto 541 Acrylic Foam Mounting Tape',
      industry: 'Specialty Adhesive Tapes & Industrial Solutions',
      market: 'Automotive & Exterior Attachment',
      application: 'Automotive Side Moldings & Emblem Attachment',
      specs: {
        'Backing material': 'Viscoelastic Acrylic Foam',
        'Adhesive type': 'High Bond Acrylic',
        'Total thickness': '0.8 mm',
        'Temperature resistance': '-40°C to 120°C',
        'Adhesion to Steel': '32 N/20mm',
        'Color': 'Gray'
      },
      imageUrl: 'https://www.nitto.com/us/en/Images/541_img01.jpg',
      productUrl: 'https://www.nitto.com/us/en/products/foam_tape/541/'
    }
  ],

  'Saint-Gobain': [
    {
      name: 'Saint-Gobain Norbond A7300 Acrylic Foam Tape',
      industry: 'Specialty Adhesive Tapes & Industrial Solutions',
      market: 'Building Components & Automotive',
      application: 'Architectural Cladding & Structural Glazing Attachment',
      specs: {
        'Backing material': 'Viscoelastic Closed-Cell Acrylic Foam',
        'Adhesive type': 'High Performance Crosslinked Acrylic',
        'Total thickness': '1.0 mm (40 mil)',
        'Temperature resistance': '-40°C to 160°C',
        'Adhesion to Steel': '30 N/cm',
        'Tensile strength': '850 kPa',
        'Color': 'Dark Gray'
      },
      imageUrl: 'https://tapesolutions.saint-gobain.com/sites/default/files/norbond-a7300.jpg',
      productUrl: 'https://tapesolutions.saint-gobain.com/products/norbond-a7300'
    },
    {
      name: 'Saint-Gobain CHR K104 Kapton Polyimide Tape',
      industry: 'Specialty Adhesive Tapes & Industrial Solutions',
      market: 'Electronics & Aerospace',
      application: 'High Temperature Electrical Insulation & PCB Wave Soldering',
      specs: {
        'Backing material': 'Dupont Kapton Polyimide Film (1 mil)',
        'Adhesive type': 'Cross-linked Silicone',
        'Total thickness': '0.065 mm (2.5 mil)',
        'Temperature resistance': '-73°C to 260°C',
        'Dielectric Breakdown Voltage': '7500 Volts',
        'Adhesion to Steel': '2.8 N/cm',
        'Color': 'Amber'
      },
      imageUrl: 'https://tapesolutions.saint-gobain.com/sites/default/files/chr-k104.jpg',
      productUrl: 'https://tapesolutions.saint-gobain.com/products/chr-k104'
    },
    {
      name: 'Saint-Gobain Norseal FS1000 Intumescent Foam Seal',
      industry: 'Specialty Adhesive Tapes & Industrial Solutions',
      market: 'Building Components & Mass Transit',
      application: 'Fire-Resistant Building Joint Expansion & Smoke Blocking',
      specs: {
        'Backing material': 'Elastomeric Intumescent Foam',
        'Adhesive type': 'Pressure Sensitive Acrylic',
        'Total thickness': '4.5 mm',
        'Temperature resistance': 'Up to 1000°C (Under Flame)',
        'Flame Retardancy': 'UL94 V-0 & EN 45545-2 HL3',
        'Color': 'Black'
      },
      imageUrl: 'https://tapesolutions.saint-gobain.com/sites/default/files/norseal-fs1000.jpg',
      productUrl: 'https://tapesolutions.saint-gobain.com/products/norseal-fs1000'
    }
  ],

  'Shurtape': [
    {
      name: 'Shurtape CP 105 General Purpose Masking Tape',
      industry: 'Specialty Adhesive Tapes & Industrial Solutions',
      market: 'Building & Construction',
      application: 'General Purpose Masking, Bundling, Labeling & Holding',
      specs: {
        'Backing material': 'Crepe Paper',
        'Adhesive type': 'Synthetic Rubber Adhesive',
        'Total thickness': '0.127 mm (5.0 mil)',
        'Temperature resistance': '10°C to 65°C',
        'Adhesion to Steel': '32 oz/in width (3.5 N/cm)',
        'Tensile strength': '19 lbs/in width (33.3 N/cm)',
        'Elongation at break': '9%',
        'Color': 'Natural / Beige'
      },
      imageUrl: 'https://www.shurtape.com/images/cp105.jpg',
      productUrl: 'https://www.shurtape.com/products/cp-105/'
    },
    {
      name: 'Shurtape CP 201 Medium-High Adhesion Masking Tape',
      industry: 'Specialty Adhesive Tapes & Industrial Solutions',
      market: 'Industrial Surface Processing & Painting',
      application: 'Industrial Paint Masking, Light Splicing & Bundling',
      specs: {
        'Backing material': 'Coarse Crepe Paper',
        'Adhesive type': 'Rubber Resin Adhesive',
        'Total thickness': '0.14 mm (5.5 mil)',
        'Temperature resistance': 'Up to 93°C for 30 min',
        'Adhesion to Steel': '38 oz/in width (4.16 N/cm)',
        'Tensile strength': '22 lbs/in width (38.5 N/cm)',
        'Color': 'Natural'
      },
      imageUrl: 'https://www.shurtape.com/images/cp201.jpg',
      productUrl: 'https://www.shurtape.com/products/cp-201/'
    },
    {
      name: 'Shurtape PC 600 General Purpose Duct Tape',
      industry: 'Specialty Adhesive Tapes & Industrial Solutions',
      market: 'HVAC & Industrial Logistics',
      application: 'Industrial Packaging, Moisture Proofing & Sealing',
      specs: {
        'Backing material': 'Polyethylene Film with Poly-Cotton Blend Cloth Scrim',
        'Adhesive type': 'Natural Rubber Adhesive',
        'Total thickness': '0.23 mm (9.0 mil)',
        'Temperature resistance': '10°C to 93°C',
        'Adhesion to Steel': '50 oz/in width (5.47 N/cm)',
        'Tensile strength': '24 lbs/in width (42.0 N/cm)',
        'Color': 'Silver / Black / Red / White / Blue'
      },
      imageUrl: 'https://www.shurtape.com/images/pc600.jpg',
      productUrl: 'https://www.shurtape.com/products/pc-600/'
    },
    {
      name: 'Shurtape PC 957 Heavy Duty Foil Duct Tape',
      industry: 'Specialty Adhesive Tapes & Industrial Solutions',
      market: 'HVAC & Power Engineering',
      application: 'Sheet Metal Duct Joint Sealing & Thermal Moisture Barrier',
      specs: {
        'Backing material': 'Dead Soft Aluminum Foil with Cloth Scrim',
        'Adhesive type': 'High Performance Acrylic Adhesive',
        'Total thickness': '0.28 mm (11.0 mil)',
        'Temperature resistance': '-29°C to 121°C',
        'Adhesion to Steel': '60 oz/in width (6.56 N/cm)',
        'Tensile strength': '30 lbs/in width (52.5 N/cm)',
        'Color': 'Aluminum Silver'
      },
      imageUrl: 'https://www.shurtape.com/images/pc957.jpg',
      productUrl: 'https://www.shurtape.com/products/pc-957/'
    },
    {
      name: 'Shurtape HP 200 Production Grade Packaging Tape',
      industry: 'Specialty Adhesive Tapes & Industrial Solutions',
      market: 'Packaging & Logistics',
      application: 'Medium-Weight Box Sealing & Automated Case Sealing',
      specs: {
        'Backing material': 'Biaxially-Oriented Polypropylene (BOPP) Film',
        'Adhesive type': 'Synthetic Hot Melt Rubber Adhesive',
        'Total thickness': '0.048 mm (1.9 mil)',
        'Temperature resistance': '7°C to 60°C',
        'Adhesion to Steel': '44 oz/in width (4.81 N/cm)',
        'Tensile strength': '27 lbs/in width (47.3 N/cm)',
        'Color': 'Clear / Tan'
      },
      imageUrl: 'https://www.shurtape.com/images/hp200.jpg',
      productUrl: 'https://www.shurtape.com/products/hp-200/'
    },
    {
      name: 'Shurtape DF 65 Double-Coated Cloth Tape',
      industry: 'Specialty Adhesive Tapes & Industrial Solutions',
      market: 'Building Components & Tradeshow Flooring',
      application: 'Carpet Hold-Down & Temporary Floor Attachment with Clean Peel',
      specs: {
        'Backing material': 'Cotton Cloth Mesh',
        'Adhesive type': 'Differential Natural Rubber Resin',
        'Total thickness': '0.35 mm (14.0 mil)',
        'Temperature resistance': '10°C to 93°C',
        'Adhesion to Steel': '40 oz/in width (4.38 N/cm)',
        'Color': 'Natural White'
      },
      imageUrl: 'https://www.shurtape.com/images/df65.jpg',
      productUrl: 'https://www.shurtape.com/products/df-65/'
    },
    {
      name: 'Shurtape AF 100 Cold Temperature Foil Tape',
      industry: 'Specialty Adhesive Tapes & Industrial Solutions',
      market: 'HVAC & Refrigeration',
      application: 'Cold Weather HVAC Duct Sealing & Vapor Barrier (UL 181A-P/B-FX)',
      specs: {
        'Backing material': 'Aluminum Foil (2.0 mil)',
        'Adhesive type': 'Cold Weather Acrylic Adhesive',
        'Total thickness': '0.10 mm (4.0 mil)',
        'Temperature resistance': '-34°C to 121°C',
        'Adhesion to Steel': '65 oz/in width (7.11 N/cm)',
        'Tensile strength': '27 lbs/in width (47.3 N/cm)',
        'Color': 'Silver'
      },
      imageUrl: 'https://www.shurtape.com/images/af100.jpg',
      productUrl: 'https://www.shurtape.com/products/af-100/'
    },
    {
      name: 'Shurtape T-Rex Ferociously Strong Tape',
      industry: 'Specialty Adhesive Tapes & Industrial Solutions',
      market: 'Extreme Industrial Repair & Construction',
      application: 'Rough Surface Repair, Waterproof Holding & Heavy Securing',
      specs: {
        'Backing material': 'Co-extruded Heavy Polyethylene & High Tensile Cloth',
        'Adhesive type': 'Double-Thick Natural Rubber Adhesive',
        'Total thickness': '0.43 mm (17.0 mil)',
        'Temperature resistance': '-18°C to 93°C',
        'Adhesion to Steel': '90 oz/in width (9.85 N/cm)',
        'Tensile strength': '55 lbs/in width (96.3 N/cm)',
        'Color': 'Gunmetal Gray'
      },
      imageUrl: 'https://www.shurtape.com/images/trex.jpg',
      productUrl: 'https://www.shurtape.com/products/t-rex-tape/'
    }
  ],

  'Havells India': [
    {
      name: 'Havells Reo FR PVC Electrical Insulation Tape',
      industry: 'Electrical & Industrial Utilities',
      market: 'Building Components & Electrical Utilities',
      application: 'Primary Wire Splicing & Flame Retardant Jacketing up to 650V',
      specs: {
        'Backing material': 'Flame Retardant Plasticized PVC',
        'Adhesive type': 'Pressure Sensitive Rubber Adhesive',
        'Total thickness': '0.125 mm',
        'Dielectric Breakdown Voltage': '6000 Volts (IS:7884 Certified)',
        'Temperature resistance': '0°C to 80°C',
        'Adhesion to Steel': '1.8 N/cm',
        'Elongation at break': '150%',
        'Color': 'Black / Blue / Red / Yellow / Green'
      },
      imageUrl: 'https://www.havells.com/images/reo-tape.jpg',
      productUrl: 'https://www.havells.com/en/consumer/cables/pvc-tape.html'
    },
    {
      name: 'Havells Heavy Duty Self-Amalgamating Rubber Tape',
      industry: 'Electrical & Industrial Utilities',
      market: 'Industrial High-Voltage Utilities',
      application: 'High Voltage Cable Jointing & Moisture Impervious Insulation',
      specs: {
        'Backing material': 'Ethylene Propylene Rubber (EPR)',
        'Adhesive type': 'Self-Fusing Non-Adhesive Elastomer',
        'Total thickness': '0.76 mm (30 mil)',
        'Dielectric Breakdown Voltage': '22000 Volts (22 kV)',
        'Temperature resistance': '-40°C to 90°C (Emergency Overload 130°C)',
        'Tensile strength': '2.5 MPa',
        'Elongation at break': '600%',
        'Color': 'Black'
      },
      imageUrl: 'https://www.havells.com/images/amalgamating-tape.jpg',
      productUrl: 'https://www.havells.com/en/industrial/high-voltage-tape.html'
    }
  ],

  'Ajit Industries (AIPL)': [
    {
      name: 'AIPL ABRO Masking Tape',
      industry: 'Specialty Adhesive Tapes & Industrial Solutions',
      market: 'Industrial Surface Processing & Automotive',
      application: 'Automotive Paint Masking, Carpentry & Electronic Solder Protection',
      specs: {
        'Backing material': 'Crepe Paper',
        'Adhesive type': 'Natural Rubber Solvent Adhesive',
        'Total thickness': '0.135 mm (135 micron)',
        'Temperature resistance': 'Up to 90°C for 60 min',
        'Adhesion to Steel': '6.5 N/25mm',
        'Tensile strength': '75 N/25mm',
        'Color': 'Natural White / Cream'
      },
      imageUrl: 'https://aiplmarketing.com/images/masking-tape.jpg',
      productUrl: 'https://aiplmarketing.com/aipl-abro-cellux-masking-tape-6332464.html'
    },
    {
      name: 'AIPL Double Sided Tissue Tape (P-637)',
      industry: 'Specialty Adhesive Tapes & Industrial Solutions',
      market: 'Industrial Solutions & Converters',
      application: 'Foam Lamination, Nameplate Attachment & Envelope Splicing',
      specs: {
        'Backing material': 'Non-Woven Tissue Matrix',
        'Adhesive type': 'Modified Acrylic Adhesive',
        'Total thickness': '0.10 mm (100 micron)',
        'Temperature resistance': '-20°C to 120°C',
        'Adhesion to Steel': '14 N/25mm',
        'Color': 'Translucent'
      },
      imageUrl: 'https://aiplmarketing.com/images/ds-tissue.jpg',
      productUrl: 'https://aiplmarketing.com/ds-tissue-tape-p-637--11024819.html'
    },
    {
      name: 'AIPL Cross Filament Tape',
      industry: 'Specialty Adhesive Tapes & Industrial Solutions',
      market: 'Packaging & Logistics',
      application: 'Heavy Duty Metal Pipe Bundling & Pallet Reinforcement',
      specs: {
        'Backing material': 'Bi-directional Fiberglass Reinforced BOPP Film',
        'Adhesive type': 'High Tack Synthetic Rubber',
        'Total thickness': '0.13 mm (130 micron)',
        'Tensile strength': '550 N/25mm',
        'Adhesion to Steel': '20 N/25mm',
        'Elongation at break': '6%',
        'Color': 'Transparent with Glass Grid'
      },
      imageUrl: 'https://aiplmarketing.com/images/cross-filament.jpg',
      productUrl: 'https://aiplmarketing.com/cross-filament-tape-11024823.html'
    },
    {
      name: 'AIPL Aluminium Foil Tape',
      industry: 'Specialty Adhesive Tapes & Industrial Solutions',
      market: 'Building Components & HVAC',
      application: 'HVAC Air Duct Joint Sealing, Thermal Insulation & Moisture Barrier',
      specs: {
        'Backing material': 'Pure Aluminum Foil (30 micron)',
        'Adhesive type': 'Solvent Acrylic Adhesive with Liner',
        'Total thickness': '0.065 mm (65 micron)',
        'Temperature resistance': '-30°C to 120°C',
        'Adhesion to Steel': '15 N/25mm',
        'Flame Retardancy': 'Class 1 / Class 0 Fire Rated',
        'Color': 'Bright Silver'
      },
      imageUrl: 'https://aiplmarketing.com/images/alu-foil.jpg',
      productUrl: 'https://aiplmarketing.com/aluminium-foil-tape-11024827.html'
    },
    {
      name: 'AIPL Polyimide Kapton Tape',
      industry: 'Specialty Adhesive Tapes & Industrial Solutions',
      market: 'Electronics & High-Tech',
      application: 'PCB Wave Soldering Masking & Transformer Coil High Temp Insulation',
      specs: {
        'Backing material': 'Kapton Polyimide Film (25 micron)',
        'Adhesive type': 'High Grade Silicone Adhesive',
        'Total thickness': '0.06 mm (60 micron)',
        'Temperature resistance': '-70°C to 260°C (Short Term 300°C)',
        'Dielectric Breakdown Voltage': '6500 Volts (6.5 kV)',
        'Tensile strength': '120 N/25mm',
        'Color': 'Amber'
      },
      imageUrl: 'https://aiplmarketing.com/images/polyimide.jpg',
      productUrl: 'https://aiplmarketing.com/polyimide-tape-11024813.html'
    },
    {
      name: 'AIPL Floor Marking Tape',
      industry: 'Specialty Adhesive Tapes & Industrial Solutions',
      market: 'Industrial Surface Processing & Safety',
      application: 'Factory Floor Demarcation, Hazard Warning & Social Distancing',
      specs: {
        'Backing material': 'Plasticized Polyvinyl Chloride (PVC)',
        'Adhesive type': 'High Tack Rubber Resin',
        'Total thickness': '0.15 mm (150 micron)',
        'Adhesion to Steel': '4.0 N/25mm',
        'Elongation at break': '150%',
        'Color': 'Yellow / Black / Red / White / Green'
      },
      imageUrl: 'https://aiplmarketing.com/images/floor-marking.jpg',
      productUrl: 'https://aiplmarketing.com/floor-marking-tape-11024817.html'
    },
    {
      name: 'AIPL Double Sided PE Foam Tape',
      industry: 'Specialty Adhesive Tapes & Industrial Solutions',
      market: 'Building Components & Automotive',
      application: 'Automotive Emblem Mounting & Mirror Plate Fixation',
      specs: {
        'Backing material': 'Closed-Cell Polyethylene (PE) Foam',
        'Adhesive type': 'Pure Acrylic Solvent Adhesive',
        'Total thickness': '1.0 mm (1000 micron)',
        'Temperature resistance': '-20°C to 90°C',
        'Adhesion to Steel': '18 N/25mm',
        'Color': 'Black / White with Green PE Liner'
      },
      imageUrl: 'https://aiplmarketing.com/images/foam-tape.jpg',
      productUrl: 'https://aiplmarketing.com/ds-foam-tape-11024821.html'
    },
    {
      name: 'AIPL Heavy Duty Duct Tape',
      industry: 'Specialty Adhesive Tapes & Industrial Solutions',
      market: 'Industrial Solutions & Logistics',
      application: 'Waterproof Sealing, Industrial Pipe Wrapping & Heavy Bundling',
      specs: {
        'Backing material': 'Polyethylene Coated Textile Cloth Scrim',
        'Adhesive type': 'Hot Melt Pressure Sensitive Adhesive',
        'Total thickness': '0.17 mm (170 micron)',
        'Temperature resistance': '-10°C to 60°C',
        'Tensile strength': '85 N/25mm',
        'Color': 'Silver / Black'
      },
      imageUrl: 'https://aiplmarketing.com/images/duct-tape.jpg',
      productUrl: 'https://aiplmarketing.com/duct-tape-11024818.html'
    },
    {
      name: 'AIPL PVC Electrical Insulation Tape',
      industry: 'Specialty Adhesive Tapes & Industrial Solutions',
      market: 'Electrical & Utilities',
      application: 'Primary Wire Splicing & Electrical Joint Insulation up to 600V',
      specs: {
        'Backing material': 'Flame Retardant Plasticized Soft PVC',
        'Adhesive type': 'Rubber Pressure Sensitive Adhesive',
        'Total thickness': '0.125 mm (125 micron)',
        'Dielectric Breakdown Voltage': '5000 Volts (5 kV)',
        'Temperature resistance': '0°C to 80°C',
        'Elongation at break': '160%',
        'Color': 'Black / Blue / Red / Yellow / Green'
      },
      imageUrl: 'https://aiplmarketing.com/images/pvc-electrical.jpg',
      productUrl: 'https://aiplmarketing.com/pvc-electrical-insulation-tape-2561634.html'
    }
  ]
};
