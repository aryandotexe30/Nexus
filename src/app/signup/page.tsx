"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Building2, User, KeyRound, ArrowRight, ArrowLeft, ShieldCheck, FileText, Factory, Landmark, Briefcase, Phone, Mail, ShieldAlert } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

export default function Signup() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    companyName: "",
    gstNumber: "",
    udyamNumber: "",
    industry: "Technology",
    cinNumber: "",
    personalEmail: "",
    companyPhone: "",
    personalPhone: "",
    agreedToTerms: false
  });

  const nextStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 1) {
      if (!formData.email || !formData.password) {
        setError("Email and password are required.");
        return;
      }
      setError("");
      setStep(2);
    } else if (step === 2) {
      if (!formData.companyName || !formData.gstNumber) {
        setError("Company Name and GSTIN are required.");
        return;
      }
      setError("");
      setStep(3);
    }
  };

  const prevStep = () => {
    setError("");
    setStep(step - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.agreedToTerms) {
      setError("You must agree to the Terms of Service and Privacy Policy.");
      return;
    }
    
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to register");
      }

      router.push("/login?registered=true");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-500/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-500/10 blur-[120px] pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-slate-900/50 backdrop-blur-xl border border-slate-800 p-8 rounded-3xl shadow-2xl relative z-10"
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-tr from-blue-500 to-indigo-500 rounded-2xl mx-auto flex items-center justify-center mb-4 shadow-lg shadow-blue-500/20">
            {step === 1 ? <User className="w-8 h-8 text-white" /> : (step === 2 ? <Briefcase className="w-8 h-8 text-white" /> : <ShieldCheck className="w-8 h-8 text-white" />)}
          </div>
          <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">
            {step === 1 ? "Create Account" : (step === 2 ? "Company Details" : "Identity Verification")}
          </h1>
          <p className="text-slate-400 text-sm">
            {step === 1 ? "Step 1: Setup your login credentials." : (step === 2 ? "Step 2: Basic business information." : "Step 3: Complete KYC & verification.")}
          </p>
          
          <div className="flex justify-center gap-2 mt-6">
            <div className={`h-1.5 w-10 rounded-full transition-colors ${step >= 1 ? 'bg-blue-500' : 'bg-slate-700'}`} />
            <div className={`h-1.5 w-10 rounded-full transition-colors ${step >= 2 ? 'bg-blue-500' : 'bg-slate-700'}`} />
            <div className={`h-1.5 w-10 rounded-full transition-colors ${step >= 3 ? 'bg-blue-500' : 'bg-slate-700'}`} />
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-xl flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-400 font-medium">{error}</p>
          </div>
        )}

        <form onSubmit={step === 3 ? handleSubmit : nextStep} className="space-y-5 overflow-hidden">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div 
                key="step1"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="space-y-5"
              >
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Company Work Email (Login)</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                    <input 
                      type="email"
                      required
                      value={formData.email}
                      onChange={e => setFormData({...formData, email: e.target.value})}
                      className="w-full bg-slate-950/50 border border-slate-800 text-white rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all placeholder:text-slate-600"
                      placeholder="you@company.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Password</label>
                  <div className="relative">
                    <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                    <input 
                      type="password"
                      required
                      value={formData.password}
                      onChange={e => setFormData({...formData, password: e.target.value})}
                      className="w-full bg-slate-950/50 border border-slate-800 text-white rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all placeholder:text-slate-600"
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                <button 
                  type="submit" 
                  className="w-full bg-slate-800 hover:bg-slate-700 text-white font-medium py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-2 group"
                >
                  Continue
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div 
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="space-y-5"
              >
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Registered Company Name</label>
                  <div className="relative">
                    <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                    <input 
                      type="text"
                      required
                      value={formData.companyName}
                      onChange={e => setFormData({...formData, companyName: e.target.value})}
                      className="w-full bg-slate-950/50 border border-slate-800 text-white rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all placeholder:text-slate-600"
                      placeholder="Acme Corp Pvt Ltd"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">GSTIN</label>
                    <div className="relative">
                      <FileText className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                      <input 
                        type="text"
                        required
                        value={formData.gstNumber}
                        onChange={e => setFormData({...formData, gstNumber: e.target.value})}
                        className="w-full bg-slate-950/50 border border-slate-800 text-white rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all placeholder:text-slate-600 text-sm"
                        placeholder="22AAAAA0000A1Z5"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">CIN (Corporate ID)</label>
                    <div className="relative">
                      <Landmark className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                      <input 
                        type="text"
                        required
                        value={formData.cinNumber}
                        onChange={e => setFormData({...formData, cinNumber: e.target.value})}
                        className="w-full bg-slate-950/50 border border-slate-800 text-white rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all placeholder:text-slate-600 text-sm"
                        placeholder="U72900MH..."
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Industry Sector</label>
                  <div className="relative">
                    <Factory className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                    <select 
                      value={formData.industry}
                      onChange={e => setFormData({...formData, industry: e.target.value})}
                      className="w-full bg-slate-950/50 border border-slate-800 text-white rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all appearance-none"
                    >
                      <option value="Manufacturing">Manufacturing</option>
                      <option value="Technology">Technology & IT</option>
                      <option value="Retail">Retail & E-commerce</option>
                      <option value="Healthcare">Healthcare</option>
                      <option value="Logistics">Logistics & Supply Chain</option>
                      <option value="Finance">Finance & Fintech</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button 
                    type="button" 
                    onClick={prevStep}
                    className="px-4 py-3 bg-slate-800 hover:bg-slate-700 text-white font-medium rounded-xl transition-all"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  <button 
                    type="submit" 
                    className="flex-1 bg-slate-800 hover:bg-slate-700 text-white font-medium py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-2 group"
                  >
                    Continue
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div 
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Personal Email</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                    <input 
                      type="email"
                      required
                      value={formData.personalEmail}
                      onChange={e => setFormData({...formData, personalEmail: e.target.value})}
                      className="w-full bg-slate-950/50 border border-slate-800 text-white rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all placeholder:text-slate-600"
                      placeholder="personal@gmail.com"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Company Phone</label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <input 
                        type="tel"
                        required
                        value={formData.companyPhone}
                        onChange={e => setFormData({...formData, companyPhone: e.target.value})}
                        className="w-full bg-slate-950/50 border border-slate-800 text-white rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all placeholder:text-slate-600 text-sm"
                        placeholder="+91..."
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Personal Phone</label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <input 
                        type="tel"
                        required
                        value={formData.personalPhone}
                        onChange={e => setFormData({...formData, personalPhone: e.target.value})}
                        className="w-full bg-slate-950/50 border border-slate-800 text-white rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all placeholder:text-slate-600 text-sm"
                        placeholder="+91..."
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Udyam No. (Optional)</label>
                  <div className="relative">
                    <Landmark className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                    <input 
                      type="text"
                      value={formData.udyamNumber}
                      onChange={e => setFormData({...formData, udyamNumber: e.target.value})}
                      className="w-full bg-slate-950/50 border border-slate-800 text-white rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all placeholder:text-slate-600"
                      placeholder="UDYAM-MH-00..."
                    />
                  </div>
                </div>

                <div className="flex items-start gap-3 mt-4 mb-2">
                  <input 
                    type="checkbox" 
                    id="terms" 
                    checked={formData.agreedToTerms}
                    onChange={e => setFormData({...formData, agreedToTerms: e.target.checked})}
                    className="mt-1 w-4 h-4 bg-slate-900 border-slate-700 rounded text-blue-600 focus:ring-blue-500 focus:ring-offset-slate-950" 
                  />
                  <label htmlFor="terms" className="text-sm text-slate-400 leading-relaxed">
                    I attest that this information is accurate and I agree to the{' '}
                    <a href="/terms-of-service" target="_blank" className="text-blue-400 hover:underline">Terms of Service</a> and{' '}
                    <a href="/privacy-policy" target="_blank" className="text-blue-400 hover:underline">Privacy Policy</a>.
                  </label>
                </div>

                <div className="flex gap-3 pt-2">
                  <button 
                    type="button" 
                    onClick={prevStep}
                    className="px-4 py-3 bg-slate-800 hover:bg-slate-700 text-white font-medium rounded-xl transition-all"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  <button 
                    type="submit" 
                    disabled={loading}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-medium py-3 px-4 rounded-xl shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-2 group disabled:opacity-70"
                  >
                    {loading ? (
                      <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        Submit Verification
                        <ShieldCheck className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </form>

        <p className="mt-8 text-center text-slate-400 text-sm">
          Already have an account?{' '}
          <Link href="/login" className="text-blue-400 hover:text-blue-300 font-medium transition-colors">
            Sign in
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
