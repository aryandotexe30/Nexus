"use client";

import { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import { UploadCloud, FileSpreadsheet, Loader2, Database, Search, CheckCircle2, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";

export default function DatabookPage() {
  const [companies, setCompanies] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCompany, setSelectedCompany] = useState<any>(null);

  // Upload & Enrichment State
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [logs, setLogs] = useState<{ type: 'success' | 'error', msg: string }[]>([]);

  useEffect(() => {
    fetchDatabook();
  }, []);

  const fetchDatabook = async () => {
    try {
      const res = await fetch('/api/admin/databook');
      const data = await res.json();
      if (data.success) {
        setCompanies(data.companies);
      }
    } catch (e) {
      console.error("Failed to fetch databook");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0];
    if (uploadedFile) {
      setFile(uploadedFile);
    }
  };

  const processBulkEnrichment = async () => {
    if (!file) return;

    setIsProcessing(true);
    setLogs([]);
    
    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      // Convert to JSON, expecting { "Company Name": "...", "GST": "..." } or similar
      const rawJson = XLSX.utils.sheet_to_json(worksheet);

      // Normalize keys
      const parsedData = rawJson.map((row: any) => {
        const nameKey = Object.keys(row).find(k => k.toLowerCase().includes("name") || k.toLowerCase().includes("company"));
        const gstKey = Object.keys(row).find(k => k.toLowerCase().includes("gst"));
        return {
          name: nameKey ? row[nameKey] : row[Object.keys(row)[0]], // fallback to first column
          gst: gstKey ? row[gstKey] : ""
        };
      }).filter(r => r.name);

      setProgress({ current: 0, total: parsedData.length });

      for (let i = 0; i < parsedData.length; i++) {
        const item = parsedData[i];
        try {
          const res = await fetch('/api/enrich/bulk', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: item.name, gst: item.gst })
          });
          const result = await res.json();
          if (result.success) {
            setLogs(prev => [{ type: 'success', msg: `Enriched ${item.name}` }, ...prev]);
          } else {
            setLogs(prev => [{ type: 'error', msg: `Failed ${item.name}: ${result.error || 'Rate Limited'}` }, ...prev]);
          }
        } catch (e) {
          setLogs(prev => [{ type: 'error', msg: `Network error for ${item.name}` }, ...prev]);
        }
        setProgress(prev => ({ ...prev, current: i + 1 }));
        
        // Artificial delay of 4 seconds to respect free tier API rate limits
        if (i < parsedData.length - 1) {
            setLogs(prev => [{ type: 'success', msg: `Waiting 4s to prevent API rate limit...` }, ...prev]);
            await new Promise(r => setTimeout(r, 4000));
        }
      }
      
      alert("Bulk enrichment completed!");
      fetchDatabook(); // Refresh the table
    } catch (err) {
      alert("Error parsing excel file. Please ensure it is a valid .xlsx or .csv");
      console.error(err);
    } finally {
      setIsProcessing(false);
      setFile(null);
    }
  };

  const filteredCompanies = companies.filter(c => {
    if (!c.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    
    // Parse data safely
    let data: any = {};
    try {
      data = typeof c.data === 'string' ? JSON.parse(c.data) : c.data || {};
    } catch (e) {}

    // Check if any significant data field exists
    const hasLocation = !!data.location && data.location !== 'Unknown';
    const hasDescription = !!data.description || !!data.all_available_info;
    const hasProducts = (Array.isArray(data.products) && data.products.length > 0) || !!data.products_and_services;
    const hasGst = !!data.gst || !!data.gst_number;
    const hasIndustry = !!data.industry;

    // Hide if all major columns are entirely empty
    if (!hasLocation && !hasDescription && !hasProducts && !hasGst && !hasIndustry) {
      return false;
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto p-6 font-sans">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-indigo-100 text-indigo-600 rounded-xl">
          <Database className="w-8 h-8" />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900">Admin Databook</h1>
          <p className="text-slate-500 font-medium">Bulk data enrichment & proprietary knowledge base</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-8 mb-12">
        {/* Upload Section */}
        <div className="lg:col-span-1 2xl:col-span-1 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
            <UploadCloud className="w-5 h-5 text-indigo-600" /> Upload Excel Data
          </h2>
          
          <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center bg-slate-50 mb-4">
            <FileSpreadsheet className="w-10 h-10 text-slate-400 mx-auto mb-3" />
            <p className="text-sm text-slate-600 font-medium mb-4">
              Upload an .xlsx file containing Company Name and GST columns.
            </p>
            <input 
              type="file" 
              accept=".xlsx, .csv" 
              onChange={handleFileUpload}
              className="text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer"
            />
          </div>

          <button 
            onClick={processBulkEnrichment}
            disabled={!file || isProcessing}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : "Start Bulk Enrichment"}
          </button>

          {isProcessing && (
            <div className="mt-6">
              <div className="flex justify-between text-sm font-bold text-slate-700 mb-2">
                <span>Enrichment Progress</span>
                <span>{progress.current} / {progress.total}</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2.5">
                <div 
                  className="bg-indigo-600 h-2.5 rounded-full transition-all duration-300" 
                  style={{ width: `${(progress.current / progress.total) * 100}%` }}
                ></div>
              </div>
              
              <div className="mt-4 bg-slate-900 rounded-lg p-3 h-32 overflow-y-auto text-xs font-mono space-y-1">
                {logs.map((log, i) => (
                  <div key={i} className={log.type === 'success' ? 'text-green-400' : 'text-red-400'}>
                    [{new Date().toLocaleTimeString()}] {log.msg}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Stats Section */}
        <div className="lg:col-span-1 2xl:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-6 text-white shadow-md flex flex-col justify-center">
            <h3 className="text-indigo-100 font-bold mb-1">Total Enriched Companies</h3>
            <p className="text-5xl font-black">{companies.length}</p>
          </div>
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-center">
            <h3 className="text-slate-500 font-bold mb-1">Data Quality</h3>
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle2 className="w-8 h-8" />
              <span className="text-2xl font-black">High</span>
            </div>
          </div>
        </div>
      </div>

      {/* Datatable */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
          <h2 className="text-lg font-bold text-slate-900">Proprietary Database</h2>
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search companies..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="text-xs text-slate-500 uppercase bg-slate-100 font-bold">
              <tr>
                <th className="px-6 py-4">Company Name</th>
                <th className="px-6 py-4">Location</th>
                <th className="px-6 py-4">Description</th>
                <th className="px-6 py-4">Products</th>
                <th className="px-6 py-4">GST</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="text-center py-8"><Loader2 className="w-6 h-6 animate-spin mx-auto text-indigo-500" /></td>
                </tr>
              ) : filteredCompanies.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-slate-500 font-medium">No companies found.</td>
                </tr>
              ) : (
                filteredCompanies.map((c, i) => {
                  // data column is JSON. Let's parse or use safely
                  const data = typeof c.data === 'string' ? JSON.parse(c.data) : c.data || {};
                  return (
                    <tr 
                      key={c.id} 
                      className="border-b border-slate-100 hover:bg-slate-50 cursor-pointer transition-colors"
                      onClick={() => setSelectedCompany({ ...c, parsedData: data })}
                    >
                      <td className="px-6 py-4 font-bold text-slate-900 whitespace-nowrap">{c.name}</td>
                      <td className="px-6 py-4">{data.location || 'Unknown'}</td>
                      <td className="px-6 py-4 max-w-xs truncate">{data.description || '-'}</td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {Array.isArray(data.products) ? data.products.slice(0, 2).map((p: string, idx: number) => (
                            <span key={idx} className="bg-slate-200 text-slate-700 text-[10px] px-2 py-0.5 rounded font-bold">{p}</span>
                          )) : '-'}
                          {Array.isArray(data.products) && data.products.length > 2 && <span className="text-xs text-slate-400">+{data.products.length - 2}</span>}
                        </div>
                      </td>
                      <td className="px-6 py-4 font-mono text-xs">{data.gst || data.gst_number || '-'}</td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal for Details */}
      {selectedCompany && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[80vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b border-slate-200 flex justify-between items-start bg-slate-50">
              <div>
                <h2 className="text-2xl font-black text-slate-900">{selectedCompany.name}</h2>
                <p className="text-slate-500 font-mono text-sm mt-1">GST: {selectedCompany.parsedData.gst || selectedCompany.parsedData.gst_number || 'N/A'}</p>
              </div>
              <button 
                onClick={() => setSelectedCompany(null)}
                className="text-slate-400 hover:text-slate-600 bg-white border border-slate-200 rounded-full w-8 h-8 flex items-center justify-center font-bold"
              >
                ✕
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto bg-white flex-1">
              <div className="space-y-6">
                {(() => {
                  const safeRender = (val: any) => {
                    if (!val) return 'Data not available';
                    if (typeof val === 'string') return val;
                    if (Array.isArray(val)) {
                      return val.map(v => typeof v === 'string' ? v : JSON.stringify(v)).join(', ');
                    }
                    if (typeof val === 'object') {
                      return JSON.stringify(val, null, 2);
                    }
                    return String(val);
                  };

                  return (
                    <>
                      <div>
                        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Description</h3>
                        <p className="text-slate-700 bg-slate-50 p-4 rounded-xl border border-slate-100">{safeRender(selectedCompany.parsedData.description || selectedCompany.parsedData.all_available_info)}</p>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-6">
                        <div>
                          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Industry</h3>
                          <p className="text-slate-700 font-medium">{safeRender(selectedCompany.parsedData.industry)}</p>
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Location</h3>
                          <p className="text-slate-700 font-medium">{safeRender(selectedCompany.parsedData.location)}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-xl">
                          <h3 className="text-sm font-bold text-emerald-600 uppercase tracking-wider mb-2">Raw Materials Purchased (Suppliers)</h3>
                          <p className="text-slate-700 whitespace-pre-wrap text-sm">{safeRender(selectedCompany.parsedData.raw_materials_purchased)}</p>
                        </div>
                        <div className="bg-rose-50 border border-rose-100 p-4 rounded-xl">
                          <h3 className="text-sm font-bold text-rose-600 uppercase tracking-wider mb-2">Customers & Sales Output</h3>
                          <p className="text-slate-700 whitespace-pre-wrap text-sm">{safeRender(selectedCompany.parsedData.customers)}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-green-50 border border-green-100 p-4 rounded-xl">
                          <h3 className="text-sm font-bold text-green-600 uppercase tracking-wider mb-2">Financials (Including Previous Years)</h3>
                          <p className="text-slate-700 whitespace-pre-wrap text-sm">{safeRender(selectedCompany.parsedData.financials)}</p>
                        </div>
                        <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl">
                          <h3 className="text-sm font-bold text-blue-600 uppercase tracking-wider mb-2">Stock Market Info</h3>
                          <p className="text-slate-700 whitespace-pre-wrap text-sm">{safeRender(selectedCompany.parsedData.stock_market_info || selectedCompany.parsedData.stock_information || 'Private Company / Data not available')}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 gap-6">
                        <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl">
                          <h3 className="text-sm font-bold text-blue-600 uppercase tracking-wider mb-2">Products / Services</h3>
                          <p className="text-slate-700 whitespace-pre-wrap text-sm">{safeRender(selectedCompany.parsedData.products_and_services || selectedCompany.parsedData.products)}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-purple-50 border border-purple-100 p-4 rounded-xl">
                          <h3 className="text-sm font-bold text-purple-600 uppercase tracking-wider mb-2">Goods Sold Overview</h3>
                          <p className="text-slate-700 whitespace-pre-wrap text-sm">{safeRender(selectedCompany.parsedData.goods_sold)}</p>
                        </div>
                        <div className="bg-orange-50 border border-orange-100 p-4 rounded-xl">
                          <h3 className="text-sm font-bold text-orange-600 uppercase tracking-wider mb-2">Goods Purchased Overview</h3>
                          <p className="text-slate-700 whitespace-pre-wrap text-sm">{safeRender(selectedCompany.parsedData.goods_purchased)}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl">
                          <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">Board of Directors</h3>
                          <p className="text-slate-700 whitespace-pre-wrap text-sm">{safeRender(selectedCompany.parsedData.board_of_directors)}</p>
                        </div>
                        <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl">
                          <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">Personnel Contacts (Sales, HR, Execs)</h3>
                          <p className="text-slate-700 whitespace-pre-wrap text-sm">{safeRender(selectedCompany.parsedData.personnel_contacts || selectedCompany.parsedData.hr_contacts || selectedCompany.parsedData.sales_and_business_heads)}</p>
                        </div>
                      </div>
                    </>
                  );
                })()}
              </div>    
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
