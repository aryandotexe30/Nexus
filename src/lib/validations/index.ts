import { z } from "zod";

export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, "Password must be at least 8 characters"),
  companyName: z.string().min(2),
  gstNumber: z.string().min(15, "Invalid GST"),
  cinNumber: z.string().min(21, "Invalid CIN"),
  personalEmail: z.string().email(),
  companyPhone: z.string().min(10),
  personalPhone: z.string().min(10),
  industry: z.string().optional(),
  udyamNumber: z.string().optional(),
});

export const enquirySchema = z.object({
  targetToken: z.string().min(1),
  productName: z.string().min(1),
  quantity: z.string().or(z.number()).transform(v => String(v)),
  unit: z.string().min(1),
  purpose: z.string().min(1),
  details: z.string().min(10, "Please provide more details for the supplier."),
});

export const bulkEnrichSchema = z.object({
  name: z.string().min(2),
  gst: z.string().optional(),
});

export const agentSchema = z.object({
  messages: z.array(z.object({
    role: z.enum(["user", "ai"]),
    text: z.string(),
  })),
});

export const paymentOrderSchema = z.object({
  plan: z.string().min(1),
  amount: z.number().positive(),
});

export const paymentVerifySchema = z.object({
  razorpay_payment_id: z.string().min(1),
  razorpay_order_id: z.string().min(1),
  razorpay_signature: z.string().min(1),
  plan: z.string().min(1),
});
