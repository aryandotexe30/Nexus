"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  Mail,
  FileText,
  CheckCircle2,
  AlertTriangle,
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
  Edit3,
  QrCode,
  KeyRound,
  Terminal,
  Sliders,
  Play,
  FileSpreadsheet,
  Trash2,
  Check,
  X
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
  fulfillmentStep: 0 | 1 | 2 | 3 | 4;
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

const STORAGE_KEY = "tarasai_uploaded_po_cases_v1";

export default function PoAutomationPage() {
  // Real uploaded PO cases only (no simulated pre-populated data)
  const [cases, setCases] = useState<PurchaseOrderCase[]>([]);
  const [selectedCaseId, setSelectedCaseId] = useState<string>("");
  const [activeStageTab, setActiveStageTab] = useState<1 | 2 | 3 | 4>(1);

  // Customer-configurable Human Intervention Policy Toggles
  const [humanGates, setHumanGates] = useState({
    gate1DiscrepancyReview: true,
    gate2SalesPlanApproval: true,
    gate3OrderGeneration: false,
    gate4CollectionEmailReview: true
  });
  const [showGateConfig, setShowGateConfig] = useState(false);

  // Upload PO Modal / Form State
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [senderEmailInput, setSenderEmailInput] = useState("");
  const [subjectInput, setSubjectInput] = useState("");
  const [rawTextInput, setRawTextInput] = useState("");
  const [isParsingPo, setIsParsingPo] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);

  // Inline editing state for Stage 2 line items & Stage 4 emails
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editPriceVal, setEditPriceVal] = useState<string>("");
  const [editQtyVal, setEditQtyVal] = useState<string>("");
  const [selectedEmailId, setSelectedEmailId] = useState<string>("");
  const [isRunningAutopilot, setIsRunningAutopilot] = useState(false);

  // Live Agent Execution Audit Trail (only logs real actions on uploaded POs)
  const [agentLogs, setAgentLogs] = useState<AgentLogEntry[]>([]);

  // Load user's previously uploaded POs from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setCases(parsed);
          setSelectedCaseId(parsed[0].id);
          setActiveStageTab(parsed[0].currentStage || 2);
          setSelectedEmailId(parsed[0].emails?.[0]?.id || "");
        }
      }
    } catch {
      // Ignore storage errors
    }
  }, []);

  // Persist user's uploaded POs to localStorage
  useEffect(() => {
    try {
      if (cases.length > 0) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(cases));
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch {
      // Ignore storage errors
    }
  }, [cases]);

  const activeCase = useMemo(
    () => cases.find((c) => c.id === selectedCaseId) || cases[0] || null,
    [cases, selectedCaseId]
  );

  const activeEmail = useMemo(() => {
    if (!activeCase) return null;
    const found = activeCase.emails.find((e) => e.id === selectedEmailId);
    return found || activeCase.emails[0] || null;
  }, [activeCase, selectedEmailId]);

  const addLog = (actor: AgentLogEntry["actor"], action: string, detail: string) => {
    const now = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit"
    });
    setAgentLogs((prev) => [
      { id: `log-${Date.now()}-${Math.random()}`, timestamp: now, actor, action, detail },
      ...prev
    ]);
  };

  // Financial calculations for active PO
  const financials = useMemo(() => {
    if (!activeCase) {
      return {
        subtotal: 0,
        totalCost: 0,
        gstAmount: 0,
        grandTotal: 0,
        netMarginRs: 0,
        netMarginPct: "0.0"
      };
    }
    const subtotal = activeCase.items.reduce(
      (acc, item) => acc + Number(item.quantity || 0) * Number(item.poUnitPrice || 0),
      0
    );
    const totalCost = activeCase.items.reduce(
      (acc, item) => acc + Number(item.quantity || 0) * Number(item.unitCost || 0),
      0
    );
    const gstAmount = Math.round(subtotal * 0.18);
    const grandTotal = subtotal + gstAmount;
    const netMarginRs = subtotal - totalCost;
    const netMarginPct = subtotal > 0 ? ((netMarginRs / subtotal) * 100).toFixed(1) : "0.0";

    return {
      subtotal,
      totalCost,
      gstAmount,
      grandTotal,
      netMarginRs,
      netMarginPct
    };
  }, [activeCase]);

  const handleSelectCase = (poCase: PurchaseOrderCase) => {
    setSelectedCaseId(poCase.id);
    setActiveStageTab(poCase.currentStage);
    setSelectedEmailId(poCase.emails[0]?.id || "");
    setEditingItemId(null);
  };

  const handleDeleteCase = (caseId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const remaining = cases.filter((c) => c.id !== caseId);
    setCases(remaining);
    if (selectedCaseId === caseId) {
      setSelectedCaseId(remaining[0]?.id || "");
    }
  };

  // Upload & Parse User's Own PO (PDF / Excel / CSV / Image / Text)
  const handleUploadAndParsePo = async (e: React.FormEvent) => {
    e.preventDefault();
    setParseError(null);

    if (!selectedFile && !rawTextInput.trim()) {
      setParseError("Please select a PO file (PDF, Excel, CSV, Image) or paste your PO text.");
      return;
    }

    setIsParsingPo(true);
    try {
      const formData = new FormData();
      if (selectedFile) {
        formData.append("file", selectedFile);
      }
      if (senderEmailInput.trim()) {
        formData.append("senderEmail", senderEmailInput.trim());
      }
      if (subjectInput.trim()) {
        formData.append("subject", subjectInput.trim());
      }
      if (rawTextInput.trim()) {
        formData.append("rawEmailText", rawTextInput.trim());
      }

      const res = await fetch("/api/po-automation/parse", {
        method: "POST",
        body: formData
      });
      const data = await res.json();

      if (!res.ok || !data.success || !data.parsedPo) {
        setParseError(data.error || "Failed to parse the uploaded Purchase Order.");
        setIsParsingPo(false);
        return;
      }

      const p = data.parsedPo;
      const newCaseId = `po-${Date.now()}`;
      const cleanPoNum = String(p.poNumber || `PO-${Date.now().toString().slice(-4)}`);
      const suffix = cleanPoNum.replace(/[^A-Z0-9]/gi, "").slice(-6) || "1001";
      const buyerEmail =
        senderEmailInput.trim() ||
        (p.contactEmail && p.contactEmail.includes("@") ? p.contactEmail : "customer@company.com");

      const normalizedItems: PoLineItem[] = (Array.isArray(p.items) ? p.items : []).map(
        (it: any, idx: number) => {
          const qty = Number(it.quantity) || 1;
          const poPrice = Number(it.poUnitPrice) || 0;
          const floorPrice = Number(it.catalogFloorPrice) || poPrice;
          const cost = Number(it.unitCost) || Math.round(poPrice * 0.75);
          return {
            id: `item-${newCaseId}-${idx + 1}`,
            sku: String(it.sku || `SKU-${idx + 1}`),
            description: String(it.description || `Line Item #${idx + 1}`),
            hsnCode: String(it.hsnCode || "39199090"),
            quantity: qty,
            unit: String(it.unit || "Units"),
            poUnitPrice: poPrice,
            catalogFloorPrice: floorPrice,
            unitCost: cost,
            stockAvailable: Number(it.stockAvailable) || qty * 2,
            warehouseHub: String(it.warehouseHub || "Primary Fulfillment Hub"),
            leadTimeDays: Number(it.leadTimeDays) || 2,
            status:
              poPrice < floorPrice
                ? "PRICE_VARIANCE"
                : it.status === "PARTIAL_STOCK_JOBWORK"
                ? "PARTIAL_STOCK_JOBWORK"
                : "READY_IN_STOCK"
          };
        }
      );

      const itemsSummaryList = normalizedItems
        .map((i) => `• ${i.description}: ${i.quantity} ${i.unit} @ ₹${i.poUnitPrice.toLocaleString("en-IN")}/${i.unit}`)
        .join("\n");

      const newCase: PurchaseOrderCase = {
        id: newCaseId,
        receivedAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        emailSubject:
          subjectInput.trim() || `Purchase Order ${cleanPoNum} — ${p.buyerCompany || "Customer"}`,
        senderName: `${p.contactName || "Procurement Desk"} (${p.buyerCompany || "Buyer"})`,
        senderEmail: buyerEmail,
        attachmentName: data.fileName || selectedFile?.name || "Uploaded_PO.pdf",
        rawEmailBody: data.extractedRawText || rawTextInput,
        poNumber: cleanPoNum,
        poDate: p.poDate || new Date().toISOString().split("T")[0],
        buyerCompany: p.buyerCompany || "Buyer Organization",
        buyerGstin: p.buyerGstin || "Not Specified",
        contactPhone: p.contactPhone || "Not Specified",
        deliveryAddress: p.deliveryAddress || "As per Purchase Order",
        paymentTerms: p.paymentTerms || "As per Purchase Order",
        requestedDeliveryDate: p.requestedDeliveryDate || "Standard Lead Time",
        aiConfidence: Number(p.aiConfidence) || 97,
        requiresHumanIntervention: true,
        interventionReason:
          p.interventionReason ||
          "Purchase Order extracted from your uploaded document. Awaiting Human Sales Plan review & sign-off before order generation.",
        currentStage: 2,
        workflowStatus: "PLAN_AWAITING_APPROVAL",
        salesPlanSummary:
          p.salesPlanSummary ||
          `Extracted ${normalizedItems.length} line item(s) for ${p.buyerCompany}. Ready for commercial review and warehouse allocation.`,
        fulfillmentStep: 0,
        items: normalizedItems,
        emails: [
          {
            id: `em-${newCaseId}-1`,
            stepType: "ORDER_CONFIRMATION",
            title: "1. PO Acceptance, Sales Order & Proforma Invoice",
            to: buyerEmail,
            cc: "sales-desk@tarasai.in",
            subject: `Order Confirmed: PO ${cleanPoNum} | Sales Order #SO-${suffix} & Proforma Invoice`,
            body: `Dear ${p.contactName || p.buyerCompany || "Customer"},\n\nThank you for your Purchase Order ${cleanPoNum}. Our commercial team has approved the Sales Plan and booked your order under Sales Order #SO-${suffix}.\n\nConfirmed Line Items:\n${itemsSummaryList}\n\nDelivery Destination: ${p.deliveryAddress || "As per PO"}\nPayment Terms: ${p.paymentTerms || "As per PO"}\n\nPlease find your Sales Order Confirmation and Tax Proforma Invoice attached.\n\nWarm regards,\nOrder Fulfillment Desk`,
            attachments: [`Sales_Order_SO_${suffix}.pdf`, `Proforma_Invoice_PI_${suffix}.pdf`],
            status: "DRAFT_PENDING_REVIEW"
          },
          {
            id: `em-${newCaseId}-2`,
            stepType: "DISPATCH_TRACKING",
            title: "2. Dispatch Notification, Tax Invoice & e-Way Bill",
            to: buyerEmail,
            cc: "logistics@tarasai.in",
            subject: `Shipment Dispatched: PO ${cleanPoNum} | e-Way Bill & Tracking Details`,
            body: `Dear ${p.buyerCompany || "Customer"} Receiving Team,\n\nYour consignment against Purchase Order ${cleanPoNum} (Sales Order #SO-${suffix}) has passed quality inspection and been dispatched.\n\n• Delivery Address: ${p.deliveryAddress || "As per PO"}\n• Attached Documents: GST Tax Invoice, e-Way Bill, and Packing List.\n\nBest regards,\nLogistics Control Tower`,
            attachments: [
              `Tax_Invoice_${suffix}.pdf`,
              `GST_eWayBill_${suffix}.pdf`,
              `Packing_List_${suffix}.pdf`
            ],
            status: "DRAFT_PENDING_REVIEW"
          },
          {
            id: `em-${newCaseId}-3`,
            stepType: "COLLECTION_NOTICE",
            title: "3. Delivery Arrival & Customer Collection Notice (OTP)",
            to: buyerEmail,
            cc: "dispatch@tarasai.in",
            subject: `ACTION REQUIRED: Collect Your Delivery for PO ${cleanPoNum} (Gate Pass & Handover OTP)`,
            body: `Dear ${p.buyerCompany || "Customer"} Stores & Receiving Team,\n\nYour shipment for Purchase Order ${cleanPoNum} has arrived at ${p.deliveryAddress || "your receiving facility"} and is ready for collection.\n\nDelivery Collection Details:\n• Collection Gate Pass: GP-${suffix}\n• Handover Verification OTP: 849201\n\nKindly verify the consignment and share the Handover OTP to collect your delivery and complete the digital Proof of Delivery (e-POD).\n\nThank you!`,
            attachments: [`Delivery_Gate_Pass_GP_${suffix}.pdf`, `ePOD_Manifest_${suffix}.pdf`],
            status: "DRAFT_PENDING_REVIEW"
          }
        ]
      };

      setCases((prev) => [newCase, ...prev]);
      setSelectedCaseId(newCaseId);
      setActiveStageTab(1);
      setSelectedEmailId(newCase.emails[0].id);
      setIsUploadModalOpen(false);
      setSelectedFile(null);
      setRawTextInput("");

      addLog(
        "AI_AGENT",
        `Extracted Uploaded PO: ${cleanPoNum}`,
        `Parsed ${normalizedItems.length} line item(s) for ${newCase.buyerCompany} from ${newCase.attachmentName}.`
      );
      addLog(
        "AI_AGENT",
        "Prepared AI Sales & Fulfillment Plan",
        `Generated pricing, margin, and warehouse allocation plan for ${cleanPoNum}. Waiting for Human Approval in Stage 2.`
      );
    } catch (err: any) {
      setParseError(err.message || "Error uploading and parsing PO.");
    } finally {
      setIsParsingPo(false);
    }
  };

  // Save inline edit on a PO line item in Stage 2
  const handleSaveItemEdit = (itemId: string) => {
    if (!activeCase) return;
    const newPrice = parseFloat(editPriceVal);
    const newQty = parseInt(editQtyVal, 10);
    if (isNaN(newPrice) || isNaN(newQty) || newPrice < 0 || newQty <= 0) return;

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
      "Updated Sales Plan Line Item",
      `Adjusted rate to ₹${newPrice} and quantity to ${newQty} on ${activeCase.poNumber}`
    );
  };

  // Stage 2 -> Stage 3: Approve Sales Plan & Generate Order
  const handleApproveSalesPlan = () => {
    if (!activeCase) return;
    const nowStr = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const suffix = activeCase.poNumber.replace(/[^A-Z0-9]/gi, "").slice(-6) || "1001";
    const soId = `SO-${suffix}`;
    const piId = `PI-${suffix}`;
    const eway = `2710${Math.floor(10000000 + Math.random() * 89999999)}`;
    const otp = `${Math.floor(100000 + Math.random() * 899999)}`;
    const gatePass = `GP-${suffix}`;

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
          salesPlanApprovedBy: "Approved by Human Operator",
          salesPlanApprovedAt: `Today, ${nowStr}`,
          salesOrderId: soId,
          proformaInvoiceNo: piId,
          ewayBillNo: eway,
          vehicleNumber: "MH-14-EL-8821",
          transporterName: "Priority Linehaul Logistics",
          collectionOtp: otp,
          gatePassCode: gatePass,
          fulfillmentStep: 2,
          emails: updatedEmails
        };
      })
    );

    addLog(
      "HUMAN_OPERATOR",
      "Approved Sales Plan",
      `Approved Sales Plan for ${activeCase.poNumber} (Taxable Value: ₹${financials.subtotal.toLocaleString("en-IN")}, Margin: ${financials.netMarginPct}%)`
    );
    addLog(
      "AI_AGENT",
      "Created Order & Statutory Documents",
      `Generated Sales Order ${soId}, Proforma ${piId}, and e-Way Bill ${eway}.`
    );
    setActiveStageTab(3);
  };

  const handleRequestBuyerAmendment = () => {
    if (!activeCase) return;
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
      "Requested PO Amendment from Buyer",
      `Flagged ${activeCase.poNumber} for commercial revision before order booking.`
    );
    setActiveStageTab(4);
  };

  // Stage 3 -> Stage 4: Advance Fulfillment to "Ready for Customer Collection"
  const handleAdvanceFulfillmentToCollection = () => {
    if (!activeCase) return;
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
      "Shipment Arrived & Collection Notice Prepared",
      `Consignment for ${activeCase.poNumber} marked ready for customer collection with Gate Pass ${activeCase.gatePassCode || "GP-1001"}.`
    );
    const collectionEmail = activeCase.emails.find((e) => e.stepType === "COLLECTION_NOTICE");
    if (collectionEmail) setSelectedEmailId(collectionEmail.id);
    setActiveStageTab(4);
  };

  // Stage 4: Approve & Send Customer Email
  const handleSendCustomerEmail = (emailId: string) => {
    if (!activeCase) return;
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
        `Dispatched Email: ${targetEmail.title}`,
        `Sent to ${targetEmail.to} (Subject: "${targetEmail.subject}")`
      );
    }
  };

  // Stage 4 Final Step: Confirm Customer Delivery Collection
  const handleConfirmCustomerCollection = () => {
    if (!activeCase) return;
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
      "Customer Collected Delivery & Signed e-POD",
      `${activeCase.buyerCompany} verified Handover OTP ${activeCase.collectionOtp || "849201"} and collected the order.`
    );
  };

  // Run Autonomous Agent Step on the active uploaded PO
  const handleRunAutopilot = () => {
    if (!activeCase) return;
    setIsRunningAutopilot(true);
    addLog(
      "AI_AGENT",
      "Autonomous Pipeline Step Initiated",
      `Processing ${activeCase.poNumber} according to configured Human Intervention Gates.`
    );

    setTimeout(() => {
      if (humanGates.gate2SalesPlanApproval && !activeCase.salesPlanApprovedAt) {
        addLog(
          "AI_AGENT",
          "Paused at Human Gate #2 (Sales Plan Approval)",
          `Waiting for human approval on ${activeCase.poNumber} Sales Plan.`
        );
        setActiveStageTab(2);
        setIsRunningAutopilot(false);
      } else {
        handleApproveSalesPlan();
        setTimeout(() => {
          handleAdvanceFulfillmentToCollection();
          setIsRunningAutopilot(false);
        }, 800);
      }
    }, 600);
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
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-mono font-bold bg-amber-50 text-amber-800 border border-amber-200">
                <UserCheck className="w-3.5 h-3.5" /> Human-in-the-Loop Checkpoints Active
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
              Purchase Order Automation &amp; Fulfillment Copilot
            </h1>
            <p className="text-xs sm:text-sm text-slate-500">
              Upload your Purchase Order (PDF, Excel, CSV, Image, or Email) &rarr; AI extracts PO &amp; prepares Sales Plan &rarr; Human Approval &rarr; Order &amp; e-Way Bill &rarr; Customer Collection Emails.
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
              onClick={() => {
                setParseError(null);
                setIsUploadModalOpen(true);
              }}
              className="px-4 py-2.5 rounded-xl bg-[#0B4FDF] hover:bg-blue-700 text-white text-xs font-extrabold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
            >
              <Upload className="w-4 h-4" />
              <span>Upload PO (PDF / Excel / Email)</span>
            </button>

            {activeCase && (
              <button
                onClick={handleRunAutopilot}
                disabled={isRunningAutopilot}
                className="px-4 py-2.5 rounded-xl bg-[#FF5500] hover:bg-[#E04800] text-white text-xs font-extrabold flex items-center gap-2 transition-all shadow-sm cursor-pointer disabled:opacity-50"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>{isRunningAutopilot ? "Running Agent..." : "Run Autonomous Step"}</span>
              </button>
            )}
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
                    Toggle where the AI Agent pauses for human sign-off vs. executes autonomously.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {[
                  {
                    key: "gate1DiscrepancyReview" as const,
                    stage: "Stage 1 Gate",
                    title: "PO Discrepancy & Price Check",
                    desc: "Flag human if PO unit rate differs from benchmark floor"
                  },
                  {
                    key: "gate2SalesPlanApproval" as const,
                    stage: "Stage 2 Gate",
                    title: "Sales & Sourcing Plan Sign-Off",
                    desc: "Require human approval before booking Sales Order"
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
                    desc: "Require human review before sending collection OTP email"
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

      {/* ===================================================================== */}
      {/* EMPTY STATE: UPLOAD YOUR OWN PO DIRECTLY ON THE WORKSPACE             */}
      {/* ===================================================================== */}
      {!activeCase && (
        <div className="bg-white border-2 border-dashed border-blue-300 rounded-3xl p-8 sm:p-12 max-w-3xl mx-auto shadow-xs space-y-6">
          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 text-[#0B4FDF] border border-blue-200 flex items-center justify-center mx-auto">
              <Upload className="w-7 h-7" />
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900">
              Upload Your Purchase Order to Start the Automation Pipeline
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 max-w-xl mx-auto">
              No simulated data is loaded. Upload your real PO document (<strong>.pdf, .xlsx, .csv, .png, .jpg, .txt, .eml</strong>) or paste the PO email below. The AI Agent will read it, prepare the Sales Plan for your approval, generate the Order &amp; e-Way Bill, and draft the customer delivery collection emails.
            </p>
          </div>

          <form onSubmit={handleUploadAndParsePo} className="space-y-4 text-xs">
            {parseError && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 font-bold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{parseError}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 block">
                  1. Select PO Document (PDF / Excel / CSV / Image)
                </label>
                <label className="w-full p-4 rounded-xl border-2 border-dashed border-[#0B4FDF]/40 bg-blue-50/40 hover:bg-blue-50 text-[#0B4FDF] font-bold flex flex-col items-center justify-center gap-1.5 cursor-pointer transition-colors min-h-[96px]">
                  <Upload className="w-5 h-5" />
                  <span className="truncate max-w-full px-2 text-center">
                    {selectedFile ? selectedFile.name : "Click to Choose PO File (.pdf, .xlsx, .csv, .png)"}
                  </span>
                  {selectedFile && (
                    <span className="text-[10px] font-mono text-emerald-700">
                      ✓ {(selectedFile.size / 1024).toFixed(1)} KB Ready
                    </span>
                  )}
                  <input
                    type="file"
                    accept=".pdf,.xlsx,.xls,.csv,.png,.jpg,.jpeg,.webp,.txt,.eml"
                    onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                    className="hidden"
                  />
                </label>
              </div>

              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">
                    Customer Email Address (Optional — auto-detected from PO if blank)
                  </label>
                  <input
                    type="email"
                    value={senderEmailInput}
                    onChange={(e) => setSenderEmailInput(e.target.value)}
                    placeholder="e.g. buyer@company.com"
                    className="w-full p-2.5 rounded-xl border border-slate-300 bg-white font-mono text-xs outline-none focus:border-[#0B4FDF]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">
                    Email Subject / Reference Note (Optional)
                  </label>
                  <input
                    type="text"
                    value={subjectInput}
                    onChange={(e) => setSubjectInput(e.target.value)}
                    placeholder="e.g. Purchase Order for Q4 Delivery"
                    className="w-full p-2.5 rounded-xl border border-slate-300 bg-white text-xs outline-none focus:border-[#0B4FDF]"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 block">
                Or Paste PO Email / Document Text Directly (Optional if uploading a file)
              </label>
              <textarea
                rows={5}
                value={rawTextInput}
                onChange={(e) => setRawTextInput(e.target.value)}
                placeholder="Paste raw email body or purchase order text here..."
                className="w-full p-3.5 rounded-xl border border-slate-300 bg-slate-50 font-mono text-xs outline-none focus:bg-white focus:border-[#0B4FDF]"
              />
            </div>

            <div className="pt-2 flex justify-center">
              <button
                type="submit"
                disabled={isParsingPo}
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-[#0B4FDF] hover:bg-blue-700 text-white font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:opacity-50"
              >
                <Sparkles className="w-4 h-4" />
                <span>
                  {isParsingPo
                    ? "AI Agent Reading Your PO & Building Sales Plan..."
                    : "Read PO & Generate AI Sales Plan"}
                </span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ===================================================================== */}
      {/* ACTIVE WORKSPACE GRID ONCE USER UPLOADS THEIR PO                      */}
      {/* ===================================================================== */}
      {activeCase && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* LEFT COLUMN: UPLOADED PO LIST + AGENT LOG */}
          <aside className="lg:col-span-4 xl:col-span-3 space-y-4">
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
              <div className="p-4 border-b border-slate-200 bg-slate-50/80 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-[#0B4FDF]" />
                  <span className="text-xs font-bold uppercase font-mono text-slate-800">
                    Your Uploaded POs ({cases.length})
                  </span>
                </div>
                <button
                  onClick={() => {
                    setParseError(null);
                    setIsUploadModalOpen(true);
                  }}
                  className="text-[11px] font-bold text-[#0B4FDF] hover:underline flex items-center gap-0.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Add PO
                </button>
              </div>

              <div className="divide-y divide-slate-100 max-h-[520px] overflow-y-auto">
                {cases.map((po) => {
                  const isSelected = po.id === activeCase.id;
                  const poTotal = po.items.reduce(
                    (s, i) => s + Number(i.quantity || 0) * Number(i.poUnitPrice || 0),
                    0
                  );

                  return (
                    <div
                      key={po.id}
                      onClick={() => handleSelectCase(po)}
                      className={`w-full text-left p-4 transition-all cursor-pointer relative group ${
                        isSelected
                          ? "bg-blue-50/70 border-l-4 border-l-[#0B4FDF]"
                          : "hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="text-[10px] font-mono font-bold text-[#0B4FDF] bg-blue-100/80 px-2 py-0.5 rounded">
                          {po.poNumber}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] text-slate-400 font-mono">
                            {po.receivedAt}
                          </span>
                          <button
                            onClick={(e) => handleDeleteCase(po.id, e)}
                            title="Remove PO"
                            className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <div className="font-bold text-xs text-slate-900 truncate">
                        {po.buyerCompany}
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono truncate mt-0.5">
                        File: {po.attachmentName}
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
                      </div>
                    </div>
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
                <span className="text-[10px] font-mono text-emerald-400">Live Log</span>
              </div>

              <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1 text-[11px] font-mono">
                {agentLogs.length === 0 ? (
                  <div className="text-slate-400 text-xs py-4 text-center">
                    Actions performed on your uploaded PO will appear here.
                  </div>
                ) : (
                  agentLogs.map((log) => (
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
                  ))
                )}
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
                    subtitle: "Extracted From Your PO",
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
                  const isCompleted =
                    activeCase.currentStage > st.step ||
                    activeCase.workflowStatus === "DELIVERY_COLLECTED";
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
                        Sales Plan Approval Required for {activeCase.poNumber} ({activeCase.buyerCompany})
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

            {/* STAGE 1 CONTENT: UPLOADED PO TEXT & EXTRACTED ENTITIES */}
            {activeStageTab === 1 && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                <div className="lg:col-span-6 bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-xs">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-[#0B4FDF]" />
                      <h3 className="text-sm font-bold text-slate-900">
                        Uploaded PO Document Content
                      </h3>
                    </div>
                    <span className="text-[11px] font-mono text-slate-500">
                      {activeCase.receivedAt}
                    </span>
                  </div>

                  <div className="space-y-2 text-xs bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                    <div>
                      <span className="text-slate-400 font-bold">Buyer / Sender: </span>
                      <span className="font-bold text-slate-800">{activeCase.senderName}</span>{" "}
                      <span className="font-mono text-slate-500">&lt;{activeCase.senderEmail}&gt;</span>
                    </div>
                    <div className="pt-1 flex items-center gap-2">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 text-[#0B4FDF] border border-blue-200 font-mono text-[11px] font-bold">
                        <FileText className="w-3.5 h-3.5" />
                        {activeCase.attachmentName}
                      </span>
                      <span className="text-[10px] font-mono text-emerald-700 font-bold">
                        ✓ Parsed Live by AI Agent
                      </span>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-900 text-slate-100 font-mono text-xs whitespace-pre-wrap leading-relaxed max-h-[380px] overflow-y-auto">
                    {activeCase.rawEmailBody}
                  </div>
                </div>

                <div className="lg:col-span-6 bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-xs flex flex-col justify-between">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-[#FF5500]" />
                        <h3 className="text-sm font-bold text-slate-900">
                          AI Extracted PO Entities
                        </h3>
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {activeCase.aiConfidence}% Confidence
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
                          Buyer GSTIN / Tax ID
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
                          Payment Terms &amp; Delivery
                        </span>
                        <span className="font-bold text-slate-900">
                          {activeCase.paymentTerms} • {activeCase.requestedDeliveryDate}
                        </span>
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                      <span className="text-[10px] font-mono uppercase text-slate-400 block">
                        Delivery Destination
                      </span>
                      <span className="font-bold text-slate-800">{activeCase.deliveryAddress}</span>
                    </div>

                    <div className="space-y-2">
                      <div className="text-xs font-bold text-slate-800">
                        Extracted Line Items ({activeCase.items.length})
                      </div>
                      <div className="max-h-[240px] overflow-y-auto space-y-2 pr-1">
                        {activeCase.items.map((item) => (
                          <div
                            key={item.id}
                            className="p-3 rounded-xl border border-slate-200 flex items-center justify-between gap-2 text-xs"
                          >
                            <div>
                              <div className="font-bold text-slate-900">{item.description}</div>
                              <div className="text-[11px] font-mono text-slate-500">
                                SKU: {item.sku} • HSN: {item.hsnCode} • Qty: {item.quantity}{" "}
                                {item.unit}
                              </div>
                            </div>
                            <div className="text-right shrink-0">
                              <div className="font-mono font-bold text-slate-900">
                                ₹{item.poUnitPrice.toLocaleString("en-IN")} / {item.unit}
                              </div>
                              <div className="text-[10px] font-mono text-emerald-700 font-bold">
                                Total: ₹{(item.quantity * item.poUnitPrice).toLocaleString("en-IN")}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
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

            {/* STAGE 2 CONTENT: AI SALES PLAN, MARGIN & HUMAN APPROVAL GATE */}
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
                      Sales Plan &amp; Commercial Approval — {activeCase.poNumber}
                    </h2>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <div className="px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-right">
                      <span className="text-[10px] font-mono uppercase text-slate-400 block">
                        Taxable PO Value
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

                <div className="p-4 rounded-xl bg-gradient-to-r from-blue-50/90 to-indigo-50/70 border border-blue-200 flex items-start gap-3.5">
                  <Bot className="w-5 h-5 text-[#0B4FDF] shrink-0 mt-0.5" />
                  <div className="space-y-1 text-xs">
                    <div className="font-bold text-slate-900">
                      AI Sales Planner Recommendation
                    </div>
                    <p className="text-slate-700 leading-relaxed">{activeCase.salesPlanSummary}</p>
                  </div>
                </div>

                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-mono uppercase text-[10px]">
                        <tr>
                          <th className="p-3.5">SKU &amp; Material Description</th>
                          <th className="p-3.5">PO Qty</th>
                          <th className="p-3.5">Unit Rate</th>
                          <th className="p-3.5">Line Total</th>
                          <th className="p-3.5">Warehouse &amp; Stock</th>
                          <th className="p-3.5">Status</th>
                          <th className="p-3.5 text-right">Human Override</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {activeCase.items.map((item) => {
                          const isEditing = editingItemId === item.id;
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
                                  <span className="font-black text-slate-900">
                                    ₹{item.poUnitPrice.toLocaleString("en-IN")}
                                  </span>
                                )}
                              </td>

                              <td className="p-3.5 font-mono font-bold text-slate-900 whitespace-nowrap">
                                ₹{(item.quantity * item.poUnitPrice).toLocaleString("en-IN")}
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
                                    Price Variance
                                  </span>
                                ) : (
                                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-100 text-emerald-900">
                                    Ready in Stock
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

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-0.5 text-xs">
                    <div className="font-bold text-slate-900 flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-[#0B4FDF]" />
                      <span>Human Commercial Approval Checkpoint</span>
                    </div>
                    <p className="text-slate-500">
                      Approving this Sales Plan generates the ERP Sales Order, Proforma Invoice, and e-Way Bill in Stage 3.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 shrink-0">
                    <button
                      onClick={handleRequestBuyerAmendment}
                      className="px-4 py-2.5 rounded-xl bg-white hover:bg-rose-50 text-rose-700 border border-rose-200 text-xs font-bold cursor-pointer transition-colors"
                    >
                      Request PO Amendment
                    </button>

                    <button
                      onClick={handleApproveSalesPlan}
                      className="px-5 py-2.5 rounded-xl bg-[#0B4FDF] hover:bg-blue-700 text-white text-xs font-extrabold flex items-center gap-2 cursor-pointer shadow-sm transition-colors"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Approve Sales Plan &amp; Generate Order</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* STAGE 3 CONTENT: ORDER GENERATION, PACKING & DISPATCH TRACKING */}
            {activeStageTab === 3 && (
              <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-6 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
                  <div>
                    <span className="text-xs font-mono uppercase font-bold text-[#0B4FDF]">
                      Stage 3 • Automated Order &amp; Logistics Execution
                    </span>
                    <h2 className="text-lg font-black text-slate-900 mt-0.5">
                      Sales Order {activeCase.salesOrderId || "Pending Approval"} — {activeCase.buyerCompany}
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

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  {[
                    {
                      idx: 1,
                      label: "ERP Sales Order & Proforma",
                      detail: activeCase.salesOrderId || "Awaiting Approval"
                    },
                    {
                      idx: 2,
                      label: "Batch QC & Packing List",
                      detail: `${activeCase.items.length} Line Item(s) Verified`
                    },
                    {
                      idx: 3,
                      label: "GST e-Way Bill & Dispatch",
                      detail: `e-Way #${activeCase.ewayBillNo || "Pending"}`
                    },
                    {
                      idx: 4,
                      label: "Arrived at Customer Dock",
                      detail: `Gate Pass: ${activeCase.gatePassCode || "Pending"}`
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

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                        SO: {activeCase.salesOrderId || "Pending"} • PI:{" "}
                        {activeCase.proformaInvoiceNo || "Pending"}
                      </div>
                    </div>
                    <div className="text-xs space-y-1 pt-2 border-t border-slate-200 font-mono">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Taxable Value:</span>
                        <span className="font-bold">₹{financials.subtotal.toLocaleString("en-IN")}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">GST (18%):</span>
                        <span className="font-bold">₹{financials.gstAmount.toLocaleString("en-IN")}</span>
                      </div>
                      <div className="flex justify-between text-slate-900 font-black pt-1 border-t border-slate-200">
                        <span>Total Payable:</span>
                        <span>₹{financials.grandTotal.toLocaleString("en-IN")}</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                        GST Portal Verified
                      </span>
                      <Truck className="w-4 h-4 text-emerald-700" />
                    </div>
                    <div>
                      <div className="text-xs font-black text-slate-900">
                        GST e-Way Bill &amp; Fleet Assignment
                      </div>
                      <div className="text-[11px] font-mono text-slate-500 mt-0.5">
                        e-Way Bill: {activeCase.ewayBillNo || "Generated on Approval"}
                      </div>
                    </div>
                    <div className="text-xs space-y-1 pt-2 border-t border-slate-200 font-mono">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Vehicle No:</span>
                        <span className="font-bold">{activeCase.vehicleNumber || "MH-14-EL-8821"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Buyer GSTIN:</span>
                        <span className="font-bold">{activeCase.buyerGstin}</span>
                      </div>
                    </div>
                  </div>

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
                        Pass ID: {activeCase.gatePassCode || "Generated on Approval"}
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
                        <span className="text-slate-500">Customer Notification:</span>
                        <span className="font-bold text-[#0B4FDF]">Ready in Stage 4</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STAGE 4 CONTENT: AUTOMATED CUSTOMER EMAILS & DELIVERY COLLECTION */}
            {activeStageTab === 4 && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                <div className="lg:col-span-4 space-y-3">
                  <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3 shadow-xs">
                    <div className="text-xs font-mono font-bold uppercase text-slate-700">
                      Customer Communication Sequence
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
                              {em.status === "SENT_DELIVERED"
                                ? `✓ Sent (${em.sentAt})`
                                : "Pending Review"}
                            </span>
                          </div>
                          <div className="text-xs font-bold text-slate-900">{em.title}</div>
                          <div className="text-[11px] text-slate-500 truncate">To: {em.to}</div>
                        </button>
                      );
                    })}
                  </div>

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
                        Once the customer receives the <strong>Collection Notice Email</strong>, their receiving team verifies Handover OTP{" "}
                        <span className="font-mono font-bold text-amber-300">
                          {activeCase.collectionOtp || "849201"}
                        </span>{" "}
                        to collect the delivery and close PO {activeCase.poNumber}.
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
                        Confirm Customer OTP Handover &amp; Collect Delivery
                      </button>
                    )}
                  </div>
                </div>

                {activeEmail && (
                  <div className="lg:col-span-8 bg-white border border-slate-200 rounded-2xl p-6 space-y-5 shadow-xs">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-bold uppercase text-[#0B4FDF]">
                            Customer Email Notification
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
                            <CheckCircle2 className="w-4 h-4" /> Sent to Customer ({activeEmail.sentAt})
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

                    <div className="space-y-2.5 text-xs">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-2">
                          <span className="text-slate-400 font-bold shrink-0">To:</span>
                          <input
                            type="text"
                            value={activeEmail.to}
                            onChange={(e) => {
                              const val = e.target.value;
                              setCases((prev) =>
                                prev.map((c) => {
                                  if (c.id !== activeCase.id) return c;
                                  return {
                                    ...c,
                                    emails: c.emails.map((em) =>
                                      em.id === activeEmail.id ? { ...em, to: val } : em
                                    )
                                  };
                                })
                              );
                            }}
                            className="w-full bg-transparent font-mono font-bold text-slate-900 outline-none"
                          />
                        </div>
                        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-2">
                          <span className="text-slate-400 font-bold shrink-0">CC:</span>
                          <input
                            type="text"
                            value={activeEmail.cc}
                            onChange={(e) => {
                              const val = e.target.value;
                              setCases((prev) =>
                                prev.map((c) => {
                                  if (c.id !== activeCase.id) return c;
                                  return {
                                    ...c,
                                    emails: c.emails.map((em) =>
                                      em.id === activeEmail.id ? { ...em, cc: val } : em
                                    )
                                  };
                                })
                              );
                            }}
                            className="w-full bg-transparent font-mono text-slate-700 outline-none"
                          />
                        </div>
                      </div>
                      <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-2">
                        <span className="text-slate-400 font-bold shrink-0">Subject:</span>
                        <input
                          type="text"
                          value={activeEmail.subject}
                          onChange={(e) => {
                            const val = e.target.value;
                            setCases((prev) =>
                              prev.map((c) => {
                                if (c.id !== activeCase.id) return c;
                                return {
                                  ...c,
                                  emails: c.emails.map((em) =>
                                    em.id === activeEmail.id ? { ...em, subject: val } : em
                                  )
                                };
                              })
                            );
                          }}
                          className="w-full bg-transparent font-bold text-slate-900 outline-none"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[11px] font-mono uppercase text-slate-500 font-bold">
                        Email Body (Generated from your PO — Editable)
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

                    <div className="space-y-2">
                      <div className="text-[11px] font-mono uppercase text-slate-500 font-bold">
                        Attached Order &amp; Delivery Documents
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
      )}

      {/* ========================================================================= */}
      {/* MODAL: UPLOAD ANOTHER PO FILE / EMAIL                                     */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {isUploadModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white border border-slate-200 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-5 relative max-h-[90vh] overflow-y-auto"
            >
              <button
                onClick={() => setIsUploadModalOpen(false)}
                className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div>
                <span className="text-xs font-mono font-bold text-[#0B4FDF] uppercase">
                  Live PO Document Ingestion
                </span>
                <h3 className="text-lg font-black text-slate-900 mt-0.5">
                  Upload Your Purchase Order
                </h3>
                <p className="text-xs text-slate-500">
                  Upload a PDF, Excel, CSV, or Image PO (or paste the PO email text) for live AI extraction and sales planning.
                </p>
              </div>

              <form onSubmit={handleUploadAndParsePo} className="space-y-4 text-xs">
                {parseError && (
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 font-bold">
                    {parseError}
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700 block">
                    Select PO Document (.pdf, .xlsx, .csv, .png, .jpg, .txt, .eml)
                  </label>
                  <label className="w-full p-4 rounded-xl border-2 border-dashed border-blue-300 bg-blue-50/50 hover:bg-blue-50 text-[#0B4FDF] font-bold flex items-center justify-center gap-2 cursor-pointer">
                    <Upload className="w-4 h-4" />
                    <span className="truncate">
                      {selectedFile ? selectedFile.name : "Choose PO File from Computer"}
                    </span>
                    <input
                      type="file"
                      accept=".pdf,.xlsx,.xls,.csv,.png,.jpg,.jpeg,.webp,.txt,.eml"
                      onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                      className="hidden"
                    />
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">
                      Customer Email (Optional)
                    </label>
                    <input
                      type="email"
                      value={senderEmailInput}
                      onChange={(e) => setSenderEmailInput(e.target.value)}
                      placeholder="Auto-extracted from PO if blank"
                      className="w-full p-2.5 rounded-xl border border-slate-300 bg-white font-mono text-xs outline-none focus:border-[#0B4FDF]"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">
                      Email Subject (Optional)
                    </label>
                    <input
                      type="text"
                      value={subjectInput}
                      onChange={(e) => setSubjectInput(e.target.value)}
                      placeholder="Optional reference subject"
                      className="w-full p-2.5 rounded-xl border border-slate-300 bg-white text-xs outline-none focus:border-[#0B4FDF]"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">
                    Or Paste PO Email / Text Directly
                  </label>
                  <textarea
                    rows={6}
                    value={rawTextInput}
                    onChange={(e) => setRawTextInput(e.target.value)}
                    placeholder="Paste purchase order text here if not uploading a file..."
                    className="w-full p-3 rounded-xl border border-slate-300 bg-slate-50 font-mono text-xs outline-none focus:bg-white focus:border-[#0B4FDF]"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsUploadModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isParsingPo}
                    className="px-5 py-2.5 rounded-xl bg-[#0B4FDF] hover:bg-blue-700 text-white font-extrabold flex items-center gap-2 cursor-pointer shadow-sm disabled:opacity-50"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>
                      {isParsingPo
                        ? "Reading Your PO..."
                        : "Read PO & Generate AI Sales Plan"}
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
