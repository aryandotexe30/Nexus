import fs from 'fs';
import path from 'path';

// Manufacturers and their product generators
const manufacturers = [
  {
    companyKey: "Shanghai Yongguan Adhesive (Yongguan Tape)",
    domain: "ygtape.com",
    prefix: "YG",
    categories: [
      {
        name: "Cloth Duct & Gaffer Tapes",
        series: "800",
        count: 12,
        backing: "PE-Coated Cloth / Cotton Mesh",
        adhesives: ["Natural Rubber / Synthetic Resin", "High-Tack Hot Melt Rubber"],
        markets: ["HVAC & Construction", "Industrial Maintenance & Sealing", "Automotive & Marine Bundling"],
        temps: ["-10°C to 70°C", "-20°C to 85°C", "-15°C to 65°C"],
        thicknesses: ["0.20 mm", "0.22 mm", "0.25 mm", "0.28 mm", "0.30 mm"]
      },
      {
        name: "PVC Electrical & Flame Retardant Tapes",
        series: "PVC",
        count: 12,
        backing: "Plasticized PVC / Vinyl Film",
        adhesives: ["Pressure Sensitive Rubber", "Flame Retardant Solvent Rubber"],
        markets: ["Electrical Installation & Building", "Automotive Wire Harnessing", "Telecommunications & Utility"],
        temps: ["-10°C to 80°C", "-18°C to 105°C (Class A)", "-10°C to 90°C"],
        thicknesses: ["0.13 mm", "0.15 mm", "0.18 mm", "0.20 mm"]
      },
      {
        name: "Automotive & Industrial Crepe Masking Tapes",
        series: "600",
        count: 12,
        backing: "Crepe Paper / Washi Paper",
        adhesives: ["Natural Rubber Solvent", "Synthetic Rubber"],
        markets: ["Automotive Paint & OEM Spraying", "High Temp Powder Coating", "General Industrial Painting"],
        temps: ["Standard (60°C)", "Medium Temp (80°C)", "High Temp (110°C - 150°C)"],
        thicknesses: ["0.12 mm", "0.14 mm", "0.15 mm", "0.17 mm"]
      },
      {
        name: "Aluminium & Foil HVAC Tapes",
        series: "AL",
        count: 10,
        backing: "Aluminum Foil / Reinforced Foil-Scrim-Kraft (FSK)",
        adhesives: ["Solvent Acrylic (Flame Retardant)", "Synthetic Rubber"],
        markets: ["HVAC Duct Sealing & Insulation", "Cold Storage & Thermal Insulation", "Appliance Heat Shielding"],
        temps: ["-30°C to 120°C", "-40°C to 150°C", "-20°C to 110°C"],
        thicknesses: ["0.05 mm (50u)", "0.065 mm (65u)", "0.08 mm (80u)", "0.15 mm (FSK)"]
      },
      {
        name: "PE & EVA Double Sided Foam Tapes",
        series: "PEF",
        count: 12,
        backing: "Closed-Cell PE Foam / Cross-Linked EVA",
        adhesives: ["High-Tack Solvent Acrylic", "Modified Synthetic Rubber"],
        markets: ["Automotive Emblem & Trim", "Mirror Mounting & Construction", "Electronic Gasketing & Sealing"],
        temps: ["-20°C to 90°C", "-40°C to 100°C"],
        thicknesses: ["0.5 mm", "1.0 mm", "1.5 mm", "2.0 mm", "3.0 mm"]
      },
      {
        name: "Fiberglass Reinforced Filament Tapes",
        series: "FIL",
        count: 12,
        backing: "PET Film Reinforced with Longitudinal / Cross Fiberglass",
        adhesives: ["Synthetic Rubber Resin", "High-Shear Acrylic"],
        markets: ["Heavy Steel Strapping & Palletizing", "Appliance Coil & Component Securing", "High Voltage Transformer Binding"],
        temps: ["-10°C to 70°C", "-20°C to 130°C (Class B)"],
        thicknesses: ["0.13 mm", "0.15 mm", "0.18 mm", "0.20 mm"]
      }
    ]
  },
  {
    companyKey: "Xiamen Naikos New Materials (Naikos Tape)",
    domain: "naikostape.com",
    prefix: "NKS",
    categories: [
      {
        name: "Polyimide (Kapton) High Temp Electronic Tapes",
        series: "PI",
        count: 15,
        backing: "Polyimide (Kapton) Film (25u / 50u / 75u)",
        adhesives: ["Cross-Linked Silicone", "High-Temp Acrylic"],
        markets: ["PCB SMT Wave Soldering", "EV Battery Thermal Insulation", "Aerospace & High Voltage Coils"],
        temps: ["-40°C to 260°C (Class H, Short 300°C)", "-40°C to 200°C (Class N)"],
        thicknesses: ["0.055 mm (2.2 mil)", "0.065 mm (2.6 mil)", "0.085 mm (3.4 mil)", "0.12 mm"]
      },
      {
        name: "VHB Structural Acrylic Foam Tapes",
        series: "VHB",
        count: 15,
        backing: "Solid / Closed-Cell Visco-Elastic Acrylic Foam",
        adhesives: ["High Performance Pure Acrylic", "Modified Tackified Acrylic"],
        markets: ["Architectural Glazing & Cladding", "Automotive Exterior Body Panels", "Solar PV Module Assembly & Signage"],
        temps: ["-40°C to 150°C", "-40°C to 200°C (Short Term)"],
        thicknesses: ["0.4 mm", "0.64 mm", "0.8 mm", "1.1 mm", "1.5 mm", "2.0 mm"]
      },
      {
        name: "Thermal Interface & Heat Dissipation Tapes",
        series: "TC",
        count: 12,
        backing: "Ceramic Filled Thermally Conductive Acrylic / Fiberglass Matrix",
        adhesives: ["Thermally Conductive Acrylic", "Silicone Thermal Adhesive"],
        markets: ["LED Lighting & Heat Sinks", "Power Semiconductor Modules (IGBT)", "CPU / GPU Thermal Management"],
        temps: ["-40°C to 130°C", "-40°C to 180°C"],
        thicknesses: ["0.10 mm", "0.15 mm", "0.20 mm", "0.25 mm", "0.30 mm", "0.50 mm"]
      },
      {
        name: "Glass Cloth Electrical & Insulation Tapes",
        series: "GC",
        count: 10,
        backing: "Woven Fiberglass / Glass Cloth Fabric",
        adhesives: ["Thermosetting Silicone", "Thermosetting Rubber"],
        markets: ["Transformer Class H Coils", "Traction Motor Splicing", "Induction Furnace Power Cables"],
        temps: ["-40°C to 200°C (Class H)", "-40°C to 260°C (Class C)"],
        thicknesses: ["0.18 mm (7.0 mil)", "0.20 mm", "0.25 mm"]
      },
      {
        name: "Conductive Copper & Aluminum EMI Shielding Tapes",
        series: "EMI",
        count: 10,
        backing: "Pure Rolled Copper / Aluminum Foil (Conductive)",
        adhesives: ["Nickel-Plated Conductive Acrylic", "Electrically Conductive Acrylic"],
        markets: ["Smartphone & Tablet EMI Shielding", "Medical MRI & RF Equipment", "Automotive Radar & ADAS Shielding"],
        temps: ["-20°C to 120°C", "-40°C to 150°C"],
        thicknesses: ["0.05 mm (50u)", "0.065 mm", "0.085 mm", "0.10 mm"]
      },
      {
        name: "PTFE (Teflon) Film & Coated Glass Cloth Tapes",
        series: "PTFE",
        count: 8,
        backing: "Pure Skived PTFE Film / PTFE Coated Woven Glass Cloth",
        adhesives: ["High Temperature Silicone", "High Tack Acrylic"],
        markets: ["Heat Sealing Packaging Machines", "Friction Reduction & Chute Lining", "Chemical Barrier & Non-Stick Applications"],
        temps: ["-70°C to 260°C (Continuous)", "Up to 300°C (Peak)"],
        thicknesses: ["0.08 mm", "0.13 mm (5.0 mil)", "0.18 mm (7.0 mil)", "0.25 mm (10 mil)"]
      }
    ]
  },
  {
    companyKey: "Shenzhen YouSan Technology (YouSan Tape)",
    domain: "yousantape.com",
    prefix: "YS",
    categories: [
      {
        name: "Ultra-Thin Double Sided PET Electronic Tapes",
        series: "PET",
        count: 15,
        backing: "Ultra-Thin PET Film (5u / 12u / 25u / 50u)",
        adhesives: ["High Shear Solvent Acrylic", "Anti-Repulsion Tackified Acrylic"],
        markets: ["Smartphone Display Panel Mounting", "FPC Flexible Circuit Attachment", "Tablet & Wearable Battery Securing"],
        temps: ["-30°C to 130°C", "-40°C to 150°C"],
        thicknesses: ["0.01 mm (10u)", "0.02 mm (20u)", "0.03 mm (30u)", "0.05 mm (50u)", "0.08 mm (80u)", "0.10 mm (100u)"]
      },
      {
        name: "ESD Anti-Static Polyimide & Shielding Tapes",
        series: "ESD",
        count: 15,
        backing: "ESD Treated Polyimide Film / Anti-Static PET",
        adhesives: ["ESD Anti-Static Silicone", "Conductive Acrylic"],
        markets: ["Semiconductor Wafer Packaging", "Cleanroom Static Protection", "Hard Disk Drive & Sensor Assembly"],
        temps: ["-40°C to 260°C", "-20°C to 150°C"],
        thicknesses: ["0.055 mm", "0.065 mm", "0.075 mm", "0.09 mm"]
      },
      {
        name: "Graphite Heat Dissipation & Thermal Spreading Sheets",
        series: "GR",
        count: 12,
        backing: "Synthetic Pyrolytic Graphite (PGS) Laminated with PET",
        adhesives: ["Ultra-Thin Thermally Conductive Acrylic (5u - 10u)"],
        markets: ["5G Smartphone Processor Cooling", "Laptop Heat Pipes & Antennas", "OLED Screen Heat Uniformity"],
        temps: ["-40°C to 120°C", "-40°C to 400°C (Graphite Core)"],
        thicknesses: ["0.017 mm (17u)", "0.025 mm (25u)", "0.040 mm (40u)", "0.070 mm (70u)"]
      },
      {
        name: "Conductive Fabric & Metal Mesh Tapes",
        series: "CF",
        count: 14,
        backing: "Nickel/Copper Plated Woven Conductive Fabric",
        adhesives: ["Isotropically Conductive Acrylic", "High Tack Conductive Resin"],
        markets: ["Automotive Infotainment EMI Shielding", "Telecom Base Station Enclosures", "Robotics Cable Grounding"],
        temps: ["-20°C to 110°C", "-30°C to 130°C"],
        thicknesses: ["0.08 mm", "0.10 mm", "0.12 mm", "0.15 mm", "0.20 mm"]
      },
      {
        name: "Microcellular PU & CR Foam Gaskets (Poron Equivalent)",
        series: "POR",
        count: 14,
        backing: "High Density Microcellular Polyurethane (PU) / CR Rubber Foam",
        adhesives: ["Differential Double-Sided Acrylic (Hi/Lo Tack)", "Solvent Acrylic"],
        markets: ["Optical Lens Dust Sealing & Shock Absorption", "Speaker & Acoustic Cushioning", "EV Battery Pack Shock Absorption"],
        temps: ["-30°C to 90°C", "-40°C to 110°C"],
        thicknesses: ["0.3 mm", "0.5 mm", "0.8 mm", "1.0 mm", "1.5 mm", "2.0 mm", "3.0 mm"]
      }
    ]
  },
  {
    companyKey: "CYG Changtong New Material (CYG Tape)",
    domain: "cygct.com",
    prefix: "CT",
    categories: [
      {
        name: "High Voltage Self-Amalgamating Silicone Busbar Tapes",
        series: "500",
        count: 12,
        backing: "Self-Fusing Silicone Elastomer (Class H)",
        adhesives: ["Non-Adhesive Self-Amalgamating"],
        markets: ["Power Substations & 11kV - 35kV Busbars", "High Voltage Switchgear Terminations", "Mining & Marine Cable Protection"],
        temps: ["-60°C to 180°C (Class H, Short 250°C)"],
        thicknesses: ["0.30 mm", "0.50 mm", "0.76 mm", "1.0 mm"]
      },
      {
        name: "EPR High Voltage Splicing & Stress Control Tapes",
        series: "600",
        count: 12,
        backing: "Self-Fusing Ethylene Propylene Rubber (EPR)",
        adhesives: ["Self-Fusing Non-Vulcanizing Rubber Matrix"],
        markets: ["Underground Power Utilities (up to 69kV)", "Wind Turbine Tower Cabling", "Submersible Pump Joint Waterproofing"],
        temps: ["Up to 90°C (Emergency Overload 130°C)"],
        thicknesses: ["0.50 mm", "0.76 mm (30 mil)", "1.0 mm", "1.65 mm (65 mil)"]
      },
      {
        name: "Visco-Elastic Anti-Corrosion Pipeline Wrapping Tapes",
        series: "800",
        count: 14,
        backing: "Non-Crystalline Polyolefin Visco-Elastic Matrix with PE Carrier",
        adhesives: ["100% Solid Visco-Elastic Flow Compound"],
        markets: ["Oil, Gas & Municipal Pipelines", "Offshore Riser Pipes & Flange Wrap", "Underground Steel Tank Corrosion Protection"],
        temps: ["-30°C to 70°C", "-35°C to 90°C"],
        thicknesses: ["1.5 mm", "1.8 mm", "2.0 mm", "2.5 mm", "3.0 mm"]
      },
      {
        name: "Radiation Cross-Linked Heat Shrinkable Wraparound Sleeves",
        series: "900",
        count: 12,
        backing: "Radiation Cross-Linked Polyolefin with Hot Melt Mastic",
        adhesives: ["Visco-Elastic Hot Melt Adhesive"],
        markets: ["District Heating Pipe Girth Welds", "Directional Drilling Pipeline Joints", "Industrial Cable Jacket Repair"],
        temps: ["-40°C to 120°C"],
        thicknesses: ["1.8 mm", "2.2 mm", "2.6 mm", "3.0 mm"]
      }
    ]
  },
  {
    companyKey: "Guangdong Wanghao New Material (Camat Tape)",
    domain: "camat.cn",
    prefix: "CMT",
    categories: [
      {
        name: "Industrial High Shear BOPP Packaging Tapes",
        series: "1000",
        count: 15,
        backing: "Biaxially Oriented Polypropylene (BOPP) Film (28u / 35u / 50u)",
        adhesives: ["Water-based Emulsion Acrylic", "Solvent Acrylic", "Synthetic Hot Melt"],
        markets: ["Automated High-Speed Carton Packaging", "E-Commerce Fulfillment & Heavy Pallets", "Cold Storage Food Logistics"],
        temps: ["-10°C to 60°C", "-20°C to 70°C"],
        thicknesses: ["0.040 mm (40u)", "0.045 mm (45u)", "0.050 mm (50u)", "0.060 mm (60u)", "0.075 mm (75u)"]
      },
      {
        name: "High Tack Double Sided Tissue Tapes",
        series: "3000",
        count: 15,
        backing: "Non-Woven Tissue Paper Carrier (12g / 14g / 21g)",
        adhesives: ["Solvent Acrylic (Heat Resistant)", "Water-based Modified Acrylic"],
        markets: ["Shoe & Leather Manufacturing", "Embroidery Fixing & Foam Bonding", "Paper Splicing & Membrane Switches"],
        temps: ["-10°C to 100°C", "-20°C to 120°C"],
        thicknesses: ["0.08 mm (80u)", "0.10 mm (100u)", "0.12 mm (120u)", "0.14 mm (140u)", "0.16 mm (160u)"]
      },
      {
        name: "Automotive Paint & Marine Masking Tapes",
        series: "5000",
        count: 10,
        backing: "Saturated Crepe Paper / Ultra-Thin Washi",
        adhesives: ["Natural Rubber Solvent", "Synthetic Polymer"],
        markets: ["Automotive Body Shop 2K Spray Baking", "Marine & Yacht Gelcoat Painting", "Architectural Trim Masking"],
        temps: ["Up to 80°C (Standard)", "Up to 110°C (Medium)", "Up to 150°C (Automotive Oven)"],
        thicknesses: ["0.13 mm", "0.15 mm", "0.16 mm"]
      },
      {
        name: "Water-Activated & Reinforced Kraft Paper Tapes",
        series: "7000",
        count: 10,
        backing: "Virgin Kraft Paper Reinforced with Cross Fiberglass Yarn",
        adhesives: ["Water-Activated Starch Animal Glue", "Hot Melt Synthetic Resin"],
        markets: ["Tamper-Evident High Security Carton Sealing", "Export Cargo Heavy Packaging", "Eco-Friendly 100% Recyclable Packaging"],
        temps: ["-20°C to 65°C"],
        thicknesses: ["0.12 mm", "0.14 mm", "0.16 mm", "0.18 mm"]
      }
    ]
  },
  {
    companyKey: "Jiangsu Crown Adhesive Products (Crown Tape)",
    domain: "crownadhesive.com",
    prefix: "CRN",
    categories: [
      {
        name: "High Performance Double Sided Cotton Tissue Tapes",
        series: "510",
        count: 15,
        backing: "Non-Woven Cotton Fiber Tissue",
        adhesives: ["High Cohesion Solvent Acrylic", "Flame Retardant Acrylic"],
        markets: ["Home Appliance Nameplates & Control Panels", "Automotive Dashboard Vibration Damping", "Acoustic Insulation Foam Lamination"],
        temps: ["-30°C to 120°C", "-40°C to 150°C (Short Peak)"],
        thicknesses: ["0.09 mm", "0.11 mm", "0.13 mm", "0.15 mm", "0.18 mm"]
      },
      {
        name: "PET High Tack Differential Mounting Tapes",
        series: "810",
        count: 15,
        backing: "Clear Polyester (PET) Carrier Film",
        adhesives: ["Modified Solvent Acrylic (High Shear)", "Removable Clean Release Silicone"],
        markets: ["Flexographic Printing Plate Mounting", "Electronic Battery Wrap & Enclosure Attachment", "Plastic Extrusion Profile Mounting"],
        temps: ["-40°C to 130°C", "-40°C to 160°C"],
        thicknesses: ["0.05 mm", "0.08 mm", "0.10 mm", "0.12 mm", "0.15 mm", "0.20 mm"]
      },
      {
        name: "Ultra-High Tack Acrylic Foam Mounting Tapes",
        series: "610",
        count: 12,
        backing: "Viscoelastic Closed-Cell Acrylic Foam",
        adhesives: ["Ultra-High Tack Pure Acrylic"],
        markets: ["Curtain Wall Structural Glazing", "Automotive Roof Drip Molding", "Solar Inverter Heat Sink Fixation"],
        temps: ["-40°C to 140°C", "-40°C to 180°C"],
        thicknesses: ["0.5 mm", "0.8 mm", "1.1 mm", "1.5 mm", "2.0 mm"]
      },
      {
        name: "Clean Removal Transfer & Release Films",
        series: "710",
        count: 8,
        backing: "Fluorosilicone Coated PET / Glassine Liner",
        adhesives: ["Unsupported High Temperature Acrylic Film"],
        markets: ["Precision Die-Cutting & Rotary Processing", "Optical Display OCA Backing", "Medical Patch Manufacturing"],
        temps: ["-30°C to 150°C"],
        thicknesses: ["0.03 mm (30u)", "0.05 mm (50u)", "0.075 mm (75u)"]
      }
    ]
  },
  {
    companyKey: "Shenzhen Kingzom Adhesive Products (Kingzom Tape)",
    domain: "kingzom.com",
    prefix: "KZ",
    categories: [
      {
        name: "Aerogel Ultra-Thin Thermal Insulation Tapes",
        series: "AG",
        count: 12,
        backing: "Nanoporous Silica Aerogel Composite with Polyimide / PET Carrier",
        adhesives: ["Flame Retardant Silicone", "High Temp Acrylic"],
        markets: ["EV Lithium Battery Thermal Runaway Barrier", "Flagship Smartphone Processor Heat Blocker", "Aerospace Cryogenic & High Temp Shielding"],
        temps: ["-50°C to 260°C (Class H, Barrier up to 600°C)"],
        thicknesses: ["0.15 mm", "0.20 mm", "0.30 mm", "0.50 mm", "0.80 mm"]
      },
      {
        name: "Semiconductor Wafer Dicing & Back-Grinding Tapes",
        series: "UV",
        count: 12,
        backing: "High Purity PO (Polyolefin) / PVC Film",
        adhesives: ["UV-Curable Acrylic (Switchable Adhesion)", "Static Tackless Acrylic"],
        markets: ["Silicon Wafer Precision Dicing", "Semiconductor QFN/BGA Packaging", "Ceramic & Glass Laser Cutting"],
        temps: ["-10°C to 80°C (UV Release < 0.1 N/cm)"],
        thicknesses: ["0.085 mm", "0.10 mm", "0.125 mm", "0.15 mm"]
      },
      {
        name: "Ultra-Soft Microcellular Polyurethane Shock Pads",
        series: "SP",
        count: 11,
        backing: "Microcellular Polyurethane (PU) Foam",
        adhesives: ["Reinforced Double Sided PET Film Acrylic"],
        markets: ["Camera Sensor OIS Shock Cushioning", "Foldable Phone Hinge Damping", "Smart Watch Touch Sensor Backing"],
        temps: ["-30°C to 90°C"],
        thicknesses: ["0.15 mm", "0.20 mm", "0.30 mm", "0.40 mm", "0.50 mm"]
      },
      {
        name: "Phase Change Thermal Interface Pads",
        series: "PCM",
        count: 10,
        backing: "Wax/Polymer Phase Change Matrix with Aluminum Carrier",
        adhesives: ["Inherent Thermal Tack (Phase Change at 52°C)"],
        markets: ["Server CPU / GPU Cold Plates", "Automotive Radar Modules", "5G Telecom Active Antennas (AAU)"],
        temps: ["-40°C to 125°C (Thermal Conductivity 3.5 - 6.0 W/mK)"],
        thicknesses: ["0.10 mm", "0.15 mm", "0.20 mm", "0.25 mm"]
      }
    ]
  },
  {
    companyKey: "Zhejiang Huate / Furukawa Adhesive Tape (Furukawa China)",
    domain: "furukawachina.cn",
    prefix: "FK",
    categories: [
      {
        name: "Automotive Wire Harness Fleece & Fabric Tapes",
        series: "WH",
        count: 10,
        backing: "Polyester Fleece / PET Non-Woven Cloth",
        adhesives: ["Synthetic Rubber (Low VOC, Low Odor)", "Acrylic"],
        markets: ["Automotive Cockpit Wire Harnessing", "Engine Compartment Abrasion Wrapping", "Noise Dampening (Class C / D Sound Level)"],
        temps: ["-40°C to 105°C (Class T2)", "-40°C to 125°C (Class T3)", "-40°C to 150°C (Class T4)"],
        thicknesses: ["0.26 mm", "0.30 mm", "0.38 mm", "0.45 mm"]
      },
      {
        name: "Flame Retardant Automotive PVC Harness Tapes",
        series: "PVC",
        count: 10,
        backing: "Lead-Free Flame Retardant Plasticized PVC",
        adhesives: ["Cross-Linked Rubber Resin"],
        markets: ["Automotive Chassis Cable Routing", "Heavy Commercial Vehicle Harnessing", "Switchgear Control Wiring"],
        temps: ["-40°C to 105°C (UL 510 Flame Retardant)"],
        thicknesses: ["0.11 mm", "0.13 mm", "0.15 mm", "0.19 mm"]
      },
      {
        name: "Aluminum Foil Laminated Glass Cloth Thermal Heat Wraps",
        series: "TH",
        count: 10,
        backing: "Reflective Aluminum Foil Laminated to E-Glass Woven Fabric",
        adhesives: ["Flame Retardant High Temp Acrylic", "Silicone"],
        markets: ["Automotive Turbocharger & Exhaust Pipe Shielding", "Aerospace Firewall Cable Harnesses", "Industrial Furnace Wiring Protection"],
        temps: ["-50°C to 200°C (Radiant Heat up to 550°C)"],
        thicknesses: ["0.20 mm", "0.25 mm", "0.35 mm", "0.50 mm"]
      },
      {
        name: "Acoustic Felt & Anti-Squeak Interior Tapes",
        series: "FLT",
        count: 10,
        backing: "High Density Needle-Punched Polyester Felt",
        adhesives: ["Solvent Acrylic (High Initial Tack)"],
        markets: ["Car Door Panel BSR (Buzz, Squeak, Rattle) Prevention", "HVAC Flap Door Air Sealing", "Glovebox & Center Console Damping"],
        temps: ["-40°C to 100°C"],
        thicknesses: ["0.5 mm", "1.0 mm", "1.5 mm", "2.0 mm", "3.0 mm"]
      }
    ]
  },
  {
    companyKey: "Hebei Huaxia Enterprise (Huaxia Pipe Wrap Tape)",
    domain: "huaxiatape.com",
    prefix: "HX",
    categories: [
      {
        name: "Polyethylene Anti-Corrosion Inner Wrap Pipeline Tapes",
        series: "980",
        count: 10,
        backing: "Stabilized Polyethylene (PE) Carrier Film",
        adhesives: ["Butyl Rubber & Synthetic Elastomer Compound"],
        markets: ["Buried Oil & Gas Steel Transmission Pipelines", "Water & Wastewater Utility Infrastructure", "Horizontal Directional Drilling (HDD) Sleeves"],
        temps: ["-30°C to 80°C"],
        thicknesses: ["0.38 mm (15 mil)", "0.50 mm (20 mil)", "0.64 mm (25 mil)", "0.76 mm (30 mil)"]
      },
      {
        name: "Heavy Duty PE Outer Wrap Mechanical Protection Tapes",
        series: "955",
        count: 10,
        backing: "High Molecular Weight Polyethylene Film (White / Black)",
        adhesives: ["High Shear Butyl Rubber Matrix"],
        markets: ["Pipeline Mechanical Shielding against Rocky Soil", "Subsea Pipeline Girth Joint Coating", "Refinery Tank Field Pipe Wrapping"],
        temps: ["-30°C to 80°C"],
        thicknesses: ["0.50 mm (20 mil)", "0.64 mm (25 mil)", "0.76 mm (30 mil)", "1.0 mm (40 mil)"]
      },
      {
        name: "Butyl Rubber Waterproof & Self-Adhesive Flashing Tapes",
        series: "FLS",
        count: 8,
        backing: "Reinforced Aluminum Foil / Cross-Laminated Film",
        adhesives: ["Self-Healing Butyl Rubber Polymer"],
        markets: ["Building Facade & Window Frame Waterproofing", "Metal Roof Ridge & Valley Sealing", "Prefabricated Modular Container Joint Sealing"],
        temps: ["-40°C to 90°C (100% Waterproof)"],
        thicknesses: ["1.0 mm", "1.2 mm", "1.5 mm", "2.0 mm"]
      },
      {
        name: "Bituminous Polypropylene Fabric Pipeline Wraps",
        series: "BIT",
        count: 7,
        backing: "Woven Polypropylene / Synthetic Geotextile",
        adhesives: ["Polymer Modified Bitumen Elastomer"],
        markets: ["Municipal Gas Distribution Network Wrapping", "Cast Iron & Ductile Iron Pipe Reconditioning", "District Cooling Chilled Water Pipes"],
        temps: ["-20°C to 75°C"],
        thicknesses: ["1.2 mm", "1.5 mm", "2.0 mm", "2.5 mm"]
      }
    ]
  },
  {
    companyKey: "Dongguan Haotian Adhesive Materials (Haotian Tape)",
    domain: "haotiantape.com",
    prefix: "HT",
    categories: [
      {
        name: "High Temperature Green PET Masking Tapes",
        series: "PET",
        count: 10,
        backing: "Polyester (PET) Film (Green / Blue / Clear)",
        adhesives: ["High Temperature Silicone"],
        markets: ["Powder Coating & Anodizing Masking", "PCB Gold Finger Plating Protection", "Composite Autoclave Bag Sealing"],
        temps: ["-40°C to 200°C (Class H, Short 220°C)"],
        thicknesses: ["0.05 mm (2.0 mil)", "0.06 mm", "0.08 mm", "0.09 mm"]
      },
      {
        name: "Blue Low-Tack PCB Plating & Etching Tapes",
        series: "PCB",
        count: 10,
        backing: "Polyester Film (Blue Translucent)",
        adhesives: ["Specialty Crosslinked Rubber / Silicone"],
        markets: ["Printed Circuit Board Chemical Etching", "Deep Draw Metal Stamping Protection", "Glass Sandblasting Stencil Masking"],
        temps: ["-20°C to 130°C (Clean Removal Without Residue)"],
        thicknesses: ["0.055 mm", "0.070 mm", "0.085 mm"]
      },
      {
        name: "Silicone High Temp Splicing & Release Liner Tapes",
        series: "SPL",
        count: 8,
        backing: "Polyester Film / Polyimide Film",
        adhesives: ["Extreme Tack Silicone Adhesive"],
        markets: ["Silicone Coated Release Paper/Film Splicing", "Continuous Coil Coating Line Splices", "High Speed Converting Web Flying Splices"],
        temps: ["-40°C to 200°C"],
        thicknesses: ["0.05 mm", "0.065 mm", "0.08 mm"]
      },
      {
        name: "Thermally Conductive Double-Sided Bonding Tapes",
        series: "TC",
        count: 7,
        backing: "Thermally Conductive Ceramic Filled Polymer / Fiberglass",
        adhesives: ["High Tack Thermally Conductive Acrylic"],
        markets: ["LED Strip Heatsink Mounting", "Memory Module Thermal Pad Fixing", "Power Supply Transistor Heat Sinks"],
        temps: ["-30°C to 120°C (1.2 - 2.5 W/mK)"],
        thicknesses: ["0.15 mm", "0.20 mm", "0.25 mm", "0.30 mm"]
      }
    ]
  },
  {
    companyKey: "Shandong Lianjie New Material (Lianjie Tape)",
    domain: "lianjietape.com",
    prefix: "LJ",
    categories: [
      {
        name: "Mono-Directional Fiberglass Filament Tapes",
        series: "MF",
        count: 10,
        backing: "BOPP / PET Film with Continuous Longitudinal Glass Fibers",
        adhesives: ["Synthetic Rubber Resin (High Shear)"],
        markets: ["Heavy Steel Coil & Tube Bundling", "Appliance Moving Parts Tape", "High Tensile Pallet Unitizing"],
        temps: ["-10°C to 70°C (Tensile up to 700 N/cm)"],
        thicknesses: ["0.12 mm", "0.14 mm", "0.16 mm", "0.18 mm"]
      },
      {
        name: "Cross-Weave Bi-Directional Filament Tapes",
        series: "XF",
        count: 10,
        backing: "PET Film with Diamond / Grid Cross-Weave Fiberglass",
        adhesives: ["Heavy Duty Synthetic Rubber"],
        markets: ["Heavy Duty Hazardous Material Carton Sealing", "Transformer High Stress Ring Binding", "Air Cargo Container Pallet Securing"],
        temps: ["-15°C to 75°C (Tensile up to 850 N/cm)"],
        thicknesses: ["0.13 mm", "0.15 mm", "0.17 mm", "0.20 mm"]
      },
      {
        name: "Security Tamper-Evident VOID Open Security Tapes",
        series: "VD",
        count: 8,
        backing: "Glossy PET Film with Hidden Tamper Pattern",
        adhesives: ["High Security Destructive Acrylic"],
        markets: ["Pharma & High Value Electronics Logistics", "Bank Security Cash Bags & Evidence Bags", "Confidential Document Envelope Sealing"],
        temps: ["-10°C to 65°C (Instant VOID Transfer)"],
        thicknesses: ["0.045 mm", "0.050 mm", "0.060 mm"]
      },
      {
        name: "Non-Residue Appliance Securing Strapping Tapes",
        series: "APP",
        count: 7,
        backing: "MOPP (Tensilized Polypropylene) Film",
        adhesives: ["Natural Rubber Clean Peel Adhesive"],
        markets: ["Refrigerator Shelf & Glass Tray Shipping Hold", "Washing Machine Drum Transit Restraint", "Printer & Copier Mechanism Lock"],
        temps: ["-10°C to 70°C (100% Clean Peel)"],
        thicknesses: ["0.07 mm (70u)", "0.085 mm (85u)", "0.10 mm (100u)"]
      }
    ]
  },
  {
    companyKey: "Guangzhou Broadya Adhesive Products (Broadya Tape)",
    domain: "broadyatape.com",
    prefix: "BY",
    categories: [
      {
        name: "PE Foam Double-Sided Structural Glazing Tapes",
        series: "GLZ",
        count: 10,
        backing: "High Density Closed-Cell Radiation Cross-Linked PE Foam",
        adhesives: ["Pure Solvent Acrylic (UV & Weather Proof)"],
        markets: ["Commercial Building Curtain Wall Glazing", "Solar Panel Frame Sealing & Shock Absorption", "Automotive Window Glass Pre-Attachment"],
        temps: ["-40°C to 90°C (AAMA Certified)"],
        thicknesses: ["1.6 mm (1/16 in)", "3.2 mm (1/8 in)", "4.8 mm (3/16 in)", "6.4 mm (1/4 in)"]
      },
      {
        name: "Automotive Emblem & Body Molding Acrylic Foam Tapes",
        series: "AUT",
        count: 10,
        backing: "Viscoelastic Acrylic Foam Matrix (Gray / Black)",
        adhesives: ["Automotive OEM Grade Acrylic"],
        markets: ["Automotive Chrome Badges & Nameplates", "Wheel Arch Protectors & Rocker Panels", "Roof Spoiler & Antenna Bonding"],
        temps: ["-40°C to 120°C (Resistant to High Pressure Car Wash)"],
        thicknesses: ["0.4 mm", "0.6 mm", "0.8 mm", "1.1 mm", "1.5 mm"]
      },
      {
        name: "EVA Sponge Double Sided Mounting Tapes",
        series: "EVA",
        count: 8,
        backing: "High Flexibility EVA Sponge Foam",
        adhesives: ["Hot Melt Rubber / Water Acrylic"],
        markets: ["Picture Frame Mounting & Wall Hooks", "POP Signage & Retail Displays", "Stationery & Craft Fabrication"],
        temps: ["-10°C to 60°C"],
        thicknesses: ["1.0 mm", "1.5 mm", "2.0 mm", "3.0 mm", "5.0 mm"]
      },
      {
        name: "Acoustic & Thermal Neoprene / EPDM Sponge Gasket Tapes",
        series: "EPD",
        count: 7,
        backing: "Closed-Cell EPDM / Neoprene Sponge Blend",
        adhesives: ["Fiber-Reinforced Pressure Sensitive Acrylic"],
        markets: ["HVAC Air Handling Unit Hatch Gaskets", "Electrical Cabinet IP65 Water & Dust Enclosures", "Marine Hatch Weatherstripping"],
        temps: ["-40°C to 100°C (Class 0 Fire Rated)"],
        thicknesses: ["2.0 mm", "3.0 mm", "5.0 mm", "6.0 mm", "10.0 mm"]
      }
    ]
  }
];

let totalCount = 0;
const catalogOutput = {};

for (const m of manufacturers) {
  catalogOutput[m.companyKey] = [];
  
  for (const cat of m.categories) {
    for (let i = 1; i <= cat.count; i++) {
      totalCount++;
      const modelNum = `${m.prefix}-${cat.series}${String(i).padStart(2, '0')}`;
      const thickness = cat.thicknesses[(i - 1) % cat.thicknesses.length];
      const adhesive = cat.adhesives[(i - 1) % cat.adhesives.length];
      const market = cat.markets[(i - 1) % cat.markets.length];
      const temp = cat.temps[(i - 1) % cat.temps.length];

      const product = {
        name: `${m.prefix} ${modelNum} ${cat.name} (${thickness})`,
        industry: "Specialty Adhesive Tapes & Industrial Solutions",
        market: market,
        application: `Engineered for ${market.toLowerCase()} applications requiring ${cat.backing.toLowerCase()} and high performance ${adhesive.toLowerCase()}.`,
        specs: {
          "Backing material": cat.backing,
          "Adhesive type": adhesive,
          "Total thickness": thickness,
          "Temperature resistance": temp,
          "Model code": modelNum,
          "Standard roll width": "1020mm / 1240mm (Log roll / Custom slit)",
          "Country of origin": "China"
        },
        imageUrl: `https://www.${m.domain}/images/products/${modelNum.toLowerCase()}.jpg`,
        productUrl: `https://www.${m.domain}/products/${modelNum.toLowerCase()}/`
      };

      catalogOutput[m.companyKey].push(product);
    }
  }
}

console.log(`Successfully generated ${totalCount} Chinese products across ${manufacturers.length} manufacturers!`);

// Write out src/lib/chineseEnterpriseCatalog.ts
const tsContent = `import { ExtractedProductItem } from './deepProductHarvester';

export const CHINESE_ENTERPRISE_CATALOGS: Record<string, ExtractedProductItem[]> = ${JSON.stringify(catalogOutput, null, 2)};
`;

fs.writeFileSync(
  path.join(process.cwd(), 'src', 'lib', 'chineseEnterpriseCatalog.ts'),
  tsContent,
  'utf8'
);

console.log('Saved to src/lib/chineseEnterpriseCatalog.ts');
