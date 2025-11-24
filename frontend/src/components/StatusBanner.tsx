"use client";

import React from 'react';
import { useAppState } from '@/context/AppContext';

export function StatusBanner() {
    const { datasetUploaded, modelTrained, loading, clearAll } = useAppState();

    const handleClear = () => {
        if (confirm('Are you sure you want to clear all data and model status? This cannot be undone.')) {
            clearAll();
        }
    };

    if (loading) return null;

    return (
        <div className="mb-8 flex gap-3 flex-wrap items-center justify-between">
            <div className="flex gap-3 flex-wrap">
                <div className={`px-4 py-2 rounded-lg border text-sm font-medium ${datasetUploaded
                        ? 'bg-green-500/10 border-green-500/30 text-green-400'
                        : 'bg-orange-500/10 border-orange-500/30 text-orange-400'
                    }`}>
                    {datasetUploaded ? '✓ Dataset Uploaded' : '○ No Dataset'}
                </div>
                <div className={`px-4 py-2 rounded-lg border text-sm font-medium ${modelTrained
                        ? 'bg-green-500/10 border-green-500/30 text-green-400'
                        : 'bg-orange-500/10 border-orange-500/30 text-orange-400'
                    }`}>
                    {modelTrained ? '✓ Model Trained' : '○ No Model'}
                </div>
            </div>

            {(datasetUploaded || modelTrained) && (
                <button
                    onClick={handleClear}
                    className="px-4 py-2 rounded-lg border-2 border-red-500/30 text-red-600 hover:bg-red-50 hover:border-red-500 transition-all text-sm font-medium"
                >
                    🗑️ Clear All
                </button>
            )}
        </div>
    );
}
