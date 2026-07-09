"use client";

import React, { useState, useRef } from 'react';
import { UploadCloud, FileSpreadsheet, X, CheckCircle2 } from 'lucide-react';
import { parseExcelInput, ParsedCompany } from '@/utils/excel';
import Tilt from 'react-parallax-tilt';
import { motion, AnimatePresence } from 'framer-motion';

interface UploadDropzoneProps {
  onDataParsed: (companies: ParsedCompany[]) => void;
}

export default function UploadDropzone({ onDataParsed }: UploadDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const processFile = async (selectedFile: File) => {
    setError('');
    if (!selectedFile.name.match(/\.(xlsx|xls|csv)$/)) {
      setError('Please upload a valid Excel or CSV file.');
      return;
    }
    setFile(selectedFile);
    try {
      const companies = await parseExcelInput(selectedFile);
      if (companies.length === 0) {
        setError('No valid data found. Ensure columns contain Name, Address, and Pincode.');
        return;
      }
      setTimeout(() => onDataParsed(companies), 800); // Small delay for UI animation
    } catch (err: any) {
      setError(err.message || 'Error parsing file.');
      setFile(null);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto my-8">
      <Tilt
        tiltMaxAngleX={5}
        tiltMaxAngleY={5}
        glareEnable={true}
        glareMaxOpacity={0.1}
        glareColor="#ffffff"
        glarePosition="all"
        scale={1.02}
        transitionSpeed={2000}
        className="rounded-[2rem]"
      >
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => !file && fileInputRef.current?.click()}
          className={`
            relative overflow-hidden cursor-pointer
            bg-white backdrop-blur-xl border-2
            rounded-[2rem] p-12 transition-all duration-500 ease-out shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)]
            ${isDragging 
              ? 'border-blue-400 bg-blue-50/50 shadow-[0_20px_50px_-12px_rgba(59,130,246,0.2)]' 
              : 'border-slate-100 hover:border-blue-200 hover:shadow-[0_20px_50px_-12px_rgba(59,130,246,0.15)]'}
          `}
        >
          {/* Animated Gradient Border Glow */}
          {isDragging && (
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400 via-indigo-500 to-purple-500 opacity-20 blur-xl"></div>
          )}

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".xlsx, .xls, .csv"
            className="hidden"
          />

          <AnimatePresence mode="wait">
            {!file ? (
              <motion.div 
                key="upload-prompt"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="flex flex-col items-center justify-center text-center relative z-10"
              >
                <motion.div
                  animate={{ y: isDragging ? -10 : 0 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className={`p-6 rounded-full mb-6 shadow-sm transition-colors duration-300 ${isDragging ? 'bg-blue-100' : 'bg-slate-50'}`}
                >
                  <UploadCloud size={48} className={`transition-colors duration-300 ${isDragging ? 'text-blue-600' : 'text-slate-400'}`} />
                </motion.div>
                
                <h3 className="text-2xl font-bold text-slate-800 tracking-tight mb-2">
                  Drop your company list here
                </h3>
                <p className="text-slate-500 mb-6 font-medium">
                  Supported formats: <span className="text-slate-700 bg-slate-100 px-2 py-1 rounded-md text-sm mx-1">.xlsx</span> <span className="text-slate-700 bg-slate-100 px-2 py-1 rounded-md text-sm mx-1">.csv</span>
                </p>
                
                <span className="bg-slate-900 text-white px-8 py-3 rounded-full font-semibold shadow-lg shadow-slate-900/20 hover:shadow-slate-900/40 transition-shadow">
                  Browse Files
                </span>
              </motion.div>
            ) : (
              <motion.div 
                key="file-success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center text-center py-4 relative z-10"
              >
                <div className="relative">
                  <div className="absolute inset-0 bg-emerald-400 blur-xl opacity-20 rounded-full animate-pulse"></div>
                  <FileSpreadsheet size={64} className="text-emerald-500 relative z-10 mb-6" />
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: "spring" }}
                    className="absolute -bottom-2 -right-2 bg-white rounded-full p-1"
                  >
                    <CheckCircle2 size={24} className="text-emerald-500 fill-emerald-100" />
                  </motion.div>
                </div>
                
                <h3 className="text-2xl font-bold text-slate-800 mb-2 truncate max-w-sm">
                  {file.name}
                </h3>
                <p className="text-emerald-600 font-semibold mb-6 flex items-center justify-center gap-2">
                  Valid data extracted securely
                </p>
                
                <button 
                  onClick={(e) => { e.stopPropagation(); setFile(null); }}
                  className="flex items-center gap-2 text-slate-400 hover:text-rose-500 transition-colors font-medium bg-slate-50 hover:bg-rose-50 px-4 py-2 rounded-full"
                >
                  <X size={16} /> Cancel
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </Tilt>

      <AnimatePresence>
        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-4 p-4 bg-rose-50 border border-rose-100 rounded-xl text-rose-600 text-sm text-center font-medium shadow-sm"
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
