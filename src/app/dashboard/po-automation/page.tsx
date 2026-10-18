"use client";

import React, { useState, useMemo } from "react";
import {
  Mail,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Send,
  Truck,
  PackageCheck,
  ShieldCheck,
  Sparkles,
  UserCheck,
  Bot,
  ArrowRight,
  Upload,
  Plus,
  RefreshCw,
  Building2,
  MapPin,
  IndianRupee,
  Layers,
  Check,
  X,
  Edit3,
  Eye,
  Download,
  QrCode,
  KeyRound,
  Terminal,
  Sliders,
  Play,
  FileSpreadsheet,
  ChevronRight
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export interface PoLineItem {
  id: string;
  sku: string;
  description: string;
  hsnCode: string;
  quantity: number;
  unit: string;
  poUnitPrice: number;
  catalogFloorPrice: number;
  unitCost: number;
  stockAvailable: number;
  warehouseHub: string;
  leadTimeDays: number;
  status: "READY_IN_STOCK" | "PRICE_VARIANCE" | "PARTIAL_STOCK_JOBWORK";
}

export interface CustomerEmailTouchpoint {
  id: string;
  stepType: "ORDER_CONFIRMATION" | "DISPATCH_TRACKING" | "COLLECTION_NOTICE";
  title: string;
  to: string;
  cc: string;
  subject: string;
  body: string;
  attachments: string[];
  status: "DRAFT_PENDING_REVIEW" | "APPROVED_QUEUED" | "SENT_DELIVERED";
  sentAt?: string;
}

export interface PurchaseOrderCase {
  id: string;
  receivedAt: string;
  emailSubject: string;
  senderName: string;
  senderEmail: string;
  attachmentName: string;
  rawEmailBody: string;
  poNumber: string;
  poDate: string;
  buyerCompany: string;
  buyerGstin: string;
  contactPhone: string;
  deliveryAddress: string;
  paymentTerms: string;
  requestedDeliveryDate: string;
  aiConfidence: number;
  requiresHumanIntervention: boolean;
  interventionReason: string;
  currentStage: 1 | 2 | 3 | 4;
  workflowStatus:
    | "EMAIL_RECEIVED"
    | "PLAN_AWAITING_APPROVAL"
    | "AMENDMENT_REQUESTED"
    | "ORDER_IN_FULFILLMENT"
    | "READY_FOR_COLLECTION"
    | "DELIVERY_COLLECTED";
  salesPlanSummary: string;
  salesPlanApprovedBy?: string;
  salesPlanApprovedAt?: string;
  salesOrderId?: string;
  proformaInvoiceNo?: string;
  ewayBillNo?: string;
  vehicleNumber?: string;
  transporterName?: string;
  collectionOtp?: string;
  gatePassCode?: string;
  fulfillmentStep: 0 | 1 | 2 | 3 | 4; // 0: Not started, 1: SO Created, 2: QC & Packed, 3: Dispatched/At Hub, 4: Collected by Customer
  items: PoLineItem[];
  emails: CustomerEmailTouchpoint[];
}

export interface AgentLogEntry {
  id: string;
  timestamp: string;
  actor: "AI_AGENT" | "HUMAN_OPERATOR" | "CUSTOMER_PORTAL";
  action: string;
  detail: string;
}

const INITIAL_PO_CASES: PurchaseOrderCase[] = [
  {
    id: "case-havells-8841",
    receivedAt: "10:14 AM Today",
    emailSubject: "URGENT PO #PO-HVL-2026-8841 - Transformer Insulation & Switchgear Dielectrics",
    senderName: "Rajesh Kulkarni (VP Procurement - Havells)",
    senderEmail: "r.kulkarni@havells.com",
    attachmentName: "PO_HVL_2026_8841_Signed.pdf",
    rawEmailBody: `Dear TarasAI Order Desk,

Please find attached our official Purchase Order #PO-HVL-2026-8841 for our Faridabad Switchgear & Motor Division.

PO Summary:
- Buyer: Havells India Limited (GSTIN: 06AAACH0351E1Z4)
- Delivery Plant: Plot No. 6, Sector 15A, Mathura Road Industrial Area, Faridabad, Haryana - 121007
- Payment Terms: Net 45 Days from GRN
- Required Delivery: Within 5 Days

Line Items:
1. Nomex Aramid Dielectric Barrier Sheets (Class H 180°C, 0.25mm) — 800 sq.m @ ₹310 / sq.m
2. CPRI Tested Mica Glass Cloth High-Voltage Tape (25mm x 33m) — 450 Rolls @ ₹525 / roll
3. Medium Voltage Switchgear Breaker Insulator Bushings — 120 Units @ ₹1,320 / unit

Note: We have applied a 2.8% volume discount on Line 1 & Line 2 based on Q4 projections. Kindly confirm order acceptance and share Proforma & dispatch schedule.

Regards,
Rajesh Kulkarni
VP - Strategic Sourcing, Havells India Ltd.`,
    poNumber: "PO-HVL-2026-8841",
    poDate: "2026-10-18",
    buyerCompany: "Havells India Limited",
    buyerGstin: "06AAACH0351E1Z4",
    contactPhone: "+91 98112 84920",
    deliveryAddress: "Plot No. 6, Sector 15A, Mathura Road Industrial Area, Faridabad, Haryana - 121007",
    paymentTerms: "Net 45 Days from GRN",
    requestedDeliveryDate: "2026-10-23",
    aiConfidence: 98,
    requiresHumanIntervention: true,
    interventionReason:
      "Line 1 & Line 2 PO unit prices are 2.8% below standard catalog floor rate (₹310 vs ₹320/sq.m and ₹525 vs ₹540/roll). Net order contribution margin remains strong at 24.6% (₹1,58,150). Human commercial sign-off required.",
    currentStage: 2,
    workflowStatus: "PLAN_AWAITING_APPROVAL",
    salesPlanSummary:
      "100% of requested quantities are available across Noida & Pune hubs. Despite the 2.8% volume price discount requested by Havells, blended gross margin is 24.6% (above the 20% enterprise threshold). Recommended: Approve Sales Plan & dispatch from Noida Hub within 24 hours.",
    fulfillmentStep: 0,
    items: [
      {
        id: "hvl-1",
        sku: "TAR-ELC-NMX25",
        description: "Nomex Aramid Dielectric Barrier Sheets (Class H 180°C, 0.25mm)",
        hsnCode: "85469090",
        quantity: 800,
        unit: "sq.m",
        poUnitPrice: 310,
        catalogFloorPrice: 320,
        unitCost: 232,
        stockAvailable: 1450,
        warehouseHub: "Noida Industrial Hub",
        leadTimeDays: 1,
        status: "PRICE_VARIANCE"
      },
      {
        id: "hvl-2",
        sku: "TAR-TAP-MIC25",
        description: "CPRI Tested Mica Glass Cloth High-Voltage Tape (25mm x 33m)",
        hsnCode: "70199090",
        quantity: 450,
        unit: "Rolls",
        poUnitPrice: 525,
        catalogFloorPrice: 540,
        unitCost: 395,
        stockAvailable: 900,
        warehouseHub: "Noida Industrial Hub",
        leadTimeDays: 1,
        status: "PRICE_VARIANCE"
      },
      {
        id: "hvl-3",
        sku: "TAR-ELC-BSH12",
        description: "MV Switchgear Breaker Insulator Bushings (18 kV/mm)",
        hsnCode: "85389000",
        quantity: 120,
        unit: "Units",
        poUnitPrice: 1320,
        catalogFloorPrice: 1320,
        unitCost: 990,
        stockAvailable: 310,
        warehouseHub: "Pune MIDC Hub",
        leadTimeDays: 2,
        status: "READY_IN_STOCK"
      }
    ],
    emails: [
      {
        id: "em-hvl-1",
        stepType: "ORDER_CONFIRMATION",
        title: "1. PO Acceptance, Sales Order & Tax Proforma",
        to: "r.kulkarni@havells.com",
        cc: "accounts.payable@havells.com, dispatch@tarasai.in",
        subject: "Order Confirmed: PO #PO-HVL-2026-8841 | Sales Order #SO-TAR-2026-8841 & Proforma Attached",
        body: `Dear Mr. Rajesh Kulkarni,

Thank you for your Purchase Order #PO-HVL-2026-8841. Our commercial desk has approved your volume pricing and booked Sales Order #SO-TAR-2026-8841 for immediate fulfillment from our Noida & Pune Industrial Hubs.

Order Summary:
• Buyer Entity: Havells India Limited (GSTIN: 06AAACH0351E1Z4)
• Total Taxable Value: ₹6,42,650.00 (+ 18% GST)
• Assigned Warehouse: Noida Industrial Hub (Primary)
• Scheduled Dispatch Date: Tomorrow, 19 Oct 2026

Attached Documents:
1. Official Sales Order Confirmation (#SO-TAR-2026-8841)
2. Tax Proforma Invoice (#PI-TAR-2026-8841)
3. CPRI & ASTM Batch Quality Assurance Certificates

Warm regards,
TarasAI Autonomous Order Desk`,
        attachments: ["SO-TAR-2026-8841.pdf", "Proforma_Invoice_8841.pdf", "CPRI_Batch_QA_Cert.pdf"],
        status: "DRAFT_PENDING_REVIEW"
      },
      {
        id: "em-hvl-2",
        stepType: "DISPATCH_TRACKING",
        title: "2. Factory Dispatch, e-Way Bill & Vehicle Tracking",
        to: "r.kulkarni@havells.com, stores.faridabad@havells.com",
        cc: "logistics@tarasai.in",
        subject: "Shipment Dispatched: PO #PO-HVL-2026-8841 | e-Way Bill #181094827104 & Vehicle HR-38-AB-9021",
        body: `Dear Havells Stores & Procurement Team,

Your consignment against PO #PO-HVL-2026-8841 has passed final QC inspection and departed from our Noida Industrial Hub.

Logistics & Statutory Details:
• GST e-Way Bill No.: 181094827104
• Dedicated Vehicle No.: HR-38-AB-9021 (TarasAI Express Linehaul)
• Total Pallets / Cartons: 6 Shrink-Wrapped Pallets (28 Master Cartons)
• Estimated Arrival at Faridabad Gate 2: Within 4 Hours

Please keep unloading bay clearance ready.

Best regards,
TarasAI Logistics Control Tower`,
        attachments: ["eWayBill_181094827104.pdf", "Packing_List_8841.pdf", "Tax_Invoice_TI_8841.pdf"],
        status: "DRAFT_PENDING_REVIEW"
      },
      {
        id: "em-hvl-3",
        stepType: "COLLECTION_NOTICE",
        title: "3. Delivery Arrival & Customer Collection Gate Pass (OTP)",
        to: "r.kulkarni@havells.com, stores.faridabad@havells.com",
        cc: "pod-desk@tarasai.in",
        subject: "ACTION REQUIRED: Collect Your Delivery for PO #PO-HVL-2026-8841 (Gate Pass & Handover OTP: 849201)",
        body: `Dear Havells Receiving Team (Faridabad Plant),

Your shipment for PO #PO-HVL-2026-8841 has arrived at your facility / collection dock and is ready for immediate handover and unloading.

Delivery Collection Credentials:
• Collection Gate Pass ID: GP-TAR-8841-HVL
• Secure Handover OTP: 849201 (Share with driver/dock officer upon seal verification)
• Driver Contact: +91 98104 55219 (Vehicle: HR-38-AB-9021)
• Digital GRN / e-POD Link: https://www.tarasai.in/pod/GP-TAR-8841-HVL

Kindly verify the tamper-proof pallet seals, present the Handover OTP to collect the delivery, and sign the digital Proof of Delivery (e-POD).

Thank you for partnering with TarasAI!`,
        attachments: ["Delivery_Gate_Pass_GP8841.pdf", "Digital_ePOD_Manifest.pdf"],
        status: "DRAFT_PENDING_REVIEW"
      }
    ]
  },
  {
    id: "case-tata-4109",
    receivedAt: "09:42 AM Today",
    emailSubject: "Purchase Order #PO-TATA-2026-4109 | EV Battery Pack TIM Pads & Custom EPDM Gaskets",
    senderName: "Ananya Deshmukh (Sourcing Lead - Tata AutoComp)",
    senderEmail: "ananya.d@tataautocomp.com",
    attachmentName: "TACO_EV_PO_4109.pdf",
    rawEmailBody: `Hello TarasAI Team,

Attached is Purchase Order #PO-TATA-2026-4109 for our Chakan EV Battery Pack Assembly Line.

Buyer: Tata AutoComp Systems Limited (GSTIN: 27AAACT2727Q1ZW)
Ship To: Plot D-23, MIDC Chakan Industrial Area Phase II, Pune - 410501
Payment Terms: Net 30 Days via TriFlow Escrow

Items Ordered:
1. Silicone Thermal Interface Gap Pad 6.0 W/m-K (UL 94 V-0, 2.0mm Sheet) — 400 Sheets @ ₹1,450 / sheet
2. Custom Die-Cut IP68 EPDM Battery Enclosure Gaskets (Drawing #TACO-EPDM-09) — 2,500 Units @ ₹140 / unit
3. Solid Core Acrylic Foam VHB Structural Tape (1000µm x 19mm x 33m) — 700 Rolls @ ₹380 / roll

Please confirm rotary die-cutting slot for Line 2 and share the Sales Order.

Thanks,
Ananya Deshmukh
Tata AutoComp Systems Ltd.`,
    poNumber: "PO-TATA-2026-4109",
    poDate: "2026-10-18",
    buyerCompany: "Tata AutoComp Systems Ltd.",
    buyerGstin: "27AAACT2727Q1ZW",
    contactPhone: "+91 98230 11840",
    deliveryAddress: "Plot D-23, MIDC Chakan Industrial Area Phase II, Pune, Maharashtra - 410501",
    paymentTerms: "Net 30 Days (TriFlow Escrow)",
    requestedDeliveryDate: "2026-10-22",
    aiConfidence: 99,
    requiresHumanIntervention: true,
    interventionReason:
      "Line 2 (Custom Die-Cut IP68 EPDM Gaskets - 2,500 units) has 1,500 units in ready stock; remaining 1,000 units scheduled on Rotary Die-Cutter #3 at Pune MIDC Converter Plant (adds 24h lead time). Human production schedule sign-off requested.",
    currentStage: 2,
    workflowStatus: "PLAN_AWAITING_APPROVAL",
    salesPlanSummary:
      "100% catalog price match across all 3 EV battery lines (₹11,96,000 taxable value, 26.8% net margin). Line 1 & Line 3 are ready in Chakan Hub stock; Line 2 allocates 1,500 units from stock + 1,000 units via 24-hour rotary die-cut conversion job-work.",
    fulfillmentStep: 0,
    items: [
      {
        id: "tata-1",
        sku: "TAR-TIM-GAP60",
        description: "Silicone Thermal Interface Gap Pad 6.0 W/m-K (UL 94 V-0, 2.0mm)",
        hsnCode: "39209999",
        quantity: 400,
        unit: "Sheets",
        poUnitPrice: 1450,
        catalogFloorPrice: 1450,
        unitCost: 1060,
        stockAvailable: 620,
        warehouseHub: "Pune MIDC Hub",
        leadTimeDays: 1,
        status: "READY_IN_STOCK"
      },
      {
        id: "tata-2",
        sku: "TAR-DIE-EPDM68",
        description: "Custom Die-Cut IP68 EPDM Battery Enclosure Gaskets (Dwg #TACO-09)",
        hsnCode: "40169320",
        quantity: 2500,
        unit: "Units",
        poUnitPrice: 140,
        catalogFloorPrice: 140,
        unitCost: 98,
        stockAvailable: 1500,
        warehouseHub: "Pune Converter Line #3",
        leadTimeDays: 2,
        status: "PARTIAL_STOCK_JOBWORK"
      },
      {
        id: "tata-3",
        sku: "TAR-TAP-VHB10",
        description: "Solid Core Acrylic Foam VHB Structural Tape (1000µm x 19mm)",
        hsnCode: "39191000",
        quantity: 700,
        unit: "Rolls",
        poUnitPrice: 380,
        catalogFloorPrice: 380,
        unitCost: 285,
        stockAvailable: 1200,
        warehouseHub: "Pune MIDC Hub",
        leadTimeDays: 1,
        status: "READY_IN_STOCK"
      }
    ],
    emails: [
      {
        id: "em-tata-1",
        stepType: "ORDER_CONFIRMATION",
        title: "1. PO Acceptance, Sales Order & Rotary Conversion Schedule",
        to: "ananya.d@tataautocomp.com",
        cc: "ev.supplychain@tataautocomp.com, orders@tarasai.in",
        subject: "Order Confirmed: PO #PO-TATA-2026-4109 | SO #SO-TAR-2026-4109 & Production Slot Locked",
        body: `Dear Ananya,

We have processed your Purchase Order #PO-TATA-2026-4109 and locked Sales Order #SO-TAR-2026-4109 for your Chakan EV Battery Pack Assembly Line.

Fulfillment Allocation:
• Line 1 (400 Sheets Silicone Gap Pad 6.0 W/m-K): Allocated from Pune MIDC Ready Stock
• Line 2 (2,500 Units IP68 EPDM Gaskets): 1,500 from stock + 1,000 scheduled on Rotary Laser Line #3 (Completion: 24 hrs)
• Line 3 (700 Rolls VHB 1000µm Tape): Allocated from Pune MIDC Ready Stock

Attached are your Sales Order, Tax Proforma Invoice, and UL 94 V-0 / ASTM D3330 batch certificates.

Best regards,
TarasAI Autonomous Order Desk`,
        attachments: ["SO-TAR-2026-4109.pdf", "Proforma_Invoice_4109.pdf", "UL94_ASTM_Test_Report.pdf"],
        status: "DRAFT_PENDING_REVIEW"
      },
      {
        id: "em-tata-2",
        stepType: "DISPATCH_TRACKING",
        title: "2. Factory Dispatch, e-Way Bill & Chakan Milk-Run Tracking",
        to: "ananya.d@tataautocomp.com, chakan.stores@tataautocomp.com",
        cc: "logistics@tarasai.in",
        subject: "Dispatched to Chakan Phase-II: PO #PO-TATA-2026-4109 | Vehicle MH-14-JL-4402",
        body: `Dear Tata AutoComp Logistics Team,

Your complete order for PO #PO-TATA-2026-4109 has been dispatched from our Pune MIDC Hub via dedicated milk-run vehicle MH-14-JL-4402.

• GST e-Way Bill No.: 271088392011
• Transit Time to Chakan Plot D-23: ~45 Minutes
• All kiss-cut gasket rolls and TIM sheets include barcode lot labels for direct line-side feeding.

Regards,
TarasAI Logistics Control Tower`,
        attachments: ["eWayBill_271088392011.pdf", "Packing_Slip_4109.pdf"],
        status: "DRAFT_PENDING_REVIEW"
      },
      {
        id: "em-tata-3",
        stepType: "COLLECTION_NOTICE",
        title: "3. Delivery Arrival & Customer Collection Gate Pass (OTP)",
        to: "ananya.d@tataautocomp.com, chakan.stores@tataautocomp.com",
        cc: "pod-desk@tarasai.in",
        subject: "READY FOR COLLECTION: PO #PO-TATA-2026-4109 at Chakan Receiving Bay (OTP: 551904)",
        body: `Dear Tata AutoComp Receiving Team,

Your consignment for PO #PO-TATA-2026-4109 is now at Chakan Plant Receiving Bay #4 and ready for collection.

Collection Credentials:
• Gate Pass ID: GP-TAR-4109-TACO
• Handover Verification OTP: 551904
• Vehicle / Driver: MH-14-JL-4402 (+91 98224 77103)

Please provide the OTP to complete handover and generate your automated digital GRN receipt.

Warm regards,
TarasAI Fulfilment Desk`,
        attachments: ["Gate_Pass_GP4109.pdf", "ePOD_Receipt_Template.pdf"],
        status: "DRAFT_PENDING_REVIEW"
      }
    ]
  },
  {
    id: "case-bajaj-5592",
    receivedAt: "Yesterday, 04:15 PM",
    emailSubject: "PO #PO-BAJ-2026-5592 - Automotive Wire Harness Fleece Tape & Silicone Resin",
    senderName: "Vikramaditya Joshi (Bajaj Auto Waluj Plant)",
    senderEmail: "v.joshi@bajajauto.co.in",
    attachmentName: "PO_BAJ_5592_Waluj.pdf",
    rawEmailBody: `Dear TarasAI Team,

Please process attached PO #PO-BAJ-2026-5592 for our Waluj Plant (Aurangabad).

1. Automotive Wire Harness PET Fleece Acoustic Tape (19mm x 25m) — 2,000 Rolls @ ₹85 / roll
2. Silicone PSA Resin SR545 Drum (200 Kg Sealed Drum) — 2,000 Kgs @ ₹110 / kg

Deliver to: Bajaj Auto Ltd, Waluj MIDC, Chhatrapati Sambhajinagar (Aurangabad) - 431136.

Regards,
Vikramaditya Joshi`,
    poNumber: "PO-BAJ-2026-5592",
    poDate: "2026-10-17",
    buyerCompany: "Bajaj Auto Limited",
    buyerGstin: "27AAACB2902M1Z5",
    contactPhone: "+91 98220 99310",
    deliveryAddress: "Bajaj Auto Complex, Waluj MIDC, Aurangabad, Maharashtra - 431136",
    paymentTerms: "Net 30 Days",
    requestedDeliveryDate: "2026-10-19",
    aiConfidence: 99,
    requiresHumanIntervention: false,
    interventionReason: "Zero discrepancies. 100% contract price match and full stock availability.",
    currentStage: 4,
    workflowStatus: "READY_FOR_COLLECTION",
    salesPlanSummary:
      "Approved and fulfilled from Pune & Bhiwandi hubs. Order is packed, e-Way bill generated, and shipment has reached Waluj Receiving Hub awaiting final customer collection email & OTP sign-off.",
    salesPlanApprovedBy: "Aryan (Commercial Director)",
    salesPlanApprovedAt: "17 Oct 2026, 04:20 PM",
    salesOrderId: "SO-TAR-2026-5592",
    proformaInvoiceNo: "PI-TAR-2026-5592",
    ewayBillNo: "271099481205",
    vehicleNumber: "MH-20-EL-7781",
    transporterName: "TarasAI Express Linehaul",
    collectionOtp: "390412",
    gatePassCode: "GP-TAR-5592-BAJ",
    fulfillmentStep: 3,
    items: [
      {
        id: "baj-1",
        sku: "TAR-HAR-FLC19",
        description: "Automotive Wire Harness PET Fleece Acoustic Tape (19mm x 25m)",
        hsnCode: "59061000",
        quantity: 2000,
        unit: "Rolls",
        poUnitPrice: 85,
        catalogFloorPrice: 85,
        unitCost: 62,
        stockAvailable: 5400,
        warehouseHub: "Pune MIDC Hub",
        leadTimeDays: 1,
        status: "READY_IN_STOCK"
      },
      {
        id: "baj-2",
        sku: "TAR-RES-SR545",
        description: "Silicone PSA Resin SR545 Wholesale Precursor (200 Kg Drums)",
        hsnCode: "39100090",
        quantity: 2000,
        unit: "Kgs",
        poUnitPrice: 110,
        catalogFloorPrice: 110,
        unitCost: 84,
        stockAvailable: 6000,
        warehouseHub: "Bhiwandi Chemical Hub",
        leadTimeDays: 1,
        status: "READY_IN_STOCK"
      }
    ],
    emails: [
      {
        id: "em-baj-1",
        stepType: "ORDER_CONFIRMATION",
        title: "1. PO Acceptance, Sales Order & Tax Proforma",
        to: "v.joshi@bajajauto.co.in",
        cc: "waluj.stores@bajajauto.co.in",
        subject: "Order Confirmed: PO #PO-BAJ-2026-5592 | SO #SO-TAR-2026-5592",
        body: `Dear Mr. Vikramaditya Joshi,\n\nYour PO #PO-BAJ-2026-5592 has been confirmed under Sales Order #SO-TAR-2026-5592. Proforma Invoice and Batch Test Certificates are attached.\n\nRegards,\nTarasAI Autonomous Order Desk`,
        attachments: ["SO-TAR-2026-5592.pdf", "Proforma_Invoice_5592.pdf"],
        status: "SENT_DELIVERED",
        sentAt: "17 Oct, 04:21 PM"
      },
      {
        id: "em-baj-2",
        stepType: "DISPATCH_TRACKING",
        title: "2. Factory Dispatch, e-Way Bill & Vehicle Tracking",
        to: "v.joshi@bajajauto.co.in, waluj.stores@bajajauto.co.in",
        cc: "logistics@tarasai.in",
        subject: "Shipment Dispatched: PO #PO-BAJ-2026-5592 | e-Way Bill #271099481205",
        body: `Dear Bajaj Auto Stores Team,\n\nYour shipment against PO #PO-BAJ-2026-5592 has departed via vehicle MH-20-EL-7781 with e-Way Bill #271099481205.\n\nRegards,\nTarasAI Logistics Control Tower`,
        attachments: ["eWayBill_271099481205.pdf", "Packing_List_5592.pdf"],
        status: "SENT_DELIVERED",
        sentAt: "18 Oct, 06:30 AM"
      },
      {
        id: "em-baj-3",
        stepType: "COLLECTION_NOTICE",
        title: "3. Delivery Arrival & Customer Collection Gate Pass (OTP)",
        to: "v.joshi@bajajauto.co.in, waluj.stores@bajajauto.co.in",
        cc: "pod-desk@tarasai.in",
        subject: "ACTION REQUIRED: Collect Your Delivery for PO #PO-BAJ-2026-5592 (Gate Pass & OTP: 390412)",
        body: `Dear Bajaj Auto Waluj Receiving Team,

Your shipment for PO #PO-BAJ-2026-5592 (2,000 Rolls Wire Harness Fleece Tape & 2,000 Kgs Silicone PSA Resin SR545) has arrived at Waluj Plant Gate #3 and is ready for collection.

Delivery Collection Credentials:
• Collection Gate Pass ID: GP-TAR-5592-BAJ
• Handover OTP: 390412
• Vehicle / Driver: MH-20-EL-7781 (+91 98231 09412)

Please share the Handover OTP with the linehaul supervisor to collect your delivery and complete the digital Proof of Delivery.

Best regards,
TarasAI Fulfilment Desk`,
        attachments: ["Delivery_Gate_Pass_GP5592.pdf", "Digital_ePOD_5592.pdf"],
        status: "DRAFT_PENDING_REVIEW"
      }
    ]
  }
];

export default function PoAutomationDemoPage() {
  // Cases state
  const [cases, setCases] = useState<PurchaseOrderCase[]>(INITIAL_PO_CASES);
  const [selectedCaseId, setSelectedCaseId] = useState<string>(INITIAL_PO_CASES[0].id);

  // Active stage view tab (1 to 4)
  const [activeStageTab, setActiveStageTab] = useState<1 | 2 | 3 | 4>(2);

  // Customer-configurable Human Intervention Policy Toggles
  const [humanGates, setHumanGates] = useState({
    gate1DiscrepancyReview: true,
    gate2SalesPlanApproval: true,
    gate3OrderGeneration: false, // Auto-generate SO & e-Way Bill once plan approved
    gate4CollectionEmailReview: true // Human reviews collection email before sending
  });
  const [showGateConfig, setShowGateConfig] = useState(false);

  // Custom PO Injection Modal State
  const [isInjectModalOpen, setIsInjectModalOpen] = useState(false);
  const [customSenderEmail, setCustomSenderEmail] = useState("procurement@larsentoubro.com");
  const [customSubject, setCustomSubject] = useState(
    "Purchase Order #PO-LT-2026-9920 - Heavy Electrical Switchgear & Polyimide Tapes"
  );
  const [customFileName, setCustomFileName] = useState("LT_Switchgear_PO_9920.pdf");
  const [customRawText, setCustomRawText] = useState(
    `Buyer: Larsen & Toubro Limited (Electrical & Automation)\nGSTIN: 27AAACL0140P1Z1\nDelivery Address: L&T Switchgear Works, Gate No. 4, Powai Campus, Mumbai - 400072\nPayment Terms: Net 45 Days\nPO No: PO-LT-2026-9920\n\n1. High-Temp Polyimide SMT Masking Tape 50µm x 25mm - 1500 Rolls @ ₹140\n2. Silicone Thermal Interface Gap Pad 6.0 W/m-K - 200 Sheets @ ₹1450\n3. Custom EPDM IP68 Switchgear Cabinet Gaskets - 1800 Units @ ₹95`
  );
  const [isParsingCustomPo, setIsParsingCustomPo] = useState(false);

  // Inline editing state for Stage 2 line items & Stage 4 emails
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editPriceVal, setEditPriceVal] = useState<string>("");
  const [editQtyVal, setEditQtyVal] = useState<string>("");
  const [selectedEmailId, setSelectedEmailId] = useState<string>("");
  const [isRunningAutopilot, setIsRunningAutopilot] = useState(false);

  // Live Agent Execution Audit Trail
  const [agentLogs, setAgentLogs] = useState<AgentLogEntry[]>([
    {
      id: "log-1",
      timestamp: "10:14:02 AM",
      actor: "AI_AGENT",
      action: "Ingested Incoming PO Email",
      detail: "Read email from r.kulkarni@havells.com with attachment PO_HVL_2026_8841_Signed.pdf (98% confidence)"
    },
    {
      id: "log-2",
      timestamp: "10:14:05 AM",
      actor: "AI_AGENT",
      action: "Prepared Sales & Sourcing Plan",
      detail: "Allocated 1,370 total units across Noida & Pune hubs. Flagged 2.8% volume price variance for Human Commercial Approval."
    }
  ]);

  const activeCase = useMemo(
    () => cases.find((c) => c.id === selectedCaseId) || cases[0],
    [cases, selectedCaseId]
  );

  // Keep selected email synced with active case
  const activeEmail = useMemo(() => {
    const found = activeCase.emails.find((e) => e.id === selectedEmailId);
    return found || activeCase.emails[activeCase.emails.length - 1];
  }, [activeCase, selectedEmailId]);

  const addLog = (actor: AgentLogEntry["actor"], action: string, detail: string) => {
    const now = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
    setAgentLogs((prev) => [
      { id: `log-${Date.now()}-${Math.random()}`, timestamp: now, actor, action, detail },
      ...prev
    ]);
  };

  // Financial calculations for active PO
  const financials = useMemo(() => {
    const subtotal = activeCase.items.reduce((acc, item) => acc + item.quantity * item.poUnitPrice, 0);
    const totalCost = activeCase.items.reduce((acc, item) => acc + item.quantity * item.unitCost, 0);
    const gstAmount = Math.round(subtotal * 0.18);
    const grandTotal = subtotal + gstAmount;
    const netMarginRs = subtotal - totalCost;
    const netMarginPct = subtotal > 0 ? ((netMarginRs / subtotal) * 100).toFixed(1) : "0.0";
    const catalogValue = activeCase.items.reduce(
      (acc, item) => acc + item.quantity * item.catalogFloorPrice,
      0
    );
    const varianceRs = subtotal - catalogValue;

    return {
      subtotal,
      totalCost,
      gstAmount,
      grandTotal,
      netMarginRs,
      netMarginPct,
      catalogValue,
      varianceRs
    };
  }, [activeCase]);

  // Select a PO from the Inbox
  const handleSelectCase = (poCase: PurchaseOrderCase) => {
    setSelectedCaseId(poCase.id);
    setActiveStageTab(poCase.currentStage);
    setSelectedEmailId(poCase.emails[0]?.id || "");
    setEditingItemId(null);
  };

  // Save inline edit on a PO line item in Stage 2
  const handleSaveItemEdit = (itemId: string) => {
    const newPrice = parseFloat(editPriceVal);
    const newQty = parseInt(editQtyVal, 10);
    if (isNaN(newPrice) || isNaN(newQty) || newPrice <= 0 || newQty <= 0) return;

    setCases((prev) =>
      prev.map((c) => {
        if (c.id !== activeCase.id) return c;
        const updatedItems = c.items.map((it) => {
          if (it.id !== itemId) return it;
          const isVar = newPrice < it.catalogFloorPrice;
          return {
            ...it,
            poUnitPrice: newPrice,
            quantity: newQty,
            status: (isVar ? "PRICE_VARIANCE" : "READY_IN_STOCK") as PoLineItem["status"]
          };
        });
        return { ...c, items: updatedItems };
      })
    );
    setEditingItemId(null);
    addLog(
      "HUMAN_OPERATOR",
      "Adjusted Sales Plan Line Item",
      `Updated line item rate to ₹${newPrice} and quantity to ${newQty} on ${activeCase.poNumber}`
    );
  };

  // Stage 2 -> Stage 3: Approve Sales Plan & Generate Order + Dispatch Documents
  const handleApproveSalesPlan = () => {
    const nowStr = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const suffix = activeCase.poNumber.split("-").pop() || "9001";
    const soId = `SO-TAR-2026-${suffix}`;
    const piId = `PI-TAR-2026-${suffix}`;
    const eway = `2710${Math.floor(10000000 + Math.random() * 89999999)}`;
    const otp = `${Math.floor(100000 + Math.random() * 899999)}`;
    const gatePass = `GP-TAR-${suffix}`;

    setCases((prev) =>
      prev.map((c) => {
        if (c.id !== activeCase.id) return c;
        const updatedEmails = c.emails.map((em, idx) =>
          idx === 0
            ? {
                ...em,
                status: (humanGates.gate4CollectionEmailReview
                  ? "APPROVED_QUEUED"
                  : "SENT_DELIVERED") as CustomerEmailTouchpoint["status"],
                sentAt: "Just now"
              }
            : em
        );
        return {
          ...c,
          requiresHumanIntervention: false,
          currentStage: 3,
          workflowStatus: "ORDER_IN_FULFILLMENT",
          salesPlanApprovedBy: "Human Commercial Desk (Verified)",
          salesPlanApprovedAt: `Today, ${nowStr}`,
          salesOrderId: soId,
          proformaInvoiceNo: piId,
          ewayBillNo: eway,
          vehicleNumber: "MH-14-kog-8821",
          transporterName: "TarasAI Priority Linehaul",
          collectionOtp: otp,
          gatePassCode: gatePass,
          fulfillmentStep: 2,
          emails: updatedEmails
        };
      })
    );

    addLog(
      "HUMAN_OPERATOR",
      "Approved Sales & Sourcing Plan",
      `Signed off Sales Plan for ${activeCase.poNumber} (Net Margin: ${financials.netMarginPct}%)`
    );
    addLog(
      "AI_AGENT",
      "Generated ERP Sales Order & Statutory Docs",
      `Created ${soId}, Proforma ${piId}, and reserved warehouse inventory.`
    );
    setActiveStageTab(3);
  };

  // Request Buyer Amendment if Human rejects price variance
  const handleRequestBuyerAmendment = () => {
    setCases((prev) =>
      prev.map((c) =>
        c.id === activeCase.id
          ? {
              ...c,
              workflowStatus: "AMENDMENT_REQUESTED",
              currentStage: 4
            }
          : c
      )
    );
    addLog(
      "HUMAN_OPERATOR",
      "Flagged PO for Buyer Price Amendment",
      `Requested revised PO matching catalog floor rates for ${activeCase.poNumber}`
    );
    setActiveStageTab(4);
  };

  // Stage 3 -> Stage 4: Advance Fulfillment to "Ready for Customer Collection"
  const handleAdvanceFulfillmentToCollection = () => {
    setCases((prev) =>
      prev.map((c) => {
        if (c.id !== activeCase.id) return c;
        const updatedEmails = c.emails.map((em) =>
          em.stepType === "ORDER_CONFIRMATION" || em.stepType === "DISPATCH_TRACKING"
            ? { ...em, status: "SENT_DELIVERED" as const, sentAt: em.sentAt || "Just now" }
            : em
        );
        return {
          ...c,
          currentStage: 4,
          fulfillmentStep: 3,
          workflowStatus: "READY_FOR_COLLECTION",
          emails: updatedEmails
        };
      })
    );

    addLog(
      "AI_AGENT",
      "Dispatched Consignment & Generated Collection Gate Pass",
      `e-Way Bill ${activeCase.ewayBillNo || "271088492012"} active. Consignment arrived at receiving dock; Collection Notice drafted.`
    );
    const collectionEmail = activeCase.emails.find((e) => e.stepType === "COLLECTION_NOTICE");
    if (collectionEmail) setSelectedEmailId(collectionEmail.id);
    setActiveStageTab(4);
  };

  // Stage 4: Approve & Send Customer Email
  const handleSendCustomerEmail = (emailId: string) => {
    const targetEmail = activeCase.emails.find((e) => e.id === emailId);
    setCases((prev) =>
      prev.map((c) => {
        if (c.id !== activeCase.id) return c;
        return {
          ...c,
          emails: c.emails.map((em) =>
            em.id === emailId ? { ...em, status: "SENT_DELIVERED", sentAt: "Just now" } : em
          )
        };
      })
    );

    if (targetEmail) {
      addLog(
        "AI_AGENT",
        `Sent Email: ${targetEmail.title}`,
        `Dispatched to ${targetEmail.to} with ${targetEmail.attachments.length} attachment(s).`
      );
    }
  };

  // Stage 4 Final Step: Simulate Customer Collecting Delivery with OTP
  const handleConfirmCustomerCollection = () => {
    setCases((prev) =>
      prev.map((c) => {
        if (c.id !== activeCase.id) return c;
        return {
          ...c,
          fulfillmentStep: 4,
          workflowStatus: "DELIVERY_COLLECTED",
          emails: c.emails.map((em) => ({
            ...em,
            status: "SENT_DELIVERED",
            sentAt: em.sentAt || "Just now"
          }))
        };
      })
    );

    addLog(
      "CUSTOMER_PORTAL",
      "Delivery Collected & Digital e-POD Signed",
      `${activeCase.buyerCompany} verified OTP ${activeCase.collectionOtp || "849201"} and collected consignment under Gate Pass ${activeCase.gatePassCode || "GP-TAR-8841"}.`
    );
  };

  // Run Autonomous Agent Demo Sequence
  const handleRunAutopilot = () => {
    setIsRunningAutopilot(true);
    addLog(
      "AI_AGENT",
      "Autonomous Pipeline Initiated",
      `Executing end-to-end PO workflow for ${activeCase.poNumber} respecting Human Intervention Gates.`
    );

    setTimeout(() => {
      if (activeCase.currentStage === 1) {
        setActiveStageTab(2);
      }
      if (humanGates.gate2SalesPlanApproval && !activeCase.salesPlanApprovedAt) {
        addLog(
          "AI_AGENT",
          "Paused at Human Gate #2 (Sales Plan Approval)",
          `Waiting for human sign-off on ${activeCase.poNumber} before releasing order to warehouse.`
        );
        setActiveStageTab(2);
        setIsRunningAutopilot(false);
      } else {
        handleApproveSalesPlan();
        setTimeout(() => {
          handleAdvanceFulfillmentToCollection();
          setIsRunningAutopilot(false);
        }, 900);
      }
    }, 700);
  };

  // Handle Custom PO Email / File Upload & Live AI Parsing
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCustomFileName(file.name);
    try {
      const text = await file.text();
      if (text && text.trim().length > 10) {
        setCustomRawText(text.slice(0, 6000));
      }
    } catch {
      // Keep default text if binary PDF
    }
  };

  const handleInjectCustomPo = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsParsingCustomPo(true);
    try {
      const res = await fetch("/api/po-automation/parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rawEmailText: customRawText,
          senderEmail: customSenderEmail,
          subject: customSubject,
          fileName: customFileName
        })
      });
      const data = await res.json();
      if (data.success && data.parsedPo) {
        const p = data.parsedPo;
        const newCaseId = `case-custom-${Date.now()}`;
        const suffix = p.poNumber.split("-").pop() || "9920";

        const newCase: PurchaseOrderCase = {
          id: newCaseId,
          receivedAt: "Just now",
          emailSubject: customSubject,
          senderName: `${p.contactName || "Procurement Head"} (${p.buyerCompany})`,
          senderEmail: customSenderEmail,
          attachmentName: customFileName,
          rawEmailBody: customRawText,
          poNumber: p.poNumber,
          poDate: p.poDate || new Date().toISOString().split("T")[0],
          buyerCompany: p.buyerCompany,
          buyerGstin: p.buyerGstin || "27AAACL0140P1Z1",
          contactPhone: p.contactPhone || "+91 98201 44510",
          deliveryAddress: p.deliveryAddress,
          paymentTerms: p.paymentTerms || "Net 30 Days",
          requestedDeliveryDate: p.requestedDeliveryDate || "Within 4 Days",
          aiConfidence: p.aiConfidence || 97,
          requiresHumanIntervention: p.requiresHumanIntervention ?? true,
          interventionReason:
            p.interventionReason ||
            "Custom PO ingested from live inbox. Routed to Human Commercial Gate for Sales Plan approval.",
          currentStage: 2,
          workflowStatus: "PLAN_AWAITING_APPROVAL",
          salesPlanSummary: p.salesPlanSummary,
          fulfillmentStep: 0,
          items: p.items,
          emails: [
            {
              id: `em-${newCaseId}-1`,
              stepType: "ORDER_CONFIRMATION",
              title: "1. PO Acceptance, Sales Order & Tax Proforma",
              to: customSenderEmail,
              cc: "orders@tarasai.in",
              subject: `Order Confirmed: ${p.poNumber} | Sales Order #SO-TAR-2026-${suffix} & Proforma Attached`,
              body: `Dear ${p.buyerCompany} Procurement Team,\n\nWe have received and verified your Purchase Order ${p.poNumber}. Sales Order #SO-TAR-2026-${suffix} and Tax Proforma Invoice are attached for your records.\n\nDelivery Address: ${p.deliveryAddress}\nScheduled Dispatch: Within 24-48 Hours\n\nBest regards,\nTarasAI Autonomous Order Desk`,
              attachments: [`SO-TAR-2026-${suffix}.pdf`, `Proforma_PI_${suffix}.pdf`, "Batch_QA_Certificate.pdf"],
              status: "DRAFT_PENDING_REVIEW"
            },
            {
              id: `em-${newCaseId}-2`,
              stepType: "DISPATCH_TRACKING",
              title: "2. Factory Dispatch, e-Way Bill & Vehicle Tracking",
              to: customSenderEmail,
              cc: "logistics@tarasai.in",
              subject: `Shipment Dispatched: ${p.poNumber} | e-Way Bill & Linehaul Tracking`,
              body: `Dear ${p.buyerCompany} Receiving Team,\n\nYour order against ${p.poNumber} has been packed and dispatched from our fulfillment hub.\n\n• Vehicle No.: MH-14-EL-9012\n• e-Way Bill & Packing List attached.\n\nRegards,\nTarasAI Logistics Control Tower`,
              attachments: [`eWayBill_${suffix}.pdf`, `Packing_List_${suffix}.pdf`],
              status: "DRAFT_PENDING_REVIEW"
            },
            {
              id: `em-${newCaseId}-3`,
              stepType: "COLLECTION_NOTICE",
              title: "3. Delivery Arrival & Customer Collection Gate Pass (OTP)",
              to: customSenderEmail,
              cc: "pod-desk@tarasai.in",
              subject: `ACTION REQUIRED: Collect Your Delivery for ${p.poNumber} (Gate Pass & Handover OTP: 774109)`,
              body: `Dear ${p.buyerCompany} Stores & Receiving Team,\n\nYour shipment for ${p.poNumber} has arrived at ${p.deliveryAddress} and is ready for collection.\n\n• Gate Pass ID: GP-TAR-${suffix}\n• Handover Verification OTP: 774109\n\nPlease share the OTP at the receiving bay to collect your delivery and sign the digital e-POD.\n\nThank you,\nTarasAI Fulfilment Desk`,
              attachments: [`Delivery_Gate_Pass_${suffix}.pdf`, `Digital_ePOD_${suffix}.pdf`],
              status: "DRAFT_PENDING_REVIEW"
            }
          ]
        };

        setCases((prev) => [newCase, ...prev]);
        setSelectedCaseId(newCaseId);
        setActiveStageTab(2);
        setSelectedEmailId(newCase.emails[0].id);
        setIsInjectModalOpen(false);

        addLog(
          "AI_AGENT",
          `Live Extracted PO ${p.poNumber} (${data.source === "AI_AGENT_LIVE" ? "Groq Llama-3.3-70B" : "Structured Engine"})`,
          `Parsed ${p.items.length} line items for ${p.buyerCompany} and generated Sales Plan.`
        );
      }
    } catch (err) {
      console.error("Failed to inject custom PO:", err);
    } finally {
      setIsParsingCustomPo(false);
    }
  };

  return (
    <div className="max-w-[1440px] mx-auto pb-20 space-y-6 font-sans text-slate-900">
      {/* 1. TOP COMMAND HEADER */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono font-bold bg-blue-50 text-[#0B4FDF] border border-blue-200">
                <Bot className="w-3.5 h-3.5" /> AUTONOMOUS PO-TO-DELIVERY ENGINE
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Listening: procurement-inbox@tarasai.in
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-mono font-bold bg-amber-50 text-amber-800 border border-amber-200">
                <UserCheck className="w-3.5 h-3.5" /> Human-in-the-Loop Active
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
              Purchase Order Automation & Fulfillment Copilot
            </h1>
            <p className="text-xs sm:text-sm text-slate-500">
              End-to-end autonomous pipeline: Email PO ingestion &rarr; AI Sales &amp; Margin Plan &rarr; Human Approval Gate &rarr; Order &amp; e-Way Bill &rarr; Customer Delivery Collection.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setShowGateConfig(!showGateConfig)}
              className={`px-3.5 py-2.5 rounded-xl border text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer ${
                showGateConfig
                  ? "bg-slate-900 text-white border-slate-900"
                  : "bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200"
              }`}
            >
              <Sliders className="w-4 h-4" />
              <span>Human Intervention Rules</span>
            </button>

            <button
              onClick={() => setIsInjectModalOpen(true)}
              className="px-3.5 py-2.5 rounded-xl bg-white hover:bg-blue-50 text-[#0B4FDF] border border-[#0B4FDF]/30 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
            >
              <Plus className="w-4 h-4" />
              <span>Simulate / Upload New PO Email</span>
            </button>

            <button
              onClick={handleRunAutopilot}
              disabled={isRunningAutopilot}
              className="px-4 py-2.5 rounded-xl bg-[#FF5500] hover:bg-[#E04800] text-white text-xs font-extrabold flex items-center gap-2 transition-all shadow-sm cursor-pointer disabled:opacity-50"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>{isRunningAutopilot ? "Running Agent..." : "Run Autonomous Step"}</span>
            </button>
          </div>
        </div>

        {/* Collapsible Customer-Configurable Human Intervention Matrix */}
        <AnimatePresence>
          {showGateConfig && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-5 pt-5 border-t border-slate-200 overflow-hidden"
            >
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="text-xs font-bold uppercase font-mono text-slate-800">
                    Customer-Configurable Human Intervention Gates
                  </h3>
                  <p className="text-xs text-slate-500">
                    Configure exactly where the AI Agent executes autonomously vs. where it pauses for mandatory human sign-off.
                  </p>
                </div>
                <span className="text-[11px] font-mono text-[#0B4FDF] font-bold">
                  Custom Enterprise Policy Mode
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {[
                  {
                    key: "gate1DiscrepancyReview" as const,
                    stage: "Stage 1 Gate",
                    title: "PO Discrepancy & Price Variance",
                    desc: "Flag human if PO unit rate differs from contract/catalog floor"
                  },
                  {
                    key: "gate2SalesPlanApproval" as const,
                    stage: "Stage 2 Gate",
                    title: "Sales & Sourcing Plan Sign-Off",
                    desc: "Require commercial manager approval before booking Sales Order"
                  },
                  {
                    key: "gate3OrderGeneration" as const,
                    stage: "Stage 3 Gate",
                    title: "Proforma & e-Way Bill Generation",
                    desc: "Pause before generating tax invoice & e-Way bill (Off = 100% Auto)"
                  },
                  {
                    key: "gate4CollectionEmailReview" as const,
                    stage: "Stage 4 Gate",
                    title: "Customer Collection Emails",
                    desc: "Require human review before dispatching collection OTP email"
                  }
                ].map((gate) => {
                  const isEnabled = humanGates[gate.key];
                  return (
                    <div
                      key={gate.key}
                      onClick={() =>
                        setHumanGates((prev) => ({ ...prev, [gate.key]: !prev[gate.key] }))
                      }
                      className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between gap-2 ${
                        isEnabled
                          ? "bg-amber-50/60 border-amber-300"
                          : "bg-emerald-50/40 border-emerald-200"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono font-bold uppercase text-slate-500">
                          {gate.stage}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                            isEnabled
                              ? "bg-amber-200/80 text-amber-900"
                              : "bg-emerald-200/80 text-emerald-900"
                          }`}
                        >
                          {isEnabled ? "HUMAN GATE ON" : "100% AUTO"}
                        </span>
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900">{gate.title}</div>
                        <p className="text-[11px] text-slate-600 mt-0.5 leading-snug">{gate.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 2. MAIN WORKSPACE GRID: LEFT INBOX (3 COLS) + RIGHT PIPELINE (9 COLS) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: LIVE PROCUREMENT EMAIL INBOX */}
        <aside className="lg:col-span-4 xl:col-span-3 space-y-4">
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
            <div className="p-4 border-b border-slate-200 bg-slate-50/80 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#0B4FDF]" />
                <span className="text-xs font-bold uppercase font-mono text-slate-800">
                  Incoming PO Inbox ({cases.length})
                </span>
              </div>
              <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-bold">
                IMAP Synced
              </span>
            </div>

            <div className="divide-y divide-slate-100 max-h-[640px] overflow-y-auto">
              {cases.map((po) => {
                const isSelected = po.id === activeCase.id;
                const poTotal = po.items.reduce((s, i) => s + i.quantity * i.poUnitPrice, 0);

                return (
                  <button
                    key={po.id}
                    onClick={() => handleSelectCase(po)}
                    className={`w-full text-left p-4 transition-all cursor-pointer block ${
                      isSelected
                        ? "bg-blue-50/70 border-l-4 border-l-[#0B4FDF]"
                        : "hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="text-[10px] font-mono font-bold text-[#0B4FDF] bg-blue-100/80 px-2 py-0.5 rounded">
                        {po.poNumber}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">{po.receivedAt}</span>
                    </div>

                    <div className="font-bold text-xs text-slate-900 truncate">
                      {po.buyerCompany}
                    </div>
                    <div className="text-[11px] text-slate-600 line-clamp-1 mt-0.5">
                      {po.emailSubject}
                    </div>

                    <div className="mt-2.5 flex items-center justify-between gap-2">
                      <span className="text-xs font-mono font-extrabold text-slate-900">
                        ₹{poTotal.toLocaleString("en-IN")}
                      </span>

                      {po.workflowStatus === "PLAN_AWAITING_APPROVAL" && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-100 text-amber-900 border border-amber-300">
                          <AlertTriangle className="w-3 h-3" /> Needs Approval
                        </span>
                      )}
                      {po.workflowStatus === "ORDER_IN_FULFILLMENT" && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-100 text-blue-900">
                          <Truck className="w-3 h-3" /> In Fulfillment
                        </span>
                      )}
                      {po.workflowStatus === "READY_FOR_COLLECTION" && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-purple-100 text-purple-900 border border-purple-200">
                          <PackageCheck className="w-3 h-3" /> Collect Delivery
                        </span>
                      )}
                      {po.workflowStatus === "DELIVERY_COLLECTED" && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-100 text-emerald-900">
                          <CheckCircle2 className="w-3 h-3" /> Closed (e-POD)
                        </span>
                      )}
                      {po.workflowStatus === "AMENDMENT_REQUESTED" && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-100 text-rose-900">
                          Amendment Sent
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* LIVE AI AGENT EXECUTION AUDIT LOG */}
          <div className="bg-slate-900 text-slate-100 rounded-2xl p-4 space-y-3 shadow-md border border-slate-800">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-white">
                  Agent Execution Trace
                </span>
              </div>
              <span className="text-[10px] font-mono text-emerald-400">Live Telemetry</span>
            </div>

            <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1 text-[11px] font-mono">
              {agentLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-2.5 rounded-lg bg-slate-800/90 border border-slate-700/70 space-y-1"
                >
                  <div className="flex items-center justify-between text-[10px]">
                    <span
                      className={`font-bold px-1.5 py-0.5 rounded ${
                        log.actor === "AI_AGENT"
                          ? "bg-blue-500/20 text-blue-300"
                          : log.actor === "HUMAN_OPERATOR"
                          ? "bg-amber-500/20 text-amber-300"
                          : "bg-emerald-500/20 text-emerald-300"
                      }`}
                    >
                      {log.actor}
                    </span>
                    <span className="text-slate-400">{log.timestamp}</span>
                  </div>
                  <div className="font-bold text-white">{log.action}</div>
                  <div className="text-slate-300 text-[10px] leading-relaxed font-sans">
                    {log.detail}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </aside>

        {/* RIGHT COLUMN: 4-STAGE INTERACTIVE PIPELINE */}
        <main className="lg:col-span-8 xl:col-span-9 space-y-5">
          {/* PIPELINE STAGE STEPPER BAR */}
          <div className="bg-white border border-slate-200 rounded-2xl p-3 shadow-xs">
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
              {[
                {
                  step: 1 as const,
                  title: "1. Mail & PO Ingestion",
                  subtitle: "AI OCR & Discrepancy Check",
                  icon: Mail
                },
                {
                  step: 2 as const,
                  title: "2. Sales Plan & Approval",
                  subtitle: "Margin, Stock & Human Sign-Off",
                  icon: UserCheck
                },
                {
                  step: 3 as const,
                  title: "3. Order & Dispatch Prep",
                  subtitle: "SO, Proforma, Packing & e-Way Bill",
                  icon: Truck
                },
                {
                  step: 4 as const,
                  title: "4. Customer Emails & Collection",
                  subtitle: "Gate Pass, OTP & Delivery POD",
                  icon: PackageCheck
                }
              ].map((st) => {
                const Icon = st.icon;
                const isCurrentTab = activeStageTab === st.step;
                const isCompleted = activeCase.currentStage > st.step || activeCase.workflowStatus === "DELIVERY_COLLECTED";
                const needsAttention =
                  st.step === 2 && activeCase.workflowStatus === "PLAN_AWAITING_APPROVAL";

                return (
                  <button
                    key={st.step}
                    onClick={() => setActiveStageTab(st.step)}
                    className={`p-3 rounded-xl text-left transition-all cursor-pointer border flex items-start gap-3 ${
                      isCurrentTab
                        ? "bg-[#0B4FDF] text-white border-[#0B4FDF] shadow-sm"
                        : isCompleted
                        ? "bg-emerald-50/70 text-slate-900 border-emerald-200 hover:bg-emerald-50"
                        : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                        isCurrentTab
                          ? "bg-white/20 text-white"
                          : isCompleted
                          ? "bg-emerald-600 text-white"
                          : needsAttention
                          ? "bg-amber-500 text-white"
                          : "bg-slate-200 text-slate-700"
                      }`}
                    >
                      {isCompleted && !isCurrentTab ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        <Icon className="w-4 h-4" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-extrabold truncate">{st.title}</div>
                      <div
                        className={`text-[10px] truncate mt-0.5 ${
                          isCurrentTab ? "text-blue-100" : "text-slate-500"
                        }`}
                      >
                        {st.subtitle}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* HUMAN INTERVENTION BANNER IF ACTIVE */}
          {activeCase.requiresHumanIntervention &&
            activeCase.workflowStatus === "PLAN_AWAITING_APPROVAL" && (
              <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 mt-0.5">
                    <UserCheck className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono font-extrabold uppercase px-2 py-0.5 rounded bg-amber-200 text-amber-950">
                        Human Intervention Required
                      </span>
                      <span className="text-xs font-mono text-amber-800 font-bold">
                        AI Confidence: {activeCase.aiConfidence}%
                      </span>
                    </div>
                    <h3 className="text-sm font-black text-slate-900">
                      Commercial Sign-Off Requested Before Booking Order {activeCase.poNumber}
                    </h3>
                    <p className="text-xs text-slate-700 leading-relaxed">
                      {activeCase.interventionReason}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {activeStageTab !== 2 ? (
                    <button
                      onClick={() => setActiveStageTab(2)}
                      className="px-4 py-2.5 rounded-xl bg-[#0B4FDF] hover:bg-blue-700 text-white text-xs font-extrabold cursor-pointer whitespace-nowrap"
                    >
                      Review Sales Plan &rarr;
                    </button>
                  ) : (
                    <button
                      onClick={handleApproveSalesPlan}
                      className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold flex items-center gap-1.5 cursor-pointer whitespace-nowrap shadow-sm"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Approve Sales Plan Now</span>
                    </button>
                  )}
                </div>
              </div>
            )}

          {/* ===================================================================== */}
          {/* STAGE 1 CONTENT: INCOMING EMAIL & AI PO EXTRACTION                    */}
          {/* ===================================================================== */}
          {activeStageTab === 1 && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              {/* Raw Incoming Email & Attachment Card */}
              <div className="lg:col-span-6 bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-xs">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-[#0B4FDF]" />
                    <h3 className="text-sm font-bold text-slate-900">
                      Original Customer Email &amp; PO PDF
                    </h3>
                  </div>
                  <span className="text-[11px] font-mono text-slate-500">
                    {activeCase.receivedAt}
                  </span>
                </div>

                <div className="space-y-2 text-xs bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  <div>
                    <span className="text-slate-400 font-bold">From: </span>
                    <span className="font-bold text-slate-800">{activeCase.senderName}</span>{" "}
                    <span className="font-mono text-slate-500">&lt;{activeCase.senderEmail}&gt;</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-bold">Subject: </span>
                    <span className="font-bold text-slate-900">{activeCase.emailSubject}</span>
                  </div>
                  <div className="pt-1 flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 text-[#0B4FDF] border border-blue-200 font-mono text-[11px] font-bold">
                      <FileText className="w-3.5 h-3.5" />
                      {activeCase.attachmentName}
                    </span>
                    <span className="text-[10px] font-mono text-emerald-700 font-bold">
                      ✓ OCR &amp; Table Extracted
                    </span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-900 text-slate-100 font-mono text-xs whitespace-pre-wrap leading-relaxed max-h-[360px] overflow-y-auto">
                  {activeCase.rawEmailBody}
                </div>
              </div>

              {/* AI Extracted Structured PO Metadata */}
              <div className="lg:col-span-6 bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-xs flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-[#FF5500]" />
                      <h3 className="text-sm font-bold text-slate-900">
                        AI Agent Extracted PO Entities
                      </h3>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {activeCase.aiConfidence}% Extraction Accuracy
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                      <span className="text-[10px] font-mono uppercase text-slate-400 block">
                        Purchase Order No.
                      </span>
                      <span className="font-mono font-black text-slate-900 text-sm">
                        {activeCase.poNumber}
                      </span>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                      <span className="text-[10px] font-mono uppercase text-slate-400 block">
                        Buyer GSTIN (Verified)
                      </span>
                      <span className="font-mono font-bold text-emerald-700 text-sm">
                        {activeCase.buyerGstin}
                      </span>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                      <span className="text-[10px] font-mono uppercase text-slate-400 block">
                        Buyer Organization
                      </span>
                      <span className="font-bold text-slate-900">{activeCase.buyerCompany}</span>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                      <span className="text-[10px] font-mono uppercase text-slate-400 block">
                        Payment Terms &amp; SLA
                      </span>
                      <span className="font-bold text-slate-900">
                        {activeCase.paymentTerms} • Due {activeCase.requestedDeliveryDate}
                      </span>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                    <span className="text-[10px] font-mono uppercase text-slate-400 block">
                      Plant Delivery Destination
                    </span>
                    <span className="font-bold text-slate-800">{activeCase.deliveryAddress}</span>
                  </div>

                  {/* Extracted Line Summary */}
                  <div className="space-y-2">
                    <div className="text-xs font-bold text-slate-800">
                      Extracted Line Items ({activeCase.items.length})
                    </div>
                    {activeCase.items.map((item) => (
                      <div
                        key={item.id}
                        className="p-3 rounded-xl border border-slate-200 flex items-center justify-between gap-2 text-xs"
                      >
                        <div>
                          <div className="font-bold text-slate-900">{item.description}</div>
                          <div className="text-[11px] font-mono text-slate-500">
                            SKU: {item.sku} • HSN: {item.hsnCode} • Qty: {item.quantity} {item.unit}
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <div className="font-mono font-bold text-slate-900">
                            ₹{item.poUnitPrice} / {item.unit}
                          </div>
                          {item.poUnitPrice < item.catalogFloorPrice ? (
                            <span className="text-[10px] font-mono text-amber-700 font-bold">
                              Catalog: ₹{item.catalogFloorPrice}
                            </span>
                          ) : (
                            <span className="text-[10px] font-mono text-emerald-700 font-bold">
                              ✓ Contract Match
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex justify-end">
                  <button
                    onClick={() => setActiveStageTab(2)}
                    className="px-5 py-2.5 rounded-xl bg-[#0B4FDF] hover:bg-blue-700 text-white text-xs font-extrabold flex items-center gap-2 cursor-pointer shadow-xs"
                  >
                    <span>Proceed to Stage 2: AI Sales Plan &amp; Approval</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ===================================================================== */}
          {/* STAGE 2 CONTENT: AI SALES PLAN, MARGIN & HUMAN APPROVAL GATE          */}
          {/* ===================================================================== */}
          {activeStageTab === 2 && (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-6 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono uppercase font-bold text-[#0B4FDF]">
                      Stage 2 • AI Sales &amp; Sourcing Plan
                    </span>
                    {activeCase.salesPlanApprovedAt && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800">
                        ✓ Approved ({activeCase.salesPlanApprovedAt})
                      </span>
                    )}
                  </div>
                  <h2 className="text-lg font-black text-slate-900 mt-0.5">
                    Commercial Margin, Inventory Allocation &amp; Approval Gate — {activeCase.poNumber}
                  </h2>
                </div>

                {/* Financial Summary Pills */}
                <div className="flex flex-wrap items-center gap-3">
                  <div className="px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-right">
                    <span className="text-[10px] font-mono uppercase text-slate-400 block">
                      Taxable Order Value
                    </span>
                    <span className="text-sm font-mono font-black text-slate-900">
                      ₹{financials.subtotal.toLocaleString("en-IN")}
                    </span>
                  </div>
                  <div className="px-3.5 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-right">
                    <span className="text-[10px] font-mono uppercase text-emerald-700 block">
                      Projected Net Margin
                    </span>
                    <span className="text-sm font-mono font-black text-emerald-800">
                      {financials.netMarginPct}% (₹{financials.netMarginRs.toLocaleString("en-IN")})
                    </span>
                  </div>
                  <div className="px-3.5 py-2 rounded-xl bg-blue-50 border border-blue-200 text-right">
                    <span className="text-[10px] font-mono uppercase text-[#0B4FDF] block">
                      Total Invoice (Inc. 18% GST)
                    </span>
                    <span className="text-sm font-mono font-black text-[#0B4FDF]">
                      ₹{financials.grandTotal.toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>
              </div>

              {/* AI Executive Sales Plan Recommendation Box */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-blue-50/90 to-indigo-50/70 border border-blue-200 flex items-start gap-3.5">
                <Bot className="w-5 h-5 text-[#0B4FDF] shrink-0 mt-0.5" />
                <div className="space-y-1 text-xs">
                  <div className="font-bold text-slate-900">
                    AI Sales Planner Synthesis &amp; Fulfillment Strategy
                  </div>
                  <p className="text-slate-700 leading-relaxed">{activeCase.salesPlanSummary}</p>
                </div>
              </div>

              {/* Line-by-Line Allocation & Commercial Override Table */}
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-mono uppercase text-[10px]">
                      <tr>
                        <th className="p-3.5">SKU &amp; Material Specification</th>
                        <th className="p-3.5">PO Qty</th>
                        <th className="p-3.5">PO Rate vs. Floor</th>
                        <th className="p-3.5">Unit Cost &amp; Margin</th>
                        <th className="p-3.5">Warehouse &amp; Stock Allocation</th>
                        <th className="p-3.5">Status</th>
                        <th className="p-3.5 text-right">Human Override</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {activeCase.items.map((item) => {
                        const isEditing = editingItemId === item.id;
                        const itemMarginPct = (
                          ((item.poUnitPrice - item.unitCost) / item.poUnitPrice) *
                          100
                        ).toFixed(1);
                        const hasPriceVariance = item.poUnitPrice < item.catalogFloorPrice;

                        return (
                          <tr key={item.id} className="hover:bg-slate-50/80">
                            <td className="p-3.5 max-w-xs">
                              <div className="font-bold text-slate-900">{item.description}</div>
                              <div className="text-[11px] font-mono text-slate-400">
                                {item.sku} • HSN {item.hsnCode}
                              </div>
                            </td>

                            <td className="p-3.5 font-mono font-bold text-slate-900 whitespace-nowrap">
                              {isEditing ? (
                                <input
                                  type="number"
                                  value={editQtyVal}
                                  onChange={(e) => setEditQtyVal(e.target.value)}
                                  className="w-20 p-1.5 rounded border border-blue-400 bg-white font-mono text-xs"
                                />
                              ) : (
                                `${item.quantity.toLocaleString()} ${item.unit}`
                              )}
                            </td>

                            <td className="p-3.5 font-mono whitespace-nowrap">
                              {isEditing ? (
                                <input
                                  type="number"
                                  value={editPriceVal}
                                  onChange={(e) => setEditPriceVal(e.target.value)}
                                  className="w-24 p-1.5 rounded border border-blue-400 bg-white font-mono text-xs"
                                />
                              ) : (
                                <div>
                                  <span className="font-black text-slate-900">
                                    ₹{item.poUnitPrice}
                                  </span>
                                  <span className="text-slate-400 text-[11px] block">
                                    Floor: ₹{item.catalogFloorPrice}
                                  </span>
                                </div>
                              )}
                            </td>

                            <td className="p-3.5 font-mono whitespace-nowrap">
                              <div className="text-emerald-700 font-bold">{itemMarginPct}% Margin</div>
                              <div className="text-[11px] text-slate-400">
                                Cost: ₹{item.unitCost}/{item.unit}
                              </div>
                            </td>

                            <td className="p-3.5">
                              <div className="font-bold text-slate-800">{item.warehouseHub}</div>
                              <div className="text-[11px] font-mono text-slate-500">
                                Avail: {item.stockAvailable.toLocaleString()} {item.unit} • SLA:{" "}
                                {item.leadTimeDays}d
                              </div>
                            </td>

                            <td className="p-3.5 whitespace-nowrap">
                              {hasPriceVariance ? (
                                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-100 text-amber-900 border border-amber-300">
                                  Price Variance (-
                                  {(
                                    ((item.catalogFloorPrice - item.poUnitPrice) /
                                      item.catalogFloorPrice) *
                                    100
                                  ).toFixed(1)}
                                  %)
                                </span>
                              ) : item.status === "PARTIAL_STOCK_JOBWORK" ? (
                                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-100 text-blue-900">
                                  Stock + 24h Die-Cut
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-100 text-emerald-900">
                                  100% Ready in Stock
                                </span>
                              )}
                            </td>

                            <td className="p-3.5 text-right whitespace-nowrap">
                              {isEditing ? (
                                <div className="inline-flex items-center gap-1">
                                  <button
                                    onClick={() => handleSaveItemEdit(item.id)}
                                    className="px-2.5 py-1 rounded bg-emerald-600 text-white text-[11px] font-bold cursor-pointer"
                                  >
                                    Save
                                  </button>
                                  <button
                                    onClick={() => setEditingItemId(null)}
                                    className="px-2 py-1 rounded bg-slate-200 text-slate-700 text-[11px] font-bold cursor-pointer"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              ) : (
                                <button
                                  onClick={() => {
                                    setEditingItemId(item.id);
                                    setEditPriceVal(String(item.poUnitPrice));
                                    setEditQtyVal(String(item.quantity));
                                  }}
                                  className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold inline-flex items-center gap-1 cursor-pointer"
                                >
                                  <Edit3 className="w-3 h-3" /> Edit Rate/Qty
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Human Approval Action Bar */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-0.5 text-xs">
                  <div className="font-bold text-slate-900 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-[#0B4FDF]" />
                    <span>Human Commercial Approval Checkpoint</span>
                  </div>
                  <p className="text-slate-500">
                    Approving this Sales Plan locks inventory at the designated hubs, creates the ERP Sales Order, and triggers Proforma &amp; e-Way Bill generation.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3 shrink-0">
                  <button
                    onClick={handleRequestBuyerAmendment}
                    className="px-4 py-2.5 rounded-xl bg-white hover:bg-rose-50 text-rose-700 border border-rose-200 text-xs font-bold cursor-pointer transition-colors"
                  >
                    Reject Variance &amp; Request PO Amendment
                  </button>

                  <button
                    onClick={handleApproveSalesPlan}
                    className="px-5 py-2.5 rounded-xl bg-[#0B4FDF] hover:bg-blue-700 text-white text-xs font-extrabold flex items-center gap-2 cursor-pointer shadow-sm transition-colors"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>
                      {activeCase.salesPlanApprovedAt
                        ? "Re-Sync Sales Plan & View Order (Stage 3)"
                        : "Approve Sales Plan & Generate Order"}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ===================================================================== */}
          {/* STAGE 3 CONTENT: ORDER GENERATION, PACKING & DISPATCH TRACKING        */}
          {/* ===================================================================== */}
          {activeStageTab === 3 && (
            <div className="space-y-5">
              {/* Fulfillment Progress Tracker Card */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-6 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
                  <div>
                    <span className="text-xs font-mono uppercase font-bold text-[#0B4FDF]">
                      Stage 3 • Automated Order &amp; Logistics Execution
                    </span>
                    <h2 className="text-lg font-black text-slate-900 mt-0.5">
                      Sales Order {activeCase.salesOrderId || "SO-TAR-2026-8841"} — Warehouse &amp; Dispatch Control
                    </h2>
                  </div>

                  <button
                    onClick={handleAdvanceFulfillmentToCollection}
                    className="px-5 py-2.5 rounded-xl bg-[#FF5500] hover:bg-[#E04800] text-white text-xs font-extrabold flex items-center gap-2 cursor-pointer shadow-sm"
                  >
                    <Truck className="w-4 h-4" />
                    <span>Mark Arrived at Customer Dock &amp; Trigger Collection Email &rarr;</span>
                  </button>
                </div>

                {/* 4-Step Visual Warehouse & Logistics Milestone Bar */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  {[
                    {
                      idx: 1,
                      label: "ERP Sales Order & Proforma",
                      detail: activeCase.salesOrderId || "SO-TAR-2026-8841"
                    },
                    {
                      idx: 2,
                      label: "Batch QC & Shrink-Wrap Packing",
                      detail: "ASTM / CPRI Cert Attached"
                    },
                    {
                      idx: 3,
                      label: "GST e-Way Bill & Linehaul Dispatch",
                      detail: `e-Way #${activeCase.ewayBillNo || "181094827104"}`
                    },
                    {
                      idx: 4,
                      label: "Arrived at Customer Receiving Bay",
                      detail: `Gate Pass: ${activeCase.gatePassCode || "GP-TAR-8841"}`
                    }
                  ].map((m) => {
                    const isDone = activeCase.fulfillmentStep >= m.idx;
                    return (
                      <div
                        key={m.idx}
                        className={`p-4 rounded-xl border ${
                          isDone
                            ? "bg-emerald-50/70 border-emerald-200"
                            : "bg-slate-50 border-slate-200"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-[10px] font-mono font-bold uppercase text-slate-500">
                            Milestone 0{m.idx}
                          </span>
                          <span
                            className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                              isDone
                                ? "bg-emerald-600 text-white"
                                : "bg-slate-200 text-slate-600"
                            }`}
                          >
                            {isDone ? "✓" : m.idx}
                          </span>
                        </div>
                        <div className="text-xs font-bold text-slate-900">{m.label}</div>
                        <div className="text-[11px] font-mono text-slate-600 mt-0.5">{m.detail}</div>
                      </div>
                    );
                  })}
                </div>

                {/* Generated Statutory & Commercial Documents Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Card 1: Sales Order & Tax Proforma */}
                  <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-blue-100 text-[#0B4FDF]">
                        Commercial Document
                      </span>
                      <FileSpreadsheet className="w-4 h-4 text-[#0B4FDF]" />
                    </div>
                    <div>
                      <div className="text-xs font-black text-slate-900">
                        Tax Proforma &amp; Sales Order
                      </div>
                      <div className="text-[11px] font-mono text-slate-500 mt-0.5">
                        SO: {activeCase.salesOrderId || "SO-TAR-2026-8841"} • PI:{" "}
                        {activeCase.proformaInvoiceNo || "PI-TAR-2026-8841"}
                      </div>
                    </div>
                    <div className="text-xs space-y-1 pt-2 border-t border-slate-200 font-mono">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Taxable Value:</span>
                        <span className="font-bold">₹{financials.subtotal.toLocaleString("en-IN")}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">IGST (18%):</span>
                        <span className="font-bold">₹{financials.gstAmount.toLocaleString("en-IN")}</span>
                      </div>
                      <div className="flex justify-between text-slate-900 font-black pt-1 border-t border-slate-200">
                        <span>Total Payable:</span>
                        <span>₹{financials.grandTotal.toLocaleString("en-IN")}</span>
                      </div>
                    </div>
                  </div>

                  {/* Card 2: e-Way Bill & Vehicle Manifest */}
                  <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                        NIC GST Portal Verified
                      </span>
                      <Truck className="w-4 h-4 text-emerald-700" />
                    </div>
                    <div>
                      <div className="text-xs font-black text-slate-900">
                        GST e-Way Bill &amp; Fleet Assignment
                      </div>
                      <div className="text-[11px] font-mono text-slate-500 mt-0.5">
                        e-Way Bill: {activeCase.ewayBillNo || "181094827104"}
                      </div>
                    </div>
                    <div className="text-xs space-y-1 pt-2 border-t border-slate-200 font-mono">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Vehicle No:</span>
                        <span className="font-bold">{activeCase.vehicleNumber || "HR-38-AB-9021"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Logistics Partner:</span>
                        <span className="font-bold">TarasAI Express</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Destination GSTIN:</span>
                        <span className="font-bold">{activeCase.buyerGstin}</span>
                      </div>
                    </div>
                  </div>

                  {/* Card 3: Delivery Collection Gate Pass & Handover OTP */}
                  <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-purple-100 text-purple-900">
                        Zero-Dispute POD
                      </span>
                      <QrCode className="w-4 h-4 text-purple-700" />
                    </div>
                    <div>
                      <div className="text-xs font-black text-slate-900">
                        Customer Collection Gate Pass
                      </div>
                      <div className="text-[11px] font-mono text-slate-500 mt-0.5">
                        Pass ID: {activeCase.gatePassCode || "GP-TAR-8841"}
                      </div>
                    </div>
                    <div className="text-xs space-y-1 pt-2 border-t border-slate-200 font-mono">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Handover OTP:</span>
                        <span className="font-black text-[#FF5500] text-sm">
                          {activeCase.collectionOtp || "849201"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">QC Test Reports:</span>
                        <span className="font-bold text-emerald-700">✓ Bundled</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Customer Notification:</span>
                        <span className="font-bold text-[#0B4FDF]">Ready in Stage 4</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ===================================================================== */}
          {/* STAGE 4 CONTENT: AUTOMATED CUSTOMER EMAILS & DELIVERY COLLECTION      */}
          {/* ===================================================================== */}
          {activeStageTab === 4 && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              {/* Left 4 cols: Customer Email Sequence Selector */}
              <div className="lg:col-span-4 space-y-3">
                <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3 shadow-xs">
                  <div className="text-xs font-mono font-bold uppercase text-slate-700">
                    Customer Communication Lifecycle
                  </div>

                  {activeCase.emails.map((em) => {
                    const isSelected = activeEmail?.id === em.id;
                    return (
                      <button
                        key={em.id}
                        onClick={() => setSelectedEmailId(em.id)}
                        className={`w-full text-left p-3.5 rounded-xl border transition-all cursor-pointer space-y-1.5 ${
                          isSelected
                            ? "bg-blue-50/80 border-[#0B4FDF] shadow-2xs"
                            : "bg-slate-50 hover:bg-slate-100 border-slate-200"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[10px] font-mono font-bold uppercase text-[#0B4FDF]">
                            {em.stepType.replace("_", " ")}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                              em.status === "SENT_DELIVERED"
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-amber-100 text-amber-900"
                            }`}
                          >
                            {em.status === "SENT_DELIVERED" ? `✓ Sent (${em.sentAt})` : "Pending Send"}
                          </span>
                        </div>
                        <div className="text-xs font-bold text-slate-900">{em.title}</div>
                        <div className="text-[11px] text-slate-500 truncate">To: {em.to}</div>
                      </button>
                    );
                  })}
                </div>

                {/* Final Customer Delivery Collection Box */}
                <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-2xl p-5 space-y-4 shadow-md">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold uppercase px-2.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      Final Handover &amp; e-POD
                    </span>
                    <KeyRound className="w-4 h-4 text-amber-400" />
                  </div>

                  <div className="space-y-1">
                    <h4 className="text-sm font-black">
                      Customer Delivery Collection &amp; OTP Verification
                    </h4>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Once the customer receives the <strong>Collection Notice Email</strong>, their stores officer presents Handover OTP{" "}
                      <span className="font-mono font-bold text-amber-300">
                        {activeCase.collectionOtp || "849201"}
                      </span>{" "}
                      to collect the shipment and auto-close the PO.
                    </p>
                  </div>

                  {activeCase.workflowStatus === "DELIVERY_COLLECTED" ? (
                    <div className="p-3.5 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center gap-2.5 text-xs font-bold text-emerald-200">
                      <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                      <span>
                        Delivery Collected by {activeCase.buyerCompany} &amp; Digital e-POD Signed!
                      </span>
                    </div>
                  ) : (
                    <button
                      onClick={handleConfirmCustomerCollection}
                      className="w-full py-2.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black text-xs uppercase tracking-wider transition-colors cursor-pointer shadow-sm"
                    >
                      Simulate Customer OTP Handover &amp; Collect Delivery
                    </button>
                  )}
                </div>
              </div>

              {/* Right 8 cols: Live Email Composer / Reviewer */}
              {activeEmail && (
                <div className="lg:col-span-8 bg-white border border-slate-200 rounded-2xl p-6 space-y-5 shadow-xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold uppercase text-[#0B4FDF]">
                          AI-Drafted Customer Dispatch &amp; Collection Email
                        </span>
                        {humanGates.gate4CollectionEmailReview &&
                          activeEmail.status !== "SENT_DELIVERED" && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-100 text-amber-900">
                              Human Review Gate Active
                            </span>
                          )}
                      </div>
                      <h3 className="text-base font-black text-slate-900 mt-0.5">
                        {activeEmail.title}
                      </h3>
                    </div>

                    <div className="flex items-center gap-2">
                      {activeEmail.status === "SENT_DELIVERED" ? (
                        <span className="px-3.5 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold inline-flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4" /> Dispatched to Customer ({activeEmail.sentAt})
                        </span>
                      ) : (
                        <button
                          onClick={() => handleSendCustomerEmail(activeEmail.id)}
                          className="px-5 py-2.5 rounded-xl bg-[#FF5500] hover:bg-[#E04800] text-white text-xs font-extrabold inline-flex items-center gap-2 cursor-pointer shadow-sm"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>Approve &amp; Send Email to Customer</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Email Metadata Fields */}
                  <div className="space-y-2.5 text-xs">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                        <span className="text-slate-400 font-bold">To: </span>
                        <span className="font-mono font-bold text-slate-900">{activeEmail.to}</span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                        <span className="text-slate-400 font-bold">CC: </span>
                        <span className="font-mono text-slate-700">{activeEmail.cc}</span>
                      </div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                      <span className="text-slate-400 font-bold">Subject: </span>
                      <span className="font-bold text-slate-900">{activeEmail.subject}</span>
                    </div>
                  </div>

                  {/* Editable Email Body */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-mono uppercase text-slate-500 font-bold">
                      Email Message Body (Editable by Operator before dispatch)
                    </label>
                    <textarea
                      rows={11}
                      value={activeEmail.body}
                      onChange={(e) => {
                        const val = e.target.value;
                        setCases((prev) =>
                          prev.map((c) => {
                            if (c.id !== activeCase.id) return c;
                            return {
                              ...c,
                              emails: c.emails.map((em) =>
                                em.id === activeEmail.id ? { ...em, body: val } : em
                              )
                            };
                          })
                        );
                      }}
                      className="w-full p-4 rounded-xl border border-slate-200 bg-slate-50/50 font-mono text-xs text-slate-800 leading-relaxed focus:ring-2 focus:ring-[#0B4FDF] focus:bg-white outline-none"
                    />
                  </div>

                  {/* Attachments */}
                  <div className="space-y-2">
                    <div className="text-[11px] font-mono uppercase text-slate-500 font-bold">
                      Auto-Attached Statutory &amp; Fulfillment Documents
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {activeEmail.attachments.map((att, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 text-[#0B4FDF] border border-blue-200 text-xs font-mono font-bold"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          {att}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* ========================================================================= */}
      {/* MODAL: INJECT / UPLOAD CUSTOM PO EMAIL FOR LIVE DEMO                      */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {isInjectModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white border border-slate-200 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-5 relative max-h-[90vh] overflow-y-auto"
            >
              <button
                onClick={() => setIsInjectModalOpen(false)}
                className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div>
                <span className="text-xs font-mono font-bold text-[#0B4FDF] uppercase">
                  Live PO Ingestion Simulator
                </span>
                <h3 className="text-lg font-black text-slate-900 mt-0.5">
                  Simulate Incoming Customer PO Email or Upload PO File
                </h3>
                <p className="text-xs text-slate-500">
                  Paste any raw email or Purchase Order text (or upload a file) to watch the AI Agent extract line items, check pricing &amp; stock, and build a Sales Plan live.
                </p>
              </div>

              <form onSubmit={handleInjectCustomPo} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Customer Sender Email</label>
                    <input
                      type="email"
                      value={customSenderEmail}
                      onChange={(e) => setCustomSenderEmail(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-300 bg-white font-mono text-xs outline-none focus:border-[#0B4FDF]"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Upload PO Document (Optional)</label>
                    <label className="w-full p-2 rounded-xl border border-dashed border-blue-300 bg-blue-50/50 hover:bg-blue-50 text-[#0B4FDF] font-bold flex items-center justify-center gap-2 cursor-pointer">
                      <Upload className="w-4 h-4" />
                      <span className="truncate">{customFileName || "Choose PDF / TXT / CSV"}</span>
                      <input
                        type="file"
                        accept=".txt,.csv,.eml,.json,.md,.pdf"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Email Subject Line</label>
                  <input
                    type="text"
                    value={customSubject}
                    onChange={(e) => setCustomSubject(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 bg-white text-xs outline-none focus:border-[#0B4FDF]"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">
                    Raw Email / Purchase Order Content
                  </label>
                  <textarea
                    rows={8}
                    value={customRawText}
                    onChange={(e) => setCustomRawText(e.target.value)}
                    className="w-full p-3 rounded-xl border border-slate-300 bg-slate-50 font-mono text-xs outline-none focus:bg-white focus:border-[#0B4FDF]"
                    required
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsInjectModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isParsingCustomPo}
                    className="px-5 py-2.5 rounded-xl bg-[#0B4FDF] hover:bg-blue-700 text-white font-extrabold flex items-center gap-2 cursor-pointer shadow-sm disabled:opacity-50"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>
                      {isParsingCustomPo
                        ? "AI Agent Reading & Planning..."
                        : "Ingest Email & Generate AI Sales Plan"}
                    </span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
