"use client";

import React, { useState } from 'react';
import { generateExportExcel } from '@/utils/excel';
import { Download, Building2, BarChart3, Users, Newspaper, TrendingUp } from 'lucide-react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import Tilt from 'react-parallax-tilt';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface DashboardProps {
  data: any[];
}

export default function Dashboard({ data }: DashboardProps) {
  const [activeTab, setActiveTab] = useState('overview');

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Building2 },
    { id: 'financials', label: 'Financials & Graphs', icon: BarChart3 },
    { id: 'stocks', label: 'Stocks & Markets', icon: TrendingUp },
    { id: 'personnel', label: 'Personnel', icon: Users },
    { id: 'news', label: 'News & Products', icon: Newspaper },
  ];

  if (!data || data.length === 0) return null;

  const jsonToMarkdown = (data: any, depth = 0): string => {
    if (!data) return '';
    if (typeof data !== 'object') return String(data);
    
    let md = '';
    const indent = '  '.repeat(depth);
    
    if (Array.isArray(data)) {
      data.forEach(item => {
        if (typeof item === 'object' && item !== null) {
          const entries = Object.entries(item);
          if (entries.length > 0) {
            md += `${indent}- **${entries[0][1]}**\n`;
            for (let i = 1; i < entries.length; i++) {
              const cleanKey = entries[i][0].replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
              md += `${indent}  - *${cleanKey}*: ${entries[i][1]}\n`;
            }
          }
        } else {
          md += `${indent}- ${item}\n`;
        }
      });
    } else {
      Object.entries(data).forEach(([k, v]) => {
        const cleanKey = k.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        if (typeof v === 'object' && v !== null) {
          md += `${indent}- **${cleanKey}**:\n${jsonToMarkdown(v, depth + 1)}`;
        } else {
          md += `${indent}- **${cleanKey}**: ${v}\n`;
        }
      });
    }
    return md;
  };

  const renderMarkdown = (content: any) => {
    if (!content) return <span className="text-slate-400 italic">No data available</span>;
    
    let textContent = '';
    if (typeof content === 'string') {
      try {
        const parsed = JSON.parse(content);
        textContent = jsonToMarkdown(parsed);
      } catch (e) {
        textContent = content; // If it's already markdown/plain text
      }
    } else {
      textContent = jsonToMarkdown(content);
    }
    
    return (
      <div className="prose prose-sm prose-slate max-w-none prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline prose-headings:font-bold prose-headings:text-slate-800 prose-p:leading-relaxed prose-li:marker:text-blue-500">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{textContent}</ReactMarkdown>
      </div>
    );
  };

  const tableVariants: Variants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const rowVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <div className="w-full max-w-7xl mx-auto">
      <div className="flex justify-between items-end mb-8 px-2">
        <div>
          <motion.h2 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-3xl font-extrabold text-slate-900 mb-2 tracking-tight"
          >
            Enrichment Results
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-slate-500 font-medium"
          >
            Successfully profiled {data.length} companies
          </motion.p>
        </div>
        
        <Tilt tiltMaxAngleX={10} tiltMaxAngleY={10} scale={1.05} transitionSpeed={2000}>
          <button 
            onClick={() => generateExportExcel(data)}
            className="bg-slate-900 hover:bg-slate-800 text-white px-6 py-3.5 rounded-2xl flex items-center gap-2 font-semibold shadow-xl shadow-slate-900/20 transition-all border border-slate-700"
          >
            <Download size={20} />
            Export to Excel
          </button>
        </Tilt>
      </div>

      <div className="bg-white/80 backdrop-blur-2xl rounded-[2.5rem] border border-white overflow-hidden shadow-[0_8px_40px_-12px_rgba(0,0,0,0.1)]">
        <div className="flex border-b border-slate-100 bg-slate-50/50 p-2 gap-2 overflow-x-auto">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 min-w-[160px] relative flex items-center justify-center gap-2 py-4 px-6 font-semibold rounded-2xl transition-all duration-300 z-10 ${
                  isActive ? 'text-blue-700' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-white rounded-2xl shadow-sm border border-slate-100"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-2">
                  <Icon size={18} className={isActive ? 'text-blue-600' : ''} />
                  {tab.label}
                </span>
              </button>
            )
          })}
        </div>

        <div className="p-2 overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr className="text-slate-400 text-sm uppercase tracking-wider">
                <th className="py-6 px-6 font-semibold w-1/4">Company Profile</th>
                
                {activeTab === 'overview' && (
                  <>
                    <th className="py-6 px-6 font-semibold w-1/4">GST Identity</th>
                    <th className="py-6 px-6 font-semibold w-1/2">Executive Summary</th>
                  </>
                )}
                {activeTab === 'financials' && (
                  <>
                    <th className="py-6 px-6 font-semibold w-1/2">Revenue & Financials</th>
                    <th className="py-6 px-6 font-semibold w-1/2">Historical Performance (Graph)</th>
                  </>
                )}
                {activeTab === 'stocks' && (
                  <>
                    <th className="py-6 px-6 font-semibold w-1/2">Market Data & Ticker</th>
                    <th className="py-6 px-6 font-semibold w-1/2">Recent Performance</th>
                  </>
                )}
                {activeTab === 'personnel' && (
                  <>
                    <th className="py-6 px-6 font-semibold w-1/3">Sales Leadership</th>
                    <th className="py-6 px-6 font-semibold w-1/3">Board of Directors</th>
                    <th className="py-6 px-6 font-semibold w-1/3">HR Contacts</th>
                  </>
                )}
                {activeTab === 'news' && (
                  <>
                    <th className="py-6 px-6 font-semibold w-1/2">Products & Services</th>
                    <th className="py-6 px-6 font-semibold w-1/2">Economic Times Intel</th>
                  </>
                )}
              </tr>
            </thead>
            
            <motion.tbody 
              key={activeTab}
              variants={tableVariants}
              initial="hidden"
              animate="show"
            >
              {data.map((item, index) => {
                const chartData = Array.isArray(item.extracted_data?.financial_chart_data) 
                  ? item.extracted_data.financial_chart_data 
                  : [];

                return (
                  <motion.tr 
                    variants={rowVariants}
                    key={index} 
                    className="border-t border-slate-100 hover:bg-slate-50/80 transition-colors group"
                  >
                    <td className="py-6 px-6 align-top">
                      <div className="font-bold text-slate-900 text-lg group-hover:text-blue-600 transition-colors">{item.company_input?.name}</div>
                      <div className="text-sm text-slate-500 mt-1 leading-relaxed">{item.company_input?.address}</div>
                      <div className="inline-block mt-3 px-2.5 py-1 bg-slate-100 text-slate-600 rounded text-xs font-mono font-medium border border-slate-200">
                        PIN: {item.company_input?.pincode}
                      </div>
                    </td>
                    
                    {activeTab === 'overview' && (
                      <>
                        <td className="py-6 px-6 align-top bg-slate-50/30">{renderMarkdown(item.extracted_data?.gst_number)}</td>
                        <td className="py-6 px-6 align-top">{renderMarkdown(item.extracted_data?.all_available_info)}</td>
                      </>
                    )}
                    
                    {activeTab === 'financials' && (
                      <>
                        <td className="py-6 px-6 align-top bg-slate-50/30">
                          {renderMarkdown(item.extracted_data?.financials)}
                          <div className="mt-4 grid grid-cols-2 gap-4">
                            <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100">
                              <h4 className="text-xs font-bold text-emerald-600 uppercase mb-2">Profits</h4>
                              {renderMarkdown(item.extracted_data?.profits_made)}
                            </div>
                            <div className="bg-rose-50 p-4 rounded-xl border border-rose-100">
                              <h4 className="text-xs font-bold text-rose-600 uppercase mb-2">Losses / Debt</h4>
                              {renderMarkdown(item.extracted_data?.loss_made)}
                            </div>
                          </div>
                        </td>
                        <td className="py-6 px-6 align-top">
                          {chartData.length > 0 ? (
                            <Tilt tiltMaxAngleX={5} tiltMaxAngleY={5} scale={1.01} transitionSpeed={2000} className="w-full">
                              <div className="h-72 w-full bg-white rounded-2xl p-4 shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
                                <ResponsiveContainer width="100%" height="100%">
                                  <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <defs>
                                      <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                      </linearGradient>
                                      <linearGradient id="colorProf" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                      </linearGradient>
                                    </defs>
                                    <XAxis dataKey="year" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <Tooltip 
                                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)' }}
                                      labelStyle={{ fontWeight: 'bold', color: '#0f172a' }}
                                    />
                                    <Area type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
                                    <Area type="monotone" dataKey="profit" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorProf)" />
                                  </AreaChart>
                                </ResponsiveContainer>
                              </div>
                            </Tilt>
                          ) : (
                            <div className="h-full flex items-center justify-center bg-slate-50 border border-dashed border-slate-200 rounded-2xl text-slate-400 italic">
                              No chart data available
                            </div>
                          )}
                        </td>
                      </>
                    )}

                    {activeTab === 'stocks' && (
                      <>
                        <td className="py-6 px-6 align-top bg-slate-50/30">{renderMarkdown(item.extracted_data?.stock_information)}</td>
                        <td className="py-6 px-6 align-top">
                          <Tilt tiltMaxAngleX={5} tiltMaxAngleY={5} scale={1.02} transitionSpeed={2000}>
                            <div className="bg-gradient-to-br from-blue-900 to-slate-900 p-8 rounded-2xl text-white shadow-xl">
                              <TrendingUp className="text-blue-400 mb-4" size={32} />
                              <h3 className="text-xl font-bold mb-2">Market Insights</h3>
                              <p className="text-blue-100/80 leading-relaxed text-sm">
                                AI has actively scoured the NASDAQ, NSE, and BSE databases via Tavily real-time search. Refer to the panel on the left for live ticker data.
                              </p>
                            </div>
                          </Tilt>
                        </td>
                      </>
                    )}

                    {activeTab === 'personnel' && (
                      <>
                        <td className="py-6 px-6 align-top bg-slate-50/30">{renderMarkdown(item.extracted_data?.sales_people)}</td>
                        <td className="py-6 px-6 align-top">{renderMarkdown(item.extracted_data?.board_of_directors)}</td>
                        <td className="py-6 px-6 align-top bg-slate-50/30">{renderMarkdown(item.extracted_data?.hr_contacts)}</td>
                      </>
                    )}

                    {activeTab === 'news' && (
                      <>
                        <td className="py-6 px-6 align-top bg-slate-50/30">{renderMarkdown(item.extracted_data?.products_and_services)}</td>
                        <td className="py-6 px-6 align-top">{renderMarkdown(item.extracted_data?.economic_times_info)}</td>
                      </>
                    )}
                  </motion.tr>
                );
              })}
            </motion.tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
