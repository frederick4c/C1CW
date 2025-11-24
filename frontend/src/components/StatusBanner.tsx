"use client";

import React from 'react';
import { useAppState } from '@/context/AppContext';
import { CheckCircle2, XCircle, Database, Brain, Trash2 } from 'lucide-react';

export function StatusBanner() {
    const { datasetUploaded, modelTrained, loading, clearAll } = useAppState();

    const handleClear = () => {
        if (confirm('Are you sure you want to clear all data and model status? This cannot be undone.')) {
            clearAll();
        }
    };

    if (loading) return null;

    return (
        <div className="w-full max-w-5xl mx-auto mb-12 animate-fade-in">
            <div className="glass-panel rounded-2xl p-1 flex items-center justify-between">
                <div className="flex items-center gap-6">
                    {/* Dataset Status */}
                    <div className={`flex items-center gap-3 px-6 py-3 rounded-xl transition-all duration-300 ${datasetUploaded
                        ? 'bg-emerald-500/10 text-emerald-400'
                        : 'bg-[var(--surface-highlight)] text-[var(--text-tertiary)]'
                        }`}>
                        <div className={`p-2 rounded-lg ${datasetUploaded ? 'bg-emerald-500/20' : 'bg-[var(--surface)]'}`}>
                            <Database className="w-5 h-5" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xs font-medium uppercase tracking-wider opacity-70">Dataset</span>
                            <span className="font-bold font-heading flex items-center gap-2">
                                {datasetUploaded ? (
                                    <>Uploaded <CheckCircle2 className="w-4 h-4" /></>
                                ) : (
                                    <>Not Uploaded <XCircle className="w-4 h-4" /></>
                                )}
                            </span>
                        </div>
                    </div>

                    {/* Model Status */}
                    <div className={`flex items-center gap-3 px-6 py-3 rounded-xl transition-all duration-300 ${modelTrained
                        ? 'bg-indigo-500/10 text-indigo-400'
                        : 'bg-[var(--surface-highlight)] text-[var(--text-tertiary)]'
                        }`}>
                        <div className={`p-2 rounded-lg ${modelTrained ? 'bg-indigo-500/20' : 'bg-[var(--surface)]'}`}>
                            <Brain className="w-5 h-5" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xs font-medium uppercase tracking-wider opacity-70">Model</span>
                            <span className="font-bold font-heading flex items-center gap-2">
                                {modelTrained ? (
                                    <>Trained <CheckCircle2 className="w-4 h-4" /></>
                                ) : (
                                    <>Not Trained <XCircle className="w-4 h-4" /></>
                                )}
                            </span>
                        </div>
                    </div>
                </div>

                {(datasetUploaded || modelTrained) && (
                    <button
                        onClick={handleClear}
                        className="mr-2 px-4 py-2 rounded-xl flex items-center gap-2 text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all duration-200"
                    >
                        <Trash2 className="w-4 h-4" />
                        <span className="font-medium">Clear All</span>
                    </button>
                )}
            </div>
        </div>
    );
}
